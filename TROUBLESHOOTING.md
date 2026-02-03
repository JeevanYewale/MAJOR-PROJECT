# TravelStay - Troubleshooting Guide

## 🚀 Quick Start

1. **Start MongoDB**
   ```bash
   mongod
   ```

2. **Start the application**
   ```bash
   node app.js
   ```

3. **Access the application**
   - URL: http://localhost:8080
   - Admin Login: admin / admin123

## 🐛 Common Issues & Solutions

### Issue: Cannot Create/Add Listings

**Symptoms:**
- Form submission doesn't work
- Redirected back to form without success message
- No error messages shown

**Solutions:**

1. **Check if you're logged in**
   - Make sure you're logged in as admin (admin/admin123)
   - Check the navbar - should show "Welcome, admin"

2. **Check MongoDB connection**
   ```bash
   node test-app.js
   ```

3. **Check file upload**
   - Make sure you select an image file
   - Supported formats: JPG, PNG, JPEG
   - File size should be reasonable (< 10MB)

4. **Check required fields**
   - Title (3-100 characters)
   - Description (10-2000 characters)
   - Country (2-60 characters)
   - Location (2-100 characters)
   - Price (minimum ₹100)
   - Max Guests, Bedrooms, Bathrooms, Property Type
   - Property Image

5. **Check browser console for errors**
   - Press F12 to open developer tools
   - Check Console tab for JavaScript errors
   - Check Network tab for failed requests

### Issue: Database Connection Failed

**Solutions:**
1. Make sure MongoDB is running: `mongod`
2. Check if port 27017 is available
3. Try MongoDB Atlas (cloud) if local fails

### Issue: Port 8080 Already in Use

**Solutions:**
```bash
# Kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID_NUMBER> /F
```

### Issue: Image Upload Not Working

**Solutions:**
1. Check Cloudinary configuration in .env file
2. Make sure file input has `enctype="multipart/form-data"`
3. Check file size and format

## 🔧 Debug Mode

To enable debug logging, add this to your .env file:
```
DEBUG=true
NODE_ENV=development
```

## 📝 Testing Listing Creation

1. **Login as admin**
   - Go to http://localhost:8080/users/login
   - Username: admin
   - Password: admin123

2. **Navigate to Add Listing**
   - Click "Add Listing" in navbar
   - Or go to http://localhost:8080/listings/new

3. **Fill the form**
   - Title: "Test Property"
   - Description: "This is a test property for debugging"
   - Country: "India"
   - Location: "Mumbai"
   - Price: 2000
   - Max Guests: 4
   - Bedrooms: 2
   - Bathrooms: 1
   - Property Type: Apartment
   - Upload any image file

4. **Submit and check**
   - Click "Create Listing"
   - Should redirect to the new listing page
   - Check if listing appears in listings page

## 🛠️ Manual Database Check

```javascript
// Run this in MongoDB shell or Node.js
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');

mongoose.connect('mongodb://127.0.0.1:27017/wanderlust').then(async () => {
  const listings = await Listing.find().populate('owner');
  console.log('Total listings:', listings.length);
  listings.forEach(listing => {
    console.log(`- ${listing.title} by ${listing.owner.username}`);
  });
  process.exit(0);
});
```

## 📞 Still Having Issues?

1. Check the browser's Network tab (F12) when submitting the form
2. Look at the server console for error messages
3. Verify all required fields are filled
4. Try creating a listing with minimal data first
5. Check if the issue is with image upload by trying without an image first

## 🎯 Expected Behavior

When everything works correctly:
1. Form submission shows loading state
2. Redirects to new listing detail page
3. Success message appears
4. Listing appears in listings grid
5. User's dashboard shows updated listing count

## 🔍 Debug Commands

```bash
# Test database connection
node test-app.js

# Check syntax
node -c app.js

# Start with debug logging
DEBUG=* node app.js

# Check MongoDB status
mongo --eval "db.stats()"
```