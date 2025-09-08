const Listing = require("../models/listing");
const Review = require("../models/review");

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  const newReview = new Review(req.body.review);
  newReview.listing = listing._id;

  await newReview.save();

  // ✅ Push review and skip re-validation of listing (avoids owner error)
  listing.reviews.push(newReview._id);
  await listing.save({ validateBeforeSave: false });

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${id}`);
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};
