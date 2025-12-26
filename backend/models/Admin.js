const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: [true, 'Admin ID is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Admin ID must be at least 3 characters long'],
    maxlength: [20, 'Admin ID cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'admins'
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Instance method to generate JWT token
adminSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      adminId: this._id, 
      adminUserId: this.adminId,
      email: this.email, 
      role: this.role,
      name: this.name,
      type: 'admin'
    },
    process.env.JWT_SECRET || 'ratna-super-secret-jwt-key-2024',
    { expiresIn: '24h' }
  );
};

// Remove password from JSON output
adminSchema.methods.toJSON = function() {
  const adminObject = this.toObject();
  delete adminObject.password;
  return adminObject;
};

// Index for better query performance
adminSchema.index({ adminId: 1 });
adminSchema.index({ email: 1 });

module.exports = mongoose.model('Admin', adminSchema);