import { useState } from 'react';

export default function InputScreen({ onSubmit, lang, onLangToggle }) {
  const [input, setInput] = useState('');

  const examples = {
    EN: [
      "Heavier objects fall faster than lighter ones",
      "Force is what keeps objects moving",
      "Electrons flow from negative to positive",
      "Water conducts electricity because it's wet"
    ],
    BN: [
      "ভারী বস্তু হালকা বস্তুর চেয়ে দ্রুত নিচে পড়ে",
      "বল প্রয়োগ করলেই কোনো বস্তু গতিশীল থাকে",
      "ইলেকট্রন ঋণাত্মক থেকে ধনাত্মক দিকে প্রবাহিত হয়",
      "পানি ভেজা বলেই বিদ্যুৎ পরিবাহী"
    ]
  };

  const texts = {
    EN: {
      title: "NovaMind XR",
      subtitle: "Tell me what's confusing you — I'll build you a 3D world to explore it",
      placeholder: "e.g. I don't understand why objects keep moving after I stop pushing them...",
      button: "Build My Simulation",
      tryExample: "Try an example misconception:",
      footer: "Press Ctrl + Enter to submit"
    },
    BN: {
      title: "নোভামাইন্ড এক্সআর",
      subtitle: "আপনার দ্বিধা বা ভুল ধারণাটি লিখুন — এটি সমাধান করার জন্য আমি একটি থ্রিডি ল্যাব তৈরি করব",
      placeholder: "যেমনঃ আমি বুঝি না কেন ধাক্কা দেওয়া বন্ধ করলেও কোনো বস্তু চলতে থাকে...",
      button: "আমার সিমুলেশন তৈরি করুন",
      tryExample: "একটি উদাহরণ যাচাই করুন:",
      footer: "জমা দিতে Ctrl + Enter চাপুন"
    }
  };

  const currentText = texts[lang];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #09091e 0%, #030308 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      boxSizing: 'border-box',
      fontFamily: 'sans-serif'
    }}>
      {/* Language toggle button absolute at top-right */}
      <div style={{ position: 'absolute', top: '24px', right: '24px', display: 'flex', gap: '8px' }}>
        <button 
          onClick={onLangToggle}
          style={{
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '20px',
            color: '#60a5fa',
            padding: '6px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
        >
          {lang === 'EN' ? 'বাংলা' : 'English'}
        </button>
      </div>

      <div style={{ 
        width: '100%', 
        maxWidth: '620px',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        textAlign: 'center'
      }}>
        {/* Logo and Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '16px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.025em' }}>
            {currentText.title}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.5, margin: 0 }}>
            {currentText.subtitle}
          </p>
        </div>

        {/* Input Area */}
        <div style={{ width: '100%', textAlign: 'left' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={currentText.placeholder}
            style={{
              width: '100%',
              minHeight: '140px',
              background: 'rgba(10, 10, 26, 0.8)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '15px',
              padding: '18px',
              resize: 'vertical',
              boxSizing: 'border-box',
              outline: 'none',
              fontFamily: 'sans-serif',
              lineHeight: 1.6,
              transition: 'border-color 0.25s, box-shadow 0.25s'
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#60a5fa';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey && input.trim()) {
                onSubmit(input.trim());
              }
            }}
          />

          <button
            onClick={() => input.trim() && onSubmit(input.trim())}
            disabled={!input.trim()}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '16px',
              background: input.trim() 
                ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' 
                : 'rgba(30, 41, 59, 0.5)',
              color: input.trim() ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              boxShadow: input.trim() ? '0 4px 20px rgba(59, 130, 246, 0.35)' : 'none',
              transition: 'all 0.25s ease'
            }}
            onMouseEnter={e => {
              if (input.trim()) e.currentTarget.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.filter = 'none';
            }}
          >
            {currentText.button}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: '#475569' }}>
            {currentText.footer}
          </div>

          {/* Try Examples Section */}
          <div style={{ marginTop: '32px' }}>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px', fontWeight: 500 }}>
              {currentText.tryExample}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {examples[lang].map(ex => (
                <button 
                  key={ex}
                  onClick={() => setInput(ex)}
                  style={{
                    padding: '10px 14px',
                    background: 'rgba(30, 41, 59, 0.3)',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '10px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
