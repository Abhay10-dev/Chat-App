# Chat App — Frontend Integration Guide

> **Stack**: Spring Boot 4.1 · MongoDB · STOMP over SockJS WebSocket  
> **Base URL**: `http://localhost:8080`  
> **CORS**: All origins are allowed (`*`)

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Data Models](#data-models)
3. [REST API Reference](#rest-api-reference)
4. [WebSocket / Real-time Messaging](#websocket--real-time-messaging)
5. [Error Handling](#error-handling)
6. [Recommended UI Flow](#recommended-ui-flow)
7. [Example Code Snippets](#example-code-snippets)

---

## Tech Stack Overview

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Language     | Java 21                             |
| Framework    | Spring Boot 4.1                     |
| Database     | MongoDB (`chat-app` database)       |
| REST         | Spring Web (`/api/rooms`)           |
| Real-time    | STOMP over SockJS (`/chat` endpoint)|
| Serialization| JSON (Jackson default)              |

---

## Data Models

### `Room`

```json
{
  "id": "mongo_generated_object_id",
  "roomId": "my-room-001",
  "messages": []
}
```

| Field      | Type        | Description                        |
|------------|-------------|------------------------------------|
| `id`       | `string`    | MongoDB auto-generated `_id`       |
| `roomId`   | `string`    | Human-readable room identifier     |
| `messages` | `Message[]` | All messages stored in this room   |

---

### `Message`

```json
{
  "sender": "alice",
  "content": "Hello, World!",
  "timeStamp": "2026-07-25T17:30:00"
}
```

| Field       | Type      | Description                                      |
|-------------|-----------|--------------------------------------------------|
| `sender`    | `string`  | Username / display name of the sender            |
| `content`   | `string`  | The message text                                 |
| `timeStamp` | `string`  | ISO-8601 `LocalDateTime` (no timezone). Format: `YYYY-MM-DDTHH:mm:ss` |

> **Note**: `timeStamp` has no timezone — treat it as the server local time.

---

## REST API Reference

### Base path: `http://localhost:8080/api/rooms`

---

### 1. Create a Room

```
POST /api/rooms
Content-Type: application/json
```

**Request Body**:
```json
{ "roomId": "my-room-001" }
```

| Field    | Type     | Required | Description                    |
|----------|----------|----------|--------------------------------|
| `roomId` | `string` | YES      | Unique identifier for the room |

**Success** — `201 Created`:
```json
{
  "id": "6883a2...",
  "roomId": "my-room-001",
  "messages": []
}
```

**Error** — `409 Conflict` (duplicate roomId):
```json
{
  "error": "Room Already Exists",
  "message": "Room with ID my-room-001 already exists."
}
```

---

### 2. Get a Room

```
GET /api/rooms?roomId={roomId}
```

| Query Param | Type     | Required | Description              |
|-------------|----------|----------|--------------------------|
| `roomId`    | `string` | YES      | The room ID to look up   |

**Success** — `200 OK`: Returns full `Room` object (same shape as above).

**Error** — `404 Not Found`:
```json
{
  "error": "Room Not Found",
  "message": "Room with ID my-room-001 does not exist."
}
```

> Use this to validate a room exists before connecting via WebSocket.

---

### 3. Get Room Messages (Paginated)

```
GET /api/rooms/{roomId}/messages?page={page}&pageSize={pageSize}
```

| Parameter  | Type    | Required | Default | Description                        |
|------------|---------|----------|---------|------------------------------------|
| `roomId`   | `string`| YES (path)| —      | The room ID                        |
| `page`     | `int`   | NO       | `0`     | Page number (0-indexed)            |
| `pageSize` | `int`   | NO       | `20`    | Number of messages per page        |

**Pagination notes**:
- Messages are stored oldest → newest internally.
- `page=0` returns the **most recent** `pageSize` messages.
- `page=1` returns the previous `pageSize` messages (older), etc.
- This is **reverse chronological pagination** — ideal for "load more" UX.

**Success** — `200 OK`: Returns `Message[]`.

**Error** — `404 Not Found` if room does not exist.

---

## WebSocket / Real-time Messaging

The backend uses **STOMP** over **SockJS** for real-time messaging.

### Connection Details

| Property            | Value                               |
|---------------------|-------------------------------------|
| SockJS Endpoint     | `http://localhost:8080/chat`        |
| App Prefix          | `/app`                              |
| Broker Prefix       | `/topic`                            |
| Send Destination    | `/app/sendMessage/{roomId}`         |
| Subscribe Topic     | `/topic/room/{roomId}`              |

### Required Packages

```bash
npm install @stomp/stompjs sockjs-client
```

---

### Connection Setup

```js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
  reconnectDelay: 5000,
  onConnect: () => {
    console.log('Connected to WebSocket');
  },
  onDisconnect: () => {
    console.log('Disconnected');
  },
});

client.activate();
```

---

### Subscribe to a Room

```js
client.subscribe(`/topic/room/${roomId}`, (frame) => {
  const message = JSON.parse(frame.body);
  // { sender, content, timeStamp }
  appendToChat(message);
});
```

---

### Send a Message

```js
client.publish({
  destination: `/app/sendMessage/${roomId}`,
  body: JSON.stringify({
    roomId: roomId,
    sender: username,
    content: messageText,
  }),
});
```

**Payload fields**:

| Field     | Type     | Required | Description                     |
|-----------|----------|----------|---------------------------------|
| `roomId`  | `string` | YES      | Must match the subscribed room  |
| `sender`  | `string` | YES      | Username / display name         |
| `content` | `string` | YES      | Message text                    |

> After publishing, ALL subscribers (including sender) on `/topic/room/{roomId}` will receive the message back. Do NOT optimistically add it to the UI before the server echoes it back.

---

## Error Handling

All REST errors return:

```json
{
  "error": "<Error Title>",
  "message": "<Detailed message>"
}
```

| HTTP Status | Error Title             | Trigger                                         |
|-------------|-------------------------|-------------------------------------------------|
| `409`       | `Room Already Exists`   | `POST /api/rooms` with a duplicate `roomId`     |
| `404`       | `Room Not Found`        | Any operation referencing a non-existent room   |
| `404`       | `Resource Not Found`    | General resource not found                      |

---

## Recommended UI Flow

```
1. LANDING / JOIN SCREEN
   ├── Input: Username  (persist in localStorage)
   ├── Input: Room ID
   ├── [Join Room]   -> GET /api/rooms?roomId={id}
   │     200 -> go to Chat Screen
   │     404 -> show "Room not found"
   └── [Create Room] -> POST /api/rooms { roomId }
         201 -> go to Chat Screen
         409 -> show "Room already exists"

2. CHAT SCREEN
   ├── On mount:
   │     ├── GET /api/rooms/{roomId}/messages?page=0&pageSize=20
   │     └── Connect WebSocket, subscribe to /topic/room/{roomId}
   ├── Message list (oldest at top, newest at bottom)
   │     └── Scroll to top -> load page+1 (older messages)
   ├── Message input + Send button
   │     └── Publish to /app/sendMessage/{roomId}
   └── WebSocket message received -> append to bottom of list
```

---

## Example Code Snippets

### Join a Room

```js
async function joinRoom(roomId) {
  const res = await fetch(`http://localhost:8080/api/rooms?roomId=${roomId}`);
  if (res.status === 404) throw new Error('Room not found');
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}
```

### Create a Room

```js
async function createRoom(roomId) {
  const res = await fetch('http://localhost:8080/api/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId }),
  });
  if (res.status === 409) throw new Error('Room already exists');
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}
```

### Fetch Message History

```js
async function fetchMessages(roomId, page = 0, pageSize = 20) {
  const res = await fetch(
    `http://localhost:8080/api/rooms/${roomId}/messages?page=${page}&pageSize=${pageSize}`
  );
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json(); // Message[]
}
```

### Full Chat Service (WebSocket)

```js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export function connectToRoom(roomId, onMessage) {
  stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8080/chat'),
    reconnectDelay: 5000,
    onConnect: () => {
      stompClient.subscribe(`/topic/room/${roomId}`, (frame) => {
        onMessage(JSON.parse(frame.body));
      });
    },
  });
  stompClient.activate();
}

export function sendMessage(roomId, sender, content) {
  if (!stompClient?.connected) return;
  stompClient.publish({
    destination: `/app/sendMessage/${roomId}`,
    body: JSON.stringify({ roomId, sender, content }),
  });
}

export function disconnect() {
  stompClient?.deactivate();
}
```

---

## Suggested App State

```js
{
  username: 'alice',          // from user input, persist to localStorage
  currentRoom: {
    roomId: 'my-room-001',
    id: 'mongo_id',
  },
  messages: [                 // Message[]
    { sender, content, timeStamp }
  ],
  messagePage: 0,             // increment for "load more older messages"
  isConnected: false,         // WebSocket connection status
}
```

---

## Pages to Build

| Screen         | Key Elements                                                |
|----------------|-------------------------------------------------------------|
| **Landing**    | Username input, Room ID input, Join + Create buttons        |
| **Chat Room**  | Scrollable message history, real-time feed, message input   |
