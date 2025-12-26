const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ratna');
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ adminId: 'admin' });
    if (existingAdmin) {
      console.log('ℹ️ Default admin already exists');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      adminId: 'admin',
      name: 'System Administrator',
      email: 'admin@ratna.com',
      password: 'admin123',
      role: 'super_admin'
    });

    await admin.save();
    console.log('✅ Default admin created successfully');
    console.log('📋 Admin Credentials:');
    console.log('   Admin ID: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@ratna.com');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

createDefaultAdmin();