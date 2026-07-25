import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('chat_username') || null;
  });
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Sync username to localStorage whenever it changes
  useEffect(() => {
    if (username) {
      localStorage.setItem('chat_username', username);
    }
  }, [username]);

  const value = {
    username,
    setUsername,
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

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used inside a <ChatProvider>');
  }
  return ctx;
}
