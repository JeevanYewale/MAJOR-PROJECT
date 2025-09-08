const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  
  // Role system for user types
  role: {
    type: String,
    enum: ['guest', 'host', 'admin'],
    default: 'guest'
  },
  
  // Host profile fields
  bio: {
    type: String,
    maxlength: 500,
    default: 'Welcome! I love sharing amazing places with fellow travelers.'
  },
  
  languages: [{
    type: String,
    default: []
  }],
  
  yearsHosting: {
    type: Number,
    min: 0,
    default: 1
  },
  
  responseRate: {
    type: String,
    default: '95%'
  },
  
  responseTime: {
    type: String,
    default: 'within a few hours'
  },
  
  avatar: {
    type: String,
    default: '/images/default-avatar.jpg'
  },
  
  // Additional profile fields
  firstName: {
    type: String,
    default: ''
  },
  
  lastName: {
    type: String,
    default: ''
  },
  
  // Host verification status
  verified: {
    type: Boolean,
    default: false
  },
  
  superhost: {
    type: Boolean,
    default: false
  },
  
  // User favorites for listings
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Listing'
  }],
  
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
  return this.username;
});

// Virtual for host rating (calculated from reviews - placeholder for now)
userSchema.virtual('hostRating').get(function() {
  return 4.8; // Will be calculated from actual reviews later
});

// Virtual for total reviews as host
userSchema.virtual('totalHostReviews').get(function() {
  return Math.floor(Math.random() * 500) + 100; // Placeholder
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
    return this.save();
  }
  return Promise.resolve(this);
};

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Add username and password fields + convenient Passport methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
