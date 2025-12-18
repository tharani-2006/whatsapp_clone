# 💬 WhatsApp Clone

**Real-time messaging application with WebRTC voice/video calls, status updates, and JWT authentication.**

---

##  Project Overview

Full-stack messaging app built with React and Node.js. Handles real-time chat via Socket.IO, WebRTC calls, status updates, and JWT auth. Users register, upload profile pics, search contacts, and track call history. Backend uses MongoDB with Express APIs; frontend is React with Tailwind CSS. Messages persist in the database while Socket.IO handles live delivery.

---

##  Key Features

- **Real-time messaging** — Instant message delivery using Socket.IO with typing indicators
- **Voice & video calls** — WebRTC-based peer-to-peer communication with call history tracking
- **Status updates** — Share temporary status posts visible to all contacts
- **User authentication** — JWT-based secure login with email verification via EmailJS
- **Profile management** — Upload profile pictures, update name and about section
- **Contact search** — Find and add users by email or phone number

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI framework
- **React Router DOM** — Client-side routing
- **Tailwind CSS** — Styling
- **Socket.IO Client** — Real-time WebSocket communication
- **Axios** — HTTP client for API requests

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Web framework
- **Socket.IO** — Real-time bidirectional communication
- **JWT** — Authentication tokens
- **bcryptjs** — Password hashing
- **Multer** — File upload handling

### Database
- **MongoDB** — NoSQL database with Mongoose ODM

### Tools
- **WebRTC** — Peer-to-peer media streaming
- **EmailJS** — Email verification service
- **Nodemon** — Development server auto-reload

---

##  Architecture 

React frontend sends HTTP requests to Express backend for auth and data operations. Socket.IO manages real-time events (messages, calls, status). MongoDB persists users, messages, chats, and call logs. WebRTC calls use Socket.IO for signaling (offer/answer/ICE candidates) before establishing peer-to-peer connections. JWT middleware protects routes by validating tokens on each request.

---

## Screenshots 

Screenshot 2025-09-15 005808.png
Screenshot 2025-09-15 005928.png
Screenshot 2025-09-15 005903.png

## 🚀 Setup Instructions

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd whatsapp
   ```

2. **Backend setup:**
   ```bash
   cd server
   npm install
   ```
   Create `.env` file:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
   Start server: `npm start` (or `npm run dev` for nodemon)

3. **Frontend setup:**
   ```bash
   cd client
   npm install
   npm start
   ```
   Update API base URL in `src/utils/axios.js` if backend runs on different port

4. **Open** `http://localhost:3000` in your browser

---

##  Notes

- **MongoDB:** Run locally or use MongoDB Atlas (update `MONGO_URI` in `.env`)
- **EmailJS:** Configure credentials in `client/src/utils/emailjsConfig.js` for OTP verification
- **Ports:** Backend defaults to `5000`, frontend to `3000`
- **File storage:** Profile pics and status images saved in `server/uploads/` directory
- **JWT:** Token expires after 1 day (configurable in `server/routes/auth.js`)

---

## 📄 License

ISC

