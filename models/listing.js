const Listing = require("../models/listing.js");
const User = require("../models/user.js");

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

function safeParseNumber(value, defaultValue, min = null, max = null) {
  if (value === undefined || value === null || value === "") return defaultValue;
  let parsed = typeof value === "string" ? parseFloat(value) : Number(value);
  if (isNaN(parsed)) return defaultValue;
  if (min !== null && parsed < min) parsed = min;
  if (max !== null && parsed > max) parsed = max;
  return parsed;
}

function safeParseArray(value, defaultValue = []) {
  if (!value) return defaultValue;
  if (Array.isArray(value)) return value.filter(i => i && typeof i === "string");
  if (typeof value === "string") return [value];
  return defaultValue;
}

module.exports.index = async (req, res) => {
  try {
    const allListings = await Listing.find({})
      .populate("owner", "username firstName lastName avatar verified superhost")
      .sort({ createdAt: -1 });
    res.render("listings/index.ejs", { allListings });
  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to fetch listings");
    res.render("listings/index.ejs", { allListings: [] });
  }
};

module.exports.renderNewForm = (req, res) => {
  if (!req.user) {
    req.flash("error", "You must be signed in to create a listing");
    return res.redirect("/login");
  }
  res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res) => {
  try {
    if (!req.user) {
      req.flash("error", "You must be signed in to create a listing");
      return res.redirect("/login");
    }
    const payload = req.body.listing || {};
    const hostPayload = req.body.host || {};

    const listingData = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: safeParseNumber(payload.price, 0, 1, 1000000),
      country: payload.country.trim(),
      location: payload.location.trim(),
      maxGuests: safeParseNumber(payload.maxGuests, 2, 1, 20),
      bedrooms: safeParseNumber(payload.bedrooms, 1, 0, 10),
      bathrooms: safeParseNumber(payload.bathrooms, 1, 0, 10),
      category: ['apartment','house','villa','cabin','hotel','resort','other'].includes(payload.category) ? payload.category : 'apartment',
      amenities: safeParseArray(payload.amenities, []),
    };

    if (req.file) {
      listingData.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    } else if (payload.image || payload.imageUrl) {
      listingData.image = normalizeImageInput(payload.image, payload.imageUrl, undefined);
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    if (hostPayload) {
      const user = await User.findById(req.user._id);
      if (hostPayload.firstName) user.firstName = hostPayload.firstName.trim();
      if (hostPayload.lastName) user.lastName = hostPayload.lastName.trim();
      if (hostPayload.bio) user.bio = hostPayload.bio.trim();
      if (hostPayload.languages) user.languages = safeParseArray(hostPayload.languages);
      if (hostPayload.responseTime) user.responseTime = hostPayload.responseTime.trim();
      await user.save();
    }

    await newListing.save();
    req.flash("success", "New listing added successfully");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Error creating listing");
    res.redirect("/listings/new");
  }
};

module.exports.showListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "owner",
        select: "username firstName lastName avatar bio languages responseTime verified superhost"
      })
      .populate({
        path: "reviews",
        populate: {
          path: "author",
          select: "username"
        }
      });

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // Defaults for owner if missing
    if (!listing.owner.languages || listing.owner.languages.length === 0) {
      listing.owner.languages = ["English"];
    }
    if (!listing.owner.bio) {
      listing.owner.bio = "Welcome! I love sharing amazing places with fellow travelers.";
    }

    res.render("listings/show.ejs", { listing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading listing");
    res.redirect("/listings");
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== "admin")) {
      req.flash("error", "You don't have permission to edit this listing");
      return res.redirect(`/listings/${id}`);
    }

    res.render("listings/edit.ejs", { listing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error loading edit form");
    res.redirect("/listings");
  }
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body.listing || {};

    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== "admin")) {
      req.flash("error", "You don't have permission to edit this listing");
      return res.redirect(`/listings/${id}`);
    }

    const updated = {
      title: payload.title.trim(),
      description: payload.description.trim(),
      price: safeParseNumber(payload.price, listing.price, 1, 1000000),
      country: payload.country.trim(),
      location: payload.location.trim(),
      maxGuests: safeParseNumber(payload.maxGuests, listing.maxGuests, 1, 20),
      bedrooms: safeParseNumber(payload.bedrooms, listing.bedrooms, 0, 10),
      bathrooms: safeParseNumber(payload.bathrooms, listing.bathrooms, 0, 10),
      category: ['apartment','house','villa','cabin','hotel','resort','other'].includes(payload.category) ? payload.category : listing.category,
      amenities: safeParseArray(payload.amenities, listing.amenities)
    };

    if (req.file) {
      updated.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    } else {
      updated.image = normalizeImageInput(payload.image, payload.imageUrl, listing.image);
    }

    await Listing.findByIdAndUpdate(id, updated, { runValidators: true, new: true });
    req.flash("success", "Listing updated successfully");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Error updating listing");
    res.redirect(`/listings/${req.params.id}/edit`);
  }
};

module.exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("owner");
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }
    if (!req.user || (!listing.owner._id.equals(req.user._id) && req.user.role !== "admin")) {
      req.flash("error", "You don't have permission to delete this listing");
      return res.redirect(`/listings/${id}`);
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted successfully");
    res.redirect("/listings");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error deleting listing");
    res.redirect("/listings");
  }
};
