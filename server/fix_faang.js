require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // Let's see what problems we have with "faang" in the slug
    const p = await Problem.find({ slug: /faang/i });
    console.log(`Found ${p.length} faang problems.`);
    for (let prob of p) {
      console.log(`- ${prob.slug} (isFaang: ${prob.isFaang})`);
    }

    // Mark them all as isFaang: true
    const result = await Problem.updateMany({ slug: /faang/i }, { $set: { isFaang: true } });
    console.log(`Updated ${result.modifiedCount} problems to isFaang: true`);

    process.exit(0);
  });
