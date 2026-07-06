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
    const { amount, planId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, message: "Amount is required" });
    }

    const options = {
      amount: amount, // Dynamic amount passed from frontend
      currency: "INR",
      receipt: `rcp_${Date.now()}_${req.userId.substring(18)}`, // under 40 chars
      notes: {
        userId: req.userId,
        plan: planId || 'pro_1m' // Storing plan info for verification
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
      
      // Fetch order to read plan metadata
      const orderDetails = await razorpay.orders.fetch(razorpay_order_id);
      const notes = orderDetails.notes || {};
      const planId = notes.plan || 'pro_1m';

      const userBeforeUpdate = await User.findById(req.userId);

      // Calculate expiry from plan (accumulate if already premium)
      let expiry = new Date();
      if (userBeforeUpdate && userBeforeUpdate.isPremium && userBeforeUpdate.premiumExpiry) {
        const currentExpiry = new Date(userBeforeUpdate.premiumExpiry);
        if (currentExpiry > new Date()) {
          expiry = currentExpiry; // Start adding from current expiry
        }
      }

      if (planId.includes('6m') || planId === 'six_months' || planId === 'yearly') {
        expiry.setMonth(expiry.getMonth() + 6);
        expiry.setDate(expiry.getDate() + 7); // 7-day trial for 6-month plan
      } else {
        expiry.setMonth(expiry.getMonth() + 1);
      }

      // Save the specific plan ID so we know if it's 1-month or 6-months
      await User.findByIdAndUpdate(req.userId, { 
        isPremium: true,
        premiumPlan: planId,
        premiumExpiry: expiry,
        premiumOrderId: razorpay_order_id
      });

      const user = await User.findById(req.userId).select('-password -otp -otpExpiry');

      // ── Send Welcome Email (via Brevo) ──
      try {
        if (user.email && process.env.BREVO_API_KEY) {
          const planLabel = planId.includes('6m') ? 'Pro — 6 Months' : 'Pro — 1 Month';
          const amountPaid = orderDetails.amount ? `₹${(orderDetails.amount / 100).toLocaleString('en-IN')}` : 'N/A';
          const expiryStr = expiry.toLocaleDateString('en-IN', { dateStyle: 'long' });

          const htmlContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f0f14; border-radius: 16px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #ff6b35, #f7451d); padding: 28px 32px;">
                <h1 style="color: #fff; margin: 0; font-size: 24px;">{C} NodeClash Pro</h1>
                <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Thank you for subscribing!</p>
              </div>
              <div style="padding: 32px;">
                <p style="color: #d1d5db; font-size: 15px; line-height: 1.7;">
                  Hey <strong style="color: #fff;">${user.username || 'Champion'}</strong>,
                </p>
                <p style="color: #d1d5db; font-size: 14px; line-height: 1.7;">
                  You now have full access to the <strong style="color: #ff6b35;">The Elite Archive</strong>, 
                  <strong style="color: #60a5fa;">Clara AI Interviews</strong>, ranked tournaments, and all Pro features.
                </p>
                <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0;">
                  <table style="width: 100%; color: #d1d5db; font-size: 13px; border-collapse: collapse;">
                    <tr><td style="padding: 8px 0; color: #888;">Plan</td><td style="text-align: right; font-weight: 700; color: #fff;">${planLabel}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Amount Paid</td><td style="text-align: right; font-weight: 700; color: #ff6b35;">${amountPaid}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Valid Until</td><td style="text-align: right; font-weight: 700; color: #22c55e;">${expiryStr}</td></tr>
                    <tr><td style="padding: 8px 0; color: #888;">Order ID</td><td style="text-align: right; font-size: 11px; color: #888;">${razorpay_order_id}</td></tr>
                  </table>
                </div>
                <a href="https://nodeclash.in/interview-dsa" style="display: inline-block; background: linear-gradient(135deg, #ff6b35, #f7451d); color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; margin-top: 8px;">
                  🚀 Start Practicing Now
                </a>
              </div>
            </div>
          `;

          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': process.env.BREVO_API_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              sender: { email: process.env.EMAIL_USER, name: 'NodeClash' },
              to: [{ email: user.email }],
              subject: '🎉 Welcome to NodeClash Pro!',
              htmlContent: htmlContent
            })
          });

          console.log(`Welcome email sent to ${user.email}`);
        }
      } catch (emailErr) {
        console.error('Email send failed (non-blocking):', emailErr.message);
      }

      return res.status(200).json({ 
        success: true, 
        message: "Payment verified successfully. Welcome to Pro!", 
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
    const user = await User.findById(req.userId).select('isPremium premiumPlan premiumExpiry');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Auto-fix for legacy/test premium users missing expiry
    if (user.isPremium && !user.premiumExpiry) {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1); // Give them 30 days default
      user.premiumExpiry = expiry;
      user.premiumPlan = (!user.premiumPlan || user.premiumPlan === 'free') ? 'pro_1m' : user.premiumPlan;
      await User.findByIdAndUpdate(req.userId, {
        premiumExpiry: user.premiumExpiry,
        premiumPlan: user.premiumPlan
      });
    }

    // Expiry check karo
    if (user.isPremium && user.premiumExpiry && new Date() > user.premiumExpiry) {
      await User.findByIdAndUpdate(req.userId, { isPremium: false });
      return res.json({ isPremium: false, expired: true });
    }

    res.json({
      isPremium: user.isPremium,
      premiumPlan: user.premiumPlan || 'free',
      premiumExpiry: user.premiumExpiry,
      daysLeft: user.premiumExpiry
        ? Math.ceil((new Date(user.premiumExpiry) - new Date()) / (1000 * 60 * 60 * 24))
        : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/payment/webhook (Background Server-to-Server Payment Verification)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  if (!secret) {
    console.error("Razorpay Webhook Secret not configured!");
    return res.status(200).send("Webhook secret missing"); // Returning 200 so Razorpay stops retrying
  }

  try {
    const signature = req.headers['x-razorpay-signature'];
    
    // Validate signature using raw body
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error("Invalid Webhook Signature!");
      return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;
    
    // Handle specific payment events (either payment.captured or order.paid)
    if (event === 'order.paid' || event === 'payment.captured') {
      const entity = req.body.payload.payment ? req.body.payload.payment.entity : req.body.payload.order.entity;
      const orderId = entity.order_id || entity.id; // order.paid has id as order_id
      const notes = entity.notes || {};
      const userId = notes.userId;
      const planId = notes.plan || 'pro_1m';

      if (userId) {
        const userBeforeUpdate = await User.findById(userId);
        
        // Skip if already upgraded via frontend verify
        if (userBeforeUpdate && (!userBeforeUpdate.isPremium || userBeforeUpdate.premiumOrderId !== orderId)) {
          let expiry = new Date();
          if (userBeforeUpdate.isPremium && userBeforeUpdate.premiumExpiry && new Date(userBeforeUpdate.premiumExpiry) > new Date()) {
            expiry = new Date(userBeforeUpdate.premiumExpiry);
          }

          if (planId.includes('6m') || planId === 'six_months' || planId === 'yearly') {
            expiry.setMonth(expiry.getMonth() + 6);
            expiry.setDate(expiry.getDate() + 7);
          } else {
            expiry.setMonth(expiry.getMonth() + 1);
          }

          await User.findByIdAndUpdate(userId, { 
            isPremium: true,
            premiumPlan: planId,
            premiumExpiry: expiry,
            premiumOrderId: orderId
          });
          
          console.log(`Webhook successfully upgraded User ${userId} to Pro!`);
        } else {
          console.log(`User ${userId} already upgraded by frontend verify route. Webhook skipped.`);
        }
      }
    }

    // Acknowledge receipt of the webhook to Razorpay
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Send 200 so Razorpay doesn't keep retrying continuously for non-critical errors
    res.status(200).send("Processed with error");
  }
});

module.exports = router;