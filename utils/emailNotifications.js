const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendFormConfirmation = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'We received your message - TravelStay',
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>We have received your message and will get back to you soon.</p>
      <p>Best regards,<br>TravelStay Team</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

const sendFormNotification = async (form) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL,
    subject: `New Form Submission: ${form.subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${form.name}</p>
      <p><strong>Email:</strong> ${form.email}</p>
      <p><strong>Phone:</strong> ${form.phone || 'N/A'}</p>
      <p><strong>Subject:</strong> ${form.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${form.message}</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendFormConfirmation,
  sendFormNotification
};
