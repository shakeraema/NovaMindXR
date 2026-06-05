import { useEffect, useState } from 'react';

const MESSAGES = {
  EN: [
    "Analyzing mental schema...",
    "Diagnosing misconception vectors...",
    "Identifying core physics gaps...",
    "Instantiating 3D environments...",
    "Calibrating orbital simulation...",
    "Spawning Socratic AI Mentor..."
  ],
  BN: [
    "মানসিক স্কিমা বিশ্লেষণ করা হচ্ছে...",
    "ভুল ধারণা সনাক্ত করা হচ্ছে...",
    "পদার্থবিজ্ঞানের মূল ফাঁকগুলি চিহ্নিত করা হচ্ছে...",
    "থ্রিডি পরিবেশ তৈরি করা হচ্ছে...",
    "কক্ষপথের সিমুলেশন ক্যালিব্রেট করা হচ্ছে...",
    "সক্রেটিক এআই মেন্টর প্রস্তুত করা হচ্ছে..."
  ]
};

export default function LoadingScreen({ lang }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const list = MESSAGES[lang] || MESSAGES.EN;
    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % list.length);
    }, 1200);
    
    const dotTimer = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 400);
    
    return () => { 
      clearInterval(msgTimer); 
      clearInterval(dotTimer); 
    };
  }, [lang]);

  const list = MESSAGES[lang] || MESSAGES.EN;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#030308',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Pulse Loader */}
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '32px' }}>
        {/* Outer glowing ring */}
        <div style={{
          position: 'absolute',
          inset: 0,
          border: '3px solid rgba(59, 130, 246, 0.1)',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite'
        }} />
        {/* Inner reverse-spinning ring */}
        <div style={{
          position: 'absolute',
          inset: '10px',
          border: '2px solid rgba(139, 92, 246, 0.1)',
          borderBottom: '2px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin-reverse 1s linear infinite'
        }} />
      </div>

      <h3 style={{
        color: '#f8fafc',
        fontSize: '18px',
        fontWeight: 500,
        margin: '0 0 8px',
        letterSpacing: '0.05em'
      }}>
        {lang === 'EN' ? 'RECOMPOSING REALITY' : 'বাস্তবতা পুনর্গঠন করা হচ্ছে'}
      </h3>
      
      <p style={{ 
        color: '#60a5fa', 
        fontSize: '14px', 
        margin: 0, 
        fontFamily: 'monospace',
        minWidth: '280px',
        textAlign: 'center'
      }}>
        {list[msgIndex]}{dots}
      </p>

      {/* Embedded CSS animation */}
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}
