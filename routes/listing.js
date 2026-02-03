const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../CloudConfig");
const upload = multer({ storage });

const listingsController = require("../controllers/listings.js");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware");
const { listingSchema } = require("../schemas.js");

// Validation middleware
const validateListing = (req, res, next) => {
  try {
    const { error } = listingSchema.validate(req.body);
    if (error) {
      const errMsg = error.details.map((el) => el.message).join(", ");
      req.flash("error", `Validation Error: ${errMsg}`);
      return res.redirect("/listings/new");
    }
    next();
  } catch (err) {
    console.error("Validation error:", err);
    req.flash("error", "Validation failed");
    res.redirect("/listings/new");
  }
};

// INDEX - show all listings
router.get("/", wrapAsync(listingsController.index));

// NEW - show form to create listing
router.get("/new", isLoggedIn, listingsController.renderNewForm);

// CREATE - create listing (with debug logging)
router.post("/", isLoggedIn, (req, res, next) => {
  console.log("📝 POST /listings - Request received");
  console.log("👤 User:", req.user ? req.user.username : 'Not logged in');
  console.log("📝 Body:", req.body);
  next();
}, upload.fields([
  { name: 'listing[image]', maxCount: 1 },
  { name: 'owner[photo]', maxCount: 1 }
]), (req, res, next) => {
  console.log("📁 Files uploaded:", req.files);
  next();
}, wrapAsync(listingsController.createListing));

// SHOW - show individual listing
router.get("/:id", wrapAsync(listingsController.showListing));

// EDIT - show form to edit listing
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.renderEditForm));

// UPDATE - update listing
router.put("/:id", isLoggedIn, isOwner, upload.fields([
  { name: 'listing[image]', maxCount: 1 },
  { name: 'owner[photo]', maxCount: 1 }
]), wrapAsync(listingsController.updateListing));

// DELETE - delete listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingsController.deleteListing));

// SEARCH - search listings
router.get("/search", wrapAsync(listingsController.searchListings));

// FAVORITES - toggle favorite
router.post("/:id/favorite", isLoggedIn, wrapAsync(listingsController.toggleFavorite));

module.exports = router;