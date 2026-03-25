const express = require('express')
const router = express.Router()
const { signup, login, verifyOtp, resendOtp, getMe } = require('../controllers/authController')
const authMiddleware = require('../middleware/authmiddleware')

router.post('/signup', signup)
router.post('/login', login)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.get('/me', authMiddleware, getMe)

module.exports = router