require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
})

// ✅ OTP Email
const sendOtpEmail = async (toEmail, username, otp) => {
  const mailOptions = {
    from: `"CodeArena" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${otp} is your CodeArena verification code`,
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
                🔒 <strong style="color:#aaa;">Security tip:</strong> Never share this code with anyone. CodeArena will never ask for your OTP via chat or email.
              </p>
            </div>

            <p style="color:#555; font-size:12px; line-height:1.6; margin:0;">
              If you didn't create a CodeArena account, you can safely ignore this email.
            </p>
          </div>

          <!-- Footer -->
          <div style="padding:20px 40px; border-top:1px solid #1f1f1f; text-align:center;">
            <p style="color:#333; font-size:11px; margin:0;">© 2025 CodeArena. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent to ${toEmail}: ${info.messageId}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Email send failed:', error.message)
    throw new Error(`Email failed: ${error.message}`)
  }
}

// ✅ Welcome Email
const sendWelcomeEmail = async (toEmail, username) => {
  const mailOptions = {
    from: `"CodeArena" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Welcome to CodeArena, ${username}! ⚡`,
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
            <p style="color:#333; font-size:11px; margin:0;">© 2025 CodeArena. Code smarter. Battle harder.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`✅ Welcome email sent to ${toEmail}`)
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message)
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail }