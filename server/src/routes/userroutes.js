const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authmiddleware')

// ✅ GET Own Profile
router.get('/profile', authMiddleware, userController.getProfile)
router.get('/profile/:username', userController.getPublicProfile)
router.put('/profile', authMiddleware, userController.updateProfile)

// ✅ BATTLES & LEADERBOARD
router.get('/battles', authMiddleware, userController.getBattleHistory)
router.get('/leaderboard', userController.getLeaderboard)
router.post('/match-result', authMiddleware, userController.updateMatchResult)

// 🔥 SOLVE / PUZZLE / SOCIAL
router.post('/solve', authMiddleware, userController.markAsSolved)
router.post('/puzzle-result', authMiddleware, userController.updatePuzzleResult)
router.post('/follow/:id', authMiddleware, userController.followUser)
router.post('/unfollow/:id', authMiddleware, userController.unfollowUser)
router.get('/search', authMiddleware, userController.searchUsers)

// 📅 ACTIVITY CALENDAR (lightweight - returns dates with activity counts)
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.userId).select('matchHistory stats')
    if (!user) return res.status(404).json({ success: false })
    
    // Build a map of YYYY-MM-DD -> { battles, wins }
    const activityMap = {}
    ;(user.matchHistory || []).forEach(m => {
      const d = new Date(m.date)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      if (!activityMap[key]) activityMap[key] = { battles: 0, wins: 0 }
      activityMap[key].battles++
      if (m.result === 'win') activityMap[key].wins++
    })
    
    res.json({ success: true, activity: activityMap, streak: user.stats?.streak || 0, maxStreak: user.stats?.maxStreak || 0 })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// 📊 PREMIUM DASHBOARD STATS
router.get('/premium-stats', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User')
    // Auth middleware sets req.userId (not req.user.id)
    const userId = req.userId
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

    const user = await User.findById(userId).select(
      'stats matchHistory solvedProblems elo rank peakElo isPremium username'
    )
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const now = new Date()

    // Weekly performance (last 7 days)
    const weeklyData = []
    for (let d = 6; d >= 0; d--) {
      const dayStart = new Date(now)
      dayStart.setDate(now.getDate() - d)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      const dayMatches = user.matchHistory.filter(m => {
        const md = new Date(m.date)
        return md >= dayStart && md <= dayEnd
      })
      weeklyData.push({
        day: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        wins:      dayMatches.filter(m => m.result === 'win').length,
        losses:    dayMatches.filter(m => m.result === 'loss').length,
        eloChange: dayMatches.reduce((s, m) => s + (m.eloChange || 0), 0)
      })
    }

    // Difficulty breakdown
    const difficultyMap = { Easy: 0, Medium: 0, Hard: 0 }
    user.matchHistory.forEach(m => {
      if (m.difficulty && difficultyMap[m.difficulty] !== undefined) difficultyMap[m.difficulty]++
    })

    // ELO history (last 30 days)
    const eloHistory = user.matchHistory
      .filter(m => new Date(m.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(m => ({
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        elo: m.eloAfter || user.elo
      }))

    // Win rate
    const total   = Math.max(user.stats.totalBattles || 1, 1)
    const winRate = Math.round(((user.stats.wins || 0) / total) * 100)

    // Recent 5 matches
    const recentMatches = [...user.matchHistory]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(m => ({
        opponent:  m.opponent,  problem: m.problem,   result: m.result,
        eloChange: m.eloChange, difficulty: m.difficulty,
        date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }))

    res.json({
      success: true,
      stats: {
        elo: user.elo, peakElo: user.peakElo, rank: user.rank,
        wins: user.stats.wins || 0, losses: user.stats.losses || 0,
        totalBattles: user.stats.totalBattles || 0,
        streak: user.stats.streak || 0, maxStreak: user.stats.maxStreak || 0,
        winRate, solvedCount: user.solvedProblems?.length || 0,
        isPremium: user.isPremium, username: user.username
      },
      weeklyData, difficultyMap, eloHistory, recentMatches
    })
  } catch (err) {
    console.error('Premium stats error:', err)
    res.status(500).json({ success: false, message: 'Failed to load stats' })
  }
})

module.exports = router