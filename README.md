# Chat Application

A full-stack, real-time chat application built with **Spring Boot**, **WebSockets**, and **MongoDB** on the backend, paired with **React**, **Vite**, and **Tailwind CSS** on the frontend. Features secure user authentication powered by JWT.

---

## 🚀 Live Demo

* **Frontend:** [https://chat-frontend-url.onrender.com](https://www.google.com/search?q=https://chat-frontend-url.onrender.com) *(Update with your actual frontend URL)*
* **Backend API:** [https://chat-app-backend-latest-vkos.onrender.com](https://chat-app-backend-latest-vkos.onrender.com)

---

## 📁 Repository Structure

```text
.
├── chat-app-backend/    # Spring Boot backend application
└── chat-frontend/       # React + Vite frontend application

```

---

## 🛠️ Tech Stack

### Backend

* **Java 21**
* **Spring Boot 3.x / 4.x**
* **Spring Security & JWT** (Authentication & Authorization)
* **Spring WebSocket** (STOMP Broker for real-time messaging)
* **Spring Data MongoDB** (Database interaction & Atlas integration)
* **Lombok**

### Frontend

* **React 19**
* **Vite**
* **Tailwind CSS v4**
* **React Router**
* **SockJS & STOMP** (`@stomp/stompjs`, `sockjs-client`)
* **Lucide React** (UI Icons)
* **Sonner / React Hot Toast** (Toast notifications)

---

## 🌟 Key Features

* **Real-Time Communication:** Instant messaging powered by WebSockets via STOMP protocol over SockJS fallback.
* **JWT Authentication:** Secure user sign-up, sign-in, and stateless session management using JSON Web Tokens.
* **MongoDB Atlas Integration:** Cloud database configuration with automated environment variable binding.
* **Modern & Responsive UI:** Styled with Tailwind CSS for mobile and desktop screens.

---

## ⚙️ Environment Variables Setup

### Backend (`chat-app-backend`)

Configure these variables in your `src/main/resources/application.properties` file or pass them as system environment variables (e.g., on Render):

```properties
# Server Port
server.port=8081

# MongoDB Atlas Connection String
spring.data.mongodb.uri=${SPRING_DATA_MONGODB_URI}

# JWT Configuration (if applicable)
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION_MS:86400000}

```

> **Note:** For MongoDB Atlas, format your URI like this:
> `mongodb+srv://<username>:<password>@<cluster-host>/<database-name>?retryWrites=true&w=majority`

### Frontend (`chat-frontend`)

Create a `.env` file inside the `chat-frontend` directory:

```env
VITE_API_BASE_URL=https://chat-app-backend-latest-vkos.onrender.com

```

---

## 🚦 Getting Started Locally

### Prerequisites

* **Java 21 JDK** installed
* **Node.js** (v18+ recommended) & `npm`
* **MongoDB** (Local instance or MongoDB Atlas cluster)

---

### Backend Setup

1. **Navigate to the backend folder:**
```bash
cd chat-app-backend

```


2. **Set your environment variables** (or configure `src/main/resources/application.properties`).
3. **Run the Spring Boot server:**
```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows PowerShell / CMD
.\mvnw.cmd spring-boot:run

```


The server will start at `http://localhost:8081`.

---

### Frontend Setup

1. **Navigate to the frontend folder:**
```bash
cd chat-frontend

```


2. **Install dependencies:**
```bash
npm install

```


3. **Start the Vite development server:**
```bash
npm run dev

```