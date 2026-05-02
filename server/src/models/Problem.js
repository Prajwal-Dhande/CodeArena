const mongoose = require('mongoose')

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  expected: mongoose.Schema.Types.Mixed,
  functionCall: String,
})

const problemSchema = new mongoose.Schema({
  slug:        { type: String, unique: true, required: true },
  title:       { type: String, required: true },
  difficulty:  { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category:    { type: String, required: true },
  description: { type: String, required: true },
  examples:    [{ input: String, output: String, explain: String }],
  constraints: [String],
  testCases:   [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String,
  },
  hints:      [String],
  companies:  [String],          // e.g. ['Google', 'Amazon', 'Microsoft']
  acceptance: { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  isPremium:  { type: Boolean, default: false },  // 🔒 locked behind paywall

  // 🔥 NEW FAANG VAULT FIELDS
  tier:            { type: String, enum: ['free', 'premium'], default: 'free' }, // 'free' | 'premium'
  faangFrequency:  { type: Number, default: 0 },  // how many times asked (display number)
  isFaang:         { type: Boolean, default: false },
  topCompany:      { type: String, default: '' },  // primary company (for badge)
  order:           { type: Number, default: 999 },  // sort order in vault
})

module.exports = mongoose.model('Problem', problemSchema)