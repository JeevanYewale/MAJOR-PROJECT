const Joi = require('joi');

const contactFormSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^[0-9\-\+\(\)\s]+$/).optional(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(5000).required()
});

const listingFormSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(5000).required(),
  location: Joi.string().required(),
  country: Joi.string().required(),
  price: Joi.number().positive().required(),
  maxGuests: Joi.number().positive().required(),
  amenities: Joi.array().items(Joi.string()).optional()
});

const reviewFormSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(10).max(1000).required()
});

module.exports = {
  contactFormSchema,
  listingFormSchema,
  reviewFormSchema
};
