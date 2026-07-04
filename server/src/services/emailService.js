require('dotenv').config()
const nodemailer = require('nodemailer');

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('⚠️ BREVO_API_KEY not found in .env, email will not be sent')
    throw new Error('Missing BREVO_API_KEY')
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: process.env.EMAIL_USER, name: 'NodeClash' },
      to: [{ email: toEmail }],
      subject: subject,
      htmlContent: htmlContent
    })
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to send email via Brevo')
  }
  return response.json()
}

// ✅ OTP Email
const sendOtpEmail = async (toEmail, username, otp) => {
  const mailOptions = {
    from: `"NodeClash" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your NodeClash verification code`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background:#09090b; font-family: Inter, Arial, sans-serif;">
        <div style="max-width:520px; margin:40px auto; background:#111111; border:1px solid #1f1f1f; border-radius:16px; overflow:hidden;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg, rgba(255,107,53,0.15), rgba(15,15,20,1)); padding:40px 40px 32px; text-align:center; border-bottom:1px solid #1f1f1f;">
            <div style="font-weight:900; font-size:28px; letter-spacing:-0.5px; margin-bottom:8px;">
              <span style="color:#ff6b35;">Code</span><span style="color:#ffffff;">Arena</span>
            </div>
            <p style="color:#555; font-size:13px; margin:0;">Real-time 1v1 DSA Battles</p>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <h2 style="color:#ffffff; font-size:22px; font-weight:700; margin:0 0 8px 0;">
              Verify your email
            </h2>
            <p style="color:#888; font-size:14px; line-height:1.6; margin:0 0 32px 0;">
              Hey <strong style="color:#e5e5e5;">${username}</strong>! Enter this code to complete your signup and enter the arena.
            </p>

            <!-- OTP Box -->
            <div style="background:#0d0d0d; border:1px solid rgba(255,107,53,0.3); border-radius:12px; padding:28px; text-align:center; margin-bottom:32px;">
              <p style="color:#555; font-size:11px; font-weight:700; letter-spacing:2px; margin:0 0 12px 0;">YOUR VERIFICATION CODE</p>
              <div style="font-family:'Courier New', monospace; font-size:42px; font-weight:900; letter-spacing:12px; color:#ff6b35; text-shadow:0 0 30px rgba(255,107,53,0.4);">
                ${otp}
              </div>
              <p style="color:#444; font-size:12px; margin:16px 0 0 0;">Expires in <strong style="color:#fb923c;">10 minutes</strong></p>
            </div>

            <!-- Warning -->
            <div style="background:rgba(255,107,53,0.05); border:1px solid rgba(255,107,53,0.15); border-radius:8px; padding:14px 16px; margin-bottom:28px;">
              <p style="color:#888; font-size:12px; margin:0; line-height:1.6;">
                🔒 <strong style="color:#aaa;">Security tip:</strong> Never share this code with anyone. NodeClash will never ask for your OTP via chat or email.
              </p>
            </div>

            <p style="color:#555; font-size:12px; line-height:1.6; margin:0;">
              If you didn't create a NodeClash account, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px 40px; border-top:1px solid #1f1f1f; text-align:center;">
            <p style="color:#333; font-size:11px; margin:0;">© 2025 NodeClash. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await sendBrevoEmail(toEmail, mailOptions.subject, mailOptions.html)
    console.log(`✅ OTP email sent to ${toEmail}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Email send failed:', error.message)
    throw new Error(`Email failed: ${error.message}`)
  }
}

// ✅ Welcome Email
const sendWelcomeEmail = async (toEmail, username) => {
  const mailOptions = {
    from: `"NodeClash" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to NodeClash, ${username}! ⚡`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0; padding:0; background:#09090b; font-family: Inter, Arial, sans-serif;">
        <div style="max-width:520px; margin:40px auto; background:#111111; border:1px solid #1f1f1f; border-radius:16px; overflow:hidden;">

          <div style="background:linear-gradient(135deg, rgba(255,107,53,0.15), rgba(15,15,20,1)); padding:40px; text-align:center; border-bottom:1px solid #1f1f1f;">
            <div style="font-size:48px; margin-bottom:16px;">⚔️</div>
            <div style="font-weight:900; font-size:28px; letter-spacing:-0.5px; margin-bottom:8px;">
              <span style="color:#ff6b35;">Code</span><span style="color:#ffffff;">Arena</span>
            </div>
          </div>

          <div style="padding:40px;">
            <h2 style="color:#ffffff; font-size:24px; font-weight:700; margin:0 0 12px 0;">
              Welcome, ${username}! 🎉
            </h2>
            <p style="color:#888; font-size:14px; line-height:1.7; margin:0 0 28px 0;">
              Your account is verified and ready. You're now part of the most intense coding battle platform on the web.
            </p>

            <div style="margin-bottom:32px;">
              <div style="background:#0d0d0d; border:1px solid #1f1f1f; border-radius:10px; padding:16px; display:flex; gap:14px; align-items:center; margin-bottom:12px;">
                <div style="font-size:24px;">⚡</div>
                <div>
                  <div style="color:#e5e5e5; font-size:14px; font-weight:600; margin-bottom:2px;">Real-time 1v1 battles</div>
                  <div style="color:#555; font-size:12px;">Challenge coders at your ELO level</div>
                </div>
              </div>
              <div style="background:#0d0d0d; border:1px solid #1f1f1f; border-radius:10px; padding:16px; display:flex; gap:14px; align-items:center; margin-bottom:12px;">
                <div style="font-size:24px;">🤖</div>
                <div>
                  <div style="color:#e5e5e5; font-size:14px; font-weight:600; margin-bottom:2px;">AI Constraint System</div>
                  <div style="color:#555; font-size:12px;">Groq AI injects challenges mid-battle</div>
                </div>
              </div>
              <div style="background:#0d0d0d; border:1px solid #1f1f1f; border-radius:10px; padding:16px; display:flex; gap:14px; align-items:center;">
                <div style="font-size:24px;">🏆</div>
                <div>
                  <div style="color:#e5e5e5; font-size:14px; font-weight:600; margin-bottom:2px;">ELO Rankings</div>
                  <div style="color:#555; font-size:12px;">Climb the global leaderboard</div>
                </div>
              </div>
            </div>

            <a href="${process.env.CLIENT_URL}/lobby"
              style="display:block; background:linear-gradient(135deg, #ff6b35, #f7451d); color:#fff; text-align:center; padding:16px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; box-shadow:0 4px 20px rgba(255,107,53,0.3);">
              ⚡ Enter the Arena
            </a>
          </div>

          <div style="padding:20px 40px; border-top:1px solid #1f1f1f; text-align:center;">
            <p style="color:#333; font-size:11px; margin:0;">© 2025 NodeClash. Code smarter. Battle harder.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await sendBrevoEmail(toEmail, mailOptions.subject, mailOptions.html)
    console.log(`✅ Welcome email sent to ${toEmail}`)
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message)
  }
}

// 🔥 Premium Expiry Warning Email
const sendExpiryEmail = async (toEmail, username, daysLeft) => {
  const isUrgent = daysLeft <= 1
  const subject = isUrgent
    ? `⚠️ ${username}, your NodeClash PRO expires TODAY!`
    : `🔔 ${username}, your NodeClash PRO expires in ${daysLeft} days`

  const mailOptions = {
    from: `"NodeClash" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0; padding:0; background:#09090b; font-family: Inter, Arial, sans-serif;">
        <div style="max-width:520px; margin:40px auto; background:#111111; border:1px solid ${isUrgent ? 'rgba(239,68,68,0.4)' : '#1f1f1f'}; border-radius:16px; overflow:hidden;">

          <!-- Header -->
          <div style="background:linear-gradient(135deg, ${isUrgent ? 'rgba(239,68,68,0.15)' : 'rgba(255,107,53,0.15)'}, rgba(15,15,20,1)); padding:40px 40px 32px; text-align:center; border-bottom:1px solid #1f1f1f;">
            <div style="font-size:48px; margin-bottom:16px;">${isUrgent ? '⏰' : '🔔'}</div>
            <div style="font-weight:900; font-size:28px; letter-spacing:-0.5px; margin-bottom:8px;">
              <span style="color:#ff6b35;">Code</span><span style="color:#ffffff;">Arena</span>
            </div>
            <p style="color:#555; font-size:13px; margin:0;">Premium Membership Alert</p>
          </div>

          <!-- Body -->
          <div style="padding:40px;">
            <h2 style="color:#ffffff; font-size:22px; font-weight:700; margin:0 0 8px 0;">
              ${isUrgent ? 'Your PRO expires today!' : `Your PRO expires in ${daysLeft} days`}
            </h2>
            <p style="color:#888; font-size:14px; line-height:1.6; margin:0 0 32px 0;">
              Hey <strong style="color:#e5e5e5;">${username}</strong>! ${isUrgent
                ? 'This is your final reminder. After today, you will lose access to The Elite Archive, Clara AI interviews, and all premium features.'
                : `Your NodeClash PRO membership is expiring in <strong style="color:${isUrgent ? '#ef4444' : '#ff6b35'};">${daysLeft} days</strong>. Renew now to keep your competitive edge.`}
            </p>

            <!-- Features at risk -->
            <div style="background:#0d0d0d; border:1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : 'rgba(255,107,53,0.3)'}; border-radius:12px; padding:20px; margin-bottom:32px;">
              <p style="color:#555; font-size:11px; font-weight:700; letter-spacing:2px; margin:0 0 16px 0;">FEATURES YOU'LL LOSE</p>
              ${[
                '🤖 Clara AI Mock Interviews',
                '📊 Deep Code Analytics',
                '🔐 The Elite Archive (200+ Problems)',
                '⚡ Priority Matchmaking Servers',
                '🏆 Ranked Tournaments Access'
              ].map(f => `<div style="color:#aaa; font-size:13px; padding:6px 0; border-bottom:1px solid #1a1a1a;">${f}</div>`).join('')}
            </div>

            <!-- CTA Button -->
            <a href="${process.env.CLIENT_URL || 'https://code-arena-virid.vercel.app'}/premium"
              style="display:block; background:linear-gradient(135deg, #ff6b35, #f7451d); color:#fff; text-align:center; padding:16px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none; box-shadow:0 4px 20px rgba(255,107,53,0.3);">
              🔄 Renew PRO Now
            </a>

            <p style="color:#555; font-size:12px; line-height:1.6; margin:16px 0 0 0; text-align:center;">
              Don't lose your streak. Stay ahead of the competition.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px 40px; border-top:1px solid #1f1f1f; text-align:center;">
            <p style="color:#333; font-size:11px; margin:0;">© 2025 NodeClash. Code smarter. Battle harder.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await sendBrevoEmail(toEmail, mailOptions.subject, mailOptions.html)
    console.log(`✅ Expiry warning email sent to ${toEmail} (${daysLeft} days left)`)
  } catch (error) {
    console.error('❌ Expiry email failed:', error.message)
  }
}

// 🔥 Newsletter Notification Email (Sent to Admin)
const sendNewsletterNotificationEmail = async (subscriberEmail, preferences) => {
  const adminEmail = 'nodeclash.admin@gmail.com';
  if (!adminEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#09090b; padding:40px; color:#fff;">
      <div style="max-width:500px; margin:0 auto; background:#111; padding:30px; border-radius:12px; border:1px solid #27272a;">
        <h2 style="color:#ff6b35; margin-top:0;">New Newsletter Subscriber! 🎉</h2>
        <p style="color:#ccc;">A new user has just subscribed to the NodeClash newsletter.</p>
        <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:5px 0;"><strong>Email:</strong> <span style="color:#22c55e;">${subscriberEmail}</span></p>
          <p style="margin:5px 0;"><strong>General Newsletter:</strong> ${preferences.general ? '✅ Yes' : '❌ No'}</p>
          <p style="margin:5px 0;"><strong>Biweekly Digest:</strong> ${preferences.digest ? '✅ Yes' : '❌ No'}</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendBrevoEmail(adminEmail, `🚀 New Subscriber: ${subscriberEmail}`, html);
    console.log(`✅ Newsletter notification sent for ${subscriberEmail} via Brevo`);
  } catch (error) {
    console.error('❌ Newsletter notification failed:', error.message);
    // Don't throw — subscription should still succeed even if admin notification fails
  }
}

// 🔥 Contact Us Email (Sent to Admin)
const sendContactEmail = async (senderEmail, message) => {
  const adminEmail = 'nodeclash.admin@gmail.com'; 
  if (!adminEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; background:#09090b; padding:40px; color:#fff;">
      <div style="max-width:500px; margin:0 auto; background:#111; padding:30px; border-radius:12px; border:1px solid #27272a;">
        <h2 style="color:#ff6b35; margin-top:0;">New Contact Form Message! 📩</h2>
        <p style="color:#ccc;">Someone has reached out via the NodeClash contact form.</p>
        <div style="background:#1a1a1a; padding:15px; border-radius:8px; margin:20px 0;">
          <p style="margin:5px 0;"><strong>From:</strong> <span style="color:#22c55e;">${senderEmail}</span></p>
          <div style="margin-top:15px; padding-top:15px; border-top:1px solid #333;">
            <p style="margin:0 0 10px 0; color:#888;"><strong>Message:</strong></p>
            <p style="margin:0; white-space: pre-wrap; line-height:1.5;">${message}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  try {
    await sendBrevoEmail(adminEmail, `📩 New Message from ${senderEmail}`, html);
    console.log(`✅ Contact email sent from ${senderEmail} via Brevo`);
  } catch (error) {
    console.error('❌ Contact email failed:', error.message);
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail, sendExpiryEmail, sendNewsletterNotificationEmail, sendContactEmail }