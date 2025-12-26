const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const User = require('../models/User');
const Diamond = require('../models/Diamond');
const Contact = require('../models/Contact');
const Verification = require('../models/Verification');
const DiamondSale = require('../models/DiamondSale');
const { createNotification } = require('./notifications');
const { authenticateAdminToken } = require('../middleware/adminAuth');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { adminId, password } = req.body;

    console.log('🔐 Admin login attempt:', adminId);

    // Validation
    if (!adminId || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Admin ID and password are required',
        fields: { adminId: !adminId, password: !password }
      });
    }

    // Find admin by adminId
    const admin = await Admin.findOne({ adminId: adminId.trim() });
    if (!admin) {
      console.log('❌ Admin not found:', adminId);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid admin ID or password'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(400).json({ 
        success: false,
        error: 'Account disabled',
        message: 'This admin account has been disabled'
      });
    }

    // Check password
    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password for admin:', adminId);
      return res.status(400).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid admin ID or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    console.log('✅ Admin logged in successfully:', admin.adminId);

    // Generate JWT token
    const token = admin.generateAuthToken();

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// Get dashboard statistics
router.get('/dashboard/stats', authenticateAdminToken, async (req, res) => {
  try {
    console.log('📊 Fetching dashboard stats for admin:', req.admin.adminUserId);

    // Get counts
    const [userCount, diamondCount, contactCount, verificationCount, totalValue] = await Promise.all([
      User.countDocuments(),
      Diamond.countDocuments(),
      Contact.countDocuments(),
      Verification.countDocuments(),
      Diamond.aggregate([
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    // Get recent data
    const [recentUsers, recentDiamonds, recentContacts, recentVerifications] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      Diamond.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name').select('name price carat seller createdAt'),
      Contact.find().sort({ createdAt: -1 }).limit(5).select('name email subject status createdAt'),
      Verification.find().sort({ submittedAt: -1 }).limit(5).populate('user', 'name email').select('user status submittedAt')
    ]);

    const stats = {
      totalUsers: userCount,
      totalDiamonds: diamondCount,
      totalContacts: contactCount,
      totalVerifications: verificationCount,
      pendingVerifications: await Verification.countDocuments({ status: 'pending' }),
      totalValue: totalValue[0]?.total || 0,
      averagePrice: diamondCount > 0 ? Math.round((totalValue[0]?.total || 0) / diamondCount) : 0,
      recentUsers,
      recentDiamonds,
      recentContacts,
      recentVerifications
    };

    console.log('✅ Dashboard stats fetched successfully');

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch dashboard statistics'
    });
  }
});

// Get all users with pagination
router.get('/users', authenticateAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select('-password');

    const total = await User.countDocuments(filter);

    console.log(`📊 Fetched ${users.length} users for admin`);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Admin users fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch users'
    });
  }
});

// Get all diamonds with pagination
router.get('/diamonds', authenticateAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cut: { $regex: search, $options: 'i' } },
        { color: { $regex: search, $options: 'i' } },
        { clarity: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.status = status;
    }

    const diamonds = await Diamond.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('seller', 'name email');

    const total = await Diamond.countDocuments(filter);

    console.log(`📊 Fetched ${diamonds.length} diamonds for admin`);

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
    console.error('❌ Admin diamonds fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch diamonds'
    });
  }
});

// Get all contacts
router.get('/contacts', authenticateAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Contact.countDocuments(filter);

    console.log(`📊 Fetched ${contacts.length} contacts for admin`);

    res.json({
      success: true,
      contacts,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Admin contacts fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch contacts'
    });
  }
});

// Get all verifications
router.get('/verifications', authenticateAdminToken, async (req, res) => {
  try {
    const { status = '', page = 1, limit = 20 } = req.query;
    
    let filter = {};
    if (status) {
      filter.status = status;
    }

    const verifications = await Verification.find(filter)
      .populate('user', 'name email phone')
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Verification.countDocuments(filter);

    console.log(`📊 Fetched ${verifications.length} verifications for admin`);

    res.json({
      success: true,
      verifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Admin verifications fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch verifications'
    });
  }
});

// Admin review verification
router.put('/verifications/:id/review', authenticateAdminToken, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const verificationId = req.params.id;

    console.log(`🔍 Admin reviewing verification ${verificationId} with status: ${status}`);

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status',
        message: 'Status must be either approved or rejected'
      });
    }

    const verification = await Verification.findById(verificationId)
      .populate('user', 'name email');

    if (!verification) {
      return res.status(404).json({ 
        success: false,
        error: 'Verification not found',
        message: 'The verification request could not be found'
      });
    }

    // Update verification status
    verification.status = status;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.admin.adminUserId;
    if (rejectionReason) {
      verification.rejectionReason = rejectionReason;
    }
    await verification.save();

    // Update user role and verification status if approved
    if (status === 'approved') {
      await User.findByIdAndUpdate(verification.user._id, { 
        role: 'seller',
        isVerified: true 
      });

      console.log('✅ User verified and role updated to seller:', verification.user.name);

      // Create notification for approval
      try {
        await createNotification(
          verification.user._id,
          'verification_approved',
          '✅ Verification Approved!',
          'Congratulations! Your identity verification has been approved. You can now sell diamonds on our platform.',
          {
            adminName: req.admin.name || 'Admin'
          }
        );
      } catch (notificationError) {
        console.error('❌ Failed to create approval notification:', notificationError);
      }
    } else {
      // Create notification for rejection
      try {
        await createNotification(
          verification.user._id,
          'verification_rejected',
          '❌ Verification Rejected',
          `Your verification request has been rejected. Reason: ${rejectionReason || 'Invalid or unclear documents'}. Please resubmit with correct documents.`,
          {
            reason: rejectionReason,
            adminName: req.admin.name || 'Admin'
          }
        );
      } catch (notificationError) {
        console.error('❌ Failed to create rejection notification:', notificationError);
      }
    }

    console.log(`✅ Verification ${status} for user:`, verification.user.name);

    res.json({
      success: true,
      message: `Verification ${status} successfully`,
      verification
    });
  } catch (error) {
    console.error('❌ Admin verification review error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to review verification request'
    });
  }
});

// Get all diamond sales
router.get('/sales', authenticateAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = '' } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const sales = await DiamondSale.find(filter)
      .sort({ submittedAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('diamond', 'name carat cut color clarity price image')
      .populate('seller', 'name email');

    const total = await DiamondSale.countDocuments(filter);

    console.log(`📊 Fetched ${sales.length} diamond sales for admin`);

    res.json({
      success: true,
      sales,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Admin sales fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch diamond sales'
    });
  }
});

// Get single diamond sale details
router.get('/sales/:id', authenticateAdminToken, async (req, res) => {
  try {
    const sale = await DiamondSale.findById(req.params.id)
      .populate('diamond', 'name carat cut color clarity price image')
      .populate('seller', 'name email phone');

    if (!sale) {
      return res.status(404).json({ 
        success: false,
        error: 'Sale not found',
        message: 'The diamond sale could not be found'
      });
    }

    res.json({
      success: true,
      sale
    });
  } catch (error) {
    console.error('❌ Admin sale fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch diamond sale'
    });
  }
});

// Verify diamond sale (approve/reject)
router.put('/sales/:id/verify', authenticateAdminToken, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const saleId = req.params.id;

    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid status',
        message: 'Status must be either verified or rejected'
      });
    }

    const sale = await DiamondSale.findById(saleId)
      .populate('diamond')
      .populate('seller', 'name email');

    if (!sale) {
      return res.status(404).json({ 
        success: false,
        error: 'Sale not found',
        message: 'The diamond sale could not be found'
      });
    }

    // Update sale status
    sale.status = status;
    sale.verifiedAt = new Date();
    sale.verifiedBy = req.admin.adminUserId;
    if (rejectionReason) {
      sale.rejectionReason = rejectionReason;
    }
    await sale.save();

    // Update diamond status
    if (status === 'verified') {
      sale.diamond.status = 'sold';
      await sale.diamond.save();

      // Create notification for seller
      try {
        await createNotification(
          sale.seller._id,
          'diamond_sold',
          '💎 Diamond Sale Verified!',
          `Congratulations! Your diamond "${sale.diamond.name}" sale has been verified. Invoice: ${sale.invoiceNumber}, Amount: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(sale.paymentAmount)}.`,
          {
            diamondId: sale.diamond._id,
            diamondName: sale.diamond.name,
            price: sale.paymentAmount,
            invoiceNumber: sale.invoiceNumber,
            adminName: req.admin.name
          }
        );
      } catch (notificationError) {
        console.error('❌ Failed to create sale verification notification:', notificationError);
      }
    } else {
      sale.diamond.status = 'active';
      await sale.diamond.save();

      // Create notification for rejection
      try {
        await createNotification(
          sale.seller._id,
          'sale_rejected',
          '❌ Diamond Sale Rejected',
          `Your diamond "${sale.diamond.name}" sale has been rejected. Reason: ${rejectionReason || 'Invalid documentation'}. Please resubmit with correct documents.`,
          {
            diamondId: sale.diamond._id,
            diamondName: sale.diamond.name,
            reason: rejectionReason,
            adminName: req.admin.name
          }
        );
      } catch (notificationError) {
        console.error('❌ Failed to create sale rejection notification:', notificationError);
      }
    }

    console.log(`✅ Diamond sale ${status} by admin:`, sale.diamond.name);

    res.json({
      success: true,
      message: `Diamond sale ${status} successfully`,
      sale
    });
  } catch (error) {
    console.error('❌ Admin sale verification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to verify diamond sale'
    });
  }
});

// Mark sale documents as viewed and delete them
router.put('/sales/:id/mark-viewed', authenticateAdminToken, async (req, res) => {
  try {
    const sale = await DiamondSale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({ 
        success: false,
        error: 'Sale not found',
        message: 'The diamond sale could not be found'
      });
    }

    // Mark as viewed
    sale.documentsViewed = true;
    sale.documentsViewedAt = new Date();
    sale.documentsViewedBy = req.admin.adminUserId;
    await sale.save();

    // Delete the actual files
    const fs = require('fs');
    const path = require('path');

    if (sale.invoiceDocument && sale.invoiceDocument.includes('localhost:5000')) {
      const invoicePath = sale.invoiceDocument.replace('http://localhost:5000', '');
      const fullInvoicePath = path.join(__dirname, '..', invoicePath);
      if (fs.existsSync(fullInvoicePath)) {
        fs.unlinkSync(fullInvoicePath);
        console.log('🗑️ Deleted invoice file:', fullInvoicePath);
      }
    }

    if (sale.paymentProof && sale.paymentProof.includes('localhost:5000')) {
      const paymentPath = sale.paymentProof.replace('http://localhost:5000', '');
      const fullPaymentPath = path.join(__dirname, '..', paymentPath);
      if (fs.existsSync(fullPaymentPath)) {
        fs.unlinkSync(fullPaymentPath);
        console.log('🗑️ Deleted payment proof file:', fullPaymentPath);
      }
    }

    // Clear the file paths from database
    sale.invoiceDocument = 'DELETED';
    sale.paymentProof = 'DELETED';
    await sale.save();

    console.log('✅ Sale documents marked as viewed and deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Documents viewed and deleted successfully'
    });
  } catch (error) {
    console.error('❌ Mark sale viewed error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark documents as viewed'
    });
  }
});

module.exports = router;