const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');

router.post('/mentor', async (req, res) => {
  const { question, context, history = [] } = req.body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const systemPrompt = `You are an AI mentor inside a 3D physics simulation called NovaMind XR.
Current simulation context: ${JSON.stringify(context)}
Ask ONE short Socratic question (max 2 sentences). Do NOT give the answer. Be specific to the simulation.`;

  if (geminiApiKey && !geminiApiKey.includes('your_key_here')) {
    try {
      console.log("Using Gemini API for Mentor Response");
      const contents = [
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: question }] }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const mentorReply = data.candidates[0].content.parts[0].text;
      return res.json({ response: mentorReply });
    } catch (err) {
      console.error('Gemini mentor error, trying fallback:', err);
    }
  }

  if (anthropicApiKey && !anthropicApiKey.includes('your_key_here')) {
    try {
      console.log("Using Anthropic API for Mentor Response");
      const client = new Anthropic({ apiKey: anthropicApiKey });
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: question }
      ];
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        system: systemPrompt,
        messages
      });
      return res.json({ response: message.content[0].text });
    } catch (err) {
      console.error('Anthropic mentor error, falling back to mock response:', err);
    }
  }

  console.log("Using Mock Mentor Response (No API keys configured or active)");
  return res.json({
    response: `That's an interesting question about "${question}". Look closely at the force vector. If the mass changes, does the speed of fall change in the same way? What do you observe?`,
    _debug_info: "Mock response generated because no API keys were configured or both failed."
  });
});

module.exports = router;
