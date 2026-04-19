const { VM } = require('vm2');

const LANGUAGE_VERSIONS = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
};

const runTestCases = async (code, language, testCases) => {
  // 1. Test cases check
  if (!testCases || testCases.length === 0) {
    return {
      results: [{ testCase: 1, passed: false, error: "Test cases missing in DB.", input: "" }],
      passed: 0, total: 1
    }
  }

  // 2. JAVA / PYTHON / CPP Fallback (Kyunki public API ab block ho chuki hai)
  if (language !== 'javascript') {
    return {
      results: testCases.map((tc, i) => ({
        testCase: i + 1, 
        passed: false,
        error: `Public Free APIs are now dead (as of Feb 2026). To execute ${language}, please integrate Judge0 API with a RapidAPI key.`,
        expected: tc.expected, 
        input: tc.input
      })),
      passed: 0, total: testCases.length
    }
  }

  // 3. JAVASCRIPT LOCAL EXECUTION (100% Bulletproof, No external API needed)
  const results = testCases.map((tc, i) => {
    try {
      const vm = new VM({
        timeout: 3000,
        sandbox: {}
      });

      const wrappedCode = `
        ${code}
        ${tc.functionCall}
      `;

      const result = vm.run(wrappedCode);
      const passed = JSON.stringify(result) === JSON.stringify(tc.expected);

      return {
        testCase: i + 1,
        passed,
        result,
        expected: tc.expected,
        input: tc.input,
        error: null,
        executionTime: null,
      }
    } catch (err) {
      return {
        testCase: i + 1,
        passed: false,
        error: err.message,
        expected: tc.expected,
        input: tc.input,
      }
    }
  });

  const passedCount = results.filter(r => r.passed).length;
  return { results, passed: passedCount, total: testCases.length };
}

module.exports = { runTestCases, LANGUAGE_VERSIONS };