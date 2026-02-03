const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schemas.js");
const Review = require("../models/review");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// Validation middleware
const validateReview = (req, res, next) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(", ");
      req.flash("error", `Validation Error: ${errMsg}`);
      return res.redirect(`/listings/${req.params.id}`);
    }
    next();
  } catch (err) {
    console.error("Review validation error:", err);
    req.flash("error", "Validation failed");
    res.redirect(`/listings/${req.params.id}`);
  }
};

// CREATE - Add new review
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  
  listing.reviews.push(newReview);
  
  await newReview.save();
  await listing.save();
  
  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
}));

// DELETE - Remove review
router.delete("/:reviewId", isLoggedIn, wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listings/${id}`);
  }
  
  // Check if user is the author of the review
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have permission to delete this review");
    return res.redirect(`/listings/${id}`);
  }
  
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
}));

module.exports = router;