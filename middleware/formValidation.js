const { contactFormSchema, listingFormSchema, reviewFormSchema } = require('../utils/formSchemas');

const validateForm = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return res.status(400).json({ errors });
    }
    
    req.validatedData = value;
    next();
  };
};

const validateContactForm = validateForm(contactFormSchema);
const validateListingForm = validateForm(listingFormSchema);
const validateReviewForm = validateForm(reviewFormSchema);

module.exports = {
  validateContactForm,
  validateListingForm,
  validateReviewForm
};
