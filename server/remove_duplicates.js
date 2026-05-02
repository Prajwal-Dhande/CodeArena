require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./src/models/Problem');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const p1 = await Problem.find({ isFaang: true });
    const p2 = await Problem.find({ isFaang: { $ne: true } });
    const faangTitles = p1.map(p => p.title.toLowerCase().trim());
    
    const duplicates = p2.filter(p => faangTitles.includes(p.title.toLowerCase().trim()));
    console.log(`Found ${duplicates.length} duplicate original problems.`);
    
    // Delete the duplicate original problems
    const idsToDelete = duplicates.map(p => p._id);
    const result = await Problem.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`Deleted ${result.deletedCount} problems.`);
    
    process.exit(0);
  });
