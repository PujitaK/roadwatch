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
        model: 'claude-haiku-4-5',
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
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reply: data.content[0].text })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: error.message })
    };
  }
};