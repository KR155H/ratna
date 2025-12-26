const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateToken } = require('../middleware/auth');

// Get all notifications for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    let filter = { user: req.user.userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .populate('data.diamondId', 'name image price');

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ 
      user: req.user.userId, 
      isRead: false 
    });

    console.log(`📊 Fetched ${notifications.length} notifications for user ${req.user.userId}`);

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        unreadCount
      }
    });
  } catch (error) {
    console.error('❌ Notifications fetch error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch notifications'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found',
        message: 'The notification could not be found'
      });
    }

    await notification.markAsRead();
    console.log(`✅ Notification marked as read: ${notification._id}`);

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('❌ Mark notification read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { user: req.user.userId, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );

    console.log(`✅ Marked ${result.modifiedCount} notifications as read for user ${req.user.userId}`);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Mark all notifications read error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to mark all notifications as read'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found',
        message: 'The notification could not be found'
      });
    }

    console.log(`🗑️ Notification deleted: ${notification._id}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete notification'
    });
  }
});

// Helper function to create notification
const createNotification = async (userId, type, title, message, data = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      data
    });

    await notification.save();
    console.log(`🔔 Notification created for user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('❌ Create notification error:', error);
    throw error;
  }
};

module.exports = { router, createNotification };