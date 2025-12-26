const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔐 Admin auth header:', authHeader);
    console.log('🎫 Admin token:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access token required',
        message: 'Please provide a valid admin authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ratna-super-secret-jwt-key-2024');
    console.log('🔓 Decoded admin token:', decoded);
    
    // Verify this is an admin token
    if (decoded.type !== 'admin') {
      console.log('❌ Invalid token type:', decoded.type);
      return res.status(403).json({ 
        success: false,
        error: 'Invalid token type',
        message: 'This endpoint requires admin authentication'
      });
    }

    // Get admin from database to ensure admin still exists and is active
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      console.log('❌ Admin not found or inactive:', decoded.adminId);
      return res.status(401).json({ 
        success: false,
        error: 'Admin not found or inactive',
        message: 'The admin associated with this token is not found or inactive'
      });
    }

    req.admin = {
      adminId: admin._id,
      adminUserId: admin.adminId,
      email: admin.email,
      name: admin.name,
      role: admin.role
    };
    
    console.log('✅ Admin authenticated:', req.admin.adminUserId);
    next();
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        error: 'Invalid token',
        message: 'The provided admin token is invalid'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        error: 'Token expired',
        message: 'The admin token has expired. Please login again'
      });
    }

    return res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during admin authentication'
    });
  }
};

module.exports = {
  authenticateAdminToken
};