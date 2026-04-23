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
}`;

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

module.exports = router;
