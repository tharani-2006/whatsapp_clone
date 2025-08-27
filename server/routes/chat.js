// filepath: d:\2025\whatsapp\server\routes\chat.js
const router = require('express').Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const CallHistory = require('../models/CallHistory'); // Add this line

// Get all chats for current user
router.get('/chats', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'email name profilePic')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'email name profilePic'
      }
    })
    .sort('-updatedAt');
    
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get call history for current user
router.get('/callHistory', auth, async (req, res) => {
  try {
    const callHistory = await CallHistory.find({
      $or: [
        { caller: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('caller', 'email name profilePic')
    .populate('receiver', 'email name profilePic')
    .sort('-startTime');

    res.json(callHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single chat with populated data
router.get('/chat/:id', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'email name profilePic phone about')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'email name profilePic'
        }
      });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json(chat);
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

    // Create and save message
    const message = new Message({
      chatId,
      sender: req.user._id,
      content
    });
    await message.save();

    // Populate sender details
    await message.populate('sender', 'email name profilePic');

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all messages for a chat
router.get('/chat/:chatId/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('sender', 'email name profilePic')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;