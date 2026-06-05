import { useState, useEffect } from 'react';
import UnderstandingScore from '../components/UnderstandingScore';
import SimulationScene from '../components/SimulationScene';
import { learningLedger } from '../ai/blockchain';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const WORLD_SUGGESTIONS = {
  EN: {
    gravity_lab: "Why does the heavy ball fall at the exact same speed as the lighter one?",
    orbit_sim: "Why doesn't the planet spiral into the sun even though gravity is pulling it?",
    wave_lab: "How do two wave peaks cancel each other out in destructive interference?",
    molecular: "Why does heating NaCl cause it to melt and separate?",
    circuit_flow: "Does current get used up as it passes through the bulb?",
    ocean: "Why does high salinity increase the buoyancy force on the diving probe?",
    quantum_slit: "What happens to the interference pattern when we turn on the observer detector?",
    relativity_run: "Why does the ship's length contract relative to the observer when speed increases?",
    maxwell_demon: "How does the demon filter sort particles to reduce entropy?",
    aerodynamics: "Why does the lift force suddenly drop when the angle of attack is too high?",
    lenzs_law: "Why does a magnet fall so much slower in a copper tube than acrylic?"
  },
  BN: {
    gravity_lab: "ভারী বলটি কেন হালকা বলটির সমান গতিতে নিচে পড়ে?",
    orbit_sim: "মহাকর্ষ বল আকর্ষণ করা সত্ত্বেও গ্রহটি কেন সূর্যের মধ্যে পড়ে যায় না?",
    wave_lab: "দুটি তরঙ্গের উপরিপাতে কীভাবে সম্পূর্ণ ধ্বংসাত্মক ব্যতিচার তৈরি হয়?",
    molecular: "তাপমাত্রা বৃদ্ধির ফলে সোডিয়াম ক্লোরাইড (NaCl) কেন গলতে শুরু করে?",
    circuit_flow: "কারেন্ট কি লাইট বাল্ব দিয়ে প্রবাহিত হওয়ার সময় কিছুটা কমে বা খরচ হয়ে যায়?",
    ocean: "লবণাক্ততা বাড়লে ডুবুরি প্রোবের ওপর প্লবতা বল কীভাবে বাড়ে?",
    quantum_slit: "ডিটেক্টর চালু করলে তরঙ্গের প্যাটার্ন কেন উধাও হয়ে যায়?",
    relativity_run: "বেগ বাড়ার সাথে সাথে গতিশীল বস্তুর দৈর্ঘ্য কীভাবে সংকুচিত হয়?",
    maxwell_demon: "ডেমন ফিল্টার কীভাবে কণা আলাদা করে এনট্রপি হ্রাস করে?",
    aerodynamics: "উইং বা ডানার আক্রমণ কোণ বেশি হলে লিফট ফোর্স কেন হঠাৎ হ্রাস পায়?",
    lenzs_law: "কপার টিউবের মধ্যে চুম্বকটি কেন এক্রিলিক টিউবের চেয়ে ধীরে পড়ে?"
  }
};

export default function SimulationScreen({ result, studentInput, onBack, lang }) {
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'mentor', text: lang === 'BN'
      ? "স্বাগতম! আমি আপনার সক্রেটিক মেন্টর। আপনি নিচের পরামর্শমূলক প্রশ্নটি পরিবর্তন করতে পারেন অথবা সরাসরি জিজ্ঞেস করতে 'জিজ্ঞেস করুন' বাটনে ক্লিক করতে পারেন।"
      : "Welcome! I am your AI Socratic Mentor. You can edit the preloaded question below and click Ask to begin your inquiry, or ask anything you wish."
    }
  ]);
  const [mentorInput, setMentorInput] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [scores, setScores] = useState(result?.understanding_scores || {});
  const [liveConfig, setLiveConfig] = useState(result?.scene_config || {});

  // Track active environment and dynamic header updates
  const [activeEnv, setActiveEnv] = useState(result?.scene_config?.environment || 'gravity_lab');

  // Preload suggested Socratic question based on environment & language
  useEffect(() => {
    const suggestions = WORLD_SUGGESTIONS[lang] || WORLD_SUGGESTIONS.EN;
    const suggestion = suggestions[activeEnv] || suggestions.gravity_lab;
    setMentorInput(suggestion);
  }, [activeEnv, lang]);

  // Dynamically set/translate the welcome Socratic suggestion when world or language toggles
  useEffect(() => {
    setMentorMessages(prev => {
      if (prev.length <= 1) {
        const suggestions = WORLD_SUGGESTIONS[lang] || WORLD_SUGGESTIONS.EN;
        const suggestion = suggestions[activeEnv] || suggestions.gravity_lab;
        const text = lang === 'BN'
          ? `স্বাগতম! এই সিমুলেশনে, জিজ্ঞেস করে দেখতে পারেন: "${suggestion}" অথবা ডানপাশের প্যানেল থেকে ভ্যারিয়েবলগুলো পরিবর্তন করুন।`
          : `Welcome! In this simulation, try asking: "${suggestion}" or adjust the variables in the panel.`;
        return [{ role: 'mentor', text }];
      }
      return prev;
    });
  }, [activeEnv, lang]);

  // Accessibility & Blockchain states
  const [isListening, setIsListening] = useState(false);
  const [showBlockchainModal, setShowBlockchainModal] = useState(false);
  const [showCertificate, setShowCertificate] = useState(null);
  const [colorblindMode, setColorblindMode] = useState(false);
  const [blocks, setBlocks] = useState([]);

  // Load ledger on mount
  useEffect(() => {
    setBlocks([...learningLedger.chain]);
  }, []);

  const refreshLedger = () => {
    setBlocks([...learningLedger.chain]);
  };

  const DEFAULT_ENV_SCORES = {
    gravity_lab: { conceptual_clarity: 35, spatial_reasoning: 60, cause_effect: 40, formula_understanding: 25 },
    orbit_sim: { conceptual_clarity: 45, spatial_reasoning: 70, cause_effect: 50, formula_understanding: 35 },
    wave_lab: { conceptual_clarity: 50, spatial_reasoning: 65, cause_effect: 48, formula_understanding: 40 },
    molecular: { conceptual_clarity: 40, spatial_reasoning: 60, cause_effect: 52, formula_understanding: 30 },
    circuit_flow: { conceptual_clarity: 55, spatial_reasoning: 75, cause_effect: 58, formula_understanding: 42 },
    ocean: { conceptual_clarity: 38, spatial_reasoning: 62, cause_effect: 44, formula_understanding: 33 },
    quantum_slit: { conceptual_clarity: 48, spatial_reasoning: 64, cause_effect: 50, formula_understanding: 38 },
    relativity_run: { conceptual_clarity: 52, spatial_reasoning: 72, cause_effect: 56, formula_understanding: 45 },
    maxwell_demon: { conceptual_clarity: 46, spatial_reasoning: 60, cause_effect: 55, formula_understanding: 35 },
    aerodynamics: { conceptual_clarity: 44, spatial_reasoning: 68, cause_effect: 52, formula_understanding: 40 },
    lenzs_law: { conceptual_clarity: 50, spatial_reasoning: 65, cause_effect: 58, formula_understanding: 42 }
  };

  // Sync scores when the active world changes
  useEffect(() => {
    if (activeEnv === result?.scene_config?.environment) {
      setScores(result?.understanding_scores || DEFAULT_ENV_SCORES[activeEnv]);
    } else {
      setScores(DEFAULT_ENV_SCORES[activeEnv]);
    }
  }, [activeEnv, result]);

  // Calculate average understanding score to trigger mastery credentials
  const avgScore = Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / 
    Math.max(1, Object.keys(scores).length)
  );

  useEffect(() => {
    if (avgScore >= 70) {
      learningLedger.addBlock({
        studentId: 'student-DIU',
        milestone: `NovaMind XR Milestone: Achieved Conceptual Mastery (Avg Cognitive Score: ${avgScore}/100)`
      });
      refreshLedger();
    }
  }, [avgScore]);

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
  }, []);

  const handleConfigChange = (newConfig) => {
    setLiveConfig(newConfig);
    // Dynamic updates to scores to simulate live progress based on modified configuration variables
    setScores(prev => {
      const next = { ...prev };
      
      // Determine what was adjusted and update the relevant index
      if (
        newConfig.gravity !== undefined || 
        newConfig.mass !== undefined || 
        newConfig.salinity !== undefined || 
        newConfig.temp !== undefined ||
        newConfig.slitWidth !== undefined ||
        newConfig.wavelength !== undefined ||
        newConfig.observer !== undefined
      ) {
        next.conceptual_clarity = Math.min(100, (prev.conceptual_clarity || 30) + 3);
      }
      if (
        newConfig.time_scale !== undefined || 
        newConfig.resistance !== undefined || 
        newConfig.current_speed !== undefined ||
        newConfig.demonSpeed !== undefined ||
        newConfig.doorOpen !== undefined ||
        newConfig.object_type !== undefined
      ) {
        next.cause_effect = Math.min(100, (prev.cause_effect || 30) + 3);
      }
      if (
        newConfig.show_orbit_paths !== undefined || 
        newConfig.speed !== undefined || 
        newConfig.show_charges !== undefined || 
        newConfig.show_force_vectors !== undefined || 
        newConfig.show_velocity_vectors !== undefined ||
        newConfig.mass_density !== undefined ||
        newConfig.magnet_strength !== undefined
      ) {
        next.spatial_reasoning = Math.min(100, (prev.spatial_reasoning || 30) + 3);
      }
      if (
        newConfig.freqA !== undefined || 
        newConfig.voltage !== undefined || 
        newConfig.depth !== undefined ||
        newConfig.angle_of_attack !== undefined ||
        newConfig.wind_speed !== undefined ||
        newConfig.air_density !== undefined ||
        newConfig.cylinder_mass !== undefined
      ) {
        next.formula_understanding = Math.min(100, (prev.formula_understanding || 30) + 3);
      }

      // Fallback to ensure continuous progression
      if (JSON.stringify(prev) === JSON.stringify(next)) {
        next.conceptual_clarity = Math.min(100, (prev.conceptual_clarity || 30) + 1);
        next.cause_effect = Math.min(100, (prev.cause_effect || 30) + 1);
      }

      return next;
    });
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
            activeEnv,
            liveConfig
          },
          lang,
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
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
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
            {(() => {
              const ENV_DETAILS = {
                gravity_lab: {
                  domain: "physics",
                  title: "Gravity Acceleration Lab",
                  description: "Analyzing the effect of mass and gravitational forces on freefall velocity."
                },
                orbit_sim: {
                  domain: "physics",
                  title: "Keplerian Orbit Simulator",
                  description: "Exploring stable orbits, centripetal gravity, and orbital velocity vectors."
                },
                wave_lab: {
                  domain: "physics",
                  title: "Wave Superposition Lab",
                  description: "Investigating frequency, amplitude, and phase shifting in constructive/destructive interference."
                },
                molecular: {
                  domain: "chemistry",
                  title: "Molecular Thermal Sandbox",
                  description: "Observing NaCl ionic crystal structures and dynamic bond-breaking under heat."
                },
                circuit_flow: {
                  domain: "eee",
                  title: "Ohm's Law Circuit Sandbox",
                  description: "Tracing current flow, bulb power consumption, and resistor back-EMF transients."
                },
                ocean: {
                  domain: "oceanography",
                  title: "Ocean Layer Diving",
                  description: "Measuring salinity, temperature, hydrostatic pressure, and Archimedes buoyancy dynamics."
                },
                quantum_slit: {
                  domain: "physics",
                  title: "Quantum Double-Slit Lab",
                  description: "Exploring wave-particle duality, wave function collapse, and quantum interference patterns."
                },
                relativity_run: {
                  domain: "physics",
                  title: "Einsteinian Relativity Sandbox",
                  description: "Analyzing length contraction, time dilation, and relativistic Doppler shifts."
                },
                maxwell_demon: {
                  domain: "physics",
                  title: "Maxwell's Demon Thermodynamics",
                  description: "Challenging entropy limits with localized micro-particle sorting and heat transfer."
                },
                aerodynamics: {
                  domain: "physics",
                  title: "Aerodynamic Wind Tunnel",
                  description: "Measuring air lift, drag coefficients, flow vector deflection, and wing stalls."
                },
                lenzs_law: {
                  domain: "physics",
                  title: "Lenz's Law Induction Lab",
                  description: "Investigating eddy currents and electromagnetic braking force profiles."
                }
              };

              const ENV_DETAILS_BN = {
                gravity_lab: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "মাধ্যাকর্ষণ ত্বরণ ল্যাব",
                  description: "পতনশীল বেগের ওপর ভর এবং মহাকর্ষীয় বলের প্রভাব বিশ্লেষণ।"
                },
                orbit_sim: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "কেপলারীয় কক্ষপথ সিমুলেটর",
                  description: "স্থিতিশীল কক্ষপথ, কেন্দ্রমুখী মহাকর্ষ এবং কক্ষীয় বেগ ভেক্টর অনুসন্ধান।"
                },
                wave_lab: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "তরঙ্গ উপরিপাত ল্যাব",
                  description: "গঠনমূলক/ধ্বংসাত্মক ব্যতিচারে কম্পাঙ্ক, বিস্তার এবং দশা পরিবর্তনের প্রভাব পর্যবেক্ষণ।"
                },
                molecular: {
                  domain: "রসায়ন",
                  title: "আণবিক তাপীয় স্যান্ডবক্স",
                  description: "তাপের প্রভাবে NaCl স্ফটিক গঠন এবং বন্ধন ভাঙার গতিশীল প্রক্রিয়া।"
                },
                circuit_flow: {
                  domain: "তড়িৎ প্রকৌশল",
                  title: "ওহমের সূত্র বর্তনী স্যান্ডবক্স",
                  description: "কারেন্ট প্রবাহ, বাল্ব বিদ্যুৎ ব্যবহার এবং রেজিস্টর ক্ষণস্থায়ী প্রতিক্রিয়া।"
                },
                ocean: {
                  domain: "মহাসাগরবিজ্ঞান",
                  title: "মহাসাগরীয় স্তর ডাইভিং",
                  description: "লবণাক্ততা, তাপমাত্রা, তরল চাপ এবং আর্কিমিডিসের প্লবতা গতিবিদ্যা পরিমাপ।"
                },
                quantum_slit: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "কোয়ান্টাম দ্বি-চিড় ল্যাব",
                  description: "তরঙ্গ-কণা দ্বৈততা এবং কণা পর্যবেক্ষণ প্রভাবের ওপর কোয়ান্টাম সুপারপজিশন অনুসন্ধান।"
                },
                relativity_run: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "আপেক্ষিকতার রেসট্র্যাক",
                  description: "আলোর কাছাকাছি বেগে দৈর্ঘ্যের সংকোচন এবং তীব্র স্থানীয় সময় প্রসারণ পরিমাপ।"
                },
                maxwell_demon: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "ম্যাক্সওয়েলের ডেমন ল্যাব",
                  description: "তাপগতিবিদ্যার দ্বিতীয় সূত্র চ্যালেঞ্জ করে কণা ফিল্টারিং এবং এনট্রপি হ্রাস পর্যবেক্ষণ।"
                },
                aerodynamics: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "বায়ুগতিবিদ্যা উইং টানেল",
                  description: "উইং প্রোফাইলের ওপর লিফট-টু-ড্র্যাগ অনুপাত এবং বায়ু প্রবাহ বিচ্ছিন্নতা বিশ্লেষণ।"
                },
                lenzs_law: {
                  domain: "পদার্থবিজ্ঞান",
                  title: "লেঞ্জের সূত্রের আবেশন ল্যাব",
                  description: "তামা, লোহা এবং এক্রিলিক টিউবে এডি কারেন্টের মাধ্যমে চৌম্বকীয় ব্রেকিং প্রভাব।"
                }
              };

              const isOriginalEnv = activeEnv === result?.scene_config?.environment;
              const activeDetails = (lang === 'BN' ? ENV_DETAILS_BN[activeEnv] : ENV_DETAILS[activeEnv]) || ENV_DETAILS[activeEnv];

              const currentHeader = isOriginalEnv ? {
                domain: result?.domain,
                title: result?.misconception_type,
                description: result?.knowledge_gap
              } : {
                domain: activeDetails?.domain,
                title: activeDetails?.title,
                description: activeDetails?.description
              };

              return (
                <div>
                  <span style={{ fontSize: '11px', color: '#60a5fa', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.1em' }}>
                    Cognitive Diagnosis: {currentHeader.domain?.toUpperCase()}
                  </span>
                  <h2 style={{ color: 'white', margin: '2px 0 0', fontSize: '20px', fontWeight: 600, textTransform: 'capitalize' }}>
                    {currentHeader.title}
                  </h2>
                  <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>
                    {currentHeader.description}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Colorblind Toggle */}
          <button
            onClick={() => setColorblindMode(!colorblindMode)}
            style={{
              background: colorblindMode ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              color: colorblindMode ? '#93c5fd' : '#94a3b8',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🎨 {colorblindMode ? 'High-Contrast ON' : 'Colorblind Mode'}
          </button>

          {/* Blockchain proofs button */}
          <button
            onClick={() => {
              refreshLedger();
              setShowBlockchainModal(true);
            }}
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              border: 'none',
              borderRadius: '20px',
              color: 'white',
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)',
              transition: 'all 0.2s'
            }}
          >
            🔗 Learning Proofs
          </button>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Active Mode</span>
            <span style={{ display: 'block', fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
              ● What-If Simulator
            </span>
          </div>
        </div>
      </div>

        {/* Grid Layout */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 340px', 
          gap: '24px'
        }}>
          {/* Left Column: 3D Scene */}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <SimulationScene 
              diagnosisConfig={result?.scene_config} 
              onConfigChange={handleConfigChange} 
              activeEnv={activeEnv}
              onEnvChange={setActiveEnv}
              colorblindMode={colorblindMode}
            />
          </div>

          {/* Right Column: Dashboard Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 }}>
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
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
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
                  padding: '10px 48px 10px 14px', // Extra right padding for microphone icon
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleMentorAsk();
                }}
              />

              {/* Voice recognition microphone button */}
              <button
                onClick={() => {
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
                    setMentorInput(prev => prev + (prev ? ' ' : '') + speechToText);
                    setIsListening(false);
                  };
                  
                  recognition.onerror = (e) => {
                    console.error("Speech recognition error:", e.error);
                    setIsListening(false);
                  };
                  
                  recognition.onspeechend = () => {
                    recognition.stop();
                    setIsListening(false);
                  };
                }}
                style={{
                  position: 'absolute',
                  right: '68px',
                  top: '7px',
                  background: isListening ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  border: 'none',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isListening ? '#f87171' : '#64748b',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                title={lang === 'EN' ? 'Voice input' : 'ভয়েস ইনপুট'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>

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

      {/* Blockchain Proofs Modal */}
      {showBlockchainModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: '#090d16',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '16px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '80%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.8)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🔗</span>
                <strong style={{ color: '#e2e8f0', fontSize: '16px' }}>LIGHTWEIGHT ACCREDITATION BLOCKCHAIN Ledger</strong>
              </div>
              <button 
                onClick={() => setShowBlockchainModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '20px', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            {/* Modal Body: Ledger entries */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.5 }}>
                Completed simulation milestones are logged as tamper-proof micro-credentials on a Daffodil student ledger blockchain.
              </div>

              {blocks.map((block, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '10px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>BLOCK #{block.index}</span>
                    <span style={{ color: '#64748b' }}>{new Date(block.timestamp).toLocaleString()}</span>
                  </div>
                  <div style={{ color: '#f8fafc', marginBottom: '8px', fontWeight: 500 }}>
                    {block.data?.milestone || JSON.stringify(block.data)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontFamily: 'monospace', fontSize: '10px', color: '#64748b' }}>
                    <div>PREV HASH: <span style={{ color: '#94a3b8' }}>{block.previousHash}</span></div>
                    <div>BLOCK HASH: <span style={{ color: '#10b981' }}>{block.hash}</span></div>
                  </div>
                  {block.index > 0 && (
                    <div style={{ marginTop: '8px', textAlign: 'right' }}>
                      <button
                        onClick={() => setShowCertificate(block)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid #10b981',
                          color: '#34d399',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 600
                        }}
                      >
                        👁️ View Proof Certificate
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Learning Certificate Modal */}
      {showCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: 'radial-gradient(circle at center, #0d1527 0%, #030712 100%)',
            border: '3px double #10b981',
            borderRadius: '20px',
            width: '540px',
            padding: '36px',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.25)',
            textAlign: 'center',
            position: 'relative',
            color: 'white'
          }}>
            {/* Seal background effect */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '48px', opacity: 0.15 }}>🛡️</div>
            
            {/* Close button */}
            <button 
              onClick={() => setShowCertificate(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer' }}
            >
              &times;
            </button>

            {/* Certificate Content */}
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>
              DAFFODIL INTERNATIONAL UNIVERSITY
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '14px', fontFamily: 'serif' }}>
              Learning Proof Accreditation
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid rgba(16, 185, 129, 0.2)', width: '60%', margin: '0 auto 20px' }} />
            
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
              This verifiable credential certifies that
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '12px' }}>
              DIU STUDENT (ANONYMOUS-LEDGER)
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
              has successfully achieved the experiential learning milestone:
            </div>
            <div style={{
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px dashed rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#34d399',
              lineHeight: 1.45,
              marginBottom: '20px',
              maxWidth: '85%',
              margin: '0 auto 20px'
            }}>
              {showCertificate.data?.milestone}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', marginTop: '24px', textAlign: 'left' }}>
              <div>
                <div>Accreditation Authority: <strong>NovaMind XR Engine</strong></div>
                <div>Issued On: {new Date(showCertificate.timestamp).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#10b981', fontWeight: 'bold' }}>✓ LEDGER VERIFIED</div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px' }}>HASH: {showCertificate.hash}</div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
