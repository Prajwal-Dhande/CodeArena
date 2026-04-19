const axios = require('axios'); // Piston API fetch karne ke liye (ensure axios is installed: npm install axios)

// Piston API v2 Language Versions Mapping
const LANGUAGE_VERSIONS = {
  javascript: { language: 'javascript', version: '18.15.0' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'c++', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
};

// Yahan Piston public execution endpoint use kar rahe hain
const PISTON_API_URL = 'https://emjudge-piston.piston.emjudge.com/api/v2/execute'; 
// Note: Agar Piston ka main public API rate limit mare, toh tu apni khud ki Piston docker image host karke URL badal sakta hai.
// Alternative public piston URLs: 'https://emk-piston.fly.dev/api/v2/execute'

/**
 * Piston ke hisaab se execution block banata hai, 
 * kyunki Python aur Java mein functionCall ko print bhi karwana padta hai output match karne ke liye.
 */
const buildExecutionCode = (code, language, tc) => {
  if (language === 'javascript') {
    return `${code}\nconsole.log(JSON.stringify(${tc.functionCall}));`;
  } 
  
  if (language === 'python') {
    return `import json\n${code}\nprint(json.dumps(${tc.functionCall}))`;
  }
  
  if (language === 'java') {
    // Java mein pura Class wrap karna thoda complex hota hai, par basic execution is tarah hogi.
    // Hum assume karte hain user ne Solution class me method banaya hai.
    return `
      import java.util.*;
      ${code}
      public class Main {
          public static void main(String[] args) {
              Solution sol = new Solution();
              // Note: For fully dynamic Java testing, you'd need reflection or strict main generation based on the inputs.
              // For simplicity in Piston with basic algorithms, we try a generic call if possible.
              // In production, Judge0 is preferred for Java.
              System.out.println(sol.${tc.functionCall.replace('(', ' ( ')}); 
          }
      }
    `;
  }
  
  if (language === 'cpp') {
     return `
        #include <iostream>
        #include <vector>
        using namespace std;
        ${code}
        int main() {
            // C++ is tricky to dynamically call without strict typing setup in the test cases.
            cout << ${tc.functionCall} << endl;
            return 0;
        }
     `;
  }

  return code;
};

const runTestCases = async (code, language, testCases) => {
  if (!LANGUAGE_VERSIONS[language]) {
    return {
      results: testCases.map((tc, i) => ({
        testCase: i + 1, passed: false,
        error: `Language ${language} is not supported.`,
        expected: tc.expected, input: tc.input
      })),
      passed: 0, total: testCases.length
    }
  }

  const results = [];
  
  // Piston par ek saath saare requests maarne se rate limit hit ho sakti hai, 
  // Isliye test cases ko one-by-one evaluate karenge (for loop).
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    
    try {
      const execCode = buildExecutionCode(code, language, tc);
      
      const response = await axios.post(PISTON_API_URL, {
        language: LANGUAGE_VERSIONS[language].language,
        version: LANGUAGE_VERSIONS[language].version,
        files: [{ content: execCode }],
      });

      const data = response.data;
      
      let resultStr = data.run.stdout ? data.run.stdout.trim() : "";
      const errorStr = data.run.stderr ? data.run.stderr.trim() : "";

      let resultObj;
      let passed = false;

      if (!errorStr) {
        try {
           // Output JSON string aayegi, usko parse karo
           resultObj = JSON.parse(resultStr);
        } catch (e) {
           // Agar plain string return ho rahi hai (e.g. "true")
           resultObj = resultStr; 
        }

        // Compare expected with result
        passed = JSON.stringify(resultObj) === JSON.stringify(tc.expected);
      }

      results.push({
        testCase: i + 1,
        passed: passed,
        result: resultObj !== undefined ? resultObj : null,
        expected: tc.expected,
        input: tc.input,
        error: errorStr || null,
        executionTime: null, // Piston v2 doesn't give precise ms time natively without extra config
      });

    } catch (err) {
      results.push({
        testCase: i + 1,
        passed: false,
        error: "Execution Engine Failed: " + (err.response?.data?.message || err.message),
        expected: tc.expected,
        input: tc.input,
      });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  return { results, passed: passedCount, total: testCases.length };
}

module.exports = { runTestCases, LANGUAGE_VERSIONS }