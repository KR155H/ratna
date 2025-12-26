const mongoose = require('mongoose');

const diamondSaleSchema = new mongoose.Schema({
  diamond: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Diamond',
    required: [true, 'Diamond reference is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller reference is required']
  },
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    trim: true,
    maxlength: [100, 'Invoice number cannot exceed 100 characters']
  },
  paymentAmount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [1, 'Payment amount must be at least $1']
  },
  invoiceDocument: {
    type: String,
    required: [true, 'Invoice document is required']
  },
  paymentProof: {
    type: String,
    required: [true, 'Payment proof is required']
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: String
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  documentsViewed: {
    type: Boolean,
    default: false
  },
  documentsViewedAt: {
    type: Date
  },
  documentsViewedBy: {
    type: String
  }
}, {
  timestamps: true,
  collection: 'diamond_sales'
});

// Index for better query performance
diamondSaleSchema.index({ seller: 1, createdAt: -1 });
diamondSaleSchema.index({ status: 1, createdAt: -1 });
diamondSaleSchema.index({ diamond: 1 });

module.exports = mongoose.model('DiamondSale', diamondSaleSchema);