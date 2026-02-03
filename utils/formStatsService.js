const ContactForm = require('../models/contactForm');

class FormStatsService {
  static async getStats() {
    const [total, newForms, readForms, repliedForms] = await Promise.all([
      ContactForm.countDocuments(),
      ContactForm.countDocuments({ status: 'new' }),
      ContactForm.countDocuments({ status: 'read' }),
      ContactForm.countDocuments({ status: 'replied' })
    ]);

    return { total, newForms, readForms, repliedForms };
  }

  static async getSubmissionsByDay(days = 30) {
    return await ContactForm.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }

  static async getTopSubjects(limit = 5) {
    return await ContactForm.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);
  }

  static async getResponseTime() {
    return await ContactForm.aggregate([
      {
        $match: { status: 'replied' }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
        }
      }
    ]);
  }
}

module.exports = FormStatsService;
