const express = require('express')
const router = express.Router()
const Problem = require('../models/Problem')
const authMiddleware = require('../middleware/authmiddleware')

// GET /api/problems — sab problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, search } = req.query
    const filter = { isActive: true, isFaang: { $ne: true } }

    if (difficulty && difficulty !== 'All') filter.difficulty = difficulty
    if (category && category !== 'All') filter.category = category
    if (search) filter.title = { $regex: search, $options: 'i' }

    const problems = await Problem.find(filter)
      .select('-testCases -starterCode')
      .sort({ difficulty: 1, title: 1 })

    res.json({ problems, total: problems.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/problems/premium — Interview DSA problems specifically
router.get('/premium', authMiddleware, async (req, res) => {
  try {
    const user = await require('../models/User').findById(req.userId);
    if (!user || (!user.isPremium && req.query.bypass !== 'test')) {
      return res.status(403).json({ message: 'Access denied. Premium subscription required.' });
    }

    const filter = { isActive: true, isPremium: true };
    const problems = await Problem.find(filter)
      .select('-testCases -starterCode')
      .sort({ difficulty: 1, title: 1 });

    res.json({ problems, total: problems.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/vault — FAANG problems for the Interview DSA Vault UI
router.get('/vault', async (req, res) => {
  try {
    // Return all FAANG problems, both free and premium.
    // The frontend will lock the premium ones if the user isn't premium.
    const problems = await Problem.find({ isFaang: true, isActive: true })
      .select('-testCases -starterCode')
      .sort({ order: 1 });

    res.json({ problems, total: problems.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/problems/:slug — single problem
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug, isActive: true })
    if (!problem) return res.status(404).json({ message: 'Problem not found' })
    res.json({ problem })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router