const { GoogleGenerativeAI } = require("@google/generative-ai");

const getMockReply = () => {
  return ["Sounds good!", "I will check this out.", "Thanks for the update."];
};

const getMockEnhancement = (text) => {
  if (!text) return "";
  return `(Enhanced) ${text.charAt(0).toUpperCase() + text.slice(1)}.`;
};

// Helper to get Gemini model
const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

const generateSmartReply = async (req, res) => {
  const { emailBody } = req.body;
  const model = getModel();

  if (!model) {
    return res.json({ replies: getMockReply() });
  }

  try {
    const prompt = `Generate 3 short, distinct, professional quick replies (max 5 words each) for the following email. 
    Format your response EXACTLY as a JSON array of strings like ["reply1", "reply2", "reply3"].
    Email: ${emailBody}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    let replies;
    try {
      // Find JSON array in the text (Gemini sometimes adds markdown)
      const jsonMatch = text.match(/\[.*\]/s);
      replies = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      replies = text.split('\n').map(s => s.replace(/^- /, '').replace(/^"|"$/g, '').trim()).filter(s => s);
    }
    
    res.json({ replies: Array.isArray(replies) ? replies.slice(0, 3) : getMockReply() });
  } catch (error) {
    console.error('Gemini Smart Reply Error:', error.message);
    res.json({ replies: getMockReply() });
  }
};

const enhanceText = async (req, res) => {
  const { text } = req.body;
  const model = getModel();

  if (!model) {
    return res.json({ enhancedText: getMockEnhancement(text) });
  }

  try {
    const prompt = `Rewrite the following text to be highly professional, polite, and grammatically correct. 
    Output ONLY the rewritten text, no explanations, no quotes.
    Text: ${text}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ enhancedText: response.text().trim() });
  } catch (error) {
    console.error('Gemini Enhance Text Error:', error.message);
    res.json({ enhancedText: getMockEnhancement(text) });
  }
};

const generateTheme = async (req, res) => {
  const { prompt: userPrompt } = req.body;
  const model = getModel();

  const mockTheme = {
    backgroundGradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    textColor: 'text-white',
    glassColor: 'rgba(255, 255, 255, 0.1)',
  };

  if (!model) {
    return res.json(mockTheme);
  }

  try {
    const prompt = `You are an expert UI designer. Generate a Tailwind CSS compatible theme based on the user's prompt: "${userPrompt}". 
    Return ONLY a JSON object with these exact keys:
    - "backgroundGradient": A valid CSS linear-gradient string
    - "textColor": Either "text-white" or "text-gray-900"
    - "glassColor": An RGBA string for a translucent panel (e.g., "rgba(255, 255, 255, 0.2)")
    
    Ensure the JSON is valid and contains no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{.*\}/s);
    const theme = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    res.json(theme);
  } catch (error) {
    console.error('Gemini Generate Theme Error:', error.message);
    res.json(mockTheme);
  }
};

module.exports = { generateSmartReply, enhanceText, generateTheme };
