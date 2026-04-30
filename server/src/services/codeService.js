const { VM } = require('vm2');
const ts = require('typescript');
const { executePython, executeJava, executeCpp } = require('../utils/compiler');

const LANGUAGE_VERSIONS = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.4' },
  python:     { language: 'python',     version: '3.10.0' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  java:       { language: 'java',       version: '15.0.2' },
};

// ─────────────────────────────────────────────────────────────────────────────
// ⏱ TIME COMPLEXITY ANALYZER
// ─────────────────────────────────────────────────────────────────────────────
const analyzeTimeComplexity = (code) => {
  try {
    const s = code.toLowerCase();
    if ((s.match(/for[\s\S]{0,300}for[\s\S]{0,300}for/g) || []).length) return { time: 'O(N³)', space: 'O(1)', note: 'Triple nested loops' };
    const nested = (s.match(/for[\s\S]{0,300}for/g) || []).length > 0;
    const memo   = s.includes('memo') || s.includes('dp[') || s.includes('dp =') || s.includes('cache');
    const recur  = /function\s+\w+[\s\S]*?return\s+.*\w+\s*\(/.test(s);
    const sort   = s.includes('.sort(') || s.includes('sorted(') || s.includes('arrays.sort');
    const bsrch  = s.includes('left') && s.includes('right') && s.includes('mid');
    const hmap   = s.includes('map') || s.includes('set') || s.includes('dict') || s.includes('{}');
    const loop   = s.includes('for ') || s.includes('for(') || s.includes('while ');
    const graph  = s.includes('queue') || s.includes('bfs') || s.includes('dfs') || s.includes('visited');
    if (nested && !memo) return { time: 'O(N²)', space: 'O(1)',  note: 'Nested loops' };
    if (memo && recur)   return { time: 'O(N)',  space: 'O(N)',  note: 'Memoized DP' };
    if (memo)            return { time: 'O(N)',  space: 'O(N)',  note: 'Dynamic Programming' };
    if (graph)           return { time: 'O(V+E)',space: 'O(V)',  note: 'Graph traversal' };
    if (bsrch)           return { time: 'O(log N)', space: 'O(1)', note: 'Binary search' };
    if (sort && loop)    return { time: 'O(N log N)', space: 'O(1)', note: 'Sort + scan' };
    if (sort)            return { time: 'O(N log N)', space: 'O(N)', note: 'Sorting based' };
    if (hmap && loop)    return { time: 'O(N)',  space: 'O(N)',  note: 'HashMap single pass' };
    if (loop)            return { time: 'O(N)',  space: 'O(1)',  note: 'Single loop' };
    return               { time: 'O(1)',  space: 'O(1)',  note: 'Constant time' };
  } catch { return { time: 'O(N)', space: 'O(1)', note: 'Analysis unavailable' }; }
};

// ─────────────────────────────────────────────────────────────────────────────
// 🔍 UNIVERSAL PROBLEM TYPE DETECTOR
// Detects the execution strategy needed for any problem type automatically.
// ─────────────────────────────────────────────────────────────────────────────
const detectProblemType = (code, functionCall) => {
  const fc = (functionCall || '').trim();

  // ① CLASS SIMULATION — functionCall = solution([ops...], [args...]) AND code has a class
  const isSolutionCall  = /^solution\s*\(/.test(fc);
  const codeHasClass    = /class\s+[A-Z][a-zA-Z0-9]*\s*[{\(]/.test(code);
  if (isSolutionCall && codeHasClass) return 'CLASS_SIMULATION';

  // ② LINKED LIST — code references ListNode / .next patterns
  const hasListNode = /ListNode|\.next\b/.test(code) ||
    /reverseList|mergeTwoLists|reverseBetween|addTwoNumbers|hasCycle|detectCycle|removeNthFromEnd|reorderList|middleOfList|deleteNode|swapPairs|rotateRight/i.test(fc);
  if (hasListNode) return 'LINKED_LIST';

  // ③ BINARY TREE — code references TreeNode / .left / .right patterns
  const hasTreeNode = /TreeNode|\.left\b|\.right\b/.test(code) ||
    /maxDepth|minDepth|invertTree|isBalanced|isSymmetric|levelOrder|zigzag|pathSum|lowestCommon|rightSideView|buildTree|kthSmallest|inorderTraversal|preorder|postorder|countNodes|maxPathSum|flattenTree|diameter/i.test(fc);
  if (hasTreeNode) return 'BINARY_TREE';

  // ④ NORMAL FUNCTION — default
  return 'NORMAL';
};

// ─────────────────────────────────────────────────────────────────────────────
// 🛠 HELPER CODE — injected into every JS VM run
// ─────────────────────────────────────────────────────────────────────────────
const JS_HELPERS = `
function ListNode(val, next) {
  this.val  = val  === undefined ? 0    : val;
  this.next = next === undefined ? null : next;
}
function arrayToList(arr) {
  if (!arr || !arr.length) return null;
  let head = new ListNode(arr[0]), cur = head;
  for (let i = 1; i < arr.length; i++) { cur.next = new ListNode(arr[i]); cur = cur.next; }
  return head;
}
function listToArray(node) {
  const res = [];
  while (node) { res.push(node.val); node = node.next; }
  return res;
}
function TreeNode(val, left, right) {
  this.val   = val   === undefined ? 0    : val;
  this.left  = left  === undefined ? null : left;
  this.right = right === undefined ? null : right;
}
function arrayToTree(arr) {
  if (!arr || !arr.length) return null;
  const root = new TreeNode(arr[0]);
  const q = [root]; let i = 1;
  while (i < arr.length) {
    const n = q.shift();
    if (arr[i] != null) { n.left  = new TreeNode(arr[i]); q.push(n.left); }  i++;
    if (i < arr.length && arr[i] != null) { n.right = new TreeNode(arr[i]); q.push(n.right); } i++;
  }
  return root;
}
function treeToArray(root) {
  if (!root) return [];
  const res = [], q = [root];
  while (q.length) {
    const n = q.shift();
    if (n) { res.push(n.val); q.push(n.left); q.push(n.right); }
    else     res.push(null);
  }
  while (res.length && res[res.length - 1] === null) res.pop();
  return res;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 PARSE CLASS SIMULATION ARGS FROM functionCall STRING
// Handles: solution(["ClassName","method",...], [[arg1],[arg2],...])
// ─────────────────────────────────────────────────────────────────────────────
const parseSimulationArgs = (functionCall) => {
  try {
    const fc = functionCall.trim();
    const inner = fc.slice(fc.indexOf('(') + 1, fc.lastIndexOf(')'));
    // Walk character by character to find boundary between first and second top-level array
    let depth = 0, splitIdx = -1;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '[') depth++;
      else if (inner[i] === ']') { depth--; if (depth === 0) { splitIdx = i + 1; break; } }
    }
    if (splitIdx === -1) throw new Error('Could not find array boundary');
    const ops  = JSON.parse(inner.slice(0, splitIdx).trim());
    const args = JSON.parse(inner.slice(splitIdx).replace(/^\s*,\s*/, '').trim());
    return { ops, args };
  } catch (e) {
    throw new Error('parseSimulationArgs failed: ' + e.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ⚡ JAVASCRIPT UNIVERSAL EXECUTOR
// ─────────────────────────────────────────────────────────────────────────────
const runJavaScript = (code, tc, problemType) => {
  // Strip user-defined ListNode/TreeNode to avoid redeclaration conflicts
  const cleanCode = code
    .replace(/(?:\/\*[\s\S]*?\*\/\s*)?(?:function\s+ListNode\s*\([\s\S]*?\n\}|class\s+ListNode\s*\{[\s\S]*?\n\})\s*/g, '')
    .replace(/(?:\/\*[\s\S]*?\*\/\s*)?(?:function\s+TreeNode\s*\([\s\S]*?\n\}|class\s+TreeNode\s*\{[\s\S]*?\n\})\s*/g, '');

  const vm = new VM({ timeout: 5000, sandbox: {} });
  let runnerCode;

  // ── STRATEGY A: CLASS SIMULATION ──────────────────────────────────────────
  if (problemType === 'CLASS_SIMULATION') {
    const { ops, args } = parseSimulationArgs(tc.functionCall);
    const className = ops[0];
    runnerCode = `
${JS_HELPERS}
${cleanCode}
(function(){
  var ops  = ${JSON.stringify(ops)};
  var args = ${JSON.stringify(args)};
  var out  = [null];
  var obj  = new ${className}(...(args[0] || []));
  for (var i = 1; i < ops.length; i++) {
    var r = obj[ops[i]](...(args[i] || []));
    out.push(r === undefined || r === null ? null : r);
  }
  return out;
})()`;
    const result = vm.run(runnerCode);
    const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
    return { passed, result };
  }

  // ── STRATEGY B: LINKED LIST ────────────────────────────────────────────────
  if (problemType === 'LINKED_LIST') {
    // Replace array literals in functionCall → arrayToList([...])
    const smartCall = tc.functionCall.replace(/\[([^\[\]]*)\]/g, (m) => `arrayToList([${m.slice(1,-1)}])`);
    runnerCode = `${JS_HELPERS}\n${cleanCode}\nlistToArray(${smartCall})`;
    const result = vm.run(runnerCode);
    const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
    return { passed, result };
  }

  // ── STRATEGY C: BINARY TREE ───────────────────────────────────────────────
  if (problemType === 'BINARY_TREE') {
    const smartCall = tc.functionCall.replace(/\[([^\[\]]*(?:\[[^\[\]]*\][^\[\]]*)*)\]/g, (m) => `arrayToTree([${m.slice(1,-1)}])`);
    // Output could be array (levelOrder) or number (maxDepth) — detect via expected type
    const expectsArray = Array.isArray(tc.expected);
    const wrappedCall  = expectsArray ? `treeToArray(${smartCall})` : smartCall;
    runnerCode = `${JS_HELPERS}\n${cleanCode}\n${wrappedCall}`;
    const result = vm.run(runnerCode);
    const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
    return { passed, result };
  }

  // ── STRATEGY D: NORMAL FUNCTION ──────────────────────────────────────────
  // Auto-detect and rename function if user named it differently
  const funcNameMatch = cleanCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/) ||
                        cleanCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>/);
  const realName = funcNameMatch ? funcNameMatch[1] : null;
  const callToUse = realName
    ? tc.functionCall.replace(/^[a-zA-Z0-9_]+\s*\(/, `${realName}(`)
    : tc.functionCall;
  runnerCode = `${JS_HELPERS}\n${cleanCode}\n${callToUse}`;
  const result = vm.run(runnerCode);
  const passed = JSON.stringify(result) === JSON.stringify(tc.expected);
  return { passed, result };
};

// ─────────────────────────────────────────────────────────────────────────────
// 🚀 MAIN TEST RUNNER — entry point
// ─────────────────────────────────────────────────────────────────────────────
const runTestCases = async (code, language, testCases) => {
  if (!testCases || !testCases.length) {
    return { results: [{ testCase: 1, passed: false, error: 'Test cases missing in DB.', input: '' }], passed: 0, total: 1 };
  }

  const results    = [];
  const complexity = analyzeTimeComplexity(code);

  // Detect problem type once per submission (same for all test cases)
  const sampleFc  = testCases[0]?.functionCall || '';
  const probType  = (language === 'javascript' || language === 'typescript')
    ? detectProblemType(code, sampleFc)
    : 'NORMAL';

  let executableCode = code;
  if (language === 'typescript') {
    try { executableCode = ts.transpile(code); } catch(e) { executableCode = code; }
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      // ── JAVASCRIPT / TYPESCRIPT ──────────────────────────────────────────
      if (language === 'javascript' || language === 'typescript') {
        const { passed, result } = runJavaScript(executableCode, tc, probType);
        results.push({ testCase: i + 1, passed, result, expected: tc.expected, input: tc.input, error: null });
      }

      // ── PYTHON ───────────────────────────────────────────────────────────
      else if (language === 'python') {
        const pyFuncMatch = code.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
        const pyRealName  = pyFuncMatch ? pyFuncMatch[1] : null;
        const pyCall      = pyRealName
          ? tc.functionCall.replace(/^[a-zA-Z0-9_]+\s*\(/, `${pyRealName}(`)
          : tc.functionCall;

        const pythonWrapper = `
import json, sys
true = True; false = False; null = None
${code}
try:
    res = eval("""${pyCall}""")
    print(json.dumps(res))
except Exception as e:
    print("RUNTIME_ERROR:", str(e))
`;
        const runResult = await executePython(pythonWrapper);
        if (!runResult.success) {
          results.push({ testCase: i + 1, passed: false, error: runResult.output, expected: tc.expected, input: tc.input });
        } else {
          const raw = runResult.output.trim();
          if (raw.startsWith('RUNTIME_ERROR:')) {
            results.push({ testCase: i + 1, passed: false, error: raw.replace('RUNTIME_ERROR:', '').trim(), expected: tc.expected, input: tc.input });
          } else {
            let parsed = raw;
            try { parsed = JSON.parse(raw); } catch {}
            const passed = JSON.stringify(parsed) === JSON.stringify(tc.expected);
            results.push({ testCase: i + 1, passed, result: parsed, expected: tc.expected, input: tc.input, error: null });
          }
        }
      }

      // ── JAVA (compile check only) ─────────────────────────────────────────
      else if (language === 'java') {
        const runResult = await executeJava(code);
        if (!runResult.success) {
          results.push({ testCase: i + 1, passed: false, error: runResult.output, expected: tc.expected, input: tc.input });
        } else {
          results.push({ testCase: i + 1, passed: true, result: 'Java Compilation ✅', error: null, expected: tc.expected, input: tc.input });
        }
      }

      // ── C++ (compile check only) ──────────────────────────────────────────
      else if (language === 'cpp') {
        const runResult = await executeCpp(code);
        if (!runResult.success) {
          results.push({ testCase: i + 1, passed: false, error: runResult.output, expected: tc.expected, input: tc.input });
        } else {
          results.push({ testCase: i + 1, passed: true, result: 'C++ Compilation ✅', error: null, expected: tc.expected, input: tc.input });
        }
      }

    } catch (err) {
      results.push({ testCase: i + 1, passed: false, error: err.message, expected: tc.expected, input: tc.input });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  return { results, passed: passedCount, total: testCases.length, complexity };
};

module.exports = { runTestCases, LANGUAGE_VERSIONS, analyzeTimeComplexity };