const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  
  images: [{
    url: { type: String, required: true },
    filename: { type: String, default: "listingimage" }
  }],
  
  image: {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      default: "https://images.unsplash.com/photo-1625505826533-5e598cdd06d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      set: v => (v === "" ? "https://images.unsplash.com/photo-1625505826533-5e598cdd06d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" : v)
    },
    filename: { type: String, default: "listingimage" }
  },
  
  price: { type: Number, required: true, min: 1 },
  currency: { type: String, default: "USD" },
  
  location: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  coordinates: {
    lat: Number,
    lng: Number
  },

  maxGuests: { type: Number, default: 2, min: 1, max: 20 },
  bedrooms: { type: Number, default: 1, min: 0, max: 10 },
  beds: { type: Number, default: 1, min: 1, max: 20 },
  bathrooms: { type: Number, default: 1, min: 0, max: 10 },
  
  propertyType: {
    type: String,
    enum: ["apartment", "house", "villa", "cabin", "hotel", "resort", "condo", "townhouse", "loft", "other"],
    default: "apartment"
  },
  
  category: {
    type: String,
    enum: ["beachfront", "trending", "countryside", "amazing-pools", "iconic-cities", "mountains", "castles", "amazing-views", "luxe", "cabins", "apartment", "house", "villa", "cabin", "hotel", "resort", "other"],
    default: "trending"
  },
  
  amenities: [{
    type: String,
    enum: ["wifi", "kitchen", "washer", "dryer", "air-conditioning", "heating", "tv", "pool", "hot-tub", "gym", "parking", "breakfast", "laptop-workspace", "crib", "hair-dryer", "iron", "essentials", "shampoo", "hangers", "bed-linens", "extra-pillows", "fire-extinguisher", "carbon-monoxide-alarm", "smoke-alarm", "first-aid-kit", "Beach access", "Washer", "TV", "WiFi", "Kitchen", "Air conditioning", "Heating", "Pool", "Hot tub", "Gym", "Parking", "Breakfast", "Workspace", "Hair dryer", "Iron", "Essentials", "Shampoo", "Hangers", "Bed linens", "Extra pillows"]
  }],
  
  houseRules: {
    checkIn: { type: String, default: "3:00 PM" },
    checkOut: { type: String, default: "11:00 AM" },
    smokingAllowed: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    partiesAllowed: { type: Boolean, default: false },
    quietHours: { type: String, default: "10:00 PM - 8:00 AM" },
    additionalRules: [String]
  },
  
  availability: {
    instantBook: { type: Boolean, default: false },
    minNights: { type: Number, default: 1, min: 1 },
    maxNights: { type: Number, default: 365 },
    advanceNotice: { type: String, enum: ["same-day", "1-day", "2-days", "3-days", "7-days"], default: "same-day" },
    preparationTime: { type: String, enum: ["none", "1-day", "2-days"], default: "none" }
  },
  
  pricing: {
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
    weeklyDiscount: { type: Number, default: 0, max: 50 },
    monthlyDiscount: { type: Number, default: 0, max: 50 }
  },

  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  
  bookings: [{ type: Schema.Types.ObjectId, ref: "Booking" }],
  
  status: {
    type: String,
    enum: ["active", "inactive", "pending", "suspended"],
    default: "active"
  },
  
  featured: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  
  viewCount: { type: Number, default: 0 },
  favoriteCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

listingSchema.pre("save", async function(next) {
  if (this.isNew && this.owner) {
    try {
      const User = mongoose.model("User");
      const owner = await User.findById(this.owner);
      if (owner && owner.role === "guest") {
        await owner.becomeHost();
        console.log(`User ${owner.username} upgraded to host`);
      }
    } catch (e) {
      console.error("Error upgrading user to host:", e);
    }
  }
  next();
});

listingSchema.pre("findOneAndDelete", async function(next) {
  const listingId = this.getQuery()["_id"];
  console.log(`🗑️ PRE: Preparing to delete listing with ID: ${listingId}`);
  next();
});

listingSchema.post("findOneAndDelete", async function(listing) {
  if (listing?.reviews?.length > 0) {
    try {
      const Review = require("./review.js");
      const deletedReviews = await Review.deleteMany({ _id: { $in: listing.reviews } });
      console.log(`🗑️ Deleted ${deletedReviews.deletedCount} reviews for listing: ${listing.title}`);
    } catch (e) {
      console.error("Error deleting associated reviews:", e);
    }
  }
  console.log(`✅ Cleanup completed for listing: ${listing._id}`);
});

listingSchema.methods.calculateAverageRating = async function() {
  if (!this.reviews?.length) return 0;
  await this.populate("reviews");
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / this.reviews.length).toFixed(1);
};

listingSchema.methods.getReviewCount = function() {
  return this.reviews ? this.reviews.length : 0;
};

listingSchema.virtual("averageRating").get(function() {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / this.reviews.length).toFixed(1);
});

listingSchema.virtual("reviewCount").get(function() {
  return this.reviews ? this.reviews.length : 0;
});

module.exports = mongoose.model("Listing", listingSchema);
