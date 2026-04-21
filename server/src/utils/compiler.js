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
    exec(`python3 "${filePath}"`, { timeout: 3000 }, (error, stdout, stderr) => {
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
  
  let modifiedCode = code;

  // 🔥 THE SMART FIX: Agar class pehle se hai, toh replace karo. Warna khud wrap kar do!
  if (/(public\s+)?class\s+[a-zA-Z0-9_]+/.test(code)) {
    modifiedCode = code.replace(/(public\s+)?class\s+[a-zA-Z0-9_]+/, `public class ${className}`);
  } else {
    // LeetCode style: Sirf function likha hai, toh khud class aur imports add karo
    modifiedCode = `import java.util.*;\n\npublic class ${className} {\n${code}\n}`;
  }
  
  const filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, modifiedCode);

  return new Promise((resolve) => {
    // Sirf Compile karo (Syntax Check)
    exec(`javac "${filePath}"`, { timeout: 3000 }, (compileError, _, compileStderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      const classFilePath = path.join(tempDir, `${className}.class`);
      if (fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);

      if (compileError) {
        // 🔥 Server ke lambe path ko hide karke clean "Main.java" dikhao
        const rawError = compileStderr || compileError.message;
        const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Regex safety
        const cleanError = rawError.replace(new RegExp(escapedPath, 'g'), 'Main.java');
        
        return resolve({ success: false, output: cleanError });
      }
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
    // C++ ko compile-only mode (-c flag) mein chalao
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