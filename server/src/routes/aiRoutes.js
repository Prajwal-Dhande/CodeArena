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

module.exports = router;
