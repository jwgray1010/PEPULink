const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/analyze', async (req, res) => {
  const { txHistory, question, goals = [], categories = [] } = req.body;

  const prompt = `
You are an advanced smart spending assistant. Analyze the user's transaction history and answer their question. 
Return a JSON object with:
- categories: spending totals by category
- anomalies: list of suspicious transactions
- goals: progress toward each goal
- recurring: summary of recurring payments
- recommendations: personalized suggestions
- answer: a user-friendly summary

Transaction history (JSON): ${JSON.stringify(txHistory)}
User goals (JSON): ${JSON.stringify(goals)}
Categories (optional, JSON): ${JSON.stringify(categories)}
User question: ${question}

Respond ONLY with a valid JSON object matching the above structure.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });
    // Parse the JSON response from OpenAI
    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  } catch (e) {
    res.status(500).json({ answer: "AI service error. Please try again later." });
  }
});

module.exports = router;
