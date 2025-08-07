const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const Chat = require('./models/Chat');
const Message = require('./models/Message');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store user's socket id
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('User mapped:', userId, socket.id);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log('User joined chat:', chatId);
  });

  // Handle new message
  socket.on('new_message', async (messageData) => {
    try {
      // Broadcast to everyone in the chat room immediately
      io.in(messageData.chatId).emit('receive_message', messageData);
    } catch (err) {
      console.error('Error broadcasting message:', err);
    }
  });

  // Handle typing status
  socket.on('typing', (data) => {
    const recipientSocket = onlineUsers.get(data.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('user_typing', {
        chatId: data.chatId,
        userId: data.userId
      });
    }
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api', chatRoutes);

app.get('/', (req, res) => res.send('WhatsApp Clone Backend Running'));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Running at http://localhost:${PORT}`));
