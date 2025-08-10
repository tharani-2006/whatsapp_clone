const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
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
    unique: true,
    sparse: true, // Allows null/undefined values to not trigger unique constraint
    validate: {
      validator: function(v) {
        if (!v) return true;
        return /^91\d{10}$/.test(v); // Validate Indian numbers with 91 prefix
      },
      message: props => `${props.value} is not a valid Indian phone number!`
    }
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    code: String,
    expiresAt: Date
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