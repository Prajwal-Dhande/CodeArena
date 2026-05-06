const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace common text colors
  content = content.replace(/color:\s*['"]#fff(?:fff)?['"]/gi, 'color: \'var(--text-main)\'');
  content = content.replace(/color:\s*['"]#a1a1aa['"]/gi, 'color: \'var(--text-muted)\'');
  content = content.replace(/color:\s*['"]#d1d5db['"]/gi, 'color: \'var(--text-muted)\'');
  content = content.replace(/color:\s*['"]#666(?:666)?['"]/gi, 'color: \'var(--text-muted)\'');
  content = content.replace(/color:\s*['"]#555(?:555)?['"]/gi, 'color: \'var(--text-muted)\'');
  content = content.replace(/color:\s*['"]#444(?:444)?['"]/gi, 'color: \'var(--text-muted)\'');
  content = content.replace(/color:\s*['"]#aaa(?:aaa)?['"]/gi, 'color: \'var(--text-muted)\'');

  // Replace hardcoded backgrounds that should be card backgrounds
  content = content.replace(/background:\s*['"]#0f0f14['"]/gi, 'background: \'var(--card-bg)\'');
  content = content.replace(/background:\s*['"]#111113['"]/gi, 'background: \'var(--card-bg)\'');
  content = content.replace(/background:\s*['"]#080810['"]/gi, 'background: \'var(--bg-dark)\'');

  if (original !== content) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkSync(filePath);
    } else if (file.endsWith('.jsx')) {
      processFile(filePath);
    }
  }
}

walkSync('d:/Code Arena/client/src/pages');
walkSync('d:/Code Arena/client/src/components');
console.log('Done');
