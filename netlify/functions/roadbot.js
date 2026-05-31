exports.handler = async (event) => {
  // Handle CORS preflight
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

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ reply: 'Method not allowed' })
    };
  }

  try {
    // --- Parse body safely ---
    let message = 'Hello';
    let history = [];
    try {
      const body = JSON.parse(event.body || '{}');
      message = body.message || 'Hello';
      history = body.history || [];
    } catch (parseErr) {
      console.error('Body parse error:', parseErr.message);
    }

    console.log('RoadBot received message:', message);

    // --- Check API key exists ---
    const apiKey = process.env.ANTHROPIC_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_KEY env variable is missing!');
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Configuration error: API key not set. Please contact admin.' })
      };
    }

    // --- Call Anthropic API ---
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are RoadBot, a friendly AI assistant for RoadWatch — a road safety platform for Coimbatore, Tamil Nadu, India.
You help citizens with:
- Reporting road damage (potholes, cracks, waterlogging, broken dividers)
- Road authority info: NHAI handles National Highway roads, PWD handles State Highway roads, CCMC handles city/municipal roads
- Budget info: Rs 47.3 Crore sanctioned for Coimbatore roads in 2025-26
- Complaint tracking and status updates
Keep answers short (under 80 words). Be warm, helpful and direct.
Always reply in the same language the user writes in (Tamil, Hindi, Telugu or English).`,
        messages: [
          ...history.slice(-6),
          { role: 'user', content: message }
        ]
      })
    });

    console.log('Anthropic status:', anthropicResponse.status);

    // --- Read response ---
    const responseText = await anthropicResponse.text();
    console.log('Anthropic raw response:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonErr) {
      console.error('Failed to parse Anthropic response as JSON:', responseText);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'RoadBot got an unexpected response. Please try again!' })
      };
    }

    // --- Extract reply ---
    if (data && data.content && data.content[0] && data.content[0].text) {
      console.log('RoadBot reply:', data.content[0].text);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: data.content[0].text })
      };
    }

    // --- Anthropic returned an error object ---
    console.error('Anthropic error object:', JSON.stringify(data));
    const errMsg = (data.error && data.error.message) ? data.error.message : JSON.stringify(data);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'API error: ' + errMsg })
    };

  } catch (error) {
    console.error('RoadBot handler crashed:', error.message, error.stack);
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: 'RoadBot crashed: ' + error.message })
    };
  }
};