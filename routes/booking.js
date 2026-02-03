const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");
const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Show booking form
router.get("/listings/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  res.render("bookings/new", { listing });
}));

// Create booking
router.post("/listings/:id/book", isLoggedIn, wrapAsync(async (req, res) => {
  const { checkIn, checkOut, guests, phone, message } = req.body;
  const listing = await Listing.findById(req.params.id);
  
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  
  // Calculate total price
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * listing.price;
  
  const booking = new Booking({
    listing: req.params.id,
    user: req.user._id,
    checkIn: new Date(checkIn),
    checkOut: new Date(checkOut),
    guests: parseInt(guests),
    totalPrice,
    phone,
    message
  });
  
  await booking.save();
  
  req.flash("success", "Booking request sent successfully!");
  res.redirect(`/bookings/${booking._id}`);
}));

// Show booking details
router.get("/:id", isLoggedIn, wrapAsync(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate("listing")
    .populate("user", "username firstName lastName");
  
  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/listings");
  }
  
  res.render("bookings/show", { booking });
}));

// Show user's bookings
router.get("/", isLoggedIn, wrapAsync(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });
  
  res.render("bookings/index", { bookings });
}));

module.exports = router;