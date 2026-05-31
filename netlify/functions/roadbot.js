exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    let message = 'Hello';
    let history = [];
    try {
      const body = JSON.parse(event.body || '{}');
      message = body.message || 'Hello';
      history = body.history || [];
    } catch (e) {}

    const apiKey = process.env.GEMINI_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Configuration error: API key not set.' })
      };
    }

    // Build Gemini conversation history
    const geminiHistory = history.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: `You are RoadBot, a friendly AI assistant for RoadWatch — a road safety platform for Coimbatore, Tamil Nadu, India.
You help citizens with:
- Reporting road damage (potholes, cracks, waterlogging, broken dividers)
- Road authority info: NHAI handles National Highway roads, PWD handles State Highway roads, CCMC handles city/municipal roads
- Budget info: Rs 47.3 Crore sanctioned for Coimbatore roads in 2025-26
- Complaint tracking and status updates
Keep answers short (under 80 words). Be warm, helpful and direct.
Always reply in the same language the user writes in (Tamil, Hindi, Telugu or English).` }]
          },
          contents: [
            ...geminiHistory,
            { role: 'user', parts: [{ text: message }] }
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', JSON.stringify(data));

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (reply) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply })
      };
    }

    const errMsg = data?.error?.message || JSON.stringify(data);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'API error: ' + errMsg })
    };

  } catch (error) {
    console.error('RoadBot error:', error.message);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'RoadBot crashed: ' + error.message })
    };
  }
};