const { VM } = require('vm2')

const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  cpp: 54,
}

const runTestCases = async (code, language, testCases) => {
  if (language !== 'javascript') {
    return {
      results: testCases.map((tc, i) => ({
        testCase: i + 1, passed: false,
        error: 'Only JavaScript supported currently. Python/C++ coming soon!',
        expected: tc.expected, input: tc.input
      })),
      passed: 0, total: testCases.length
    }
  }

  const results = testCases.map((tc, i) => {
    try {
      const vm = new VM({
        timeout: 3000,
        sandbox: {}
      })

      const wrappedCode = `
        ${code}
        ${tc.functionCall}
      `

      const result = vm.run(wrappedCode)
      const passed = JSON.stringify(result) === JSON.stringify(tc.expected)

      return {
        testCase: i + 1,
        passed,
        result,
        expected: tc.expected,
        input: tc.input,
        executionTime: null,
        memory: null,
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
  })

  const passed = results.filter(r => r.passed).length
  return { results, passed, total: testCases.length }
}

module.exports = { runTestCases, LANGUAGE_IDS }