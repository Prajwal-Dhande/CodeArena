const mongoose = require('mongoose');

const puzzleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  xp: { type: Number, required: true },
  question: { type: String, required: true },
  code: { type: String },
  options: [{
    id: { type: String, required: true },
    text: { type: String, required: true }
  }],
  correctId: { type: String, required: true, select: false },
  explanation: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Puzzle', puzzleSchema);