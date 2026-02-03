const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");
const Review = require("../models/review");

// Admin dashboard
module.exports.dashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]);
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email createdAt verified');
    
    const recentListings = await Listing.find()
      .populate('owner', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const stats = {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0
    };
    
    res.render("admin/dashboard", { 
      stats, 
      recentUsers, 
      recentListings 
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    req.flash("error", "Could not load dashboard");
    res.redirect("/");
  }
};

// Manage users
module.exports.manageUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.render("admin/users", { 
      users, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error("Error managing users:", error);
    req.flash("error", "Could not load users");
    res.redirect("/admin");
  }
};

// Manage listings
module.exports.manageListings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    const listings = await Listing.find()
      .populate('owner', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalListings = await Listing.countDocuments();
    const totalPages = Math.ceil(totalListings / limit);
    
    res.render("admin/listings", { 
      listings, 
      currentPage: page, 
      totalPages 
    });
  } catch (error) {
    console.error("Error managing listings:", error);
    req.flash("error", "Could not load listings");
    res.redirect("/admin");
  }
};

// Toggle user status
module.exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    
    res.json({ 
      success: true, 
      status: user.status 
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ error: "Could not update user status" });
  }
};

// Toggle listing status
module.exports.toggleListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    listing.status = listing.status === 'active' ? 'inactive' : 'active';
    await listing.save();
    
    res.json({ 
      success: true, 
      status: listing.status 
    });
  } catch (error) {
    console.error("Error toggling listing status:", error);
    res.status(500).json({ error: "Could not update listing status" });
  }
};

// Delete user
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete user's listings
    await Listing.deleteMany({ owner: id });
    
    // Delete user's bookings
    await Booking.deleteMany({ $or: [{ guest: id }, { host: id }] });
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Could not delete user" });
  }
};

// Site statistics
module.exports.getStatistics = async (req, res) => {
  try {
    const userStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);
    
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$pricing.total" }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      userStats,
      bookingStats
    });
  } catch (error) {
    console.error("Error getting statistics:", error);
    res.status(500).json({ error: "Could not load statistics" });
  }
};