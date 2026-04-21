const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

const findMissing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB... Checking for missing test cases...");

    const problems = await Problem.find({});
    let missingCount = 0;
    
    console.log("\n🚨 SLUGS WITH MISSING TEST CASES:");
    console.log("-----------------------------------");
    problems.forEach(p => {
      if (!p.testCases || p.testCases.length === 0) {
        console.log(`"${p.slug}"`);
        missingCount++;
      }
    });

    console.log("-----------------------------------");
    console.log(`Total Missing: ${missingCount}`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

findMissing();