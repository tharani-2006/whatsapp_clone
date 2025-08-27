const mongoose = require('mongoose');

const callHistorySchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number
  },
  type: {
    type: String,
    enum: ['incoming', 'outgoing', 'missed'],
    required: true
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

const CallHistory = mongoose.model('CallHistory', callHistorySchema);

module.exports = CallHistory;