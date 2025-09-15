const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

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

    // Emit socket event for real-time update
    const io = req.app.get('socketio');
    io.to(message.receiver.toString()).emit('messageEdited', message);

    res.json({ message: 'Message updated successfully', data: message });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;