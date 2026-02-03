const assert = require('assert');
const { contactFormSchema } = require('../utils/formSchemas');

describe('Form Validation', () => {
  it('should validate correct contact form data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'This is a test message with enough content'
    };
    
    const { error, value } = contactFormSchema.validate(data);
    assert.strictEqual(error, undefined);
    assert.deepStrictEqual(value, data);
  });

  it('should reject invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      subject: 'Test',
      message: 'Test message content here'
    };
    
    const { error } = contactFormSchema.validate(data);
    assert(error);
  });

  it('should reject short message', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test',
      message: 'Short'
    };
    
    const { error } = contactFormSchema.validate(data);
    assert(error);
  });

  it('should reject missing required fields', () => {
    const data = {
      name: 'John Doe'
    };
    
    const { error } = contactFormSchema.validate(data);
    assert(error);
  });
});
