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
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Only accept Indian phone numbers
        // Format: +91XXXXXXXXXX or 91XXXXXXXXXX (10 digits after 91)
        return /^(\+91|91)\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid Indian phone number! Must start with +91 or 91 followed by 10 digits.`
    }
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