const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Contact form submission
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Name, email, subject, and message are required',
        fields: { name: !name, email: !email, subject: !subject, message: !message }
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        message: 'Please enter a valid email address',
        fields: { email: true }
      });
    }

    // Save contact form to database
    const contact = new Contact({
      name: name.trim(),
      email: email.toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      subject: subject.trim(),
      message: message.trim()
    });

    await contact.save();
    console.log('📧 Contact form saved:', contact.email);
    
    res.json({ 
      success: true,
      message: 'Thank you for your message! We will get back to you within 24 hours.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        submittedAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Contact form error:', error);
    
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
      message: 'Unable to process your message at this time. Please try again later.'
    });
  }
});

module.exports = router;