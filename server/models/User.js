const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  about: {
    type: String,
    default: 'Hey there! I am using WhatsApp'
  },
  profilePic: {
    type: String,
    default: '/default-avatar.png'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);