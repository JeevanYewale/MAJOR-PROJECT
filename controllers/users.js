const User = require("../models/user");
const Listing = require("../models/listing");

// Show signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Signup logic
module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to TravelStay, " + username + "!");
      res.redirect("/listings");
    });
  } catch (e) {
    console.error("❌ Signup Error:", e.message);
    req.flash("error", e.message);
    res.redirect("/users/signup");
  }
};

// Show login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Login logic
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back, " + req.user.username + "!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "Logged out successfully.");
    res.redirect("/listings");
  });
};

// Show user profile
module.exports.showProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/listings");
    }
    res.render("users/profile", { user });
  } catch (error) {
    console.error("Error loading profile:", error);
    req.flash("error", "Could not load profile");
    res.redirect("/listings");
  }
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, phone, city, state, country } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (bio) updateData.bio = bio.trim();
    if (phone) updateData.phone = phone.trim();
    
    // Handle location fields
    if (city || state || country) {
      updateData.location = {};
      if (city) updateData.location.city = city.trim();
      if (state) updateData.location.state = state.trim();
      if (country) updateData.location.country = country.trim();
    }
    
    await User.findByIdAndUpdate(req.user._id, updateData);
    req.flash("success", "Profile updated successfully!");
    res.redirect("/users/profile");
  } catch (error) {
    console.error("Profile update error:", error);
    req.flash("error", "Update failed. Please try again.");
    res.redirect("/users/profile");
  }
};

// Dashboard for users
module.exports.showDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listings = await Listing.find({ owner: req.user._id }).limit(4);
    
    const stats = {
      totalListings: listings.length,
      totalBookings: 0,
      totalRevenue: 0,
      averageRating: 4.8
    };
    
    res.render("users/dashboard", { user, listings, stats });
  } catch (error) {
    console.error("Error loading dashboard:", error);
    req.flash("error", "Could not load dashboard");
    res.redirect("/users/profile");
  }
};

// Show user favorites
module.exports.showFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'owner',
        select: 'username firstName lastName'
      }
    });
    
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/listings");
    }
    
    res.render("users/favorites", { 
      user, 
      favorites: user.favorites || [],
      title: "My Favorites"
    });
  } catch (error) {
    console.error("Error loading favorites:", error);
    req.flash("error", "Could not load favorites");
    res.redirect("/users/dashboard");
  }
};