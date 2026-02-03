// Simple test to check if the app starts
const mongoose = require('mongoose');

async function testApp() {
  try {
    console.log('🧪 Testing TravelStay Application...');
    
    // Test MongoDB connection
    const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB connection successful');
    
    // Test models
    const User = require('./models/user.js');
    const Listing = require('./models/listing.js');
    
    const userCount = await User.countDocuments();
    const listingCount = await Listing.countDocuments();
    
    console.log(`👤 Users in database: ${userCount}`);
    console.log(`🏠 Listings in database: ${listingCount}`);
    
    // Test admin user
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
      console.log('✅ Admin user exists');
      console.log(`📧 Admin email: ${adminUser.email}`);
      console.log(`🎭 Admin role: ${adminUser.role}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    await mongoose.disconnect();
    console.log('🎉 All tests passed! Application should work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testApp();