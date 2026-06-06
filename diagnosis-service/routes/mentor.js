const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');

router.post('/mentor', async (req, res) => {
  const { question, context, history = [] } = req.body;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('your_key_here')) {
    console.log("Using Mock Mentor Response (ANTHROPIC_API_KEY not configured)");
    return res.json({
      response: `That's an interesting question about "${question}". Look closely at the force vector. If the mass changes, does the speed of fall change in the same way? What do you observe?`,
      _debug_info: "Mock response generated because ANTHROPIC_API_KEY is not set."
    });
  }

  const systemPrompt = `You are an AI mentor inside a 3D physics simulation called NovaMind XR.
Current simulation context: ${JSON.stringify(context)}
Ask ONE short Socratic question (max 2 sentences). Do NOT give the answer. Be specific to the simulation.`;

  const messages = [
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: question }
  ];

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 256,
      system: systemPrompt,
      messages
    });
    res.json({ response: message.content[0].text });
  } catch (err) {
    console.error('Mentor error, falling back to mock response:', err);
    res.json({
      response: `Interesting question. What happens when you adjust the sliders? Try changing the variables in the simulation and tell me what you see.`,
      _debug_info: `Fallback response generated due to error: ${err.message}`
    });
  }
});

module.exports = router;
