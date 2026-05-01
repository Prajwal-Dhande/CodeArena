const express = require('express')
const router = express.Router()
const auth = require('../middleware/authmiddleware')
const mongoose = require('mongoose')

// ── Tournament Schema (in-memory model) ───────────────────────────────────────
const tournamentSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  status:      { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  tier:        { type: String, enum: ['pro', 'pro-plus', 'open'], default: 'pro' },
  prizePool:   { type: String, default: '🏆 Premium Badge + 500 ELO Boost' },
  maxSlots:    { type: Number, default: 16 },
  startsAt:    { type: Date, required: true },
  endsAt:      { type: Date },
  problem:     { type: String, default: 'Random MAANG Problem' },
  difficulty:  { type: String, default: 'Hard' },
  participants: [{
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username:  String,
    rank:      String,
    elo:       Number,
    score:     { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
    joinedAt:  { type: Date, default: Date.now }
  }],
  leaderboard: [{
    position: Number, username: String, score: Number,
    timeTaken: Number, elo: Number, rank: String
  }],
  createdAt: { type: Date, default: Date.now }
})

const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', tournamentSchema)

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
    const user = await User.findById(req.user.id).select('username rank elo isPremium')
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const t = await Tournament.findById(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Tournament not found' })

    // Premium gate
    if (t.tier !== 'open' && !user.isPremium) {
      return res.status(403).json({ success: false, message: 'This tournament is for Premium members only. Upgrade to join!' })
    }

    // Already joined?
    if (t.participants.some(p => p.userId?.toString() === req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already registered!' })
    }

    // Slots full?
    if (t.participants.length >= t.maxSlots) {
      return res.status(400).json({ success: false, message: 'Tournament is full!' })
    }

    t.participants.push({ userId: req.user.id, username: user.username, rank: user.rank, elo: user.elo })
    await t.save()

    res.json({ success: true, message: 'Registered successfully!', slotsFilled: t.participants.length, maxSlots: t.maxSlots })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── POST /api/tournaments (admin) — Create tournament ────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tier, prizePool, maxSlots, startsAt, problem, difficulty } = req.body
    const t = await Tournament.create({
      title, description, tier, prizePool,
      maxSlots: maxSlots || 16,
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
        tier: 'pro', difficulty: 'Hard', problem: 'Median of Two Sorted Arrays',
        prizePool: '🏆 500 ELO Boost + Exclusive "MAANG Slayer" Badge',
        maxSlots: 16, status: 'upcoming',
        startsAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
      },
      {
        title: '🔥 Open Clash — Beginner Cup',
        description: 'Open to all! Best time on Easy problem wins. No premium required.',
        tier: 'open', difficulty: 'Easy', problem: 'Two Sum',
        prizePool: '🥇 Gold Badge + 200 ELO Boost',
        maxSlots: 32, status: 'active',
        startsAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) // started 1h ago
      },
      {
        title: '💎 Diamond Gauntlet',
        description: 'Exclusive Pro+ tournament. Medium problem, fastest correct solution wins.',
        tier: 'pro-plus', difficulty: 'Medium', problem: 'LRU Cache',
        prizePool: '💎 Diamond Badge + 300 ELO + Platform Spotlight',
        maxSlots: 8, status: 'upcoming',
        startsAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
      },
      {
        title: '🏆 Grand Prix — Season Finale',
        description: 'The ultimate CodeArena tournament. Last season winner: @champion99',
        tier: 'pro', difficulty: 'Hard', problem: 'Merge K Sorted Lists',
        prizePool: '👑 Grandmaster Badge + 1000 ELO + Hall of Fame',
        maxSlots: 16, status: 'completed',
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
