const express = require('express');
const router = express.Router();
const ContactForm = require('../models/contactForm');
const { validateContactForm } = require('../middleware/formValidation');
const wrapAsync = require('../utils/wrapAsync');

// Submit contact form
router.post('/submit', validateContactForm, wrapAsync(async (req, res) => {
  const form = new ContactForm(req.validatedData);
  await form.save();
  res.status(201).json({ message: 'Form submitted successfully', formId: form._id });
}));

// Get all forms (admin)
router.get('/all', wrapAsync(async (req, res) => {
  const forms = await ContactForm.find().sort({ createdAt: -1 });
  res.json(forms);
}));

// Get form by ID
router.get('/:id', wrapAsync(async (req, res) => {
  const form = await ContactForm.findById(req.params.id);
  if (!form) return res.status(404).json({ error: 'Form not found' });
  
  // Mark as read
  if (form.status === 'new') {
    form.status = 'read';
    await form.save();
  }
  
  res.json(form);
}));

// Update form status
router.put('/:id/status', wrapAsync(async (req, res) => {
  const { status } = req.body;
  if (!['new', 'read', 'replied'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const form = await ContactForm.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  
  res.json(form);
}));

// Delete form
router.delete('/:id', wrapAsync(async (req, res) => {
  await ContactForm.findByIdAndDelete(req.params.id);
  res.json({ message: 'Form deleted' });
}));

module.exports = router;
