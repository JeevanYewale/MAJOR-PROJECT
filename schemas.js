const Joi = require("joi");

// Host validation schema (profile section)
const hostSchema = Joi.object({
  name: Joi.string().allow('', null).max(100).optional(),   // ✅ accept host[name]
  bio: Joi.string().allow('', null).max(500).optional(),
  languages: Joi.alternatives().try(
    Joi.array().items(Joi.string().max(50)),
    Joi.string().max(50)
  ).optional(),
  responseTime: Joi.string().valid(
    "within an hour",
    "within a few hours",
    "within a day",
    "a few days or more"
  ).allow('', null).optional()
}).unknown(true); // ✅ allow extra fields inside host if needed

// Listing validation schema (main property info)
const listingFields = {
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
      "string.empty": "Title is required",
      "string.min": "Title must be at least 3 characters long",
      "string.max": "Title cannot exceed 100 characters",
      "any.required": "Title is required",
    }),
  description: Joi.string()
    .required()
    .min(10)
    .max(2000)
    .trim()
    .messages({
      "string.empty": "Description is required",
      "string.min": "Description must be at least 10 characters long",
      "string.max": "Description cannot exceed 2000 characters",
      "any.required": "Description is required",
    }),
  location: Joi.string()
    .required()
    .min(2)
    .max(100)
    .trim()
    .messages({
      "string.empty": "Location is required",
      "string.min": "Location must be at least 2 characters long",
      "string.max": "Location cannot exceed 100 characters",
      "any.required": "Location is required",
    }),
  country: Joi.string()
    .required()
    .min(2)
    .max(60)
    .trim()
    .messages({
      "string.empty": "Country is required",
      "string.min": "Country must be at least 2 characters long",
      "string.max": "Country cannot exceed 60 characters",
      "any.required": "Country is required",
    }),
  price: Joi.number()
    .required()
    .min(0.01)
    .max(1000000)
    .messages({
      "number.base": "Price must be a valid number",
      "number.min": "Price must be greater than 0",
      "number.max": "Price cannot exceed 1,000,000",
      "any.required": "Price is required",
    }),
  image: Joi.alternatives().try(
    Joi.string().uri().allow(""),
    Joi.object({
      filename: Joi.string().optional(),
      url: Joi.string().uri().allow("").optional()
    }).optional()
  ).optional(),
  imageUrl: Joi.string().uri().optional().allow(""),
  maxGuests: Joi.number().integer().min(1).max(20).optional(),
  bedrooms: Joi.number().integer().min(0).max(10).optional(),
  bathrooms: Joi.number().min(0).max(10).optional(),
  category: Joi.string().valid(
    'apartment', 'house', 'villa', 'cabin', 'hotel', 'resort', 'other'
  ).optional(),
  amenities: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()      // Handles case when only one is sent
  ).optional()
};

// Full validation schema including host profile
module.exports.listingSchema = Joi.object({
  listing: Joi.object(listingFields).required(),
  host: hostSchema.optional()
}).unknown(true); // ✅ allow `listing` + `host`

// Review validation schema with added 'name' field
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(100)
      .trim()
      .messages({
        "string.empty": "Reviewer name is required",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot exceed 100 characters",
        "any.required": "Reviewer name is required",
      }),
    comment: Joi.string()
      .required()
      .min(5)
      .max(500)
      .trim()
      .messages({
        "string.empty": "Review comment is required",
        "string.min": "Comment must be at least 5 characters long",
        "string.max": "Comment cannot exceed 500 characters",
        "any.required": "Review comment is required",
      }),
    rating: Joi.number()
      .required()
      .integer()
      .min(1)
      .max(5)
      .messages({
        "number.base": "Rating must be a number",
        "number.integer": "Rating must be a whole number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required",
      })
  }).required()
});
