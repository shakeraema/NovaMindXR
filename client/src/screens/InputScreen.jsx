import { useState, useRef, useEffect } from 'react';

export default function InputScreen({ onSubmit, lang, onLangToggle, onFacultyClick }) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showExploreMenu, setShowExploreMenu] = useState(false);
  const exploreMenuRef = useRef(null);

  const worldsInfo = {
    EN: [
      { id: "gravity_lab", name: "Gravity Lab", icon: "🌍", text: "Why don't heavier objects fall faster than feathers in a vacuum?" },
      { id: "orbit_sim", name: "Keplerian Orbit", icon: "🪐", text: "Why doesn't the Moon fall down to Earth if gravity pulls it?" },
      { id: "wave_lab", name: "Wave Superposition", icon: "〰", text: "How can two waves cancel each other out to create silence?" },
      { id: "molecular", name: "Molecular Sandbox", icon: "⚛", text: "Why does heating salt make it dissolve, but it doesn't split chemical bonds?" },
      { id: "circuit_flow", name: "Ohm's Law Circuit", icon: "⚡", text: "Is current consumed by a bulb, or is it conserved in a circuit loop?" },
      { id: "ocean", name: "Ocean Diving", icon: "🌊", text: "Why does salinity make objects float higher?" },
      { id: "quantum_slit", name: "Quantum Double-Slit", icon: "🔬", text: "Why does observing a quantum particle collapse its wave function?" },
      { id: "relativity_run", name: "Relativity Racetrack", icon: "🚀", text: "Does traveling near the speed of light actually make time slow down?" },
      { id: "maxwell_demon", name: "Maxwell's Demon", icon: "😈", text: "Can a microscopic sorting demon violate the second law of thermodynamics?" },
      { id: "aerodynamics", name: "Aerodynamic Wing", icon: "✈", text: "Why does a plane lose lift and stall when the angle of attack is too high?" },
      { id: "lenzs_law", name: "Lenz's Law Induction", icon: "🧲", text: "How does a falling magnet induce currents that slow its own descent?" }
    ],
    BN: [
      { id: "gravity_lab", name: "মাধ্যাকর্ষণ ল্যাব", icon: "🌍", text: "কেন ভারী বস্তু পালকের চেয়ে দ্রুত পড়ে না মহাশূন্যে?" },
      { id: "orbit_sim", name: "কেপলারীয় কক্ষপথ", icon: "🪐", text: "চাঁদ কেন পৃথিবীতে আছড়ে পড়ে না মাধ্যাকর্ষণের টানেও?" },
      { id: "wave_lab", name: "তরঙ্গ ব্যতিচার", icon: "〰", text: "দুটি তরঙ্গ কীভাবে একে অপরকে বাতিল করে নীরবতা সৃষ্টি করে?" },
      { id: "molecular", name: "আণবিক স্যান্ডবক্স", icon: "⚛", text: "তাপ দিলে লবণ কেন দ্রবীভূত হয় কিন্তু রাসায়নিক বন্ধন ভাঙে না?" },
      { id: "circuit_flow", name: "বর্তনী প্রবাহ", icon: "⚡", text: "কারেন্ট কি বাল্ব দ্বারা গ্রাস হয়ে যায় নাকি সংরক্ষিত থাকে?" },
      { id: "ocean", name: "মহাসাগর ডাইভিং", icon: "🌊", text: "লবণাক্ততা বৃদ্ধি পেলে বস্তু কেন বেশি ভেসে থাকে?" },
      { id: "quantum_slit", name: "কোয়ান্টাম দ্বি-চিড়", icon: "🔬", text: "কোয়ান্টাম কণা পর্যবেক্ষণ করলে এর তরঙ্গ ফাংশন কেন ভেঙে যায়?" },
      { id: "relativity_run", name: "আপেক্ষিকতার রেসট্র্যাক", icon: "🚀", text: "আলোর কাছাকাছি বেগে ভ্রমণ করলে কি সময় সত্যিই ধীর হয়ে যায়?" },
      { id: "maxwell_demon", name: "ম্যাক্সওয়েলের ডেমন", icon: "😈", text: "একটি অণুবীক্ষণিক কণা ছাঁটাইকারী কি তাপগতিবিদ্যার সূত্র লঙ্ঘন করতে পারে?" },
      { id: "aerodynamics", name: "উইং টানেল", icon: "✈", text: "উইংসের কোণ বেশি বাড়ালে কেন প্লেন তার লিফট হারিয়ে ফেলে?" },
      { id: "lenzs_law", name: "লেঞ্জের সূত্র আবেশন", icon: "🧲", text: "পতনশীল চুম্বক কীভাবে আবেশন সৃষ্টি করে নিজের গতি ধীর করে?" }
    ]
  };

  const texts = {
    EN: {
      title: "NovaMind XR",
      subtitle: "AI-Powered Scientific Concept Diagnostic Sandbox",
      welcomeTitle: "What scientific concept is confusing you today?",
      welcomeSub: "Select a card below to immediately jump into a simulation, or ask a custom question to generate a targeted interactive 3D learning world.",
      placeholder: "Ask about a scientific misconception... (e.g. Why does a heavy object fall at the same speed as a feather in a vacuum?)",
      footer: "Direct client diagnosis · Daffodil International University Lightweight Blockchain Credentials",
      btnExplore: "🧭 Explore Worlds",
      btnFaculty: "📊 Faculty Dashboard",
      labelSuggested: "Suggested Scientific Inquiries"
    },
    BN: {
      title: "নোভামাইন্ড এক্সআর",
      subtitle: "এআই-চালিত বৈজ্ঞানিক ধারণা অনুসন্ধান স্যান্ডবক্স",
      welcomeTitle: "কোন বৈজ্ঞানিক ধারণাটি আপনাকে দ্বিধান্বিত করছে?",
      welcomeSub: "সরাসরি সিমুলেশনে প্রবেশ করতে নিচের কার্ডগুলোতে ক্লিক করুন, অথবা থ্রিডি লার্নিং ওয়ার্ল্ড তৈরি করতে আপনার নিজস্ব প্রশ্ন নিচে জিজ্ঞেস করুন।",
      placeholder: "বৈজ্ঞানিক ভুল ধারণা সম্পর্কে জিজ্ঞেস করুন... (যেমনঃ মহাশূন্যে পালক ও লোহার বল কেন একই গতিতে পড়ে?)",
      footer: "সরাসরি ক্লায়েন্ট ডায়াগনোসিস · ড্যাফোডিল ইন্টারন্যাশনাল ইউনিভার্সিটি লাইটওয়েট ব্লকচেইনের প্রমাণপত্র",
      btnExplore: "🧭 এক্সপ্লোর ওয়ার্ল্ডস",
      btnFaculty: "📊 ফ্যাকাল্টি ড্যাশবোর্ড",
      labelSuggested: "প্রস্তাবিত বৈজ্ঞানিক অনুসন্ধানসমূহ"
    }
  };

  const t = texts[lang];

  // Close explore menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(event.target)) {
        setShowExploreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      background: '#030308',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #030308;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.25);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.45);
        }
      `}</style>
      
      {/* Top Header Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 36px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
        background: '#060613',
        flexShrink: 0
      }}>
        {/* Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '15px', letterSpacing: '-0.01em' }}>
              {t.title}
            </span>
            <span style={{ color: '#64748b', fontSize: '9px', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Daffodil International University
            </span>
          </div>
        </div>

        {/* Action Header controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onFacultyClick}
            style={{
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '20px',
              color: '#a5b4fc',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
          >
            {t.btnFaculty}
          </button>

          <button 
            onClick={onLangToggle}
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: '20px',
              color: '#60a5fa',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.12)'}
          >
            {lang === 'EN' ? 'বাংলা' : 'English'}
          </button>
        </div>
      </div>

      {/* Main Centered Claude-Like Landing Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 24px 8px 24px',
        maxWidth: '960px',
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box'
      }}>
        
        {/* Welcome Headline */}
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 800,
            margin: '0 0 4px 0',
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {t.welcomeTitle}
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '12.5px', lineHeight: 1.5, margin: 0, maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto' }}>
            {t.welcomeSub}
          </p>
        </div>

        {/* Central Chat Input Field Box (Similar to Claude Chat box) */}
        <div style={{
          width: '100%',
          maxWidth: '780px',
          position: 'relative',
          marginBottom: '16px'
        }}>
          
          <div style={{
            position: 'relative',
            background: '#090918',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(59, 130, 246, 0.05)',
            padding: '12px 14px',
            boxSizing: 'border-box',
            transition: 'border-color 0.2s, box-shadow 0.2s'
          }}
          onFocusCapture={e => {
            e.currentTarget.style.borderColor = '#60a5fa';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(59, 130, 246, 0.18)';
          }}
          onBlurCapture={e => {
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(59, 130, 246, 0.05)';
          }}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t.placeholder}
              style={{
                width: '100%',
                minHeight: '60px',
                background: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '14.5px',
                padding: '2px 4px',
                resize: 'none',
                boxSizing: 'border-box',
                outline: 'none',
                fontFamily: 'sans-serif',
                lineHeight: 1.5
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  onSubmit(input.trim());
                }
              }}
            />

            {/* Actions Panel nested inside the bottom row of input box */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.02)',
              paddingTop: '8px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              
              {/* Left Side: Explore Worlds dropdown trigger */}
              <div style={{ position: 'relative' }} ref={exploreMenuRef}>
                <button
                  onClick={() => setShowExploreMenu(!showExploreMenu)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    borderRadius: '8px',
                    color: '#60a5fa',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'}
                >
                  {t.btnExplore}
                  <span style={{ fontSize: '10px' }}>{showExploreMenu ? '▲' : '▼'}</span>
                </button>

                {/* Explore Dropdown Overlay */}
                {showExploreMenu && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: 0,
                    background: '#080816',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
                    width: '240px',
                    zIndex: 200,
                    maxHeight: '320px',
                    overflowY: 'auto',
                    padding: '6px'
                  }}>
                    {worldsInfo[lang].map(world => (
                      <button
                        key={world.id}
                        onClick={() => {
                          setShowExploreMenu(false);
                          onSubmit(world.id);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          color: '#cbd5e1',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#cbd5e1';
                        }}
                      >
                        <span style={{ fontSize: '15px' }}>{world.icon}</span>
                        <span style={{ fontWeight: 600 }}>{world.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Voice dictation + Send */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleVoiceInput}
                  style={{
                    background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isListening ? '#f87171' : '#64748b',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  title={lang === 'EN' ? 'Voice input' : 'ভয়েস ইনপুট'}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>

                <button
                  onClick={() => input.trim() && onSubmit(input.trim())}
                  disabled={!input.trim()}
                  style={{
                    background: input.trim() 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    color: input.trim() ? 'white' : '#475569',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: input.trim() ? '0 4px 10px rgba(59, 130, 246, 0.3)' : 'none',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Misconception Grid Header label */}
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#64748b' }}>
            {t.labelSuggested}
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.02)' }} />
        </div>

        {/* 11 Example cards grid representing each world */}
        <div style={{
          width: '100%',
          maxWidth: '780px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px',
          marginBottom: '16px'
        }}>
          {worldsInfo[lang].map(world => (
            <div
              key={world.id}
              onClick={() => onSubmit(world.text)}
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid rgba(59, 130, 246, 0.08)',
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.08)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px' }}>{world.icon}</span>
                <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {world.name}
                </span>
              </div>
              <p style={{ 
                color: '#94a3b8', 
                fontSize: '11.5px', 
                margin: 0, 
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {world.text}
              </p>
            </div>
          ))}
        </div>

        {/* Footnote Branding */}
        <div style={{ textAlign: 'center', fontSize: '10.5px', color: '#475569' }}>
          {t.footer}
        </div>

      </div>

    </div>
  );
}
