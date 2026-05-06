const axios = require('axios');

// Basic keyword fallback
const fallbackFilter = (subject, body) => {
  const spamWords = ['lottery', 'win', 'free money', 'urgent', 'click here', 'guarantee'];
  const content = `${subject || ''} ${body || ''}`.toLowerCase();
  return spamWords.some(word => content.includes(word));
};

const aiSpamFilter = async (req, res, next) => {
  if (!req.body.subject && !req.body.body) return next();

  const { subject, body } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    // Fallback to keyword filter
    req.body.isSpam = fallbackFilter(subject, body);
    return next();
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'user',
        content: `Is the following email spam? Reply with exactly "YES" or "NO".\nSubject: ${subject}\nBody: ${body}`
      }],
      temperature: 0.0,
      max_tokens: 5
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const answer = response.data.choices[0].message.content.trim().toUpperCase();
    req.body.isSpam = answer === 'YES';
    next();
  } catch (error) {
    console.error('AI Spam Filter Error:', error.message);
    // Fallback if API fails
    req.body.isSpam = fallbackFilter(subject, body);
    next();
  }
};

module.exports = { aiSpamFilter };
