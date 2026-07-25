import { useEffect, useRef } from 'react';
import { initWebSocket, disconnectWebSocket, sendChatMessage } from '../services/stompService';

/**
 * Manages the full STOMP WebSocket lifecycle for a room.
 *
 * @param {string} roomId
 * @param {(message: object) => void} onMessageReceived
 * @param {(connected: boolean) => void} onConnectionChange
 */
export function useChatWebSocket(roomId, onMessageReceived, onConnectionChange) {
  // Keep stable refs so the effect doesn't re-run on every parent render
  const onMsgRef = useRef(onMessageReceived);
  const onConnRef = useRef(onConnectionChange);

  useEffect(() => {
    onMsgRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    onConnRef.current = onConnectionChange;
  }, [onConnectionChange]);

  useEffect(() => {
    if (!roomId) return;

    initWebSocket(
      roomId,
      (msg) => onMsgRef.current(msg),
      (connected) => onConnRef.current(connected)
    );

    return () => {
      disconnectWebSocket();
    };
  }, [roomId]);

  return {
    send: (sender, content) => sendChatMessage(roomId, sender, content),
  };
}
