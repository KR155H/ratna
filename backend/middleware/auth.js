const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 Auth header:', authHeader);
    console.log('🎫 Token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ratna-super-secret-jwt-key-2024');
    console.log('🔓 Decoded token:', decoded);
    
    // Get user from database to ensure user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        message: 'The user associated with this token no longer exists'
      });
    }

    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    console.log('✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid token',
        message: 'The provided token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        error: 'Token expired',
        message: 'The provided token has expired. Please login again'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during authentication'
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required',
        message: 'Please authenticate to access this resource'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have the required permissions to access this resource'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole
};