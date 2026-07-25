import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { MessageSquare, LogIn, Plus, Loader2 } from 'lucide-react';
import { checkRoom, createRoom } from '../services/apiService';
import { useChatContext } from '../context/ChatContext';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{2,20}$/;

export default function LandingPage() {
  const { setUsername, setCurrentRoomId } = useChatContext();
  const navigate = useNavigate();

  const [usernameInput, setUsernameInput] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'JOIN' | 'CREATE'

  // Pre-fill username from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chat_username');
    if (saved) setUsernameInput(saved);
  }, []);

  function validate() {
    if (!USERNAME_REGEX.test(usernameInput.trim())) {
      toast.error('Username must be 2–20 characters: letters, numbers, or underscores only.');
      return false;
    }
    if (roomIdInput.trim().length < 3) {
      toast.error('Room ID must be at least 3 characters.');
      return false;
    }
    return true;
  }

  async function handleAction(type) {
    if (!validate()) return;

    const cleanUsername = usernameInput.trim();
    const cleanRoom = roomIdInput.trim().toLowerCase();

    setIsLoading(true);
    setActiveAction(type);

    try {
      if (type === 'JOIN') {
        await checkRoom(cleanRoom);
        toast.success(`Joined room #${cleanRoom}`);
      } else {
        await createRoom(cleanRoom);
        toast.success(`Room #${cleanRoom} created!`);
      }

      // Persist and set context
      localStorage.setItem('chat_username', cleanUsername);
      setUsername(cleanUsername);
      setCurrentRoomId(cleanRoom);
      navigate(`/chat/${cleanRoom}`);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !isLoading) handleAction('JOIN');
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40 mb-4">
            <MessageSquare className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ChatApp</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time conversations, instantly.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-semibold text-white mb-5">Join or Create a Room</h2>

          <div className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Alice_42"
                maxLength={20}
                aria-label="Your username"
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50
                  disabled:opacity-60 transition-colors"
              />
            </div>

            {/* Room ID */}
            <div>
              <label
                htmlFor="roomId"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
              >
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value.toLowerCase())}
                onKeyDown={handleKeyDown}
                placeholder="e.g. general-chat"
                aria-label="Room ID to join or create"
                disabled={isLoading}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500
                  focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50
                  disabled:opacity-60 transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                id="join-room-btn"
                onClick={() => handleAction('JOIN')}
                disabled={isLoading}
                aria-label="Join existing room"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500
                  active:bg-blue-700 text-white rounded-xl font-semibold text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                  shadow-md shadow-blue-600/30 hover:shadow-blue-500/40"
              >
                {isLoading && activeAction === 'JOIN' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Join Room
              </button>

              <button
                id="create-room-btn"
                onClick={() => handleAction('CREATE')}
                disabled={isLoading}
                aria-label="Create new room"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700
                  active:bg-slate-900 border border-slate-600 hover:border-slate-500
                  text-white rounded-xl font-semibold text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              >
                {isLoading && activeAction === 'CREATE' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create Room
              </button>
            </div>
          </div>

          <p className="text-slate-500 text-xs text-center mt-5">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to quickly join
          </p>
        </div>
      </div>
    </div>
  );
}
