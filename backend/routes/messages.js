const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Diamond = require('../models/Diamond');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Send message (diamond inquiry)
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { receiverId, diamondId, subject, message } = req.body;

    console.log('📧 Sending message:', { receiverId, diamondId, subject });

    // Validation
    if (!receiverId || !diamondId || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Receiver, diamond, subject, and message are required'
      });
    }

    // Check if diamond exists
    const diamond = await Diamond.findById(diamondId).populate('seller', 'name email');
    if (!diamond) {
      return res.status(404).json({ 
        success: false,
        error: 'Diamond not found',
        message: 'The diamond you are inquiring about could not be found'
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ 
        success: false,
        error: 'Receiver not found',
        message: 'The seller could not be found'
      });
    }

    // Prevent sending message to self
    if (req.user.userId === receiverId) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid recipient',
        message: 'You cannot send a message to yourself'
      });
    }

    // Create message
    const newMessage = new Message({
      sender: req.user.userId,
      receiver: receiverId,
      diamond: diamondId,
      subject: subject.trim(),
      message: message.trim()
    });

    await newMessage.save();

    // Populate the message for response
    await newMessage.populate([
      { path: 'sender', select: 'name email' },
      { path: 'receiver', select: 'name email' },
      { path: 'diamond', select: 'name price image' }
    ]);

    console.log('✅ Message sent successfully:', newMessage._id);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('❌ Send message error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to send message'
    });
  }
});

// Get messages for authenticated user (inbox)
router.get('/inbox', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    let filter = { receiver: req.user.userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const messages = await Message.find(filter)
      .populate('sender', 'name email')
      .populate('diamond', 'name price image')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Message.countDocuments(filter);
    const unreadCount = await Message.countDocuments({ 
      receiver: req.user.userId, 
      isRead: false 
    });

    console.log(`📧 Fetched ${messages.length} messages for user ${req.user.userId}`);

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Inbox fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch messages'
    });
  }
});

// Get sent messages
router.get('/sent', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await Message.find({ sender: req.user.userId })
      .populate('receiver', 'name email')
      .populate('diamond', 'name price image')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Message.countDocuments({ sender: req.user.userId });

    console.log(`📧 Fetched ${messages.length} sent messages for user ${req.user.userId}`);

    res.json({
      success: true,
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('❌ Sent messages fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch sent messages'
    });
  }
});

// Get single message with replies
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('diamond', 'name price image carat cut color clarity')
      .populate('replies.sender', 'name email');

    if (!message) {
      return res.status(404).json({ 
        success: false,
        error: 'Message not found',
        message: 'The message could not be found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender._id.toString() !== req.user.userId && 
        message.receiver._id.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to view this message'
      });
    }

    // Mark as read if user is the receiver
    if (message.receiver._id.toString() === req.user.userId && !message.isRead) {
      await message.markAsRead();
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('❌ Message fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch message'
    });
  }
});

// Reply to message
router.post('/:id/reply', authenticateToken, async (req, res) => {
  try {
    const { message: replyMessage } = req.body;

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Reply message is required'
      });
    }

    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ 
        success: false,
        error: 'Message not found',
        message: 'The message could not be found'
      });
    }

    // Check if user is sender or receiver (both can reply)
    if (message.sender.toString() !== req.user.userId && 
        message.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to reply to this message'
      });
    }

    // Add reply
    message.replies.push({
      sender: req.user.userId,
      message: replyMessage.trim()
    });

    await message.save();

    // Populate the updated message
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'receiver', select: 'name email' },
      { path: 'diamond', select: 'name price image' },
      { path: 'replies.sender', select: 'name email' }
    ]);

    console.log('✅ Reply added to message:', message._id);

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: message
    });
  } catch (error) {
    console.error('❌ Reply error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to send reply'
    });
  }
});

// Mark message as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ 
        success: false,
        error: 'Message not found',
        message: 'The message could not be found'
      });
    }

    // Check if user is the receiver
    if (message.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to mark this message as read'
      });
    }

    await message.markAsRead();

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('❌ Mark read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark message as read'
    });
  }
});

// Delete message
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ 
        success: false,
        error: 'Message not found',
        message: 'The message could not be found'
      });
    }

    // Check if user is sender or receiver
    if (message.sender.toString() !== req.user.userId && 
        message.receiver.toString() !== req.user.userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied',
        message: 'You are not authorized to delete this message'
      });
    }

    await Message.findByIdAndDelete(req.params.id);

    console.log('🗑️ Message deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete message error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;