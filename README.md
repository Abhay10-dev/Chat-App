# Chat Application

A full-stack real-time chat application built with Spring Boot, WebSockets, MongoDB on the backend, and React, Vite, Tailwind CSS on the frontend. It includes authentication using JWT.

## Project Structure

The repository is divided into two main components:
- `chat-app-backend/`: The Spring Boot backend.
- `chat-frontend/`: The React frontend.

## Tech Stack

### Backend
- **Java 21**
- **Spring Boot 4.1.0**
- **Spring Security & JWT** for Authentication
- **Spring WebSocket** for real-time messaging
- **Spring Data MongoDB** for database operations
- **Lombok**

### Frontend
- **React 19**
- **Vite**
- **Tailwind CSS 4**
- **React Router** for navigation
- **SockJS & STOMP** (`@stomp/stompjs`, `sockjs-client`) for WebSocket connections
- **Lucide React** for icons
- **Sonner / React Hot Toast** for notifications

## Getting Started

### Prerequisites
- Java 21
- Node.js & npm
- MongoDB instance running

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd chat-app-backend
   ```
2. Configure your MongoDB connection in `application.properties` or `application.yml` (located in `src/main/resources`).
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *(On Windows, use `mvnw.cmd spring-boot:run`)*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd chat-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables if necessary (e.g., in `.env` for backend API URLs).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Features
- Real-time messaging with WebSockets (STOMP/SockJS)
- User Authentication with JWT
- Chat rooms / private messaging (implementation specific)
- Responsive UI designed with Tailwind CSS
