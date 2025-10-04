const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Send a new message
router.post('/', auth, async (req, res) => {
  try {
    const { chatId, content } = req.body;
    
    if (!chatId || !content) {
      return res.status(400).json({ error: 'Chat ID and content are required' });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: req.body.receiver,
      content,
      chatId
    });

    await message.save();

    // Populate sender details
    await message.populate('sender', 'name email profilePic');
    
    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a chat
router.get('/chat/:chatId', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId })
      .populate('sender', 'name email profilePic')
      .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit a message
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Update the message content and mark it as edited
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();

    await message.save();

    // Populate sender details before emitting
    await message.populate('sender', 'name email profilePic');
    
    // Emit socket event for real-time update to the chat room
    const io = req.app.get('socketio');
    if (message.chatId) {
      io.to(message.chatId.toString()).emit('messageEdited', message);
    }

    res.json({ message: 'Message updated successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;