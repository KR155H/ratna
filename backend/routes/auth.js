const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Name, email, and password are required',
        fields: { name: !name, email: !email, password: !password }
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Password must be at least 6 characters long',
        fields: { password: true }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'User exists',
        message: 'A user with this email already exists',
        fields: { email: true }
      });
    }

    // Create new user
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      phone: phone ? phone.trim() : undefined, 
      password 
    });
    
    await user.save();
    console.log('✅ New user registered:', user.email);

    // Generate JWT token
    const token = user.generateAuthToken();
    console.log('🎫 Generated token for user:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: errors.join(', '),
        details: error.errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        error: 'Duplicate key error',
        message: 'A user with this email already exists',
        fields: { email: true }
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Email and password are required',
        fields: { email: !email, password: !password }
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password',
        fields: { email: true, password: true }
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password',
        fields: { email: true, password: true }
      });
    }

    console.log('✅ User logged in:', user.email);

    // Generate JWT token
    const token = user.generateAuthToken();
    console.log('🎫 Generated token for login:', user.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'The requested user profile could not be found'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the user profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'User profile could not be found'
      });
    }

    // Update allowed fields
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: errors.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating the profile'
    });
  }
});

module.exports = router;