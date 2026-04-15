const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');
const authMiddleware = require('../middleware/authmiddleware');

let razorpay = null;

try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (error) {
  console.log("Razorpay initialization error:", error.message);
}

// POST /api/payment/create-order
router.post('/create-order', authMiddleware, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "CRITICAL ERROR: Razorpay backend keys missing! Please make sure you have added both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your server's .env file!" });
    }

    const options = {
      amount: 49900, // ₹499 in paise
      currency: "INR",
      receipt: `rcp_${Date.now()}_${req.userId.substring(18)}` // under 40 chars
    };
    
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ message: "Failed to create Razorypay order" });
    }
    
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /api/payment/verify
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful and verified
      await User.findByIdAndUpdate(req.userId, { isPremium: true });
      return res.status(200).json({ message: "Payment verified successfully. Welcome to Premium!", isPremium: true });
    } else {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
