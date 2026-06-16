import { useState } from 'react';

export default function InputScreen({ onSubmit, lang, onLangToggle, onFacultyClick }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const examples = {
    EN: [
      { text: "Why don't heavier objects fall faster?", icon: "🌍", label: "Gravity & Mass" },
      { text: "Why doesn't the Moon fall down to Earth?", icon: "🪐", label: "Planetary Orbits" },
      { text: "I don't understand wave interference", icon: "〰", label: "Wave Interference" },
      { text: "Why does salt dissolve in water but oil doesn't?", icon: "⚛", label: "Molecular Energy" },
      { text: "I'm confused about voltage vs current", icon: "⚡", label: "Ohm's Law Circuits" },
      { text: "Why does salty water make objects float higher?", icon: "🌊", label: "Oceanic Buoyancy" }
    ],
    BN: [
      { text: "কেন ভারী বস্তু হালকা বস্তুর চেয়ে দ্রুত পড়ে না?", icon: "🌍", label: "মহাকর্ষ ও ভর" },
      { text: "চাঁদ কেন পৃথিবীতে আছড়ে পড়ে না?", icon: "🪐", label: "গ্রহের কক্ষপথ" },
      { text: "আমি তরঙ্গের ব্যতিচার বুঝি না", icon: "〰", label: "তরঙ্গ ব্যতিচার" },
      { text: "লবণ কেন পানিতে দ্রবীভূত হয় কিন্তু তেল হয় না?", icon: "⚛", label: "আণবিক শক্তি" },
      { text: "আমি ভোল্টেজ বনাম কারেন্টের বিষয়টি নিয়ে দ্বিধান্বিত", icon: "⚡", label: "ওহমের সূত্র বর্তনী" },
      { text: "লবণাক্ত পানি কেন বস্তুকে বেশি ভাসিয়ে রাখে?", icon: "🌊", label: "প্লবতা ও ঘনত্ব" }
    ]
  };

  const texts = {
    EN: {
      title: "NovaMind XR",
      subtitle: "AI-Powered Scientific Concept Diagnostic Sandbox",
      welcomeTitle: "What scientific concept is confusing you?",
      welcomeSub: "Describe your misconception or type a question below, and I will generate a real-time interactive 3D simulation to analyze and visualize it.",
      placeholder: "Describe a scientific misconception... (e.g. Why does a heavy object fall at the same speed as a feather in a vacuum?)",
      footer: "Press Enter to submit · Accredited by Daffodil International University Blockchain",
      sidebarHeader: "Example Misconceptions",
      sidebarSub: "Select to load into input box"
    },
    BN: {
      title: "নোভামাইন্ড এক্সআর",
      subtitle: "এআই-চালিত বৈজ্ঞানিক ধারণা অনুসন্ধান স্যান্ডবক্স",
      welcomeTitle: "কোন বৈজ্ঞানিক ধারণাটি আপনাকে দ্বিধান্বিত করছে?",
      welcomeSub: "আপনার ভুল ধারণা বা প্রশ্নটি নিচে বর্ণনা করুন, এবং আমি এটি বিশ্লেষণ ও প্রদর্শনের জন্য একটি রিয়েল-টাইম থ্রিডি সিমুলেশন তৈরি করব।",
      placeholder: "একটি বৈজ্ঞানিক ভুল ধারণা লিখুন... (যেমনঃ মহাশূন্যে পালক ও লোহার বল কেন একই গতিতে পড়ে?)",
      footer: "জমা দিতে Enter চাপুন · ড্যাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটি ব্লকচেইন দ্বারা অনুমোদিত",
      sidebarHeader: "উদাহরণ ভুল ধারণাসমূহ",
      sidebarSub: "ইনপুট বক্সে লোড করতে ক্লিক করুন"
    }
  };

  const currentText = texts[lang];

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'EN' ? 'en-US' : 'bn-BD';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    setIsListening(true);
    recognition.start();
    
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + speechToText);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    
    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      background: '#030308',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .custom-sidebar-scroll::-webkit-scrollbar {
          width: 5px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.15);
          border-radius: 10px;
        }
        .custom-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.35);
        }
      `}</style>
      
      {/* Left Sidebar Panel - Conversation / Misconception History */}
      <div style={{
        width: '320px',
        background: '#070712',
        borderRight: '1px solid rgba(59, 130, 246, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        boxSizing: 'border-box',
        height: '100%',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        
        {/* Top Branding Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <h1 style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                {currentText.title}
              </h1>
              <p style={{ color: '#60a5fa', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '2px 0 0' }}>
                DIU XR Engine
              </p>
            </div>
          </div>
          <p style={{ color: '#64748b', fontSize: '11px', lineHeight: 1.4, margin: '8px 0 24px' }}>
            {currentText.subtitle}
          </p>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 20px' }} />

          {/* Examples Header */}
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '2px' }}>
            {currentText.sidebarHeader}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '14px' }}>
            {currentText.sidebarSub}
          </span>

          {/* List of Clickable Examples */}
          <div className="custom-sidebar-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
            {examples[lang].map((ex) => (
              <button
                key={ex.text}
                onClick={() => setInput(ex.text)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  color: '#94a3b8',
                  fontSize: '12.5px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
                  e.currentTarget.style.color = '#cbd5e1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{ex.icon}</span>
                <div>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: '11px', color: '#60a5fa', marginBottom: '2px' }}>
                    {ex.label}
                  </span>
                  <span style={{ lineHeight: 1.4, display: 'block' }}>{ex.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onFacultyClick}
            style={{
              width: '100%',
              background: 'rgba(99, 102, 241, 0.06)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '12px',
              color: '#a5b4fc',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)'}
          >
            📊 {lang === 'EN' ? 'Faculty Analytics Dashboard' : 'ফ্যাকাল্টি অ্যানালিটিক্স পোর্টাল'}
          </button>
        </div>

      </div>

      {/* Right Main Interface Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'radial-gradient(circle at center, #0a0a20 0%, #030308 100%)',
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        
        {/* Top Header Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
          flexShrink: 0
        }}>
          <button 
            onClick={onLangToggle}
            style={{
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '20px',
              color: '#60a5fa',
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
          >
            {lang === 'EN' ? 'বাংলা' : 'English'}
          </button>
        </div>

        {/* Central Assistant Welcome Screen */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 24px',
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
          textAlign: 'center'
        }}>
          
          {/* Main Glowing Orb / Assistant Logo */}
          <div style={{
            width: '72px',
            height: '72px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '22px',
            margin: '0 auto 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 35px rgba(99, 102, 241, 0.45)',
            position: 'relative'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>

          <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            {currentText.welcomeTitle}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, margin: '0 0 28px', maxWidth: '580px' }}>
            {currentText.welcomeSub}
          </p>

          {/* Quick Info Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '16px' }}>
            {["✨ 6 Science Simulation Worlds", "🛡️ Blockchain Ledger", "🎙️ Socratic Voice Dictation"].map((badge, idx) => (
              <span 
                key={idx}
                style={{
                  background: 'rgba(59, 130, 246, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                  borderRadius: '20px',
                  color: '#60a5fa',
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                {badge}
              </span>
            ))}
          </div>

        </div>

        {/* Chat Box Input area (Bottom) */}
        <div style={{
          width: '100%',
          padding: '0 24px 36px 24px',
          maxWidth: '800px',
          margin: '0 auto',
          boxSizing: 'border-box',
          flexShrink: 0
        }}>
          
          <div style={{
            position: 'relative',
            background: 'rgba(10, 10, 26, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.05)',
            padding: '8px',
            boxSizing: 'border-box',
            transition: 'border-color 0.25s, box-shadow 0.25s'
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = '#60a5fa';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.15)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.05)';
          }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={currentText.placeholder}
              style={{
                width: '100%',
                minHeight: '80px',
                background: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '15px',
                padding: '12px 100px 12px 12px', // Extra right padding for microphone and send button
                resize: 'none',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'sans-serif',
                lineHeight: 1.6
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  onSubmit(input.trim());
                }
              }}
            />

            {/* Actions Panel aligned inside box (Absolute at bottom right) */}
            <div style={{
              position: 'absolute',
              right: '12px',
              bottom: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              
              {/* Voice recognition microphone button */}
              <button
                onClick={handleVoiceInput}
                style={{
                  background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  border: isListening ? '1px solid #ef4444' : '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isListening ? '#f87171' : '#60a5fa',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  boxShadow: isListening ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none'
                }}
                title={lang === 'EN' ? 'Voice Input' : 'ভয়েস ইনপুট'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

              {/* Submit Button */}
              <button
                onClick={() => input.trim() && onSubmit(input.trim())}
                disabled={!input.trim()}
                style={{
                  background: input.trim() 
                    ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  color: input.trim() ? 'white' : '#475569',
                  border: 'none',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: input.trim() ? '0 4px 12px rgba(59, 130, 246, 0.35)' : 'none',
                  transition: 'all 0.25s ease',
                  outline: 'none'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>

            </div>

          </div>

          <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#475569' }}>
            {currentText.footer}
          </div>

        </div>

      </div>

    </div>
  );
}
