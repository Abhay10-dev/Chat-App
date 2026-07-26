import { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('chat_token') || null);
  const [username, setUsername] = useState(() => localStorage.getItem('chat_username') || null);

  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sync token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('chat_token', token);
    } else {
      localStorage.removeItem('chat_token');
    }
  }, [token]);

  // Sync username to localStorage
  useEffect(() => {
    if (username) {
      localStorage.setItem('chat_username', username);
    } else {
      localStorage.removeItem('chat_username');
    }
  }, [username]);

  function loginAuth(newToken, newUsername) {
    setToken(newToken);
    setUsername(newUsername);
  }

  function logoutAuth() {
    setToken(null);
    setUsername(null);
    setCurrentRoomId(null);
    setMessages([]);
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_username');
  }

  const value = {
    token,
    setToken,
    username,
    setUsername,
    loginAuth,
    logoutAuth,
    currentRoomId,
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used inside a <ChatProvider>');
  }
  return ctx;
}
