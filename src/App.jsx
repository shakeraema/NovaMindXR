import { useState } from 'react';
import InputScreen from './screens/InputScreen';
import LoadingScreen from './screens/LoadingScreen';
import SimulationScreen from './screens/SimulationScreen';
import FacultyScreen from './screens/FacultyScreen';
import { diagnoseConfusion } from './ai/diagnosisService';

export default function App() {
  const [screen, setScreen] = useState('input'); // 'input' | 'loading' | 'simulation' | 'faculty'
  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [studentInput, setStudentInput] = useState('');
  const [lang, setLang] = useState('EN'); // 'EN' | 'BN'

  const handleLangToggle = () => {
    setLang(l => l === 'EN' ? 'BN' : 'EN');
  };

  const handleSubmit = async (input) => {
    setStudentInput(input);
    setScreen('loading');
    
    try {
      // Trigger the real Claude API diagnosis via local server
      const result = await diagnoseConfusion(input);
      
      if (!result || !result.scene_config) {
        throw new Error('Invalid diagnosis schema returned');
      }
      
      setDiagnosisResult(result);
      setScreen('simulation');
    } catch (err) {
      console.warn('Diagnosis failed, falling back to mock data:', err);
      // Ensure the app remains robust and functional during local demo if API fails
      setDiagnosisResult(MOCK_DIAGNOSIS);
      setScreen('simulation');
    }
  };

  if (screen === 'loading') {
    return <LoadingScreen lang={lang} />;
  }

  if (screen === 'simulation') {
    return (
      <SimulationScreen
        result={diagnosisResult}
        studentInput={studentInput}
        onBack={() => setScreen('input')}
        lang={lang}
      />
    );
  }

  if (screen === 'faculty') {
    return (
      <FacultyScreen
        onBack={() => setScreen('input')}
        lang={lang}
      />
    );
  }

  // Inject a small router navigation helper to go to Faculty screen
  return (
    <div style={{ position: 'relative' }}>
      {/* Onboarding View button */}
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <button
          onClick={() => setScreen('faculty')}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            color: '#94a3b8',
            padding: '6px 16px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = '#cbd5e1';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          {lang === 'EN' ? 'Faculty Analytics' : 'ফ্যাকাল্টি পোর্টাল'}
        </button>
      </div>
      
      <InputScreen 
        onSubmit={handleSubmit} 
        lang={lang}
        onLangToggle={handleLangToggle}
      />
    </div>
  );
}

const MOCK_DIAGNOSIS = {
  misconception_type: "conflation of mass and weight",
  knowledge_gap: "Student conflates gravity acceleration with object mass",
  domain: "physics",
  scene_config: { 
    environment: "gravity_lab", 
    gravity: 9.8, 
    mass: 5.0, 
    show_force_vectors: true, 
    time_scale: 1.0 
  },
  mentor_opening: "If you doubled the mass of this ball, what do you think would happen to how fast it falls?",
  understanding_scores: { 
    conceptual_clarity: 35, 
    spatial_reasoning: 60, 
    cause_effect: 40, 
    formula_understanding: 25 
  }
};
