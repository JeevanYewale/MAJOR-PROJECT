const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    url: {
      type: String,
      required: [true, "Image URL is required"],
      default: "https://images.unsplash.com/photo-1625505826533-5e598cdd06d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
      set: v => (v === "" ? "https://images.unsplash.com/photo-1625505826533-5e598cdd06d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60" : v),
      validate: {
        validator: v => typeof v === "string" && v.trim().length > 0,
        message: "Image URL cannot be empty"
      }
    },
    filename: { type: String, default: "listingimage" }
  },
  price: Number,
  location: String,
  country: String,

  maxGuests: { type: Number, default: 2, min: 1, max: 20 },
  bedrooms: { type: Number, default: 1, min: 0, max: 10 },
  bathrooms: { type: Number, default: 1, min: 0, max: 10 },
  category: {
    type: String,
    enum: ["apartment", "house", "villa", "cabin", "hotel", "resort", "other"],
    default: "apartment"
  },
  amenities: { type: [String], default: [] },

  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],

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
