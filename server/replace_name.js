const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));

let replacedCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('CodeArena')) {
    const newContent = content.replace(/CodeArena/g, 'NodeClash');
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated: ${file}`);
    replacedCount++;
  }
});

console.log(`Replaced in ${replacedCount} files.`);
