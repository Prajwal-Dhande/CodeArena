/**
 * Cap all faangFrequency values to under 100.
 * Any problem with frequency >= 100 gets a new random value between 30-99.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Problem = require('../models/Problem');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to DB...');
    
    const problems = await Problem.find({ faangFrequency: { $gte: 100 } });
    console.log(`Found ${problems.length} problems with frequency >= 100.\n`);

    let updated = 0;
    for (const p of problems) {
      const oldFreq = p.faangFrequency;
      const newFreq = Math.floor(Math.random() * (99 - 30) + 30); // 30-99
      p.faangFrequency = newFreq;
      await p.save();
      console.log(`✅ ${p.title}: ${oldFreq} → ${newFreq} times`);
      updated++;
    }

    console.log(`\n🎉 Capped ${updated} problems to under 100.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('DB error:', err);
    process.exit(1);
  });
