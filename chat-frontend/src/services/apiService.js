const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

/**
 * Returns authorization headers if token is present in localStorage.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('chat_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Register a new user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ token: string, username: string }>}
 */
export async function registerUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Registration failed. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Login user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ token: string, username: string }>}
 */
export async function loginUser(username, password) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Login failed. Invalid credentials.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Check if a room exists.
 * @param {string} roomId
 * @returns {Promise<object>} Room data
 */
export async function checkRoom(roomId) {
  const res = await fetch(`${BASE_URL}/api/rooms?roomId=${encodeURIComponent(roomId)}`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 404) {
    const err = new Error(data.message || 'Room does not exist. Check the ID or create a new room.');
    err.status = 404;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to check room.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Create a new room.
 * @param {string} roomId
 * @returns {Promise<object>} Created Room object
 */
export async function createRoom(roomId) {
  const res = await fetch(`${BASE_URL}/api/rooms`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ roomId }),
  });

  const data = await res.json().catch(() => ({}));
  if (res.status === 409) {
    const err = new Error(data.message || 'Room ID already exists. Click Join instead.');
    err.status = 409;
    throw err;
  }
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to create room. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Fetch all rooms created by the currently logged-in user.
 * @returns {Promise<Array>} Array of Room objects
 */
export async function getUserRooms() {
  const res = await fetch(`${BASE_URL}/api/rooms/my-rooms`, {
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ([]));
  if (!res.ok) {
    const err = new Error(data.message || 'Failed to load created rooms.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * Fetch paginated message history for a room.
 * @param {string} roomId
 * @param {number} page Zero-indexed page number
 * @param {number} [pageSize=20]
 * @returns {Promise<Array>} Array of Message objects
 */
export async function fetchMessages(roomId, page, pageSize = 20) {
  const res = await fetch(
    `${BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/messages?page=${page}&pageSize=${pageSize}`,
    { headers: getAuthHeaders() }
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || 'Failed to load message history.');
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Delete a room by roomId. Only creator can delete.
 * @param {string} roomId
 * @returns {Promise<void>}
 */
export async function deleteRoom(roomId) {
  const res = await fetch(`${BASE_URL}/api/rooms/${encodeURIComponent(roomId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.message || 'Only the room creator can delete this room.');
    err.status = res.status;
    throw err;
  }
}