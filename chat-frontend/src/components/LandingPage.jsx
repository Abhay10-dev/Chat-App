import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { MessageSquare, LogIn, Plus, Loader2, User, LogOut, ShieldCheck, Trash2, ArrowRight } from 'lucide-react';
import { checkRoom, createRoom, loginUser, registerUser, getUserRooms, deleteRoom } from '../services/apiService';
import { useChatContext } from '../context/ChatContext';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{2,20}$/;

export default function LandingPage() {
  const { token, username, loginAuth, logoutAuth, setCurrentRoomId } = useChatContext();
  const navigate = useNavigate();

  // Auth State
  const [authTab, setAuthTab] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Room State
  const [roomIdInput, setRoomIdInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'LOGIN' | 'REGISTER' | 'JOIN' | 'CREATE' | 'DELETE_ROOM_ID'

  // Created Rooms State
  const [createdRooms, setCreatedRooms] = useState([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  // Fetch rooms created by the logged-in user
  useEffect(() => {
    if (token) {
      fetchUserRooms();
    }
  }, [token]);

  async function fetchUserRooms() {
    setIsFetchingRooms(true);
    try {
      const rooms = await getUserRooms();
      setCreatedRooms(rooms || []);
    } catch (err) {
      console.error('Failed to load user created rooms:', err);
    } finally {
      setIsFetchingRooms(false);
    }
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    if (!USERNAME_REGEX.test(authUsername.trim())) {
      toast.error('Username must be 2–20 characters: letters, numbers, or underscores.');
      return;
    }
    if (authPassword.length < 4) {
      toast.error('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    setActiveAction(authTab);

    try {
      if (authTab === 'LOGIN') {
        const res = await loginUser(authUsername.trim(), authPassword);
        loginAuth(res.token, res.username);
        toast.success(`Welcome back, @${res.username}!`);
      } else {
        const res = await registerUser(authUsername.trim(), authPassword);
        loginAuth(res.token, res.username);
        toast.success(`Account created! Welcome, @${res.username}!`);
      }
      setAuthPassword('');
    } catch (err) {
      toast.error(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  function validateRoom() {
    if (roomIdInput.trim().length < 3) {
      toast.error('Room ID must be at least 3 characters.');
      return false;
    }
    return true;
  }

  async function handleRoomAction(type) {
    if (!validateRoom()) return;

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
        fetchUserRooms(); // Refresh the created rooms list
      }

      setCurrentRoomId(cleanRoom);
      navigate(`/chat/${cleanRoom}`);
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  async function handleDeleteRoom(targetRoomId) {
    if (!window.confirm(`Are you sure you want to delete room #${targetRoomId}? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setActiveAction(`DELETE_${targetRoomId}`);

    try {
      await deleteRoom(targetRoomId);
      toast.success(`Room #${targetRoomId} deleted successfully.`);
      setCreatedRooms((prev) => prev.filter((r) => r.roomId !== targetRoomId));
    } catch (err) {
      toast.error(err.message || 'Failed to delete room.');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  }

  function handleRoomKeyDown(e) {
    if (e.key === 'Enter' && !isLoading) handleRoomAction('JOIN');
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
          <p className="text-slate-400 text-sm mt-1">Real-time conversations with JWT security.</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-2xl shadow-black/50 space-y-6">
          {!token ? (
            /* ── Auth Form (Login / Register) ── */
            <div>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 bg-slate-800/80 p-1 rounded-xl mb-6 border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => setAuthTab('LOGIN')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    authTab === 'LOGIN'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('REGISTER')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    authTab === 'REGISTER'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="auth-username"
                    className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                  >
                    Username
                  </label>
                  <input
                    id="auth-username"
                    type="text"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder="e.g. Alice_42"
                    maxLength={20}
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50
                      disabled:opacity-60 transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder:text-slate-500
                      focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50
                      disabled:opacity-60 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500
                    active:bg-blue-700 text-white rounded-xl font-semibold text-sm
                    disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150
                    shadow-md shadow-blue-600/30 hover:shadow-blue-500/40"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  {authTab === 'LOGIN' ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </div>
          ) : (
            /* ── Room Join / Create Form ── */
            <div>
              {/* Authenticated User Banner */}
              <div className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-xl px-3.5 py-2.5 mb-5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold text-white truncate">
                    @{username}
                  </span>
                </div>
                <button
                  onClick={logoutAuth}
                  title="Sign out"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              <h2 className="text-lg font-semibold text-white mb-4">Join or Create a Room</h2>

              <div className="space-y-4">
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
                    onKeyDown={handleRoomKeyDown}
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
                    onClick={() => handleRoomAction('JOIN')}
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
                    onClick={() => handleRoomAction('CREATE')}
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

              {/* ── My Created Rooms Section ── */}
              {createdRooms.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Rooms Created By You ({createdRooms.length})
                  </h3>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {createdRooms.map((room) => (
                      <div
                        key={room.roomId || room.id}
                        className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 transition-colors"
                      >
                        <span className="text-sm font-medium text-slate-200 truncate max-w-[180px]">
                          #{room.roomId}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Join Created Room */}
                          <button
                            onClick={() => {
                              setCurrentRoomId(room.roomId);
                              navigate(`/chat/${room.roomId}`);
                            }}
                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-colors"
                          >
                            <span>Enter</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Created Room */}
                          <button
                            onClick={() => handleDeleteRoom(room.roomId)}
                            disabled={isLoading && activeAction === `DELETE_${room.roomId}`}
                            title="Delete this room"
                            className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {isLoading && activeAction === `DELETE_${room.roomId}` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-slate-500 text-xs text-center mt-5">
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to quickly join
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}