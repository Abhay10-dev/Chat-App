import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Singleton — prevents duplicate subscriptions on React re-renders
let client = null;

/**
 * Initialise and activate the STOMP WebSocket connection.
 * @param {string} roomId
 * @param {(message: object) => void} onMessageReceived
 * @param {(connected: boolean) => void} onConnectionChange
 * @returns {Client} The STOMP client instance
 */
export function initWebSocket(roomId, onMessageReceived, onConnectionChange) {
  // Clean up any pre-existing client before creating a new one
  if (client) {
    client.deactivate();
    client = null;
  }

  client = new Client({
    webSocketFactory: () => new SockJS(`${BASE_URL}/chat`),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,

    onConnect: () => {
      onConnectionChange(true);
      client.subscribe(`/topic/room/${roomId}`, (frame) => {
        try {
          const message = JSON.parse(frame.body);
          onMessageReceived(message);
        } catch (err) {
          console.error('[STOMP] Failed to parse incoming message:', err);
        }
      });
    },

    onDisconnect: () => {
      onConnectionChange(false);
    },

    onStompError: (frame) => {
      console.error('[STOMP] Broker error:', frame.headers['message']);
      onConnectionChange(false);
    },

    onWebSocketClose: () => {
      onConnectionChange(false);
    },
  });

  client.activate();
  return client;
}

/**
 * Publish a chat message to the server.
 * @param {string} roomId
 * @param {string} sender
 * @param {string} content
 */
export function sendChatMessage(roomId, sender, content) {
  if (client && client.connected) {
    client.publish({
      destination: `/app/sendMessage/${roomId}`,
      body: JSON.stringify({ roomId, sender, content }),
    });
  } else {
    console.warn('[STOMP] Cannot send — client not connected');
  }
}

/**
 * Deactivate and destroy the singleton STOMP client.
 */
export function disconnectWebSocket() {
  if (client) {
    client.deactivate();
    client = null;
  }
}

/** Exposes the raw client for edge-case reads (e.g. checking .connected) */
export function getClient() {
  return client;
}
