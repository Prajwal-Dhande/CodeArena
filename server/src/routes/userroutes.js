const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authmiddleware')

router.get('/profile', authMiddleware, userController.getProfile)
router.get('/battles', authMiddleware, userController.getBattleHistory)
router.put('/profile', authMiddleware, userController.updateProfile)
router.post('/match-result', authMiddleware, userController.updateMatchResult)
router.get('/leaderboard', userController.getLeaderboard)

module.exports = router