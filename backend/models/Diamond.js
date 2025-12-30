const mongoose = require('mongoose');

const diamondSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Diamond name is required'],
    trim: true,
    maxlength: [100, 'Diamond name cannot exceed 100 characters']
  },
  carat: {
    type: Number,
    required: [true, 'Carat weight is required'],
    min: [0.01, 'Carat weight must be at least 0.01'],
    max: [50, 'Carat weight cannot exceed 50']
  },
  cut: {
    type: String,
    required: [true, 'Cut is required'],
    enum: {
      values: [
        'Round Brilliant', 'Princess', 'Emerald', 'Oval', 'Cushion',
        'Marquise', 'Pear', 'Asscher', 'Radiant', 'Heart'
      ],
      message: 'Please select a valid cut type'
    }
  },
  color: {
    type: String,
    required: [true, 'Color grade is required'],
    enum: {
      values: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
      message: 'Please select a valid color grade'
    }
  },
  clarity: {
    type: String,
    required: [true, 'Clarity grade is required'],
    enum: {
      values: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'],
      message: 'Please select a valid clarity grade'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be at least $1']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    required: [true, 'Image is required']
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isRatnaDiamond; }
  },
  sellerName: {
    type: String,
    required: [true, 'Seller name is required']
  },
  isRatnaDiamond: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'pending', 'inactive'],
    default: 'active'
  },
  certification: {
    institute: {
      type: String,
      enum: ['GIA', 'AGS', 'GCAL', 'EGL', 'IGI', 'Other'],
      default: 'GIA'
    },
    certificateNumber: String,
    certificateImage: String,
    certificateUrl: String
  },
  dimensions: {
    length: Number,
    width: Number,
    depth: Number
  },
  fluorescence: {
    type: String,
    enum: ['None', 'Faint', 'Medium', 'Strong', 'Very Strong'],
    default: 'None'
  },
  polish: {
    type: String,
    enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    default: 'Excellent'
  },
  symmetry: {
    type: String,
    enum: ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'],
    default: 'Excellent'
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'diamonds'
});

// Index for better query performance
diamondSchema.index({ price: 1, carat: -1 });
diamondSchema.index({ cut: 1, color: 1, clarity: 1 });
diamondSchema.index({ status: 1, createdAt: -1 });
diamondSchema.index({ seller: 1 });
diamondSchema.index({ name: 'text', description: 'text' });

// Virtual for calculating price per carat
diamondSchema.virtual('pricePerCarat').get(function() {
  return Math.round(this.price / this.carat);
});

// Ensure virtual fields are serialised
diamondSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Diamond', diamondSchema);