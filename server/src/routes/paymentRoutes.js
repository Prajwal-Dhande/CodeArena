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
      return res.status(500).json({ success: false, message: "CRITICAL ERROR: Razorpay backend keys missing! Please make sure you have added both RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your server's .env file!" });
    }

    // Amount aur plan frontend se aayega
    const { amount, plan } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: amount, // Dynamic amount passed from frontend
      currency: "INR",
      receipt: `rcp_${Date.now()}_${req.userId.substring(18)}`, // under 40 chars
      notes: {
        userId: req.userId,
        plan: plan || 'monthly' // Storing plan info for verification
      }
    };
    
    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
    }
    
    // Frontend expects success, order, and key
    res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
      
      // Order fetch karke pata lagayenge konsa plan tha
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      const plan = orderDetails.notes ? orderDetails.notes.plan : 'monthly';

      // Plan ke hisaab se expiry calculate karo
      const expiry = new Date();
      if (plan === 'yearly') {
        expiry.setFullYear(expiry.getFullYear() + 1);
      } else if (plan === 'six_months') {
        expiry.setMonth(expiry.getMonth() + 6);
      } else {
        expiry.setMonth(expiry.getMonth() + 1); // default 1 month
      }

      // Update user status
      await User.findByIdAndUpdate(req.userId, { 
        isPremium: true,
        premiumExpiry: expiry,
        premiumOrderId: razorpay_order_id
      });

      // Updated user ko frontend bhejo taaki localStorage update ho jaye
      const user = await User.findById(req.userId).select('-password -otp -otpExpiry');

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully. Welcome to Premium!", 
        user 
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid payment signature!" });
    }
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// GET /api/payment/status (Required by frontend on load)
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('isPremium premiumExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Expiry check karo
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      await User.findByIdAndUpdate(req.userId, { isPremium: false });
      return res.json({ isPremium: false, expired: true });
    }

    res.json({
      isPremium: user.isPremium,
      premiumExpiry: user.premiumExpiry,
      daysLeft: user.premiumExpiry
        ? Math.ceil((new Date(user.premiumExpiry) - new Date()) / (1000 * 60 * 60 * 24))
        : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;