const express = require('express')
const router = express.Router()
const Problem = require('../models/Problem')
const authMiddleware = require('../middleware/authmiddleware')

// GET /api/problems — sab problems
router.get('/', async (req, res) => {
  try {
    const { difficulty, category, search } = req.query
    const filter = { isActive: true }

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