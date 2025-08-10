const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { generateOTP, sendOTP } = require('../utils/otpService');

// Multer configuration for profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profiles');
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

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validate phone number
    if (phone && (phone.length < 10 || phone.length > 12 || !/^\d+$/.test(phone))) {
      return res.status(400).json({ 
        message: 'Phone number must be between 10 and 12 digits' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { email },
        { phone: phone || null }
      ]
    });

    if (user) {
      return res.status(400).json({ 
        message: 'User already exists with this email or phone number' 
      });
    }

    // Create new user
    user = new User({
      email,
      password,
      name,
      phone
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (excluding the logged-in user)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user._id } },
      'email'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search for a user by email (excluding the logged-in user)
router.get('/users/search', auth, async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne(
      { 
        email: email.toLowerCase(),
        _id: { $ne: req.user._id }
      },
      'email'
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/user/profile', auth, async (req, res) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload profile picture
router.post('/user/profile-picture', auth, upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const profilePic = `/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePic },
      { new: true }
    ).select('-password');

    // Broadcast profile update to all users
    io.emit('profile_updated');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send OTP route
router.post('/send-otp', async (req, res) => {
  try {
    let { phone } = req.body;
    
    // Add 91 prefix if not present
    if (!phone.startsWith('91')) {
      phone = `91${phone}`;
    }

    // Validate phone number
    if (!/^91\d{10}$/.test(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid Indian phone number'
      });
    }

    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP valid for 10 minutes

    // Save OTP to user document
    await User.findOneAndUpdate(
      { phone },
      { 
        otp: {
          code: otp,
          expiresAt
        }
      },
      { upsert: true }
    );

    // Send OTP
    const sent = await sendOTP(phone, otp);
    if (!sent) {
      throw new Error('Failed to send OTP');
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('Send OTP error:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP route
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({ message: 'No OTP requested' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear OTP and mark phone as verified
    user.otp = undefined;
    user.isPhoneVerified = true;
    await user.save();

    // Generate token and send response
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

module.exports = router;