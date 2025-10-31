const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const { setIO } = require('./utils/io');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');
const Chat = require('./models/Chat');
const Message = require('./models/Message');
const CallHistory = require('./models/CallHistory'); 


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
setIO(io); // Set the io instance globally
app.set('socketio', io); // Make io available in routes

// Store online users
const onlineUsers = new Map();
// Store active calls
const activeCalls = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store user's socket id
  socket.on('user_connected', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log('User mapped:', userId, socket.id);
    console.log('Online Users:', onlineUsers);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log('User joined chat:', chatId);
  });

  // Handle call signaling
  socket.on('call_user', async (data) => {
    const { from, to, callType } = data;
    console.log('Calling user:', to);
    const recipientSocket = onlineUsers.get(to);
    
    if (recipientSocket) {
      const callId = `${from}_${to}_${Date.now()}`;
      activeCalls.set(callId, {
        participants: [socket.id, recipientSocket],
        callType,
        startTime: Date.now()
      });
      
      io.to(recipientSocket).emit('incoming_call', {
        from,
        callType,
        callId
      });

      // Save call to database
      try {
        const callHistory = new CallHistory({
          caller: from,
          receiver: to,
          startTime: new Date(),
          type: 'outgoing'
        });
        await callHistory.save();
      } catch (error) {
        console.error('Error saving call history:', error);
      }

    } else {
      console.log('Recipient not online:', to);
    }
  });

  socket.on('call_accepted', (data) => {
    const { callId, to } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('call_accepted', { callId });
    }
  });

  socket.on('call_rejected', (data) => {
    const { callId, to } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('call_rejected', { callId });
    }
  });

  socket.on('call_ended', async (data) => {
    const { callId, to } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('call_ended', { callId });
          }

    // Update call history in database
    try {
      const call = await CallHistory.findOne({ caller: data.from, receiver: data.to, type: 'outgoing', endTime: null }).sort({ startTime: -1 });
      if (call) {
        call.endTime = new Date();
        call.duration = (call.endTime - call.startTime) / 1000; // Duration in seconds
        await call.save();
      }
    } catch (error) {
      console.error('Error updating call history:', error);
    }
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    const { to, offer } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('offer', { from: socket.id, offer });
    }
});

  socket.on('answer', (data) => {
    const { to, answer } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('answer', { from: socket.id, answer });
    }
  });

  socket.on('ice_candidate', (data) => {
    const { to, candidate } = data;
    const recipientSocket = onlineUsers.get(to);

    if (recipientSocket) {
      io.to(recipientSocket).emit('ice_candidate', { from: socket.id, candidate });
    }
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

  // Handle new status update
  socket.on('new_status', (statusData) => {
    // Broadcast to all connected users (they'll filter on client side)
    socket.broadcast.emit('new_status', statusData);
  });

  // Handle status deletion
  socket.on('status_deleted', (statusId) => {
    // Broadcast to all connected users
    socket.broadcast.emit('status_deleted', statusId);
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    // Remove user from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        // End any active calls
        for (const [callId, call] of activeCalls.entries()) {
          if (call.participants.includes(socket.id)) {
            activeCalls.delete(callId);
            // Notify other participants
            call.participants.forEach(participantId => {
              if (participantId !== socket.id) {
                io.to(participantId).emit('call_ended', { callId });
              }
            });
          }
        }
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
app.use('/api/messages', messageRoutes);

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

