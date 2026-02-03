const Listing = require("../models/listing.js");

// INDEX - Show all listings
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({})
      .populate('owner', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.render("listings/index.ejs", { allListings });
  } catch (error) {
    console.error("❌ Error fetching listings:", error);
    req.flash("error", "Could not load listings");
    res.render("listings/index.ejs", { allListings: [] });
  }
};

// NEW - Show form to create new listing
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// CREATE - Create new listing
module.exports.createListing = async (req, res) => {
  try {
    const payload = req.body.listing || {};
    
    // Validate required fields
    if (!payload.title || !payload.description || !payload.price || !payload.location || !payload.country) {
      req.flash("error", "Please fill in all required fields");
      return res.redirect("/listings/new");
    }

    const listingData = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: parseFloat(payload.price),
      country: payload.country.trim(),
      location: payload.location.trim(),
      maxGuests: parseInt(payload.maxGuests) || 2,
      bedrooms: parseInt(payload.bedrooms) || 1,
      bathrooms: parseInt(payload.bathrooms) || 1,
      category: payload.category || 'trending',
      amenities: payload.amenities || []
    };

    // Handle image upload
    if (req.files && req.files['listing[image]'] && req.files['listing[image]'][0]) {
      listingData.image = {
        url: req.files['listing[image]'][0].path,
        filename: req.files['listing[image]'][0].filename,
      };
    }

    // Handle host profile updates - Update user profile immediately
    const User = require("../models/user.js");
    const hostData = req.body.host || {};
    
    const updateFields = {};
    if (hostData.name) {
      const nameParts = hostData.name.trim().split(' ');
      updateFields.firstName = nameParts[0];
      if (nameParts.length > 1) updateFields.lastName = nameParts.slice(1).join(' ');
    }
    if (hostData.bio) updateFields.bio = hostData.bio;
    if (hostData.languages) updateFields.languages = Array.isArray(hostData.languages) ? hostData.languages : [hostData.languages];
    if (hostData.responseTime) updateFields['hostProfile.responseTime'] = hostData.responseTime;
    
    // Handle owner photo upload
    if (req.files && req.files['owner[photo]'] && req.files['owner[photo]'][0]) {
      updateFields.avatar = {
        url: req.files['owner[photo]'][0].path,
        filename: req.files['owner[photo]'][0].filename,
      };
    }
    
    // Update user profile immediately
    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(req.user._id, updateFields, { new: true });
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New listing added successfully");
    res.redirect(`/listings/${newListing._id}`);
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    req.flash("error", "Could not create listing");
    res.redirect("/listings/new");
  }
};

// SHOW - Show individual listing
module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner", "username firstName lastName bio languages avatar hostProfile verified createdAt");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error("❌ Error fetching listing:", error);
    req.flash("error", "Could not load listing");
    res.redirect("/listings");
  }
};

// EDIT - Show form to edit listing
module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    // Get current user with full profile data
    const User = require("../models/user.js");
    const currentUser = await User.findById(req.user._id);
    
    res.render("listings/edit.ejs", { listing, currentUser });
  } catch (error) {
    console.error("❌ Error fetching listing for edit:", error);
    req.flash("error", "Could not load listing");
    res.redirect("/listings");
  }
};

// UPDATE - Update listing
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body.listing || {};
    
    const updateData = {
      title: payload.title?.trim(),
      description: payload.description?.trim(),
      price: parseFloat(payload.price),
      country: payload.country?.trim(),
      location: payload.location?.trim(),
      maxGuests: parseInt(payload.maxGuests) || 2,
      bedrooms: parseInt(payload.bedrooms) || 1,
      bathrooms: parseInt(payload.bathrooms) || 1,
      category: payload.category || 'trending',
      amenities: payload.amenities || []
    };

    // Handle image update
    if (req.files && req.files['listing[image]'] && req.files['listing[image]'][0]) {
      updateData.image = {
        url: req.files['listing[image]'][0].path,
        filename: req.files['listing[image]'][0].filename,
      };
    }

    // Handle host profile updates
    const User = require("../models/user.js");
    const hostData = req.body.host || {};
    
    const userUpdateFields = {};
    if (hostData.name) {
      const nameParts = hostData.name.trim().split(' ');
      userUpdateFields.firstName = nameParts[0];
      if (nameParts.length > 1) userUpdateFields.lastName = nameParts.slice(1).join(' ');
    }
    if (hostData.bio) userUpdateFields.bio = hostData.bio;
    if (hostData.languages) userUpdateFields.languages = Array.isArray(hostData.languages) ? hostData.languages : [hostData.languages];
    if (hostData.responseTime) userUpdateFields['hostProfile.responseTime'] = hostData.responseTime;
    
    // Handle owner photo upload
    if (req.files && req.files['owner[photo]'] && req.files['owner[photo]'][0]) {
      userUpdateFields.avatar = {
        url: req.files['owner[photo]'][0].path,
        filename: req.files['owner[photo]'][0].filename,
      };
    }
    
    // Update user profile
    if (Object.keys(userUpdateFields).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdateFields, { new: true });
    }

    const updatedListing = await Listing.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("❌ Error updating listing:", error);
    req.flash("error", "Could not update listing");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

// DELETE - Delete listing
module.exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedListing = await Listing.findByIdAndDelete(id);
    
    if (!deletedListing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
  } catch (error) {
    console.error("❌ Error deleting listing:", error);
    req.flash("error", "Could not delete listing");
    res.redirect("/listings");
  }
};

// SEARCH - Search listings
module.exports.searchListings = async (req, res) => {
  try {
    const { location, category, checkIn, checkOut, guests, minPrice, maxPrice } = req.query;
    
    let query = {};
    
    // Location search
    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { title: { $regex: location, $options: 'i' } }
      ];
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Guest capacity
    if (guests) {
      query.maxGuests = { $gte: parseInt(guests) };
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    const allListings = await Listing.find(query)
      .populate('owner', 'username firstName lastName')
      .sort({ createdAt: -1 });
    
    res.render("listings/search.ejs", { 
      allListings, 
      searchParams: req.query,
      resultsCount: allListings.length
    });
  } catch (error) {
    console.error("❌ Error searching listings:", error);
    req.flash("error", "Search failed");
    res.redirect("/listings");
  }
};

// FAVORITES - Toggle favorite
module.exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    
    const User = require("../models/user.js");
    const user = await User.findById(userId);
    
    const isFavorite = user.favorites.includes(id);
    
    if (isFavorite) {
      user.favorites.pull(id);
      listing.favoriteCount = Math.max(0, (listing.favoriteCount || 0) - 1);
    } else {
      user.favorites.push(id);
      listing.favoriteCount = (listing.favoriteCount || 0) + 1;
    }
    
    await user.save();
    await listing.save();
    
    res.json({ 
      success: true, 
      isFavorite: !isFavorite,
      favoriteCount: listing.favoriteCount
    });
  } catch (error) {
    console.error("❌ Error toggling favorite:", error);
    res.status(500).json({ error: "Could not update favorite" });
  }
};