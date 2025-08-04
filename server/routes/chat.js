// filepath: d:\2025\whatsapp\server\routes\chat.js
const router = require('express').Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

// Get all chats for current user
router.get('/chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'email')
    .populate('lastMessage')
    .sort('-updatedAt');
    
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create or get private chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check for existing chat
    let chat = await Chat.findOne({
      participants: {
        $all: [req.user._id, userId],
        $size: 2
      }
    }).populate('participants', 'email');

    // If no chat exists, create new one
    if (!chat) {
      chat = await Chat.create({
        participants: [req.user._id, userId]
      });
      await chat.populate('participants', 'email');
    }

    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message to chat
router.post('/message', auth, async (req, res) => {
  try {
    const { chatId, content } = req.body;

    const message = await Message.create({
      chatId,
      sender: req.user._id,
      content
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id
    });

    await message.populate('sender', 'email');
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all messages for a chat
router.get('/chat/:chatId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'email name profilePic')
      .sort('createdAt');
    
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;