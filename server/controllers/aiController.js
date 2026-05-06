const axios = require('axios');

const getMockReply = () => {
  return ["Sounds good!", "I will check this out.", "Thanks for the update."];
};

const getMockEnhancement = (text) => {
  if (!text) return "";
  return `(Enhanced) ${text.charAt(0).toUpperCase() + text.slice(1)}.`;
};

const generateSmartReply = async (req, res) => {
  const { emailBody } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return res.json({ replies: getMockReply() });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content: 'Generate 3 short, distinct, professional quick replies (max 5 words each) for the following email. Format as a JSON array of strings like ["reply1", "reply2", "reply3"].'
      }, {
        role: 'user',
        content: emailBody
      }],
      temperature: 0.7,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    let replies;
    try {
      replies = JSON.parse(content);
    } catch {
      // Fallback if AI didn't return strict JSON
      replies = content.split('\n').map(s => s.replace(/^- /, '').replace(/^"|"$/g, '').trim()).filter(s => s);
    }
    
    res.json({ replies: replies.slice(0,3) });
  } catch (error) {
    console.error('Smart Reply Error:', error.message);
    res.json({ replies: getMockReply() });
  }
};

const enhanceText = async (req, res) => {
  const { text } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return res.json({ enhancedText: getMockEnhancement(text) });
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content: 'Rewrite the following text to be highly professional, polite, and grammatically correct. Output ONLY the rewritten text, no explanations.'
      }, {
        role: 'user',
        content: text
      }],
      temperature: 0.5,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ enhancedText: response.data.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Enhance Text Error:', error.message);
    res.json({ enhancedText: getMockEnhancement(text) });
  }
};

const generateTheme = async (req, res) => {
  const { prompt } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  const mockTheme = {
    backgroundGradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    textColor: 'text-white',
    glassColor: 'rgba(255, 255, 255, 0.1)',
  };

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return res.json(mockTheme);
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content: `You are an expert UI designer. Generate a Tailwind CSS compatible theme based on the user's prompt. 
        Return ONLY a JSON object with these exact keys:
        - "backgroundGradient": A valid CSS linear-gradient string (e.g., "linear-gradient(to right, #ff7e5f, #feb47b)")
        - "textColor": Either "text-white" or "text-gray-900" depending on what looks best over the gradient
        - "glassColor": An RGBA string for a translucent glass panel that fits the theme (e.g., "rgba(0, 0, 0, 0.4)" or "rgba(255, 255, 255, 0.2)")`
      }, {
        role: 'user',
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const theme = JSON.parse(content);
    res.json(theme);
  } catch (error) {
    console.error('Generate Theme Error:', error.message);
    res.json(mockTheme);
  }
};

module.exports = { generateSmartReply, enhanceText, generateTheme };
