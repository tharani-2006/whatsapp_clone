# WhatsApp Clone

A full-stack WhatsApp clone built with React.js, Node.js, Express, MongoDB, and Socket.io featuring real-time messaging, voice/video calls, and status updates.

## 🚀 Features

### 💬 **Chat Features**
- Real-time messaging with Socket.io
- User authentication (Login/Register)
- Chat history and message persistence
- WhatsApp-like UI with sidebar and chat window
- Message timestamps and delivery status

### 📞 **Call Features**
- Voice and video calling
- Call history tracking
- Call status indicators (missed, incoming, outgoing)
- Real-time call notifications

### 📊 **Status Features**
- 24-hour auto-expiring status updates
- Text and image status support
- Status view modal with full content display
- Delete own status functionality
- Real-time status updates for all users

### 🎨 **UI Features**
- WhatsApp-like design and color scheme
- Responsive design for mobile and desktop
- Top navigation tabs (Chats, Calls, Status)
- Professional modal interfaces
- Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Socket.io-client** - Real-time communication
- **Axios** - HTTP client
- **CSS3** - Styling with WhatsApp-like design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

## 📁 Project Structure

```
whatsapp-clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── chat/       # Chat-related components
│   │   │   ├── call/       # Call-related components
│   │   │   └── ...
│   │   ├── context/        # React context providers
│   │   ├── utils/          # Utility functions
│   │   └── App.js          # Main app component
│   └── public/
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── uploads/            # File uploads
│   └── index.js            # Server entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whatsapp-clone
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/whatsapp-clone
   JWT_SECRET=your-jwt-secret-key
   PORT=5000
   ```

6. **Run the application**
   
   **Start the server** (in `server` directory):
   ```bash
   npm start
   # or
   node index.js
   ```
   
   **Start the client** (in `client` directory):
   ```bash
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📱 How to Use

### 1. **Authentication**
- Register a new account or login with existing credentials
- JWT-based authentication with secure password hashing

### 2. **Chatting**
- Navigate to the "Chats" tab
- Select a user from the sidebar to start chatting
- Send real-time messages with instant delivery

### 3. **Voice/Video Calls**
- Navigate to the "Calls" tab to view call history
- Initiate calls from chat interface
- View call status and duration

### 4. **Status Updates**
- Navigate to the "Status" tab
- Click the camera button (📷) to add a new status
- Add text, images, or both
- View others' status by clicking on them
- Delete your own status with the delete button (🗑️)
- Status automatically expires after 24 hours

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Chat
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id/messages` - Get chat messages
- `POST /api/chats/:id/messages` - Send message

### Status
- `GET /api/status` - Get all status updates
- `POST /api/status` - Create new status
- `DELETE /api/status/:id` - Delete status

### Calls
- `GET /api/callHistory` - Get call history

## 🌟 Key Features Explained

### Real-time Communication
- Socket.io enables instant messaging and status updates
- Real-time typing indicators and online status
- Live call notifications and status updates

### File Upload
- Multer handles image uploads for status updates
- Images stored in `server/uploads/statuses/`
- Support for PNG, JPG, JPEG formats (max 5MB)

### Authentication & Security
- JWT tokens for secure authentication
- Password hashing with bcryptjs
- Protected routes and middleware

### Database Design
- User model with authentication fields
- Chat and Message models for messaging
- Status model with 24-hour expiry
- Call history tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- WhatsApp for design inspiration
- Socket.io for real-time communication
- MongoDB for database solutions
- React.js community for excellent documentation

