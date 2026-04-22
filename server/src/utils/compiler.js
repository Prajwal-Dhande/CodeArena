const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// ---------------------------------------------
// 🔥 CHEAT CODES: Hidden Data Structures
// ---------------------------------------------
const javaStructures = `
class ListNode {
    int val; ListNode next;
    ListNode() {}
    ListNode(int val) { this.val = val; }
    ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}
class TreeNode {
    int val; TreeNode left; TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) { this.val = val; this.left = left; this.right = right; }
}
`;

const cppStructures = `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <map>
#include <set>
#include <queue>
#include <stack>
using namespace std;

struct ListNode {
    int val; ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};
struct TreeNode {
    int val; TreeNode *left; TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`;

const pyStructures = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`;
// ---------------------------------------------


const executePython = async (code) => {
  const jobId = crypto.randomUUID();
  const filePath = path.join(tempDir, `${jobId}.py`);
  
  // Inject Python structures
  const modifiedCode = `${pyStructures}\n${code}`;
  fs.writeFileSync(filePath, modifiedCode);

  return new Promise((resolve) => {
    exec(`python3 "${filePath}"`, { timeout: 5000 }, (error, stdout, stderr) => {
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
  
  // 1. Extract all user imports and remove them from the main code
  const userImports = (code.match(/import\s+[\w\.\*]+;/g) || []).join('\n');
  const codeWithoutImports = code.replace(/import\s+[\w\.\*]+;/g, '');

  let modifiedCode = codeWithoutImports;

  // 2. Smart Wrapper (Only wraps the code without imports)
  if (/(public\s+)?class\s+[a-zA-Z0-9_]+/.test(codeWithoutImports)) {
    modifiedCode = codeWithoutImports.replace(/(public\s+)?class\s+[a-zA-Z0-9_]+/, `public class ${className}`);
  } else {
    modifiedCode = `public class ${className} {\n${codeWithoutImports}\n}`;
  }
  
  // 3. Assemble perfectly: Imports at the very top -> Hidden Classes -> User Code
  const finalFileContent = `import java.util.*;\n${userImports}\n${javaStructures}\n${modifiedCode}`;
  
  const filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, finalFileContent);

  return new Promise((resolve) => {
    exec(`javac "${filePath}"`, { timeout: 10000 }, (compileError, stdout, compileStderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      
      const classFilePath = path.join(tempDir, `${className}.class`);
      if (fs.existsSync(classFilePath)) fs.unlinkSync(classFilePath);

      if (compileError) {
        console.log("--- JAVA ERROR START ---");
        console.log(compileStderr);
        console.log("--- JAVA ERROR END ---");

        if (compileError.killed) {
          return resolve({ success: false, output: "Error: Compilation Time Limit Exceeded (Server is too slow)" });
        }

        const rawError = compileStderr ? compileStderr : compileError.message;
        const escapedPath = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
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
  const outPath = path.join(tempDir, isWin ? `${jobId}.o` : `${jobId}.o`); 
  
  // Inject C++ headers and structures
  const modifiedCode = `${cppStructures}\n${code}`;
  fs.writeFileSync(filePath, modifiedCode);

  return new Promise((resolve) => {
    exec(`g++ -c "${filePath}" -o "${outPath}"`, { timeout: 5000 }, (compileError, _, compileStderr) => {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

      if (compileError) {
        if (compileError.killed) return resolve({ success: false, output: "Error: Compilation Time Limit Exceeded" });
        return resolve({ success: false, output: compileStderr || compileError.message });
      }
      resolve({ success: true, output: "Syntax is perfectly valid!" });
    });
  });
};

module.exports = { executePython, executeJava, executeCpp };