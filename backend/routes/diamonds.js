const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Diamond = require('../models/Diamond');
const User = require('../models/User');
const DiamondSale = require('../models/DiamondSale');
const { authenticateToken } = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
const diamondsDir = path.join(uploadsDir, 'diamonds');
const salesDir = path.join(uploadsDir, 'sales');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(diamondsDir)) {
  fs.mkdirSync(diamondsDir, { recursive: true });
}
if (!fs.existsSync(salesDir)) {
  fs.mkdirSync(salesDir, { recursive: true });
}

// Multer configuration for image and video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.route.path.includes('/mark-sold')) {
      cb(null, salesDir);
    } else if (file.mimetype.startsWith('video/')) {
      // Store videos in media directory or reuse diamonds directory
      // For simplicity using diamondsDir, but normally separate folder is better
      cb(null, diamondsDir);
    } else {
      cb(null, diamondsDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = req.route.path.includes('/mark-sold') ? 'sale-' : 'diamond-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50MB limit to accommodate videos
    files: 10 // Increased file limit
  },
  fileFilter: (req, file, cb) => {
    if (req.route.path.includes('/mark-sold')) {
      // For sales, allow PDF as well
      const salesAllowedTypes = /jpeg|jpg|png|webp|pdf/;
      const extname = salesAllowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = salesAllowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, WebP) and PDF files are allowed for sales'));
      }
    }
    
    // For diamonds, allow images and videos
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedVideoTypes = /mp4|mov|avi|mkv|webm/;

    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase()) ||
                   allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, WebP) and video files (MP4, MOV, AVI, MKV) are allowed'));
    }
  }
});

// Get all diamonds with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = 'createdAt',
      order = 'desc',
      cut,
      color,
      clarity,
      minPrice,
      maxPrice,
      minCarat,
      maxCarat,
      search,
      seller,
      status = 'active'
    } = req.query;

    // Build filter object
    let filter = { status };
    
    // Diamond characteristics filters
    if (cut) filter.cut = cut;
    if (color) filter.color = color;
    if (clarity) filter.clarity = clarity;
    if (seller) filter.seller = seller;
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Carat range filter
    if (minCarat || maxCarat) {
      filter.carat = {};
      if (minCarat) filter.carat.$gte = Number(minCarat);
      if (maxCarat) filter.carat.$lte = Number(maxCarat);
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cut: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const diamonds = await Diamond.find(filter)
      .sort(sortObj)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('seller', 'name email phone')
      .exec();

    // Get total count for pagination
    const total = await Diamond.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    console.log(`📊 Fetched ${diamonds.length} diamonds (${total} total)`);

    res.json({
      success: true,
      diamonds,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        hasNext: Number(page) < totalPages,
        hasPrev: Number(page) > 1
      },
      filters: {
        cut: cut || null,
        color: color || null,
        clarity: clarity || null,
        priceRange: { min: minPrice || null, max: maxPrice || null },
        caratRange: { min: minCarat || null, max: maxCarat || null },
        search: search || null
      }
    });
  } catch (error) {
    console.error('❌ Diamonds fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching diamonds'
    });
  }
});

// Get single diamond by ID
router.get('/:id', async (req, res) => {
  try {
    const diamond = await Diamond.findById(req.params.id).populate('seller', 'name email phone createdAt');
    
    if (!diamond) {
      return res.status(404).json({ 
        success: false,
        error: 'Diamond not found',
        message: 'The requested diamond could not be found'
      });
    }

    // Increment views count
    diamond.views += 1;
    await diamond.save();

    res.json({
      success: true,
      diamond
    });
  } catch (error) {
    console.error('❌ Diamond fetch error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID',
        message: 'The provided diamond ID is invalid'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching the diamond'
    });
  }
});

// Add new diamond (authenticated users only)
router.post('/', authenticateToken, upload.array('media', 10), async (req, res) => {
  try {
    const { 
      name, carat, cut, color, clarity, price, description,
      certification, dimensions, fluorescence, polish, symmetry,
      certificateNumber, certificateUrl
    } = req.body;

    // Validation
    if (!name || !carat || !cut || !color || !clarity || !price || !description) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'All required diamond details must be provided',
        required: ['name', 'carat', 'cut', 'color', 'clarity', 'price', 'description']
      });
    }

    // Get user info
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found',
        message: 'The authenticated user could not be found'
      });
    }

    // Handle media uploads
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'At least one image or video is required',
        fields: { media: true }
      });
    }

    // Process uploaded media files
    const mediaFiles = req.files.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: `http://localhost:5000/uploads/diamonds/${file.filename}`,
      filename: file.filename,
      size: file.size
    }));

    // Use first image as main image for backward compatibility
    const mainImage = mediaFiles.find(media => media.type === 'image');
    if (!mainImage) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'At least one image is required',
        fields: { media: true }
      });
    }
    // Create diamond object
    const diamondData = {
      name: name.trim(),
      carat: parseFloat(carat),
      cut,
      color,
      clarity,
      price: parseInt(price),
      description: description.trim(),
      image: mainImage.url,
      media: mediaFiles,
      seller: user._id,
      sellerName: user.name
    };

    // Add optional fields if provided
    if (certification) {
      try {
        const certData = JSON.parse(certification);
        if (certificateNumber) certData.certificateNumber = certificateNumber;
        if (certificateUrl) certData.certificateUrl = certificateUrl;
        diamondData.certification = certData;
      } catch (e) {
        diamondData.certification = { 
          institute: certification,
          certificateNumber: certificateNumber || '',
          certificateUrl: certificateUrl || ''
        };
      }
    }
    if (dimensions) {
      try {
        diamondData.dimensions = JSON.parse(dimensions);
      } catch (e) {
        // Handle simple dimension input
      }
    }
    if (fluorescence) diamondData.fluorescence = fluorescence;
    if (polish) diamondData.polish = polish;
    if (symmetry) diamondData.symmetry = symmetry;

    // Create and save diamond
    const diamond = new Diamond(diamondData);
    await diamond.save();

    console.log('✅ New diamond added:', diamond.name, 'by', user.name);

    // Populate seller info for response
    await diamond.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Diamond added successfully',
      diamond
    });
  } catch (error) {
    console.error('❌ Diamond creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Some fields contain invalid data',
        details: errors
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while creating the diamond listing'
    });
  }
});

// Update diamond (owner only)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const diamond = await Diamond.findById(req.params.id);
    
    if (!diamond) {
      return res.status(404).json({ 
        success: false,
        error: 'Diamond not found',
        message: 'The diamond you are trying to update could not be found'
      });
    }

    // Check ownership
    if (diamond.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to update this diamond'
      });
    }

    // Handle new image upload
    if (req.file) {
      req.body.image = `http://localhost:5000/uploads/diamonds/${req.file.filename}`;
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'carat', 'cut', 'color', 'clarity', 'price', 'description',
      'status', 'certification', 'dimensions', 'fluorescence', 'polish', 'symmetry', 'image'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'certification' || field === 'dimensions') {
          try {
            diamond[field] = JSON.parse(req.body[field]);
          } catch (e) {
            diamond[field] = req.body[field];
          }
        } else {
          diamond[field] = req.body[field];
        }
      }
    });

    await diamond.save();
    await diamond.populate('seller', 'name email');

    console.log('✅ Diamond updated:', diamond.name);

    res.json({
      success: true,
      message: 'Diamond updated successfully',
      diamond
    });
  } catch (error) {
    console.error('❌ Diamond update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Some fields contain invalid data',
        details: errors
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID',
        message: 'The provided diamond ID is invalid'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating the diamond'
    });
  }
});

// Delete diamond (owner or admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const diamond = await Diamond.findById(req.params.id);
    
    if (!diamond) {
      return res.status(404).json({ 
        success: false,
        error: 'Diamond not found',
        message: 'The diamond you are trying to delete could not be found'
      });
    }

    // Check ownership
    if (diamond.seller.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to delete this diamond'
      });
    }

    // Delete associated image file if it exists
    if (diamond.image && diamond.image.includes('localhost:5000')) {
      const imagePath = diamond.image.replace('http://localhost:5000', '');
      const fullImagePath = path.join(__dirname, '..', imagePath);
      if (fs.existsSync(fullImagePath)) {
        fs.unlinkSync(fullImagePath);
        console.log('🗑️ Deleted image file:', fullImagePath);
      }
    }

    await Diamond.findByIdAndDelete(req.params.id);
    
    console.log('✅ Diamond deleted:', diamond.name);
    
    res.json({
      success: true,
      message: 'Diamond deleted successfully'
    });
  } catch (error) {
    console.error('❌ Diamond deletion error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid ID',
        message: 'The provided diamond ID is invalid'
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while deleting the diamond'
    });
  }
});

// Get diamonds by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Get all diamonds for the seller (not just active ones)
    const diamonds = await Diamond.find({ seller: sellerId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('seller', 'name');

    const total = await Diamond.countDocuments({ seller: sellerId });

    console.log(`📊 Fetched ${diamonds.length} diamonds for seller ${sellerId}`);

    res.json({
      success: true,
      diamonds,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Seller diamonds fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching seller diamonds'
    });
  }
});

// Mark diamond as sold by user
router.post('/:id/mark-sold', authenticateToken, upload.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const { invoiceNumber, paymentAmount } = req.body;
    const diamondId = req.params.id;

    // Validation
    if (!invoiceNumber || !paymentAmount) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Invoice number and payment amount are required'
      });
    }

    if (!req.files || !req.files.invoice || !req.files.paymentProof) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Both invoice document and payment proof are required'
      });
    }

    // Find diamond
    const diamond = await Diamond.findById(diamondId);
    if (!diamond) {
      return res.status(404).json({ 
        success: false,
        error: 'Diamond not found',
        message: 'The diamond could not be found'
      });
    }

    // Check ownership
    if (diamond.seller.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to mark this diamond as sold'
      });
    }

    // Check if diamond is already sold or has pending sale
    const existingSale = await DiamondSale.findOne({ diamond: diamondId });
    if (existingSale) {
      return res.status(400).json({ 
        success: false,
        error: 'Already processed',
        message: 'This diamond already has a sale record'
      });
    }

    // Create sale record
    const diamondSale = new DiamondSale({
      diamond: diamondId,
      seller: req.user.userId,
      invoiceNumber: invoiceNumber.trim(),
      paymentAmount: parseFloat(paymentAmount),
      invoiceDocument: `http://localhost:5000/uploads/sales/${req.files.invoice[0].filename}`,
      paymentProof: `http://localhost:5000/uploads/sales/${req.files.paymentProof[0].filename}`
    });

    await diamondSale.save();

    // Update diamond status to pending (waiting for admin verification)
    diamond.status = 'pending';
    await diamond.save();

    console.log('✅ Diamond sale submitted:', diamond.name, 'by', req.user.name);

    res.status(201).json({
      success: true,
      message: 'Diamond sale submitted successfully. Waiting for admin verification.',
      sale: {
        id: diamondSale._id,
        invoiceNumber: diamondSale.invoiceNumber,
        paymentAmount: diamondSale.paymentAmount,
        status: diamondSale.status,
        submittedAt: diamondSale.submittedAt
      }
    });
  } catch (error) {
    console.error('❌ Diamond sale submission error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Some fields contain invalid data',
        details: errors
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while submitting the sale'
    });
  }
});

module.exports = router;