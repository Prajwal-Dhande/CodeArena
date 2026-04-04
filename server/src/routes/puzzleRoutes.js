const express = require('express');
const router = express.Router();
const Puzzle = require('../models/Puzzle');

// GET /api/puzzles — Daily puzzles (correctId is HIDDEN via select:false in schema)
router.get('/', async (req, res) => {
  try {
    const allPuzzles = await Puzzle.find();

    if (allPuzzles.length === 0) return res.json([]);

    const today = new Date();
    const daysSinceEpoch = Math.floor(today.getTime() / (1000 * 60 * 60 * 24));
    const startIndex = daysSinceEpoch % allPuzzles.length;

    let dailyPuzzles = [];
    for (let i = 0; i < 10; i++) {
      let index = (startIndex + i) % allPuzzles.length;
      dailyPuzzles.push(allPuzzles[index]);
    }

    res.json(dailyPuzzles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/puzzles/check — Server-side answer validation
router.post('/check', async (req, res) => {
  try {
    const { puzzleId, selectedOption } = req.body;

    if (!puzzleId || !selectedOption) {
      return res.status(400).json({ success: false, msg: 'Missing puzzleId or selectedOption' });
    }

    // Fetch puzzle WITH correctId (normally hidden)
    const puzzle = await Puzzle.findById(puzzleId).select('+correctId +explanation');

    if (!puzzle) {
      return res.status(404).json({ success: false, msg: 'Puzzle not found' });
    }

    const isCorrect = selectedOption === puzzle.correctId;

    res.json({
      success: true,
      isCorrect,
      correctId: puzzle.correctId,
      explanation: puzzle.explanation || ''
    });
  } catch (err) {
    console.error('Check answer error:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;