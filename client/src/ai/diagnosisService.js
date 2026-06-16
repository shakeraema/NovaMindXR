const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export async function diagnoseConfusion(studentInput) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: studentInput })
    });
    
    if (!response.ok) throw new Error('Diagnosis failed');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Diagnosis error:', err);
    return null;
  }
}

export async function getMentorResponse(studentQuestion, sceneContext, conversationHistory) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: studentQuestion,
        context: sceneContext,
        history: conversationHistory
      })
    });
    
    if (!response.ok) throw new Error('Mentor API failed');
    const data = await response.json();
    return data.response;
  } catch (err) {
    console.error('Mentor error:', err);
    return "That's an interesting observation. What do you think would happen if you changed one variable?";
  }
}
