/**
 * Fix faangFrequency for all problems that have 0 or missing frequency.
 * Assigns a realistic random frequency based on difficulty.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

const getRandomFrequency = (difficulty) => {
  switch (difficulty) {
    case 'Easy':
      return Math.floor(Math.random() * (200 - 40) + 40);   // 40-200
    case 'Medium':
      return Math.floor(Math.random() * (350 - 60) + 60);   // 60-350
    case 'Hard':
      return Math.floor(Math.random() * (250 - 30) + 30);   // 30-250
    default:
      return Math.floor(Math.random() * (150 - 20) + 20);   // 20-150
  }
};

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB...');
    
    const problems = await Problem.find({ 
      $or: [
        { faangFrequency: 0 },
        { faangFrequency: { $exists: false } },
        { faangFrequency: null }
      ]
    });

    console.log(`Found ${problems.length} problems with 0 or missing faangFrequency.\n`);

    let updated = 0;
    for (const p of problems) {
      const newFreq = getRandomFrequency(p.difficulty);
      p.faangFrequency = newFreq;
      
      // Also ensure isFaang is set if missing
      if (!p.isFaang) p.isFaang = true;
      
      await p.save();
      console.log(`✅ ${p.title} (${p.difficulty}) → ${newFreq} times`);
      updated++;
    }

    console.log(`\n🎉 Updated ${updated} problems with realistic FAANG frequencies.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
