const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { sendOtpEmail, sendWelcomeEmail } = require('../services/emailService')
const crypto = require('crypto')

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString()

// Helper: build safe user object for frontend
const buildUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  username: user.username,
  email: user.email,
  elo: user.elo ?? 0,
  isVerified: user.isVerified,
  stats: user.stats,
  puzzleXp: user.puzzleXp ?? 0,
  solvedPuzzles: user.solvedPuzzles || [],
})

// ✅ SIGNUP
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' })

    const existingUser = await User.findOne({ $or: [{ email }, { username }] })

    if (existingUser) {
      if (existingUser.email === email && !existingUser.isVerified) {
        await User.deleteOne({ _id: existingUser._id })
      } else if (existingUser.email === email && existingUser.isVerified) {
        return res.status(400).json({ message: 'Email already registered. Please login.' })
      } else if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken. Try another.' })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp = generateOtp()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    await User.create({
      username, email,
      password: hashedPassword,
      otp, otpExpiry,
      isVerified: false
    })

    console.log(`🔑 OTP for ${email}: ${otp}`)

    let emailSent = false
    try {
      await sendOtpEmail(email, username, otp)
      emailSent = true
      console.log(`📧 OTP email sent to ${email}`)
    } catch (emailErr) {
      console.error('Email failed:', emailErr.message)
    }

    res.status(201).json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated — check server terminal',
      email,
      emailSent,
    })

  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ VERIFY OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    console.log(`🔍 Verify - Email: ${email}, OTP entered: ${otp}`)

    const user = await User.findOne({ email }).select('+otp +otpExpiry +isVerified')

    if (!user) return res.status(404).json({ message: 'User not found. Please signup again.' })

    console.log(`🔍 DB OTP: ${user.otp}, Match: ${String(user.otp).trim() === String(otp).trim()}`)

    if (user.isVerified)
      return res.status(400).json({ message: 'Email already verified. Please login.' })

    if (String(user.otp).trim() !== String(otp).trim())
      return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' })

    if (new Date() > user.otpExpiry)
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })

    user.isVerified = true
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    sendWelcomeEmail(email, user.username).catch(err =>
      console.error('Welcome email failed:', err.message)
    )

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Email verified successfully!',
      token,
      user: buildUserResponse(user)
    })

  } catch (err) {
    console.error('Verify OTP error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    if (!user.isVerified)
      return res.status(400).json({
        message: 'Email not verified. Please signup again to get a new OTP.',
        notVerified: true
      })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: buildUserResponse(user)
    })

  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ RESEND OTP
const resendOtp = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ message: 'Already verified. Please login.' })

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    console.log(`🔑 Resend OTP for ${email}: ${otp}`)

    let emailSent = false
    try {
      await sendOtpEmail(email, user.username, otp)
      emailSent = true
    } catch (emailErr) {
      console.error('Resend email failed:', emailErr.message)
    }

    res.json({
      message: emailSent ? 'New OTP sent to your email' : 'New OTP — check server terminal',
      emailSent,
    })

  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ GET ME
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 GOOGLE OAUTH
const googleAuth = async (req, res) => {
  try {
    const { credential, access_token } = req.body
    if (!credential && !access_token) return res.status(400).json({ message: 'Google credential or access_token required' })

    let email, name, googleId;

    if (credential) {
      const clientId = process.env.GOOGLE_CLIENT_ID
      if (!clientId) return res.status(500).json({ message: 'Google OAuth not configured on server' })

      const { OAuth2Client } = require('google-auth-library')
      const client = new OAuth2Client(clientId)
      
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      })
      const payload = ticket.getPayload()
      email = payload.email
      name = payload.name
      googleId = payload.sub
    } else if (access_token) {
      const axios = require('axios');
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      email = response.data.email
      name = response.data.name
      googleId = response.data.sub
    }

    if (!email) return res.status(400).json({ message: 'Could not get email from Google' })

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      // Generate a unique username from Google name
      let baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').slice(0, 15)
      let username = baseUsername
      let counter = 1
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      // Create user with random password (they'll use Google to login)
      const randomPass = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(randomPass, 12)

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        isVerified: true, // Google-verified emails are trusted
        googleId,
      })

      console.log(`🌐 New Google user: ${username} (${email})`)

      sendWelcomeEmail(email, username).catch(err =>
        console.error('Welcome email failed:', err.message)
      )
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Google login successful',
      token,
      user: buildUserResponse(user)
    })

  } catch (err) {
    console.error('Google auth error:', err)
    res.status(500).json({ message: 'Google authentication failed' })
  }
}

// 🔥 GITHUB OAUTH
const githubAuth = async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'GitHub code required' })

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) return res.status(500).json({ message: 'GitHub OAuth not configured on server' })

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      })
    })
    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData)
      return res.status(400).json({ message: 'GitHub authentication failed' })
    }

    // Get user info from GitHub
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const githubUser = await userRes.json()

    // Get email (may need separate call if email is private)
    let email = githubUser.email
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
      })
      const emails = await emailRes.json()
      const primary = emails.find(e => e.primary && e.verified)
      email = primary?.email || emails[0]?.email
    }

    if (!email) return res.status(400).json({ message: 'Could not get email from GitHub' })

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      let baseUsername = (githubUser.login || email.split('@')[0]).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 15)
      let username = baseUsername
      let counter = 1
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      const randomPass = crypto.randomBytes(32).toString('hex')
      const hashedPassword = await bcrypt.hash(randomPass, 12)

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        isVerified: true,
        github: githubUser.login || '',
      })

      console.log(`🐙 New GitHub user: ${username} (${email})`)

      sendWelcomeEmail(email, username).catch(err =>
        console.error('Welcome email failed:', err.message)
      )
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'GitHub login successful',
      token,
      user: buildUserResponse(user)
    })

  } catch (err) {
    console.error('GitHub auth error:', err)
    res.status(500).json({ message: 'GitHub authentication failed' })
  }
}
// 🔥 CHANGE PASSWORD (OTP FLOW)
const requestPasswordChange = async (req, res) => {
  try {
    const { oldPassword } = req.body
    if (!oldPassword) return res.status(400).json({ message: 'Current password is required' })

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' })

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    let emailSent = false
    try {
      await sendOtpEmail(user.email, user.username, otp)
      emailSent = true
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message)
    }

    res.json({ message: emailSent ? 'OTP sent to your email' : 'OTP generated (check server logs)', emailSent })
  } catch (err) {
    console.error('requestPasswordChange error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

const verifyPasswordChange = async (req, res) => {
  try {
    const { oldPassword, newPassword, otp } = req.body
    if (!oldPassword || !newPassword || !otp) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const user = await User.findById(req.userId).select('+otp +otpExpiry')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' })

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please try again.' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('verifyPasswordChange error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 FORGOT PASSWORD (send OTP to email)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: 'No account found with this email' })
    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified. Please signup again.' })

    const otp = generateOtp()
    user.otp = otp
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    console.log(`🔑 Password Reset OTP for ${email}: ${otp}`)

    let emailSent = false
    try {
      await sendOtpEmail(email, user.username, otp)
      emailSent = true
      console.log(`📧 Password reset OTP sent to ${email}`)
    } catch (emailErr) {
      console.error('Password reset email failed:', emailErr.message)
    }

    res.json({
      message: emailSent ? 'OTP sent to your email' : 'OTP generated — check server terminal',
      emailSent,
    })
  } catch (err) {
    console.error('forgotPassword error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// 🔥 RESET PASSWORD (verify OTP + set new password)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' })
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }
    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hashedPassword
    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ success: true, message: 'Password reset successfully! You can now login.' })
  } catch (err) {
    console.error('resetPassword error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { signup, login, verifyOtp, resendOtp, getMe, googleAuth, githubAuth, requestPasswordChange, verifyPasswordChange, forgotPassword, resetPassword }