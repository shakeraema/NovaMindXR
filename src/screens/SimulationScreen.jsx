import { useState, useEffect } from 'react';
import UnderstandingScore from '../components/UnderstandingScore';
import SimulationScene from '../components/SimulationScene';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function SimulationScreen({ result, studentInput, onBack, lang }) {
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'mentor', text: result?.mentor_opening || "What do you notice about how the objects are moving?" }
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [scores, setScores] = useState(result?.understanding_scores || {});
  const [liveConfig, setLiveConfig] = useState(result?.scene_config || {});

  // Save session immediately when the simulation loads
  useEffect(() => {
    const saveSession = async () => {
      try {
        await fetch(`${BACKEND_URL}/api/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: 'student-' + Math.random().toString(36).substring(2, 9),
            misconceptionType: result.misconception_type,
            domain: result.domain,
            sceneConfig: result.scene_config,
            interactions: [],
            understandingScores: result.understanding_scores
          })
        });
        console.log('Session saved successfully.');
      } catch (err) {
        console.warn('Session save failed (non-critical):', err);
      }
    };
    if (result) saveSession();
  }, [result]);

  const handleConfigChange = (newConfig) => {
    setLiveConfig(newConfig);
    // Micro-updates to scores to simulate live progress
    setScores(prev => ({
      ...prev,
      conceptual_clarity: Math.min(100, (prev.conceptual_clarity || 30) + 2),
      cause_effect: Math.min(100, (prev.cause_effect || 30) + 1)
    }));
  };

  const handleMentorAsk = async () => {
    if (!mentorInput.trim()) return;
    
    const questionText = mentorInput.trim();
    const studentMsg = { role: 'student', text: questionText };
    setMentorMessages(prev => [...prev, studentMsg]);
    setMentorInput('');
    setMentorLoading(true);

    try {
      // Connect to real Socratic backend
      const response = await fetch(`${BACKEND_URL}/api/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          context: {
            misconceptionType: result.misconception_type,
            domain: result.domain,
            sceneConfig: result.scene_config,
            currentGravity: liveConfig.gravity,
            currentMass: liveConfig.mass
          },
          history: mentorMessages.map(m => ({
            role: m.role === 'mentor' ? 'assistant' : 'user',
            content: m.text
          }))
        })
      });
      
      if (!response.ok) throw new Error('Mentor API error');
      const data = await response.json();
      
      setMentorMessages(prev => [...prev, { role: 'mentor', text: data.response }]);
    } catch (err) {
      console.warn('Mentor query failed, falling back to mock Socratic hint:', err);
      setMentorMessages(prev => [...prev, {
        role: 'mentor',
        text: "That is an interesting observation. Try reducing the mass of the ball by half. Does the speed of its fall change, or remains identical? Tell me what you notice."
      }]);
    } finally {
      setMentorLoading(false);
    }
  };

  const texts = {
    EN: {
      back: "← Back",
      mentorTitle: "AI SOCRATIC MENTOR",
      placeholder: "Ask the mentor...",
      btnSend: "Ask",
      thinking: "Mentor is composing a question..."
    },
    BN: {
      back: "← ফেরত যান",
      mentorTitle: "এআই সক্রেটিক মেন্টর",
      placeholder: "মেন্টরকে জিজ্ঞেস করুন...",
      btnSend: "জিজ্ঞেস করুন",
      thinking: "মেন্টর চিন্তা করছেন..."
    }
  };

  const t = texts[lang] || texts.EN;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030308',
      color: '#e2e8f0',
      padding: '24px',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onBack} 
            style={{ 
              background: 'rgba(30, 41, 59, 0.5)', 
              border: '1px solid rgba(59, 130, 246, 0.2)', 
              color: '#94a3b8', 
              padding: '8px 16px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontSize: '13px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'}
          >
            {t.back}
          </button>
          <div>
            <span style={{ fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>
              Cognitive Diagnosis: {result?.domain?.toUpperCase()}
            </span>
            <h2 style={{ color: 'white', margin: '2px 0 0', fontSize: '20px', fontWeight: 600 }}>
              {result?.misconception_type}
            </h2>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
              {result?.knowledge_gap}
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Active Mode</span>
          <span style={{ display: 'block', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
            ● What-If Simulator
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 340px', 
        gap: '24px',
        maxWidth: '1300px',
        margin: '0 auto'
      }}>
        {/* Left Column: 3D Scene */}
        <div>
          <SimulationScene 
            diagnosisConfig={result?.scene_config} 
            onConfigChange={handleConfigChange} 
          />
        </div>

        {/* Right Column: Dashboard Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Radar Chart Component */}
          <UnderstandingScore scores={scores} />

          {/* AI Mentor Chat bubble */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '20px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            boxSizing: 'border-box',
            maxHeight: '400px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(59, 130, 246, 0.1)', paddingBottom: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#60a5fa' }} />
              <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', color: '#94a3b8' }}>
                {t.mentorTitle}
              </span>
            </div>

            {/* Message Area */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
              {mentorMessages.map((m, i) => (
                <div key={i} style={{ 
                  marginBottom: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.role === 'mentor' ? 'flex-start' : 'flex-end'
                }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '3px' }}>
                    {m.role === 'mentor' ? 'Mentor' : 'You'}
                  </span>
                  <div style={{
                    background: m.role === 'mentor' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    border: m.role === 'mentor' ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: m.role === 'mentor' ? '0px 14px 14px 14px' : '14px 0px 14px 14px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    lineHeight: 1.55,
                    color: m.role === 'mentor' ? '#d1d5db' : '#f3f4f6',
                    maxWidth: '85%',
                    wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              
              {mentorLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '3px' }}>Mentor</span>
                  <div style={{
                    background: 'rgba(59, 130, 246, 0.05)',
                    border: '1px dashed rgba(59, 130, 246, 0.2)',
                    borderRadius: '0px 14px 14px 14px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: '#64748b'
                  }}>
                    {t.thinking}
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={mentorInput}
                onChange={e => setMentorInput(e.target.value)}
                placeholder={t.placeholder}
                style={{
                  flex: 1,
                  background: 'rgba(10, 10, 26, 0.8)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '10px',
                  color: 'white',
                  padding: '10px 14px',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleMentorAsk();
                }}
              />
              <button 
                onClick={handleMentorAsk}
                style={{
                  padding: '10px 16px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '13px',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }}
              >
                {t.btnSend}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
