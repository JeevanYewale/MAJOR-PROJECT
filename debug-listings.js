// Debug script to check listings and images
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');

async function debugListings() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    console.log('✅ Connected to MongoDB');
    
    const listings = await Listing.find({}).limit(5);
    console.log(`📋 Found ${listings.length} listings`);
    
    listings.forEach((listing, index) => {
      console.log(`\n${index + 1}. ${listing.title}`);
      console.log(`   📍 Location: ${listing.location}, ${listing.country}`);
      console.log(`   💰 Price: ₹${listing.price}`);
      console.log(`   🖼️ Image: ${listing.image?.url || 'No image'}`);
      console.log(`   👤 Owner: ${listing.owner}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugListings();