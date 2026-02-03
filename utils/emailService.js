const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send booking confirmation email
const sendBookingConfirmation = async (booking, listing, user) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Booking Confirmed - ${listing.title}`,
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Dear ${user.firstName || user.username},</p>
      <p>Your booking has been confirmed for <strong>${listing.title}</strong></p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
        <li><strong>Guests:</strong> ${booking.guests}</li>
        <li><strong>Total Price:</strong> ₹${booking.totalPrice.toLocaleString('en-IN')}</li>
      </ul>
      
      <p>Thank you for choosing our platform!</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Send booking notification to host
const sendHostNotification = async (booking, listing, guest, host) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: host.email,
    subject: `New Booking - ${listing.title}`,
    html: `
      <h2>New Booking Received!</h2>
      <p>Dear ${host.firstName || host.username},</p>
      <p>You have received a new booking for <strong>${listing.title}</strong></p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Guest:</strong> ${guest.firstName || guest.username}</li>
        <li><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString()}</li>
        <li><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString()}</li>
        <li><strong>Guests:</strong> ${booking.guests}</li>
        <li><strong>Total Price:</strong> ₹${booking.totalPrice.toLocaleString('en-IN')}</li>
        ${booking.phone ? `<li><strong>Phone:</strong> ${booking.phone}</li>` : ''}
        ${booking.message ? `<li><strong>Message:</strong> ${booking.message}</li>` : ''}
      </ul>
      
      <p>Login to your dashboard to manage this booking.</p>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Host notification email sent');
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

module.exports = {
  sendBookingConfirmation,
  sendHostNotification
};