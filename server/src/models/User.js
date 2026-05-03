const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 20 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  
  // ✅ ELO starts at 0
  elo: { type: Number, default: 0 },
  peakElo: { type: Number, default: 0 },
  rank: { type: String, default: 'Bronze' },
  
  // 🔥 NEW FIELDS FOR PUZZLES 🔥
  puzzleXp: { type: Number, default: 0 },
  solvedPuzzles: [{ type: String }],
  // ---------------------------

  // 🔥 SOLVED DSA PROBLEMS 🔥
  solvedProblems: [{ type: String }],
  // ---------------------------

  // 🔥 PREMIUM STATUS 🔥
  isPremium: { type: Boolean, default: false },
  premiumPlan: { type: String, enum: ['free', 'pro', 'pro_plus'], default: 'free' },
  premiumExpiry: { type: Date },
  premiumOrderId: { type: String },

  // 🔥 SOCIAL FIELDS (FOLLOW SYSTEM) 🔥
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  country: { type: String, default: 'IN' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, select: false },
  otpExpiry: { type: Date, select: false },
  bio: { type: String, default: '', maxlength: 200 },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  website: { type: String, default: '' },
  education: { type: String, default: '' },
  company: { type: String, default: '' },
  languages: { type: [String], default: ['javascript'] },
  stats: {
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalBattles: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
  },
  matchHistory: [{
    opponent: { type: String, default: 'Unknown' },
    problem: { type: String, default: 'Unknown' },
    result: { type: String, enum: ['win', 'loss', 'draw'] },
    eloChange: { type: Number, default: 0 },
    eloAfter: { type: Number, default: 1000 },
    rankAfter: { type: String, default: 'Bronze' },
    difficulty: { type: String, default: 'Medium' },
    timeTaken: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('User', userSchema)