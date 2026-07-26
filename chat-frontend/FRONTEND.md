# Chat App — Frontend Integration Guide

> **Stack**: Spring Boot 4.1 · MongoDB · Spring Security JWT · STOMP over SockJS WebSocket  
> **Base URL**: `http://localhost:8081`  
> **CORS**: Allowed origins configured dynamically via `app.cors.allowed-origins` (`http://localhost:5173`, etc.)

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Data Models](#data-models)
3. [Authentication Endpoints](#authentication-endpoints)
4. [REST API Reference](#rest-api-reference)
5. [WebSocket / Real-time Messaging](#websocket--real-time-messaging)
6. [Error Handling](#error-handling)
7. [Recommended UI Flow](#recommended-ui-flow)
8. [Example Code Snippets](#example-code-snippets)

---

## Tech Stack Overview

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Language     | Java 21                                        |
| Framework    | Spring Boot 4.1 · Spring Security (Stateless)  |
| Auth         | JJWT (HS256 Bearer Token)                      |
| Database     | MongoDB (`chat-app` database)                  |
| REST         | Spring Web (`/api/auth`, `/api/rooms`)         |
| Real-time    | STOMP over SockJS (`/chat` endpoint)           |
| Serialization| JSON (Jackson default)                         |

---

## Data Models

### `User`

```json
{
  "id": "mongo_generated_user_id",
  "username": "alice",
  "password": "[BCrypt Hash]"
}
```

---

### `Room`

```json
{
  "id": "mongo_generated_object_id",
  "roomId": "my-room-001",
  "createdBy": "alice"
}
```

| Field       | Type     | Description                        |
|-------------|----------|------------------------------------|
| `id`        | `string` | MongoDB auto-generated `_id`       |
| `roomId`    | `string` | Human-readable room identifier     |
| `createdBy` | `string` | Username of the room creator       |

---

### `Message`

```json
{
  "id": "mongo_message_id",
  "roomId": "my-room-001",
  "sender": "alice",
  "content": "Hello, World!",
  "timeStamp": "2026-07-26T18:00:00Z"
}
```

| Field       | Type      | Description                                                |
|-------------|-----------|------------------------------------------------------------|
| `id`        | `string`  | MongoDB auto-generated `_id`                               |
| `roomId`    | `string`  | Associated room ID                                         |
| `sender`    | `string`  | Verified username of sender (from Principal)               |
| `content`   | `string`  | Message text (Max 200 characters)                          |
| `timeStamp` | `string`  | ISO-8601 Instant timestamp                                 |

---

## Authentication Endpoints

### 1. Register User

```
POST /api/auth/register
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "alice",
  "password": "secretpassword"
}
```

**Success** — `201 Created`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "alice"
}
```

---

### 2. Login User

```
POST /api/auth/login
Content-Type: application/json
```

**Request Body**:
```json
{
  "username": "alice",
  "password": "secretpassword"
}
```

**Success** — `200 OK`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "username": "alice"
}
```

---

## REST API Reference

> **Authorization**: Requires `Authorization: Bearer <token>` for all `/api/rooms/**` calls.

### Base path: `http://localhost:8081/api/rooms`

---

### 1. Create a Room

```
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{ "roomId": "my-room-001" }
```

**Success** — `201 Created`:
```json
{
  "id": "6883a2...",
  "roomId": "my-room-001",
  "createdBy": "alice"
}
```

---

### 2. Get a Room

```
GET /api/rooms?roomId={roomId}
Authorization: Bearer <token>
```

**Success** — `200 OK`: Returns full `Room` object including `createdBy`.

---

### 3. Get Room Messages (Paginated)

```
GET /api/rooms/{roomId}/messages?page={page}&pageSize={pageSize}
Authorization: Bearer <token>
```

**Success** — `200 OK`: Returns array of `Message` objects.

---

### 4. Delete a Room (Creator Only)

```
DELETE /api/rooms/{roomId}
Authorization: Bearer <token>
```

**Success** — `204 No Content`: Room and its messages deleted.  
**Error** — `403 Forbidden`: Returned if a non-creator attempts deletion.

```json
{
  "error": "Forbidden",
  "message": "Only the room creator can delete this room"
}
```

---

## WebSocket / Real-time Messaging

### Connection Details

| Property            | Value                                               |
|---------------------|-----------------------------------------------------|
| SockJS Endpoint     | `http://localhost:8081/chat`                        |
| Connect Headers     | `{ Authorization: "Bearer <token>" }`               |
| App Prefix          | `/app`                                              |
| Broker Prefix       | `/topic`                                            |
| Send Destination    | `/app/sendMessage/{roomId}`                         |
| Subscribe Topic     | `/topic/room/{roomId}`                              |

---

## Error Handling

| HTTP Status | Error Title             | Trigger                                                               |
|-------------|-------------------------|-----------------------------------------------------------------------|
| `401`       | `Unauthorized`          | Missing, invalid, or expired JWT token / Bad credentials             |
| `403`       | `Forbidden`             | Non-creator attempting to delete a room                               |
| `409`       | `Room Already Exists`   | `POST /api/rooms` with duplicate `roomId`                             |
| `404`       | `Room Not Found`        | Any operation referencing a non-existent room                         |
