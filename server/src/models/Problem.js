const mongoose = require('mongoose')

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  expected: mongoose.Schema.Types.Mixed,
  functionCall: String,
})

const problemSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  examples: [{ input: String, output: String, explain: String }],
  constraints: [String],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    cpp: String,
    java: String,
  },
  hints: [String],
  companies: [String],
  acceptance: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
})

module.exports = mongoose.model('Problem', problemSchema)