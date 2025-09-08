const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync");
const { reviewSchema } = require("../schemas");
const reviewsController = require("../controllers/reviews");

// Validation middleware for reviews
const validateReview = (req, res, next) => {
  if (!reviewSchema) {
    return res.status(404).send("Review functionality not available");
  }

  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(", ");
    console.error("Review Validation Error:", msg);
    return res.status(400).send(`Validation Error: ${msg}`);
  }
  next();
};

// CREATE Review
router.post("/", validateReview, wrapAsync(reviewsController.createReview));

// DELETE Review
router.delete("/:reviewId", wrapAsync(reviewsController.deleteReview));

module.exports = router;
