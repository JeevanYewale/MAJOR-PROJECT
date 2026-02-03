const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

// Mock payment processing (replace with Stripe/PayPal)
module.exports.processPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.body;
    
    const booking = await Booking.findById(bookingId)
      .populate('listing')
      .populate('guest');
    
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Mock payment processing
    const paymentResult = await mockPaymentProcess({
      amount: booking.pricing.total,
      currency: 'USD',
      paymentMethod,
      cardDetails
    });
    
    if (paymentResult.success) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      await booking.save();
      
      res.json({
        success: true,
        paymentId: paymentResult.paymentId,
        booking: booking
      });
    } else {
      res.status(400).json({
        error: "Payment failed",
        message: paymentResult.error
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
};

// Mock payment gateway
async function mockPaymentProcess(paymentData) {
  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock success/failure (90% success rate)
  const success = Math.random() > 0.1;
  
  if (success) {
    return {
      success: true,
      paymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
      transactionId: 'txn_' + Math.random().toString(36).substr(2, 9)
    };
  } else {
    return {
      success: false,
      error: "Payment declined by bank"
    };
  }
}

// Get payment methods
module.exports.getPaymentMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Mock saved payment methods
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025
      }
    ];
    
    res.json({ paymentMethods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: "Could not fetch payment methods" });
  }
};

// Refund payment
module.exports.refundPayment = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Calculate refund amount based on cancellation policy
    const refundAmount = calculateRefund(booking);
    
    // Mock refund processing
    const refundResult = await mockRefundProcess({
      bookingId,
      amount: refundAmount,
      reason
    });
    
    if (refundResult.success) {
      booking.paymentStatus = 'refunded';
      booking.cancellation = {
        cancelledBy: req.user._id,
        cancelledAt: new Date(),
        reason,
        refundAmount
      };
      await booking.save();
      
      res.json({
        success: true,
        refundAmount,
        refundId: refundResult.refundId
      });
    } else {
      res.status(400).json({
        error: "Refund failed",
        message: refundResult.error
      });
    }
  } catch (error) {
    console.error("Refund processing error:", error);
    res.status(500).json({ error: "Refund processing failed" });
  }
};

function calculateRefund(booking) {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilCheckIn > 7) {
    return booking.pricing.total; // Full refund
  } else if (daysUntilCheckIn > 1) {
    return booking.pricing.total * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
}

async function mockRefundProcess(refundData) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    success: true,
    refundId: 'ref_' + Math.random().toString(36).substr(2, 9)
  };
}