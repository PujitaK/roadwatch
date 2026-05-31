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
    const { message, history } = JSON.parse(event.body);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `You are RoadBot, AI assistant for RoadWatch — road safety platform for Coimbatore, Tamil Nadu.
Help citizens with:
- Reporting road damage (potholes, cracks, waterlogging, broken dividers)
- Road authority info: NHAI handles NH roads, PWD handles SH roads, CCMC handles municipal roads
- Budget transparency: ₹47.3Cr sanctioned for Coimbatore roads 2025-26
- Complaint tracking and status updates
Keep answers under 80 words. Be helpful and direct.
Reply in same language as user (Tamil, Hindi, Telugu or English).`,
        messages: [
          ...( history || []).slice(-6),
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
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
    const body = JSON.parse(event.body || '{}');
    const message = body.message || 'Hello';
    const history = body.history || [];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 300,
        system: `You are RoadBot, AI assistant for RoadWatch road safety platform in Coimbatore, Tamil Nadu. Help with road damage reporting, authority contacts, budget info. NHAI handles NH roads, PWD handles SH roads, CCMC handles municipal roads. Keep answers under 80 words. Reply in same language as user.`,
        messages: [
          ...history.slice(-6),
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    console.log('Anthropic response:', JSON.stringify(data));

    if (data && data.content && data.content[0]) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: data.content[0].text })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: 'Sorry, could not process. Error: ' + JSON.stringify(data) })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};