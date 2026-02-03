const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const User = require('./models/user.js');
const initData = require('./init/data.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function initDB() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ MongoDB Connected");
    
    // Create a default admin user if none exists
    let defaultUser = await User.findOne({ username: 'admin' });
    if (!defaultUser) {
      defaultUser = new User({
        username: 'admin',
        email: 'admin@travelstay.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        verified: true,
        verifications: {
          email: true,
          phone: true,
          identity: true
        }
      });
      await User.register(defaultUser, 'admin123');
      console.log("👤 Default admin user created (admin/admin123)");
    } else {
      console.log("👤 Admin user already exists");
    }
    
    // Check if listings already exist
    const existingListings = await Listing.countDocuments();
    if (existingListings > 0) {
      console.log(`📦 Database already has ${existingListings} listings`);
      console.log("🎉 Database is ready!");
      process.exit(0);
    }
    
    // Add owner to each listing with enhanced data
    const listingsWithOwner = initData.data.map(listing => ({
      ...listing,
      owner: defaultUser._id,
      status: 'active',
      category: listing.category || 'trending',
      maxGuests: listing.maxGuests || Math.floor(Math.random() * 6) + 2,
      bedrooms: listing.bedrooms || Math.floor(Math.random() * 4) + 1,
      bathrooms: listing.bathrooms || Math.floor(Math.random() * 3) + 1,
      amenities: listing.amenities || ['WiFi', 'Kitchen', 'Parking', 'Air conditioning'],
      featured: Math.random() > 0.8, // 20% chance of being featured
      verified: true,
      viewCount: Math.floor(Math.random() * 1000),
      favoriteCount: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
    }));
    
    // Insert sample data
    await Listing.insertMany(listingsWithOwner);
    console.log(`📦 Inserted ${listingsWithOwner.length} sample listings`);
    
    // Update user's listings array
    const insertedListings = await Listing.find({ owner: defaultUser._id });
    defaultUser.listings = insertedListings.map(l => l._id);
    defaultUser.hostProfile.totalListings = insertedListings.length;
    await defaultUser.save();
    
    console.log("🎉 Database initialized successfully!");
    console.log("🔑 Login with: admin / admin123");
    console.log("🌐 Visit: http://localhost:8080");
    process.exit(0);
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    process.exit(1);
  }
}

initDB();