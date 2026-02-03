const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  // Enhanced Authentication Types
  authType: {
    type: String,
    enum: ['local', 'google', 'facebook', 'phone', 'magic-link', 'apple'],
    default: 'local'
  },
  
  // Social Auth IDs
  googleId: String,
  facebookId: String,
  appleId: String,
  
  // Enhanced User Types
  userType: {
    type: String,
    enum: ['individual', 'business', 'property-manager', 'travel-agent', 'corporate'],
    default: 'individual'
  },
  
  // Role system for user types
  role: {
    type: String,
    enum: ['guest', 'host', 'admin', 'moderator', 'support', 'manager'],
    default: 'guest'
  },
  
  // Verification Levels
  verificationLevel: {
    type: String,
    enum: ['basic', 'email', 'phone', 'id', 'background', 'superhost'],
    default: 'basic'
  },
  
  // Personal Information
  firstName: {
    type: String,
    trim: true
  },
  
  lastName: {
    type: String,
    trim: true
  },
  
  dateOfBirth: Date,
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say']
  },
  
  // Profile
  avatar: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/djyr5qobo/image/upload/v1/default-avatar.jpg'
    },
    filename: String
  },
  
  bio: {
    type: String,
    maxlength: 500,
    default: 'Welcome! I love sharing amazing places with fellow travelers.'
  },
  
  languages: [{
    type: String,
    enum: ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi', 'Other']
  }],
  
  // Location
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Host specific fields
  hostProfile: {
    yearsHosting: {
      type: Number,
      min: 0,
      default: 0
    },
    
    responseRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 95
    },
    
    responseTime: {
      type: String,
      enum: ['within an hour', 'within a few hours', 'within a day', 'a few days or more'],
      default: 'within a few hours'
    },
    
    acceptanceRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 90
    },
    
    totalListings: {
      type: Number,
      default: 0
    },
    
    totalBookings: {
      type: Number,
      default: 0
    }
  },
  
  // Business Information (for business users)
  businessInfo: {
    businessName: String,
    businessLicense: String,
    taxId: String,
    businessType: {
      type: String,
      enum: ['hotel', 'resort', 'apartment', 'vacation-rental', 'hostel', 'other']
    },
    businessAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Enhanced Verification status
  verifications: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    identity: { type: Boolean, default: false },
    selfie: { type: Boolean, default: false },
    business: { type: Boolean, default: false },
    background: { type: Boolean, default: false }
  },
  
  // Security Features
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  superhost: {
    type: Boolean,
    default: false
  },
  
  // User preferences
  preferences: {
    currency: {
      type: String,
      default: 'USD'
    },
    language: {
      type: String,
      default: 'English'
    },
    timezone: String,
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  
  // User activity
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  
  bookings: [{
    type: Schema.Types.ObjectId,
    ref: 'Booking'
  }],
  
  listings: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  
  reviews: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending'],
    default: 'active'
  },
  
  lastLogin: Date,
  
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username || 'User';
});

// Virtual for display name
userSchema.virtual('displayName').get(function() {
  return this.firstName || this.username || 'User';
});

// Virtual for host rating (calculated from reviews)
userSchema.virtual('hostRating').get(function() {
  // This will be calculated from actual reviews in the future
  return 4.8;
});

// Virtual for total reviews as host
userSchema.virtual('totalHostReviews').get(function() {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for completion percentage
userSchema.virtual('profileCompletion').get(function() {
  let completion = 0;
  const fields = ['firstName', 'lastName', 'bio', 'phone', 'dateOfBirth'];
  
  fields.forEach(field => {
    if (this[field]) completion += 20;
  });
  
  if (this.avatar && this.avatar.url !== 'https://res.cloudinary.com/djyr5qobo/image/upload/v1/default-avatar.jpg') {
    completion += 20;
  }
  
  return Math.min(completion, 100);
});

// Method to check if user is host or admin
userSchema.methods.isHost = function() {
  return this.role === 'host' || this.role === 'admin';
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Auto-upgrade to host when creating first listing
userSchema.methods.becomeHost = function() {
  if (this.role === 'guest') {
    this.role = 'host';
    this.hostProfile.yearsHosting = new Date().getFullYear() - new Date(this.joinDate).getFullYear();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add listing to user's listings
userSchema.methods.addListing = function(listingId) {
  if (!this.listings.includes(listingId)) {
    this.listings.push(listingId);
    this.hostProfile.totalListings = this.listings.length;
  }
  return this.save();
};

// Method to add booking to user's bookings
userSchema.methods.addBooking = function(bookingId) {
  if (!this.bookings.includes(bookingId)) {
    this.bookings.push(bookingId);
  }
  return this.save();
};

// Method to toggle favorite listing
userSchema.methods.toggleFavorite = function(listingId) {
  const index = this.favorites.indexOf(listingId);
  if (index > -1) {
    this.favorites.splice(index, 1);
  } else {
    this.favorites.push(listingId);
  }
  return this.save();
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Add username and password fields + convenient Passport methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
