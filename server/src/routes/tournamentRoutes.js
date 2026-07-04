const express = require('express')
const router = express.Router()
const auth = require('../middleware/authmiddleware')
const mongoose = require('mongoose')

const Tournament = require('../models/Tournament')

// ── GET /api/tournaments — List all tournaments ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .sort({ startsAt: -1 })
      .select('-participants.userId')
      .limit(20)
    res.json({ success: true, tournaments })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── GET /api/tournaments/:id — Single tournament detail ───────────────────────
router.get('/:id', async (req, res) => {
  try {
    const t = await Tournament.findById(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Tournament not found' })
    res.json({ success: true, tournament: t })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/tournaments/join/:id — Join a tournament ───────────────────────
router.post('/join/:id', auth, async (req, res) => {
  try {
    const User = require('../models/User')
    const user = await User.findById(req.userId).select('username rank elo isPremium')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const t = await Tournament.findById(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Tournament not found' })

    // Premium gate
    if (t.tier !== 'open' && !user.isPremium) {
      return res.status(403).json({ success: false, message: 'This tournament is for Premium members only. Upgrade to join!' })
    }

    // Already joined?
    if (t.participants.some(p => p.userId?.toString() === req.userId)) {
      return res.status(400).json({ success: false, message: 'You are already registered!' })
    }

    // Slots full?
    if (t.participants.length >= t.maxSlots) {
      return res.status(400).json({ success: false, message: 'Tournament is full!' })
    }

    t.participants.push({ userId: req.userId, username: user.username, rank: user.rank, elo: user.elo })
    await t.save()

    res.json({ success: true, message: 'Registered successfully!', slotsFilled: t.participants.length, maxSlots: t.maxSlots })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/tournaments (admin) — Create tournament ────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tier, prizePool, maxSlots, duration, startsAt, problem, difficulty } = req.body
    const t = await Tournament.create({
      title, description, tier, prizePool,
      maxSlots: maxSlots || 16,
      duration: duration || 30,
      startsAt: new Date(startsAt),
      problem, difficulty
    })
    res.json({ success: true, tournament: t })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/tournaments/seed — Seed sample tournaments (dev helper) ─────────
router.post('/seed', async (req, res) => {
  try {
    const now = new Date()
    const sample = [
      {
        title: '⚡ MAANG Sprint — Weekly #1',
        description: 'Top 16 premium coders battle on a surprise Hard problem. Winner gets 500 ELO boost!',
        tier: 'pro', difficulty: 'Hard', problem: 'Median of Two Sorted Arrays', problemSlug: 'median-of-two-sorted-arrays-faang',
        prizePool: '🏆 500 ELO Boost + Exclusive "MAANG Slayer" Badge',
        maxSlots: 16, duration: 30, status: 'upcoming',
        startsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        title: '🔥 Open Clash — Beginner Cup',
        description: 'Open to all! Best time on Easy problem wins. No premium required.',
        tier: 'open', difficulty: 'Easy', problem: 'Two Sum', problemSlug: 'two-sum-faang',
        prizePool: '🥇 Gold Badge + 200 ELO Boost',
        maxSlots: 32, duration: 15, status: 'upcoming',
        startsAt: new Date(now.getTime() + 2 * 60 * 1000) // starts in 2 minutes for testing!
      },
      {
        title: '💎 Diamond Gauntlet',
        description: 'Exclusive Pro+ tournament. Medium problem, fastest correct solution wins.',
        tier: 'pro-plus', difficulty: 'Medium', problem: 'LRU Cache', problemSlug: 'lru-cache-faang',
        prizePool: '💎 Diamond Badge + 300 ELO + Platform Spotlight',
        maxSlots: 8, duration: 20, status: 'upcoming',
        startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        title: '🏆 Grand Prix — Season Finale',
        description: 'The ultimate NodeClash tournament. Last season winner: @champion99',
        tier: 'pro', difficulty: 'Hard', problem: 'Merge K Sorted Lists', problemSlug: 'merge-k-sorted-lists-faang',
        prizePool: '👑 Grandmaster Badge + 1000 ELO + Hall of Fame',
        maxSlots: 16, duration: 30, status: 'completed',
        startsAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // ended a week ago
      }
    ]
    await Tournament.deleteMany({}) // clear old seeds
    const created = await Tournament.insertMany(sample)
    res.json({ success: true, created: created.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
