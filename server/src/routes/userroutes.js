const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authmiddleware')

// ✅ GET Own Profile (Logged in user)
router.get('/profile', authMiddleware, userController.getProfile)

// ✅ GET Public Profile (For viewing other users - Must be BELOW /profile)
router.get('/profile/:username', userController.getPublicProfile)

// ✅ UPDATE Profile
router.put('/profile', authMiddleware, userController.updateProfile)

// ✅ BATTLES & LEADERBOARD
router.get('/battles', authMiddleware, userController.getBattleHistory)
router.get('/leaderboard', userController.getLeaderboard)
router.post('/match-result', authMiddleware, userController.updateMatchResult)

// 🔥 PROBLEM SOLVE ROUTE (NEW) 🔥
router.post('/solve', authMiddleware, userController.markAsSolved)

// 🔥 PUZZLE ROUTE 🔥
router.post('/puzzle-result', authMiddleware, userController.updatePuzzleResult)

// 🔥 SOCIAL ROUTES (FOLLOW / UNFOLLOW) 🔥
router.post('/follow/:id', authMiddleware, userController.followUser)
router.post('/unfollow/:id', authMiddleware, userController.unfollowUser)
router.get('/search', authMiddleware, userController.searchUsers);

module.exports = router