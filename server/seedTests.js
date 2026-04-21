const mongoose = require('mongoose');
const Problem = require('./src/models/Problem'); 
require('dotenv').config();

const fixSlug = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");

    // EXACT SLUG FROM YOUR VERCEL URL
    await Problem.findOneAndUpdate(
      { slug: "best-time-to-buy-and-sell-stock" }, 
      { $set: { testCases: [
        { input: "[7,1,5,3,6,4]", expected: 5, functionCall: "solution([7,1,5,3,6,4])" },
        { input: "[7,6,4,3,1]", expected: 0, functionCall: "solution([7,6,4,3,1])" },
        { input: "[2,4,1]", expected: 2, functionCall: "solution([2,4,1])" }
      ] } },
      { upsert: true, returnDocument: 'after' } 
    );

    console.log("✅ Fixed: best-time-to-buy-and-sell-stock");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

fixSlug();