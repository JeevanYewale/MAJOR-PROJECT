const assert = require('assert');
const ContactForm = require('../models/contactForm');

describe('ContactForm Model', () => {
  it('should create a new contact form', async () => {
    const form = new ContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message'
    });
    
    await form.save();
    assert.strictEqual(form.status, 'new');
    assert(form._id);
  });

  it('should validate required fields', async () => {
    const form = new ContactForm({
      name: 'John Doe'
    });
    
    try {
      await form.save();
      assert.fail('Should have thrown validation error');
    } catch (err) {
      assert(err.errors);
    }
  });

  it('should update form status', async () => {
    const form = new ContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Test message'
    });
    
    await form.save();
    form.status = 'replied';
    await form.save();
    
    const updated = await ContactForm.findById(form._id);
    assert.strictEqual(updated.status, 'replied');
  });

  it('should delete a form', async () => {
    const form = new ContactForm({
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Test message'
    });
    
    await form.save();
    await ContactForm.findByIdAndDelete(form._id);
    
    const deleted = await ContactForm.findById(form._id);
    assert.strictEqual(deleted, null);
  });
});
