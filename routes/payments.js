const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/payments");
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

// Process payment
router.post("/process", isLoggedIn, wrapAsync(paymentsController.processPayment));

// Get payment methods
router.get("/methods", isLoggedIn, wrapAsync(paymentsController.getPaymentMethods));

// Refund payment
router.post("/refund", isLoggedIn, wrapAsync(paymentsController.refundPayment));

module.exports = router;