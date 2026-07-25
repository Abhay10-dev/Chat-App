const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Check if a room exists.
 * @param {string} roomId
 * @returns {Promise<Response>}
 * @throws {Error} with .status attached for 404 / unexpected errors
 */
export async function checkRoom(roomId) {
  const res = await fetch(`${BASE_URL}/api/rooms?roomId=${encodeURIComponent(roomId)}`);
  if (res.status === 404) {
    const err = new Error('Room does not exist. Check the ID or create a new room.');
    err.status = 404;
    throw err;
  }
  if (!res.ok) {
    const err = new Error('Failed to check room. Please try again.');
    err.status = res.status;
    throw err;
  }
  return res;
}

/**
 * Create a new room.
 * @param {string} roomId
 * @returns {Promise<Response>}
 * @throws {Error} with .status attached for 409 / unexpected errors
 */
export async function createRoom(roomId) {
  const res = await fetch(`${BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  });
  if (res.status === 409) {
    const err = new Error('Room ID already exists. Click Join instead.');
    err.status = 409;
    throw err;
  }
  if (!res.ok) {
    const err = new Error('Failed to create room. Please try again.');
    err.status = res.status;
    throw err;
  }
  return res;
}

/**
 * Fetch paginated message history for a room.
 * @param {string} roomId
 * @param {number} page  Zero-indexed page number
 * @param {number} [pageSize=20]
 * @returns {Promise<Array>} Array of Message objects
 */
export async function fetchMessages(roomId, page, pageSize = 20) {
  const res = await fetch(
    `${BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/messages?page=${page}&pageSize=${pageSize}`
  );
  if (!res.ok) {
    const err = new Error('Failed to load message history.');
    err.status = res.status;
    throw err;
  }
  return res.json();
}
