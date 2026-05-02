require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

const chunk1 = require('./data_chunk_1');
const chunk2 = require('./data_chunk_2');
const allUpdates = [...chunk1, ...chunk2];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    let updated = 0;
    for (const data of allUpdates) {
      const res = await Problem.updateOne(
        { slug: data.slug },
        {
          $set: {
            description: data.description,
            examples: data.examples,
            constraints: data.constraints,
            starterCode: data.starterCode
          }
        }
      );
      if (res.modifiedCount > 0) {
        updated++;
        console.log('Updated:', data.slug);
      }
    }
    console.log(`Successfully updated ${updated} problems with rich LeetCode style details!`);
    process.exit(0);
  });
