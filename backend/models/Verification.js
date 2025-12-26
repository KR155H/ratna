const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  aadhaarNumber: {
    type: String,
    required: [true, 'Aadhaar number is required'],
    minlength: [12, 'Aadhaar number must be 12 digits'],
    maxlength: [12, 'Aadhaar number must be 12 digits'],
    match: [/^\d{12}$/, 'Aadhaar number must contain only digits']
  },
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
    enum: ['aadhaar', 'pan', 'passport', 'driving_license', 'voter_id'],
    default: 'aadhaar'
  },
  documentNumber: {
    type: String,
    required: [true, 'Document number is required'],
    trim: true,
    maxlength: [50, 'Document number cannot exceed 50 characters']
  },
  documentPath: {
    type: String,
    required: [true, 'Document file is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: String
  },
  rejectionReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'verifications'
});

// Index for better query performance
verificationSchema.index({ user: 1 });
verificationSchema.index({ status: 1, submittedAt: -1 });

module.exports = mongoose.model('Verification', verificationSchema);