const ContactForm = require('../models/contactForm');
const { Parser } = require('json2csv');

class FormExportService {
  static async exportToCSV(filters = {}) {
    const forms = await ContactForm.find(filters).lean();
    
    const fields = ['name', 'email', 'phone', 'subject', 'message', 'status', 'createdAt'];
    const parser = new Parser({ fields });
    
    return parser.parse(forms);
  }

  static async exportToJSON(filters = {}) {
    const forms = await ContactForm.find(filters).lean();
    return JSON.stringify(forms, null, 2);
  }

  static async exportByDateRange(startDate, endDate) {
    return await ContactForm.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).lean();
  }
}

module.exports = FormExportService;
