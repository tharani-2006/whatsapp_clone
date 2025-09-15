# WhatsApp Clone Project

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Flow](#project-flow)
4. [Key Features](#key-features)
5. [How Each Page Works](#how-each-page-works)
6. [Important Code and Their Purpose](#important-code-and-their-purpose)
7. [How Sockets, Axios, and Other Tools Work](#how-sockets-axios-and-other-tools-work)
8. [Setup Instructions](#setup-instructions)

---

## Project Overview

This project is a **WhatsApp Clone** that replicates the core functionalities of WhatsApp, including real-time messaging, user authentication, profile management, and call history. The application is built using **React** for the frontend and **Node.js** for the backend, with **MongoDB** as the database. Real-time communication is powered by **Socket.IO**, and RESTful APIs are used for data fetching and user management.

---

## Tech Stack

### Frontend:
- **React**: For building the user interface.
- **Axios**: For making HTTP requests to the backend.
- **Socket.IO Client**: For real-time communication.
- **EmailJS**: For sending OTPs via email.

### Backend:
- **Node.js**: For building the server.
- **Express.js**: For handling API routes.
- **Socket.IO**: For real-time communication.
- **MongoDB**: For storing user data, messages, and call history.
- **Multer**: For handling file uploads (e.g., profile pictures).

---

## Project Flow

1. **User Registration**:
   - Users register with their email, password, name, and phone number.
   - An OTP is sent to their email using **EmailJS** for verification.

2. **User Login**:
   - Users log in with their email and password.
   - A JWT token is generated for authentication.

3. **Real-Time Messaging**:
   - Users can send and receive messages in real-time using **Socket.IO**.
   - Messages are stored in MongoDB for persistence.

4. **Profile Management**:
   - Users can update their profile picture, name, and about section.
   - Profile pictures are uploaded using **Multer**.

5. **Call History**:
   - Users can view their call history, including missed, received, and outgoing calls.

6. **Search and Add Contacts**:
   - Users can search for other users by email or phone number.

---

## Key Features

1. **Real-Time Messaging**:
   - Powered by **Socket.IO** for instant communication.

2. **User Authentication**:
   - JWT-based authentication for secure login and session management.

3. **Profile Management**:
   - Users can upload profile pictures and update their details.

4. **Call History**:
   - Displays a list of recent calls with timestamps and statuses.

5. **Email Verification**:
   - OTPs are sent via **EmailJS** for email verification during registration.

6. **Responsive Design**:
   - Fully responsive UI for both desktop and mobile devices.

---

## How Each Page Works

### 1. **Register Page**
   - **Purpose**: Allows users to create an account.
   - **Flow**:
     1. User enters their details (name, email, password, phone number).
     2. An OTP is sent to their email via **EmailJS**.
     3. User enters the OTP to verify their email.
     4. On success, the user is redirected to the login page.

### 2. **Login Page**
   - **Purpose**: Allows users to log in to their account.
   - **Flow**:
     1. User enters their email and password.
     2. The backend verifies the credentials and returns a JWT token.
     3. The token is stored in local storage for authentication.

### 3. **Chat Page**
   - **Purpose**: Displays the chat interface for real-time messaging.
   - **Flow**:
     1. Users can select a contact from the sidebar.
     2. Messages are sent and received in real-time using **Socket.IO**.
     3. Messages are stored in MongoDB for persistence.

### 4. **Profile Page**
   - **Purpose**: Allows users to update their profile details.
   - **Flow**:
     1. Users can upload a profile picture using **Multer**.
     2. Users can update their name and about section.

### 5. **Call History Page**
   - **Purpose**: Displays the user's call history.
   - **Flow**:
     1. Fetches call history from the backend using **Axios**.
     2. Displays the call type (missed, received, outgoing) and timestamp.

---

## Important Code and Their Purpose

### 1. **Socket.IO (Real-Time Messaging)**
   - **Backend**:
     ```javascript
     const io = require('socket.io')(server, {
       cors: {
         origin: 'http://localhost:3000',
         methods: ['GET', 'POST']
       }
     });

     io.on('connection', (socket) => {
       console.log('User connected:', socket.id);

       socket.on('send_message', (data) => {
         io.to(data.chatId).emit('receive_message', data);
       });

       socket.on('disconnect', () => {
         console.log('User disconnected:', socket.id);
       });
     });
     ```
   - **Frontend**:
     ```javascript
     import { io } from 'socket.io-client';

     const socket = io('http://localhost:5000');

     socket.on('receive_message', (message) => {
       console.log('New message:', message);
     });

     const sendMessage = (message) => {
       socket.emit('send_message', message);
     };
     ```

### 2. **Axios (HTTP Requests)**
   - **Purpose**: Used for making API calls to the backend.
   - **Example**:
     ```javascript
     import axios from 'axios';

     const api = axios.create({
       baseURL: 'http://localhost:5000/api',
       headers: {
         Authorization: `Bearer ${localStorage.getItem('token')}`
       }
     });

     export default api;
     ```

### 3. **EmailJS (Email Verification)**
   - **Purpose**: Sends OTPs to users' email addresses during registration.
   - **Example**:
     ```javascript
     import emailjs from 'emailjs-com';

     const sendOTP = (email, otp) => {
       emailjs.send('service_id', 'template_id', {
         to_email: email,
         otp: otp
       }, 'user_id')
       .then((response) => {
         console.log('Email sent successfully:', response.status);
       })
       .catch((error) => {
         console.error('Error sending email:', error);
       });
     };
     ```

---

## How Sockets, Axios, and Other Tools Work

1. **Socket.IO**:
   - Enables real-time communication between the client and server.
   - Used for sending and receiving messages instantly.

2. **Axios**:
   - Simplifies HTTP requests to the backend.
   - Used for user authentication, fetching data, and updating profiles.

3. **EmailJS**:
   - Sends OTPs directly from the frontend without requiring a backend email service.
   - Used for email verification during registration.

4. **Multer**:
   - Handles file uploads (e.g., profile pictures) on the backend.

---

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/whatsapp-clone.git
   cd whatsapp-clone