const { GoogleGenerativeAI } = require("@google/generative-ai");

// Basic keyword fallback
const fallbackFilter = (subject, body) => {
  const spamWords = ['lottery', 'win', 'free money', 'urgent', 'click here', 'guarantee'];
  const content = `${subject || ''} ${body || ''}`.toLowerCase();
  return spamWords.some(word => content.includes(word));
};

const aiSpamFilter = async (req, res, next) => {
  if (!req.body.subject && !req.body.body) return next();

  const { subject, body } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback to keyword filter
    req.body.isSpam = fallbackFilter(subject, body);
    return next();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Is the following email spam? Reply with exactly "YES" or "NO" and nothing else.
    Subject: ${subject}
    Body: ${body}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim().toUpperCase();
    
    req.body.isSpam = answer.includes('YES');
    next();
  } catch (error) {
    console.error('Gemini Spam Filter Error:', error.message);
    // Fallback if API fails
    req.body.isSpam = fallbackFilter(subject, body);
    next();
  }
};

module.exports = { aiSpamFilter };
