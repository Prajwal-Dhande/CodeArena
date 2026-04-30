const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const auth = require('../middleware/authmiddleware');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/feedback', auth, async (req, res) => {
  try {
    const { problemTitle, userCode, language, timeComplexity, spaceComplexity, timeTaken, passedTests, totalTests } = req.body;

    if (!userCode || !problemTitle) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const prompt = `You are Clara, an expert Technical Interviewer at a FAANG company.
Review the following code submitted by an interviewee.

Problem: ${problemTitle}
Language: ${language}
Time Complexity Claimed: ${timeComplexity || 'Not provided'}
Space Complexity Claimed: ${spaceComplexity || 'Not provided'}
Tests Passed: ${passedTests}/${totalTests}
Time Taken: ${timeTaken} seconds

User's Code:
\`\`\`${language}
${userCode}
\`\`\`

Provide a strict but constructive interview feedback in JSON format ONLY. Do not include any markdown formatting outside the JSON block. Your response must be purely parsable JSON.
Structure the JSON exactly as follows:
{
  "strengths": ["point 1", "point 2"],
  "improvements": ["point 1", "point 2"],
  "optimalCode": "optimal solution code snippet in the same language"
}

IMPORTANT INSTRUCTION: If the User's Code is empty, mostly empty, or just a default function stub without logic, DO NOT complain that the code is empty in your feedback. Instead, treat it as a student asking for a hint to start. In this case:
- "strengths": ["Good start! Let's break down the problem together."]
- "improvements": ["Provide a conceptual hint on how to approach the problem (e.g. what data structure to use, or the first step of the algorithm)."]
- "optimalCode": "Leave this empty or provide just the function signature."`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama-3.3-70b-versatile', // Updated to supported Llama 3.3 model
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ success: true, feedback: aiResponse });

  } catch (error) {
    console.error('AI Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate AI feedback' });
  }
});


router.post('/visualize', auth, async (req, res) => {
  try {
    const { problemTitle } = req.body;
    if (!problemTitle) return res.status(400).json({ success: false });

    const prompt = `You are an AI algorithm visualizer. Break down the core algorithmic approach for the coding problem: "${problemTitle}".
Provide EXACTLY 4 very short steps or concepts (max 2-3 words each) that represent the flow of solving this problem.
For example, for Two Sum: ["Hash Map", "Iterate Array", "Check Target-Num", "Return Indices"]
For Trapping Rain Water: ["Left Max Array", "Right Max Array", "Calculate Min", "Sum Differences"]

Return ONLY a valid JSON object with a single key "steps" containing an array of 4 strings. No other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ success: true, steps: data.steps || ['Step 1', 'Step 2', 'Step 3', 'Step 4'] });
  } catch (error) {
    console.error('Visualize API Error:', error);
    res.status(500).json({ success: false, steps: ['Error', 'Loading', 'Steps', 'Failed'] });
  }
});

// =============================================
// 🏢 MAANG REPORT CARD — Hire/No-Hire Verdict
// =============================================
router.post('/report-card', auth, async (req, res) => {
  try {
    const { problemTitle, userCode, language, passedTests, totalTests, timeTaken, result } = req.body;

    if (!problemTitle) return res.status(400).json({ success: false });

    const prompt = `You are a strict Senior Engineering Manager at a FAANG company (Google/Amazon/Microsoft level). 
You are evaluating a candidate's coding interview performance.

Problem: "${problemTitle}"
Language: ${language || 'javascript'}
Tests Passed: ${passedTests}/${totalTests}
Time Taken: ${timeTaken || 0} seconds
Result: ${result === 'win' ? 'COMPLETED' : 'DID NOT FINISH'}

Candidate's Code:
\`\`\`${language || 'javascript'}
${userCode || '// No code submitted'}
\`\`\`

Evaluate this candidate as if you are making a real hire/no-hire decision. Be honest but constructive.

Return ONLY a valid JSON object with this exact structure:
{
  "verdict": "HIRE" or "NO HIRE" or "BORDERLINE",
  "hireScore": <integer 0-100 representing overall hire likelihood>,
  "codeQuality": <integer 0-100>,
  "readability": <integer 0-100>,
  "problemSolving": <integer 0-100>,
  "edgeCasesMissed": <integer 0-5>,
  "speedPercentile": <integer 0-99, how fast compared to others>,
  "verdictReason": "<2 sentence honest explanation of the verdict>",
  "topStrength": "<single most impressive thing about their code>",
  "criticalFlaw": "<single most important thing to fix, or null if HIRE>",
  "companyFit": {
    "google": <integer 0-100>,
    "amazon": <integer 0-100>,
    "microsoft": <integer 0-100>
  }
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ success: true, report: data });
  } catch (error) {
    console.error('Report Card Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report card' });
  }
});

// =============================================
// 🐛 DEBUG WITH CLARA — Line-specific bug finder
// =============================================
router.post('/debug', auth, async (req, res) => {
  try {
    const { problemTitle, userCode, language, failedTestInput, failedTestExpected, failedTestActual } = req.body;

    if (!userCode || !problemTitle) return res.status(400).json({ success: false });

    const prompt = `You are Clara, an expert debugging assistant. A candidate's code is failing a test case.

Problem: "${problemTitle}"
Language: ${language || 'javascript'}
Failed Test Input: ${failedTestInput || 'Unknown'}
Expected Output: ${failedTestExpected || 'Unknown'}
Actual Output: ${failedTestActual || 'Wrong'}

Candidate's Code:
\`\`\`${language || 'javascript'}
${userCode}
\`\`\`

Identify the EXACT bug causing this failure. Be specific and pinpoint the line number.

Return ONLY a valid JSON object with this exact structure:
{
  "bugLine": <line number as integer, or null if not determinable>,
  "bugDescription": "<concise description of the bug in 1-2 sentences>",
  "fix": "<specific fix suggestion in 1 sentence>",
  "fixedSnippet": "<just the fixed lines of code, not the whole solution>"
}`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.choices[0]?.message?.content);
    res.json({ success: true, debug: data });
  } catch (error) {
    console.error('Debug Error:', error);
    res.status(500).json({ success: false, message: 'Failed to debug' });
  }
});

module.exports = router;
