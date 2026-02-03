const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

console.log('🏥 TravelStay Health Check\n');

// Check Node.js version
console.log('✅ Node.js version:', process.version);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file found');
  require('dotenv').config();
} else {
  console.log('❌ .env file not found');
}

// Check MongoDB connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";
console.log('🔍 Testing MongoDB connection...');

mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB connection successful');
    
    // Check if collections exist
    return mongoose.connection.db.listCollections().toArray();
  })
  .then((collections) => {
    console.log('📊 Database collections:', collections.map(c => c.name).join(', '));
    
    // Check if sample data exists
    const Listing = require('./models/listing');
    return Listing.countDocuments();
  })
  .then((count) => {
    console.log(`📝 Listings in database: ${count}`);
    
    if (count === 0) {
      console.log('⚠️  No listings found. Run "node init-db.js" to add sample data');
    }
    
    console.log('\n🎉 Health check completed successfully!');
    console.log('🚀 You can now run "npm start" to start the application');
    
    process.exit(0);
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running (mongod command)');
    console.log('2. Check if port 27017 is available');
    console.log('3. Consider using MongoDB Atlas (cloud) instead');
    
    process.exit(1);
  });