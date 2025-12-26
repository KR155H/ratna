const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Verification = require('../models/Verification');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { createNotification } = require('./notifications');

// Create verification uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const verificationDir = path.join(uploadsDir, 'verification');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

// Verhoeff algorithm implementation for server-side validation
const multiplicationTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const permutationTable = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

const validateAadhaar = (aadhaar) => {
  try {
    const cleanAadhaar = aadhaar.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) return false;
    
    const digits = cleanAadhaar.split('').map(Number);
    let checksum = 0;
    
    for (let i = 0; i < digits.length; i++) {
      const position = digits.length - i - 1;
      const digit = digits[i];
      const permutedDigit = permutationTable[position % 8][digit];
      checksum = multiplicationTable[checksum][permutedDigit];
    }
    
    return checksum === 0;
  } catch (error) {
    console.error('Server Verhoeff validation error:', error);
    return false;
  }
};

// Multer configuration for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, verificationDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'verification-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) and PDF files are allowed'));
    }
  }
});

// Submit verification request
router.post('/submit', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    const { aadhaarNumber, documentType, documentNumber } = req.body;

    console.log('📋 Verification submission for user:', req.user.userId);
    console.log('📋 Data received:', { 
      aadhaarNumber: aadhaarNumber ? 'Present' : 'Missing', 
      documentType, 
      documentNumber: documentNumber ? 'Present' : 'Missing',
      hasFile: !!req.file
    });

    // Validation
    if (!aadhaarNumber || !documentType || !documentNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Aadhaar number, document type, and document number are required'
      });
    }

    // Clean Aadhaar number
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    console.log('📋 Clean Aadhaar:', cleanAadhaar);

    // Validate Aadhaar using Verhoeff algorithm
    if (!validateAadhaar(cleanAadhaar)) {
      console.log('❌ Aadhaar validation failed:', cleanAadhaar);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid Aadhaar',
        message: 'Invalid Aadhaar number. Please check and try again.'
      });
    }

    console.log('✅ Aadhaar validation passed:', cleanAadhaar);

    // Check if document was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'Document required',
        message: 'Government document is required for verification'
      });
    }

    console.log('📄 Document uploaded:', req.file.filename);

    // Check if user already has a verification request
    const existingVerification = await Verification.findOne({ user: req.user.userId });
    if (existingVerification) {
      return res.status(400).json({ 
        success: false,
        error: 'Already submitted',
        message: 'You have already submitted a verification request'
      });
    }

    // Create verification record
    const verification = new Verification({
      user: req.user.userId,
      aadhaarNumber: cleanAadhaar,
      documentType,
      documentNumber: documentNumber.trim(),
      documentPath: `http://localhost:5000/uploads/verification/${req.file.filename}`
    });

    await verification.save();
    console.log('✅ Verification submitted successfully for user:', req.user.userId);

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully. It will be reviewed by our team within 24-48 hours.',
      verification: {
        id: verification._id,
        status: verification.status,
        submittedAt: verification.submittedAt
      }
    });
  } catch (error) {
    console.error('❌ Verification submission error:', error);
    
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
      message: 'An error occurred while submitting verification request'
    });
  }
});

// Get user's verification status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Fetching verification status for user:', req.user.userId);
    
    const verification = await Verification.findOne({ user: req.user.userId });
    
    if (!verification) {
      console.log('📊 No verification found for user:', req.user.userId);
      return res.json({
        success: true,
        verification: null,
        message: 'No verification request found'
      });
    }

    // Mask Aadhaar number for response
    const maskedAadhaar = verification.aadhaarNumber.replace(/(\d{8})(\d{4})/, 'XXXXXXXX$2');

    console.log('✅ Verification status found:', verification.status);

    res.json({
      success: true,
      verification: {
        id: verification._id,
        status: verification.status,
        documentType: verification.documentType,
        aadhaarNumber: maskedAadhaar,
        submittedAt: verification.submittedAt,
        reviewedAt: verification.reviewedAt,
        rejectionReason: verification.rejectionReason
      }
    });
  } catch (error) {
    console.error('❌ Verification status fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching verification status'
    });
  }
});

module.exports = router;