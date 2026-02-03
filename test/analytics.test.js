const assert = require('assert');
const ContactForm = require('../models/contactForm');
const FormStatsService = require('../utils/formStatsService');

describe('FormStatsService', () => {
  beforeEach(async () => {
    await ContactForm.create([
      {
        name: 'User 1',
        email: 'user1@example.com',
        subject: 'Issue 1',
        message: 'Message 1 content here',
        status: 'new'
      },
      {
        name: 'User 2',
        email: 'user2@example.com',
        subject: 'Issue 1',
        message: 'Message 2 content here',
        status: 'read'
      },
      {
        name: 'User 3',
        email: 'user3@example.com',
        subject: 'Issue 2',
        message: 'Message 3 content here',
        status: 'replied'
      }
    ]);
  });

  it('should get form statistics', async () => {
    const stats = await FormStatsService.getStats();
    assert.strictEqual(stats.total, 3);
    assert.strictEqual(stats.newForms, 1);
    assert.strictEqual(stats.readForms, 1);
    assert.strictEqual(stats.repliedForms, 1);
  });

  it('should get top subjects', async () => {
    const subjects = await FormStatsService.getTopSubjects(5);
    assert(subjects.length > 0);
    assert.strictEqual(subjects[0]._id, 'Issue 1');
    assert.strictEqual(subjects[0].count, 2);
  });

  it('should get submissions by day', async () => {
    const data = await FormStatsService.getSubmissionsByDay(30);
    assert(data.length > 0);
    assert(data[0].count > 0);
  });
});
