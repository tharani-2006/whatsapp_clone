const router = require('express').Router();
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const CallHistory = require('../models/CallHistory'); // Add this line
const Status = require('../models/Status');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Multer configuration for status image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/statuses');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
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

// Create a new status update
router.post('/status', auth, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = `/uploads/statuses/${req.file.filename}`;
    }

    // Validate that either content or image is provided
    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Either content or image is required' });
    }

    const status = new Status({
      userId: req.user._id,
      content: content || '',
      imageUrl
    });

    await status.save();

    // Populate user info before sending response
    await status.populate('userId', 'name email profilePic');

    res.status(201).json(status);
  } catch (err) {
    console.error('Error creating status:', err);
    res.status(500).json({ message: 'Failed to create status', error: err.message });
  }
});

// Get status updates for contacts
router.get('/status', auth, async (req, res) => {
  try {
    // For now, get all users' statuses (in a real app, you'd filter by contacts)
    // You can implement a contacts system later
    const statuses = await Status.find({
      expiresAt: { $gt: new Date() } // Only get non-expired statuses
    })
    .populate('userId', 'name email profilePic')
    .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (err) {
    console.error('Error fetching statuses:', err);
    res.status(500).json({ message: 'Failed to fetch statuses' });
  }
});

// Delete a status update
router.delete('/status/:id', auth, async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    // Only allow the user who created the status to delete it
    if (status.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Status.findByIdAndDelete(req.params.id);
    res.json({ message: 'Status deleted' });
  } catch (err) {
    console.error('Error deleting status:', err);
    res.status(500).json({ message: 'Failed to delete status' });
  }
});


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
        { receiver: req.user._id }]

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

module.exports = router;