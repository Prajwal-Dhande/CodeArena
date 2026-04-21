const { executePython, executeJava } = require('../utils/compiler');

// Tera run code wala API function
exports.runCode = async (req, res) => {
  const { code, language } = req.body;
  let result;

  try {
    if (language === 'python') {
      result = await executePython(code);
    } else if (language === 'java') {
      result = await executeJava(code);
    } else {
      return res.status(400).json({ message: "Language not supported yet" });
    }

    if (!result.success) {
      return res.status(400).json({ passed: false, error: result.output });
    }

    // Agar code success hai, toh apna test cases match karne wala logic yahan laga dena
    res.json({ passed: true, output: result.output });

  } catch (error) {
    res.status(500).json({ error: "Server execution failed" });
  }
};