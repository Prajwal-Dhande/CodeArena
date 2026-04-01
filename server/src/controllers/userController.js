const User = require('../models/User')

// ✅ Rank system — 500 ELO per rank
const RANKS = [
  { name: 'Bronze',       minElo: 0,    maxElo: 499,  icon: '🥉', color: '#cd7f32' },
  { name: 'Silver',       minElo: 500,  maxElo: 999,  icon: '🥈', color: '#94a3b8' },
  { name: 'Gold',         minElo: 1000, maxElo: 1499, icon: '🥇', color: '#fbbf24' },
  { name: 'Platinum',     minElo: 1500, maxElo: 1999, icon: '💠', color: '#67e8f9' },
  { name: 'Diamond',      minElo: 2000, maxElo: 2499, icon: '💎', color: '#60a5fa' },
  { name: 'Heroic',       minElo: 2500, maxElo: 2999, icon: '⚡', color: '#a855f7' },
  { name: 'Elite Heroic', minElo: 3000, maxElo: 3499, icon: '🔥', color: '#ef4444' },
  { name: 'Master',       minElo: 3500, maxElo: 3999, icon: '👑', color: '#ff6b35' },
  { name: 'Grandmaster',  minElo: 4000, maxElo: Infinity, icon: '🌟', color: '#fff' },
]

const getRankFromElo = (elo) => {
  return RANKS.find(r => elo >= r.minElo && elo <= r.maxElo) || RANKS[0]
}

// ✅ GET Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry')
    if (!user) return res.status(404).json({ message: 'User not found' })
    // Attach rank info
    const rank = getRankFromElo(user.elo)
    res.json({ user: { ...user.toObject(), rankInfo: rank } })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ GET Battle History
exports.getBattleHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('matchHistory')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ battles: [...(user.matchHistory || [])].reverse() })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ UPDATE Profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, github, linkedin, website, education, company, languages } = req.body
    if (username && username.length < 3)
      return res.status(400).json({ message: 'Username too short' })
    if (username) {
      const existing = await User.findOne({ username })
      if (existing && existing._id.toString() !== req.userId)
        return res.status(400).json({ message: 'Username already taken' })
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { username, bio, github, linkedin, website, education, company, languages },
      { new: true }
    ).select('-password -otp -otpExpiry')
    res.json({ message: 'Profile updated', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ UPDATE Match Result + ELO + RANK
exports.updateMatchResult = async (req, res) => {
  try {
    // ✅ Extract language from req.body
    const { opponentName, result, difficulty, timeTaken, problem, language } = req.body

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const difficultyEloMap = { 'Easy': 10, 'Medium': 20, 'Hard': 30 }
    const baseElo = difficultyEloMap[difficulty] || 10
    const eloChange = result === 'win' ? baseElo : result === 'loss' ? -Math.floor(baseElo / 2) : 0

    const oldElo = user.elo
    const oldRank = getRankFromElo(oldElo)
    const newElo = Math.max(0, oldElo + eloChange)
    const newRank = getRankFromElo(newElo)
    const newPeakElo = Math.max(user.peakElo || 0, newElo)

    // ✅ Stats calculate
    const newWins = result === 'win' ? (user.stats.wins || 0) + 1 : (user.stats.wins || 0)
    const newLosses = result === 'loss' ? (user.stats.losses || 0) + 1 : (user.stats.losses || 0)
    const newStreak = result === 'win' ? (user.stats.streak || 0) + 1 : result === 'loss' ? 0 : (user.stats.streak || 0)
    const newMaxStreak = Math.max(user.stats.maxStreak || 0, newStreak)
    const newTotalBattles = (user.stats.totalBattles || 0) + 1

    const newHistoryEntry = {
      opponent: opponentName || 'Unknown',
      problem: problem || 'Unknown',
      result,
      eloChange,
      eloAfter: newElo,
      rankAfter: newRank.name,
      difficulty: difficulty || 'Easy',
      language: language || 'javascript',  // ✅ yeh add kiya
      timeTaken: timeTaken || 0,
      date: new Date()
    }

    // ✅ findByIdAndUpdate — VersionError nahi aayega
    await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          elo: newElo,
          peakElo: newPeakElo,
          rank: newRank.name,
          'stats.wins': newWins,
          'stats.losses': newLosses,
          'stats.streak': newStreak,
          'stats.maxStreak': newMaxStreak,
          'stats.totalBattles': newTotalBattles,
        },
        $push: { matchHistory: newHistoryEntry }
      },
      { new: true }
    )

    const rankChanged = oldRank.name !== newRank.name

    res.json({
      success: true,
      newElo,
      oldElo,
      eloChange,
      newRank: newRank.name,
      oldRank: oldRank.name,
      rankChanged,
      rankInfo: newRank,
      streak: newStreak,
      wins: newWins,
      losses: newLosses,
    })

  } catch (err) {
    console.error('updateMatchResult error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ✅ LEADERBOARD with ranks
exports.getLeaderboard = async (req, res) => {
  try {
    const players = await User.find({ isVerified: true })
      .sort({ elo: -1 }).limit(100)
      .select('username elo rank stats country createdAt')

    const leaderboard = players.map((p, i) => {
      const rankInfo = getRankFromElo(p.elo)
      const wins = p.stats?.wins || 0
      const losses = p.stats?.losses || 0
      const total = wins + losses
      return {
        rank: i + 1,
        username: p.username,
        elo: p.elo,
        rankName: rankInfo.name,
        rankIcon: rankInfo.icon,
        rankColor: rankInfo.color,
        wins, losses,
        winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
        streak: p.stats?.streak || 0,
        country: p.country || 'IN',
        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : null,
      }
    })
    res.json({ success: true, leaderboard })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ✅ Export rank system for use in other files
exports.getRankFromElo = getRankFromElo
exports.RANKS = RANKS