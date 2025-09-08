const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  listing: {
    type: Schema.Types.ObjectId,
    ref: "Listing",
    required: true
  }
});

reviewSchema.index({ listing: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
