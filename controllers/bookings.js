const Booking = require("../models/booking");
const Listing = require("../models/listing");

// Get unavailable dates for a listing
module.exports.getUnavailableDates = async (req, res) => {
  try {
    const bookings = await Booking.find({
      listing: req.params.id,
      status: { $in: ["confirmed", "pending"] }
    });
    
    const unavailableDates = [];
    bookings.forEach(booking => {
      const start = new Date(booking.checkIn);
      const end = new Date(booking.checkOut);
      
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        unavailableDates.push(d.toISOString().split('T')[0]);
      }
    });
    
    res.json({ unavailableDates });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch unavailable dates" });
  }
};

// Host bookings dashboard
module.exports.hostBookings = async (req, res) => {
  try {
    const userListings = await Listing.find({ owner: req.user._id });
    const listingIds = userListings.map(listing => listing._id);
    
    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate("listing")
      .populate("user", "username firstName lastName")
      .sort({ createdAt: -1 });
    
    res.render("bookings/host", { bookings, userType: "host" });
  } catch (error) {
    req.flash("error", "Could not load bookings");
    res.redirect("/users/dashboard");
  }
};