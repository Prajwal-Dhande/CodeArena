const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const generateConstraint = async (code, problem, currentPassed, totalTests) => {
  try {
    const prompt = `You are an AI Interviewer in a live coding battle platform called CodeArena.

A player is solving: "${problem.title}"
Their current code:
\`\`\`javascript
${code}
\`\`\`
They have passed ${currentPassed}/${totalTests} test cases.

Generate ONE short, specific coding constraint to make this harder. Examples:
- "Now solve this without using any built-in array methods"
- "Refactor to O(1) space complexity — no extra data structures"
- "Now handle the case where nums contains negative numbers"
- "Solve this using only a single for loop"
- "Now make your solution work for sorted arrays in O(log n)"

Rules:
- Maximum 15 words
- Must be directly related to their current code
- Should be challenging but achievable
- Return ONLY the constraint text, nothing else`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.8,
      max_tokens: 60,
    })

    const constraint = completion.choices[0]?.message?.content?.trim()
    return constraint || 'Now solve this without using a hash map!'

  } catch (error) {
    console.error('Groq AI error:', error.message)
    // Fallback constraints
    const fallbacks = [
      'Now refactor to O(1) space — no hash maps allowed!',
      'Solve this using only one for loop.',
      'Now handle duplicate numbers in the array.',
      'Refactor without using any built-in methods.',
      'Now solve this in O(n log n) time complexity.',
    ]
    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }
}

module.exports = { generateConstraint }