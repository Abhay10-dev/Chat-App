import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Copy, LogOut, Send, MessageSquareOff, ChevronUp, Trash2 } from 'lucide-react';
import { useChatContext } from '../context/ChatContext';
import { useChatWebSocket } from '../hooks/useChatWebSocket';
import { fetchMessages, checkRoom, deleteRoom } from '../services/apiService';
import { disconnectWebSocket } from '../services/stompService';
import MessageBubble from './MessageBubble';
import SkeletonLoader from './SkeletonLoader';

const PAGE_SIZE = 20;

function ConnectionBadge({ isConnected }) {
  if (isConnected) {
    return (
      <span
        aria-live="polite"
        aria-label="Connection status: Connected"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
          bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        Connected
      </span>
    );
  }
  return (
    <span
      aria-live="polite"
      aria-label="Connection status: Reconnecting"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        bg-amber-500/10 text-amber-400 border border-amber-500/20"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
      </span>
      Reconnecting…
    </span>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
        <MessageSquareOff className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-slate-300 font-semibold text-lg mb-1">No messages yet</h3>
      <p className="text-slate-500 text-sm">Be the first to say hello! 👋</p>
    </div>
  );
}

export default function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const {
    username,
    setCurrentRoomId,
    messages,
    setMessages,
    currentPage,
    setCurrentPage,
    hasMoreMessages,
    setHasMoreMessages,
    isConnected,
    setIsConnected,
    isLoadingHistory,
    setIsLoadingHistory,
  } = useChatContext();

  const [inputText, setInputText] = useState('');
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [roomCreatedBy, setRoomCreatedBy] = useState(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const chatScrollRef = useRef(null);
  const inputRef = useRef(null);
  const isAtBottomRef = useRef(true); // scroll-lock tracking

  // ─── STOMP WebSocket ─────────────────────────────────────────────────────────

  const handleNewMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, [setMessages]);

  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
  }, [setIsConnected]);

  const { send } = useChatWebSocket(roomId, handleNewMessage, handleConnectionChange);

  // ─── Initial History Load & Room Meta ────────────────────────────────────────

  useEffect(() => {
    async function loadInitial() {
      setIsLoadingHistory(true);
      setMessages([]);
      setCurrentPage(0);
      setHasMoreMessages(true);

      try {
        // Fetch room info to get createdBy
        const roomData = await checkRoom(roomId).catch(() => null);
        if (roomData && roomData.createdBy) {
          setRoomCreatedBy(roomData.createdBy);
        }

        const data = await fetchMessages(roomId, 0, PAGE_SIZE);
        setMessages(Array.isArray(data) ? data : []);
        if (!Array.isArray(data) || data.length < PAGE_SIZE) {
          setHasMoreMessages(false);
        }
      } catch (err) {
        toast.error(err.message || 'Failed to load message history.');
      } finally {
        setIsLoadingHistory(false);
      }
    }

    if (roomId) loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // ─── Auto-Scroll (only when user is near the bottom) ─────────────────────────

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  // Scroll-lock: determine whether user is near the bottom
  function handleScroll() {
    const el = chatScrollRef.current;
    if (!el) return;
    const threshold = 60; // px from bottom
    isAtBottomRef.current =
      el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
  }

  // ─── Load Older Messages (pagination) ────────────────────────────────────────

  async function loadOlderMessages() {
    if (isLoadingOlder || !hasMoreMessages) return;

    const el = chatScrollRef.current;
    const prevScrollHeight = el ? el.scrollHeight : 0;

    setIsLoadingOlder(true);
    const nextPage = currentPage + 1;

    try {
      const older = await fetchMessages(roomId, nextPage, PAGE_SIZE);
      const arr = Array.isArray(older) ? older : [];

      setMessages((prev) => [...arr, ...prev]);
      setCurrentPage(nextPage);

      if (arr.length < PAGE_SIZE) setHasMoreMessages(false);

      // Restore scroll position so the view doesn't jump
      requestAnimationFrame(() => {
        if (el) {
          el.scrollTop = el.scrollHeight - prevScrollHeight;
        }
      });
    } catch (err) {
      toast.error(err.message || 'Could not load older messages.');
    } finally {
      setIsLoadingOlder(false);
    }
  }

  // ─── Scroll-to-top detection ──────────────────────────────────────────────────

  function handleScrollDetect(e) {
    handleScroll();
    if (e.target.scrollTop === 0 && hasMoreMessages && !isLoadingOlder) {
      loadOlderMessages();
    }
  }

  // ─── Send Message ─────────────────────────────────────────────────────────────

  function handleSend(e) {
    e?.preventDefault();
    if (!inputText.trim() || !isConnected) return;

    send(username || 'Anonymous', inputText.trim());
    setInputText('');
    // Re-focus so user can type the next message immediately
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // ─── Leave Room ───────────────────────────────────────────────────────────────

  function leaveRoom() {
    disconnectWebSocket();
    setCurrentRoomId(null);
    setMessages([]);
    navigate('/');
  }

  // ─── Delete Room (Creator Only) ────────────────────────────────────────────────

  async function confirmDeleteRoom() {
    setIsDeletingRoom(true);
    try {
      await deleteRoom(roomId);
      toast.success(`Room #${roomId} deleted successfully.`);
      leaveRoom();
    } catch (err) {
      toast.error(err.message || 'Failed to delete room.');
    } finally {
      setIsDeletingRoom(false);
      setShowDeleteConfirmModal(false);
    }
  }

  // ─── Copy Invite Link ─────────────────────────────────────────────────────────

  async function copyLink() {
    try {
      const cleanInviteUrl = `${window.location.origin}/chat/${roomId}`;
      await navigator.clipboard.writeText(cleanInviteUrl);
      toast.success('Invite link copied!');
    } catch {
      toast.error('Could not copy link.');
    }
  }

  // Check if logged in user is creator of current room
  const isCreator = username && roomCreatedBy && username === roomCreatedBy;
  const showEmpty = !isLoadingHistory && messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-none px-4 sm:px-6 py-3 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between gap-3">
        {/* Left: room name + status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white truncate">
              <span className="text-slate-400">#</span>{roomId}
            </h2>
            {roomCreatedBy && (
              <p className="text-[11px] text-slate-400 truncate">
                Created by <span className="text-slate-300 font-medium">@{roomCreatedBy}</span>
              </p>
            )}
          </div>
          <ConnectionBadge isConnected={isConnected} />
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 flex-none">
          <button
            id="copy-invite-btn"
            onClick={copyLink}
            aria-label="Copy invite link"
            title="Copy invite link"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* Conditional Render: Only Creator sees "Delete Room" */}
          {isCreator && (
            <button
              id="delete-room-btn"
              onClick={() => setShowDeleteConfirmModal(true)}
              aria-label="Delete room"
              title="Delete room (Creator only)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
                bg-red-500/10 hover:bg-red-600 border border-red-500/30 text-red-400 hover:text-white
                transition-all duration-150 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete Room</span>
            </button>
          )}

          <button
            id="leave-room-btn"
            onClick={leaveRoom}
            aria-label="Leave room"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg
              bg-slate-800 hover:bg-slate-700 border border-slate-700
              text-slate-300 hover:text-white transition-all duration-150"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* ── Message Feed ── */}
      <div
        ref={chatScrollRef}
        onScroll={handleScrollDetect}
        className="flex-1 overflow-y-auto"
        style={{ scrollBehavior: 'auto' }}
      >
        {isLoadingHistory ? (
          <SkeletonLoader />
        ) : showEmpty ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col px-4 sm:px-6 py-4 gap-3">
            {/* Load Older Messages pill */}
            {hasMoreMessages && (
              <div className="flex justify-center mb-2">
                <button
                  id="load-older-btn"
                  onClick={loadOlderMessages}
                  disabled={isLoadingOlder}
                  aria-label="Load older messages"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold
                    bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoadingOlder ? (
                    <span className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                  {isLoadingOlder ? 'Loading…' : 'Load Older Messages'}
                </button>
              </div>
            )}

            {/* Bubbles */}
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id ?? `msg-${idx}`}
                message={msg}
                isOwn={msg.sender === username}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Input Bar ── */}
      <form
        onSubmit={handleSend}
        className="flex-none px-4 sm:px-6 py-3 bg-slate-900/90 backdrop-blur-sm border-t border-slate-800 flex flex-col gap-1.5"
      >
        <div className="flex items-end gap-3 w-full">
          <textarea
            ref={inputRef}
            id="message-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={isConnected ? 'Type a message… (Enter to send)' : 'Connecting…'}
            rows={1}
            maxLength={200}
            disabled={!isConnected}
            aria-label="Message input"
            className="flex-1 resize-none px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white
              placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50
              disabled:opacity-60 transition-colors max-h-32 overflow-y-auto leading-relaxed"
            style={{ scrollbarWidth: 'thin' }}
          />

          <button
            id="send-message-btn"
            type="submit"
            disabled={!isConnected || !inputText.trim()}
            aria-label="Send message"
            className="flex-none flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500
              active:bg-blue-700 text-white shadow-md shadow-blue-600/30 hover:shadow-blue-500/40
              disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Character limit counter */}
        <div className="flex justify-end px-1">
          <span
            className={`text-[11px] font-mono ${
              inputText.length >= 200
                ? 'text-red-400 font-bold'
                : inputText.length > 170
                ? 'text-amber-400'
                : 'text-slate-500'
            }`}
          >
            {inputText.length} / 200
          </span>
        </div>
      </form>

      {/* ── Delete Room Confirmation Modal ── */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1">Delete Room #{roomId}?</h3>
              <p className="text-slate-400 text-xs">
                This action is permanent and will delete all stored message history for this room.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                disabled={isDeletingRoom}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteRoom}
                disabled={isDeletingRoom}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-xs shadow-md shadow-red-600/30 transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeletingRoom ? (
                  <span className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}