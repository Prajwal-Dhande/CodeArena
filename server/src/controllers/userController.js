const User = require('../models/User')

// ✅ GET Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpiry')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    console.error('getProfile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ GET Battle History
exports.getBattleHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('matchHistory')
    if (!user) return res.status(404).json({ message: 'User not found' })
    // Latest battles pehle
    const battles = [...(user.matchHistory || [])].reverse()
    res.json({ battles })
  } catch (err) {
    console.error('getBattleHistory error:', err)
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
    console.error('updateProfile error:', err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ✅ UPDATE Match Result + ELO
exports.updateMatchResult = async (req, res) => {
  try {
    const { opponentName, result, difficulty, timeTaken, problem } = req.body

    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    // Opponent ELO find karo
    let opponentElo = 1200
    let oppUser = null
    const isBot = !opponentName || opponentName.startsWith('Bot_')

    if (!isBot) {
      oppUser = await User.findOne({ username: opponentName })
      if (oppUser) opponentElo = oppUser.elo
    }

    // ELO calculation
    const K = 32
    const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - user.elo) / 400))
    const actualScore = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0
    const eloChange = Math.round(K * (actualScore - expectedScore))

    const oldElo = user.elo
    user.elo = Math.max(100, user.elo + eloChange) // minimum 100 ELO

    // Stats update
    if (result === 'win') {
      user.stats.wins += 1
      user.stats.streak += 1
    } else if (result === 'loss') {
      user.stats.losses += 1
      user.stats.streak = 0
    } else {
      user.stats.draws += 1
    }
    user.stats.totalBattles += 1

    // Match history add karo
    user.matchHistory.push({
      opponent: opponentName || 'Unknown',
      problem: problem || 'Unknown',
      result,
      eloChange,
      eloAfter: user.elo,
      difficulty: difficulty || 'Medium',
      timeTaken: timeTaken || 0,
      date: new Date()
    })

    await user.save()

    // ✅ Opponent update karo (real player hone pe)
    if (oppUser) {
      const oppExpected = 1 / (1 + Math.pow(10, (oldElo - oppUser.elo) / 400))
      const oppActual = 1 - actualScore
      const oppEloChange = Math.round(K * (oppActual - oppExpected))

      oppUser.elo = Math.max(100, oppUser.elo + oppEloChange)
      oppUser.stats.totalBattles += 1

      if (result === 'win') {
        oppUser.stats.losses += 1
        oppUser.stats.streak = 0
      } else if (result === 'loss') {
        oppUser.stats.wins += 1
        oppUser.stats.streak += 1
      }

      oppUser.matchHistory.push({
        opponent: user.username,
        problem: problem || 'Unknown',
        result: result === 'win' ? 'loss' : result === 'loss' ? 'win' : 'draw',
        eloChange: oppEloChange,
        eloAfter: oppUser.elo,
        difficulty: difficulty || 'Medium',
        timeTaken: timeTaken || 0,
        date: new Date()
      })

      await oppUser.save()
    }

    res.json({
      success: true,
      newElo: user.elo,
      eloChange,
      streak: user.stats.streak,
      wins: user.stats.wins,
      losses: user.stats.losses
    })

  } catch (err) {
    console.error('updateMatchResult error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

// ✅ LEADERBOARD
exports.getLeaderboard = async (req, res) => {
  try {
    const players = await User.find({ isVerified: true })
      .sort({ elo: -1 })
      .limit(100)
      .select('username elo country stats createdAt')

    if (!players || players.length === 0)
      return res.json({ success: true, leaderboard: [] })

    const leaderboard = players.map((p, i) => {
      const wins = p.stats?.wins || 0
      const losses = p.stats?.losses || 0
      const total = p.stats?.totalBattles || wins + losses
      const winRate = total > 0 ? Math.round((wins / total) * 100) : 0

      return {
        rank: i + 1,
        username: p.username,
        elo: p.elo,
        wins,
        losses,
        winRate,
        streak: p.stats?.streak || 0,
        country: p.country || 'IN',
        badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : null,
      }
    })

    res.json({ success: true, leaderboard })
  } catch (err) {
    console.error('getLeaderboard error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}