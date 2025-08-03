const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');


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

  // Handle user connection
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit('user_status', { userId, status: 'online' });
  });

  // Handle private messages
  socket.on('send_message', async (messageData) => {
    const recipientSocket = onlineUsers.get(messageData.recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit('receive_message', messageData);
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
    let disconnectedUserId;
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
      }
    });

    if (disconnectedUserId) {
      onlineUsers.delete(disconnectedUserId);
      io.emit('user_status', {
        userId: disconnectedUserId,
        status: 'offline'
      });
    }
  });
});

app.use(cors());
app.use(express.json());

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
