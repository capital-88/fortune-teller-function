const express = require('express');
const { fetch } = require('undici');

const app = express();
app.use(express.json());

app.post('/generate-report', async (req, res) => {
  const { birthDate, birthTime, type } = req.body;
  const API_KEY = process.env.DEEPSEEK_API_KEY;
  let prompt;

  switch (type) {
    case 'fortune':
      prompt = `You are an expert in Chinese astrology. Please generate a detailed fortune report for someone born on ${birthDate} at ${birthTime}. Include information about their character, career, love life, wealth, and health based on their birth date and time.`;
      break;
    case 'bracelet':
      prompt = `Based on the eight characters, suggest a suitable bracelet material and design for good fortune for someone born on ${birthDate} at ${birthTime}.`;
      break;
    case 'fenghui':
      prompt = `Provide feng shui recommendations for home orientation and interior arrangement based on the person's birth date and time: ${birthDate} at ${birthTime}.`;
      break;
    default:
      res.status(400).json({ error: 'Invalid report type' });
      return;
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    res.status(200).json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});