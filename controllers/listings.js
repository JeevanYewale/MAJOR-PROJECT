const Listing = require("../models/listing.js");
const User = require("../models/user.js");

// Helper: Normalize Image Input
function normalizeImageInput(payloadImage, payloadImageUrl, existingImage) {
  if (typeof payloadImageUrl === "string" && payloadImageUrl.trim() !== "") {
    return {
      filename: (existingImage && existingImage.filename) || "listingimage",
      url: payloadImageUrl.trim(),
    };
  }
  if (
    payloadImage &&
    typeof payloadImage === "object" &&
    payloadImage.url &&
    payloadImage.url.trim() !== ""
  ) {
    return {
      filename:
        payloadImage.filename ||
        (existingImage && existingImage.filename) ||
        "listingimage",
      url: payloadImage.url.trim(),
    };
  }
  if (typeof payloadImage === "string" && payloadImage.trim() !== "") {
    const s = payloadImage.trim();
    if (/^https?:\/\//i.test(s)) {
      return {
        filename: (existingImage && existingImage.filename) || "listingimage",
        url: s,
      };
    }
    const urlMatch = s.match(/https?:\/\/[^\s'"]+/i);
    if (urlMatch) {
      return {
        filename: (existingImage && existingImage.filename) || "listingimage",
        url: urlMatch[0],
      };
    }
    return existingImage;
  }
  return existingImage;
}

// Helper: Safely parse number with default
function safeParseNumber(value, defaultValue, min = null, max = null) {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  
  let parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  
  if (isNaN(parsed)) {
    return defaultValue;
  }
  
  if (min !== null && parsed < min) parsed = min;
  if (max !== null && parsed > max) parsed = max;
  
  return parsed;
}

// Helper: Safely handle arrays
function safeParseArray(value, defaultValue = []) {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value.filter(item => item && typeof item === 'string');
  if (typeof value === 'string') return [value];
  return defaultValue;
}

// INDEX - Show all listings
module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({})
      .populate('owner', 'username fullName avatar verified superhost')
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
  if (!req.user) {
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
  }
  res.render("listings/new.ejs");
};

// CREATE - Create new listing
module.exports.createListing = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be logged in to create a listing");
      return res.redirect("/login");
    }

    const payload = req.body.listing || {};
    const hostPayload = req.body.host || {};

    // Validate required fields
    if (!payload.title || !payload.description || !payload.price || !payload.location || !payload.country) {
      req.flash("error", "Please fill in all required fields");
      return res.redirect("/listings/new");
    }

    const listingData = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: safeParseNumber(payload.price, 0, 1, 1000000),
      country: payload.country.trim(),
      location: payload.location.trim(),
      // NEW FIELDS WITH SAFE PARSING:
      maxGuests: safeParseNumber(payload.maxGuests, 2, 1, 20),
      bedrooms: safeParseNumber(payload.bedrooms, 1, 0, 10),
      bathrooms: safeParseNumber(payload.bathrooms, 1, 0, 10),
      category: payload.category && ['apartment', 'house', 'villa', 'cabin', 'hotel', 'resort', 'other'].includes(payload.category) 
                ? payload.category : 'apartment',
      amenities: safeParseArray(payload.amenities)
    };

    // Validate price
    if (listingData.price <= 0) {
      req.flash("error", "Price must be greater than 0");
      return res.redirect("/listings/new");
    }

    // Handle image upload
    if (req.file) {
      console.log("✅ File uploaded:", req.file);
      listingData.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else if (payload.image || payload.imageUrl) {
      listingData.image = normalizeImageInput(payload.image, payload.imageUrl, undefined);
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    // Update host profile if data provided
    if (hostPayload.firstName || hostPayload.lastName || hostPayload.bio || hostPayload.languages || hostPayload.responseTime) {
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          if (hostPayload.firstName && hostPayload.firstName.trim()) {
            user.firstName = hostPayload.firstName.trim();
          }
          if (hostPayload.lastName && hostPayload.lastName.trim()) {
            user.lastName = hostPayload.lastName.trim();
          }
          if (hostPayload.bio && hostPayload.bio.trim()) {
            user.bio = hostPayload.bio.trim();
          }
          if (hostPayload.languages) {
            user.languages = safeParseArray(hostPayload.languages);
          }
          if (hostPayload.responseTime && hostPayload.responseTime.trim()) {
            user.responseTime = hostPayload.responseTime.trim();
          }
          
          await user.save();
          console.log("✅ Host profile updated");
        }
      } catch (userError) {
        console.error("⚠️ Error updating host profile:", userError);
        // Don't fail the listing creation if profile update fails
      }
    }

    await newListing.save();

    console.log("✅ Saved listing with image:", newListing.image);
    req.flash("success", "New listing added successfully");
    console.log(`✅ New listing created: ${newListing.title}`);

    res.redirect(`/listings/${newListing._id}`);
  } catch (error) {
    console.error("❌ Error creating listing:", error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash("error", `Validation Error: ${errors.join(', ')}`);
    } else {
      req.flash("error", "Could not create listing. Please check your input and try again.");
    }
    
    res.redirect("/listings/new");
  }
};

// SHOW - Show individual listing with populated owner
module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid listing ID");
      return res.redirect("/listings");
    }
    
    let listing = await Listing.findById(id)
      .populate("reviews")
      .populate("owner");
      
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    // Ensure owner has default values if not set
    if (listing.owner) {
      if (!listing.owner.languages || listing.owner.languages.length === 0) {
        listing.owner.languages = ['English'];
      }
      if (!listing.owner.bio) {
        listing.owner.bio = 'Welcome! I love sharing amazing places with fellow travelers.';
      }
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
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid listing ID");
      return res.redirect("/listings");
    }
    
    const listing = await Listing.findById(id).populate('owner');
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    // Check if current user is owner or admin
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== 'admin')) {
      req.flash("error", "You don't have permission to edit this listing");
      return res.redirect(`/listings/${id}`);
    }
    
    res.render("listings/edit.ejs", { listing });
  } catch (error) {
    console.error("❌ Error loading edit form:", error);
    req.flash("error", "Could not load listing for editing");
    res.redirect("/listings");
  }
};

// UPDATE - Update existing listing
module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body.listing || {};

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid listing ID");
      return res.redirect("/listings");
    }

    const listing = await Listing.findById(id).populate('owner');
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    // Check if current user is owner or admin
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== 'admin')) {
      req.flash("error", "You don't have permission to edit this listing");
      return res.redirect(`/listings/${id}`);
    }

    // Validate required fields
    if (!payload.title || !payload.description || !payload.price || !payload.location || !payload.country) {
      req.flash("error", "Please fill in all required fields");
      return res.redirect(`/listings/${id}/edit`);
    }

    const updated = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: safeParseNumber(payload.price, listing.price || 0, 1, 1000000),
      country: payload.country.trim(),
      location: payload.location.trim(),
      // NEW FIELDS WITH SAFE PARSING AND FALLBACKS:
      maxGuests: safeParseNumber(payload.maxGuests, listing.maxGuests || 2, 1, 20),
      bedrooms: safeParseNumber(payload.bedrooms, listing.bedrooms || 1, 0, 10),
      bathrooms: safeParseNumber(payload.bathrooms, listing.bathrooms || 1, 0, 10),
      category: payload.category && ['apartment', 'house', 'villa', 'cabin', 'hotel', 'resort', 'other'].includes(payload.category) 
                ? payload.category : (listing.category || 'apartment'),
      amenities: safeParseArray(payload.amenities, listing.amenities || [])
    };

    // Validate price
    if (updated.price <= 0) {
      req.flash("error", "Price must be greater than 0");
      return res.redirect(`/listings/${id}/edit`);
    }

    // Handle image update
    if (req.file) {
      console.log("✅ File updated:", req.file);
      updated.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else {
      updated.image = normalizeImageInput(payload.image, payload.imageUrl, listing.image);
    }

    await Listing.findByIdAndUpdate(id, updated, {
      runValidators: true,
      new: true,
    });

    console.log("✅ Updated listing with image:", updated.image);
    req.flash("success", "Listing updated successfully");
    console.log(`✅ Listing updated: ${updated.title}`);
    res.redirect(`/listings/${id}`);
  } catch (error) {
    console.error("❌ Error updating listing:", error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      req.flash("error", `Validation Error: ${errors.join(', ')}`);
    } else {
      req.flash("error", "Could not update listing. Please check your input and try again.");
    }
    
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

// DELETE - Delete listing
module.exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid listing ID");
      return res.redirect("/listings");
    }
    
    const listing = await Listing.findById(id).populate('owner');
    
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    
    // Check if current user is owner or admin
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== 'admin')) {
      req.flash("error", "You don't have permission to delete this listing");
      return res.redirect(`/listings/${id}`);
    }
    
    const deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    console.log(`🗑️ Listing deleted: ${deletedListing.title}`);
    res.redirect("/listings");
  } catch (error) {
    console.error("❌ Error deleting listing:", error);
    req.flash("error", "Could not delete listing");
    res.redirect("/listings");
  }
};
