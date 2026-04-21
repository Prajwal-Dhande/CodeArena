const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const executePython = async (code) => {
  const jobId = crypto.randomUUID();
  const filePath = path.join(tempDir, `${jobId}.py`);
  fs.writeFileSync(filePath, code);

  return new Promise((resolve) => {
    exec(`python "${filePath}"`, { timeout: 3000 }, (error, stdout, stderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (error) {
        if (error.killed) return resolve({ success: false, output: "Error: Time Limit Exceeded" });
        return resolve({ success: false, output: stderr || error.message });
      }
      resolve({ success: true, output: stdout.trim() });
    });
  });
};

const executeJava = async (code) => {
  const jobId = crypto.randomUUID().replace(/-/g, '');
  const className = `Main_${jobId}`;
  
  // 🔥 THE FIX: Regex updated to handle both "public class Solution" AND "class Solution"
  const modifiedCode = code.replace(/(public\s+)?class\s+[a-zA-Z0-9_]+/, `public class ${className}`);
  
  const filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, modifiedCode);

  return new Promise((resolve) => {
    // 🔥 Sirf Compile karo (Syntax Check), Run mat karo
    exec(`javac "${filePath}"`, { timeout: 3000 }, (compileError, _, compileStderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      const classFilePath = path.join(tempDir, `${className}.class`);
      if (fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);

      if (compileError) {
        return resolve({ success: false, output: compileStderr || compileError.message });
      }
      // Agar yahan tak aaya, matlab Java code ka syntax 100% sahi hai!
      resolve({ success: true, output: "Syntax is perfectly valid!" });
    });
  });
};

const executeCpp = async (code) => {
  const jobId = crypto.randomUUID();
  const filePath = path.join(tempDir, `${jobId}.cpp`);
  const isWin = process.platform === "win32";
  const outPath = path.join(tempDir, isWin ? `${jobId}.o` : `${jobId}.o`); // .o for object file
  
  fs.writeFileSync(filePath, code);

  return new Promise((resolve) => {
    // 🔥 C++ ko compile-only mode (-c flag) mein chalao
    exec(`g++ -c "${filePath}" -o "${outPath}"`, { timeout: 4000 }, (compileError, _, compileStderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

      if (compileError) {
        return resolve({ success: false, output: compileStderr || compileError.message });
      }
      resolve({ success: true, output: "Syntax is perfectly valid!" });
    });
  });
};

module.exports = { executePython, executeJava, executeCpp };