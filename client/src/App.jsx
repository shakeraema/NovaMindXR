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

  const handleSubmit = (input) => {
    setStudentInput(input);
    const result = getMockDiagnosisForInput(input);
    setDiagnosisResult(result);
    setScreen('simulation');
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

  // Render the screens
  return (
    <InputScreen 
      onSubmit={handleSubmit} 
      lang={lang}
      onLangToggle={handleLangToggle}
      onFacultyClick={() => setScreen('faculty')}
    />
  );
}

function getMockDiagnosisForInput(input) {
  const text = (input || "").toLowerCase();
  
  if (text.includes("moon") || text.includes("orbit") || text.includes("planet") || text.includes("kepler") || text.includes("পৃথিবীতে") || text.includes("orbit_sim")) {
    return {
      misconception_type: "orbital decay misunderstanding",
      knowledge_gap: "Student assumes orbit requires constant forward thrust instead of centripetal force gravity balance",
      domain: "physics",
      scene_config: { 
        environment: "orbit_sim", 
        orbital_speed_mult: 1.0, 
        sun_mass: 1.0, 
        show_velocity_vectors: true, 
        show_gravity_vectors: true,
        show_orbit_paths: true
      },
      mentor_opening: "Welcome to the Keplerian Orbit Simulator. Try asking: 'What happens if we reduce the orbital speed?' or adjust the sliders to begin exploring.",
      understanding_scores: { 
        conceptual_clarity: 45, 
        spatial_reasoning: 70, 
        cause_effect: 50, 
        formula_understanding: 35 
      }
    };
  }
  
  if (text.includes("wave") || text.includes("interference") || text.includes("resonance") || text.includes("তরঙ্গ") || text.includes("wave_lab")) {
    return {
      misconception_type: "wave superposition confusion",
      knowledge_gap: "Student struggles to visualize how out-of-phase wave components produce destructive interference",
      domain: "eee",
      scene_config: { 
        environment: "wave_lab", 
        freqA: 1.5, 
        ampA: 0.8, 
        freqB: 1.5, 
        ampB: 0.8, 
        phaseB: 0,
        speed: 1.0,
        time_scale: 1.0 
      },
      mentor_opening: "Welcome to the Wave Superposition Lab. Try asking: 'How does phase shifting A and B cancel them out?' or adjust the sliders to begin exploring.",
      understanding_scores: { 
        conceptual_clarity: 50, 
        spatial_reasoning: 65, 
        cause_effect: 48, 
        formula_understanding: 40 
      }
    };
  }
  
  if (text.includes("salt") || text.includes("dissolve") || text.includes("molecular") || text.includes("atom") || text.includes("bond") || text.includes("লবণ") || text.includes("molecular")) {
    return {
      misconception_type: "thermal ionic dissociation",
      knowledge_gap: "Student confuses boiling and chemical decomposition, assuming heating NaCl splits it into sodium metal",
      domain: "chemistry",
      scene_config: { 
        environment: "molecular", 
        temp: 25, 
        zoom: 1.0, 
        show_charges: true, 
        show_bond_energy: false 
      },
      mentor_opening: "Welcome to the Molecular Thermal Sandbox. Try asking: 'Why does heating split the crystal lattice but not bonds?' or adjust the sliders to begin exploring.",
      understanding_scores: { 
        conceptual_clarity: 40, 
        spatial_reasoning: 60, 
        cause_effect: 52, 
        formula_understanding: 30 
      }
    };
  }
  
  if (text.includes("voltage") || text.includes("current") || text.includes("circuit") || text.includes("ohm") || text.includes("resistor") || text.includes("ভোল্টেজ") || text.includes("circuit_flow")) {
    return {
      misconception_type: "current loop conservation",
      knowledge_gap: "Student believes current is consumed by the light bulb, leaving less current returning to the battery",
      domain: "eee",
      scene_config: { 
        environment: "circuit_flow", 
        voltage: 9.0, 
        resistance: 10.0 
      },
      mentor_opening: "Welcome to the Ohm's Law Circuit Sandbox. Try asking: 'Is current consumed by the bulb in the loop?' or adjust the sliders to begin exploring.",
      understanding_scores: { 
        conceptual_clarity: 55, 
        spatial_reasoning: 75, 
        cause_effect: 58, 
        formula_understanding: 42 
      }
    };
  }

  if (text.includes("quantum") || text.includes("double slit") || text.includes("observer") || text.includes("slit") || text.includes("দ্বি-চিড়") || text.includes("quantum_slit")) {
    return {
      misconception_type: "quantum wave function collapse",
      knowledge_gap: "Student assumes quantum particles behave like classical billiard balls even without measurement observation",
      domain: "physics",
      scene_config: {
        environment: "quantum_slit",
        slitWidth: 0.3,
        wavelength: 0.5,
        observer: false
      },
      mentor_opening: "Welcome to the Quantum Double-Slit Lab. Try asking: 'Why does the observer collapse the wave pattern?' or adjust the sliders to begin exploring.",
      understanding_scores: {
        conceptual_clarity: 48,
        spatial_reasoning: 64,
        cause_effect: 50,
        formula_understanding: 38
      }
    };
  }

  if (text.includes("relativity") || text.includes("einstein") || text.includes("light speed") || text.includes("contraction") || text.includes("dilation") || text.includes("আপেক্ষিক") || text.includes("relativity_run")) {
    return {
      misconception_type: "special relativistic space-time distortion",
      knowledge_gap: "Student assumes time and space dimensions remain absolute and constant regardless of relative observer velocity",
      domain: "physics",
      scene_config: {
        environment: "relativity_run",
        speed: 0.6,
        mass_density: 1.0
      },
      mentor_opening: "Welcome to the Einsteinian Relativity Sandbox. Try asking: 'Does traveling near light speed slow down ship time?' or adjust the sliders to begin exploring.",
      understanding_scores: {
        conceptual_clarity: 52,
        spatial_reasoning: 72,
        cause_effect: 56,
        formula_understanding: 45
      }
    };
  }

  if (text.includes("entropy") || text.includes("demon") || text.includes("thermo") || text.includes("sorting") || text.includes("ম্যাক্সওয়েল") || text.includes("এনট্রপি") || text.includes("maxwell_demon")) {
    return {
      misconception_type: "thermodynamic entropy limits",
      knowledge_gap: "Student assumes thermal heat can flow spontaneously from cold to hot chambers without external work or sorting mechanisms",
      domain: "physics",
      scene_config: {
        environment: "maxwell_demon",
        demonSpeed: 1.5,
        doorWidth: 0.6,
        particleSpeed: 1.0,
        doorOpen: false
      },
      mentor_opening: "Welcome to the Maxwell's Demon Sandbox. Try asking: 'How does sorting particles violate entropy?' or adjust the sliders to begin exploring.",
      understanding_scores: {
        conceptual_clarity: 46,
        spatial_reasoning: 60,
        cause_effect: 55,
        formula_understanding: 35
      }
    };
  }

  if (text.includes("wing") || text.includes("airfoil") || text.includes("slit") || text.includes("drag") || text.includes("aerodynamic") || text.includes("উইং") || text.includes("aerodynamics")) {
    return {
      misconception_type: "aerodynamic lift generation and stall",
      knowledge_gap: "Student believes lift continues to increase linearly with angle of attack without ever triggering flow stall/separation",
      domain: "physics",
      scene_config: {
        environment: "aerodynamics",
        angle_of_attack: 6,
        wind_speed: 15,
        air_density: 1.2
      },
      mentor_opening: "Welcome to the Aerodynamic Wind Tunnel. Try asking: 'Why does high angle of attack cause aerodynamic stall?' or adjust the sliders to begin exploring.",
      understanding_scores: {
        conceptual_clarity: 44,
        spatial_reasoning: 68,
        cause_effect: 52,
        formula_understanding: 40
      }
    };
  }

  if (text.includes("lenz") || text.includes("eddy") || text.includes("induction") || text.includes("tube") || text.includes("magnet braking") || text.includes("লেঞ্জ") || text.includes("আবেশন") || text.includes("lenzs_law")) {
    return {
      misconception_type: "electromagnetic induction and back-EMF",
      knowledge_gap: "Student assumes falling magnets induce eddy currents that accelerate the descent instead of opposing the magnetic flux changes",
      domain: "physics",
      scene_config: {
        environment: "lenzs_law",
        object_type: "magnetic",
        magnet_strength: 3.0,
        cylinder_mass: 1.0
      },
      mentor_opening: "Welcome to the Lenz's Law Induction Lab. Try asking: 'How does induction current slow the falling magnet?' or adjust the sliders to begin exploring.",
      understanding_scores: {
        conceptual_clarity: 50,
        spatial_reasoning: 65,
        cause_effect: 58,
        formula_understanding: 42
      }
    };
  }
  
  if (text.includes("buoyancy") || text.includes("salinity") || text.includes("ocean") || text.includes("sink") || text.includes("float") || text.includes("dive") || text.includes("archimedes") || text.includes("পানির") || text.includes("ocean")) {
    return {
      misconception_type: "buoyancy and fluid density",
      knowledge_gap: "Student assumes salinity only increases fluid drag instead of scaling Archimedes upward forces",
      domain: "oceanography",
      scene_config: { 
        environment: "ocean", 
        depth: 150, 
        salinity: 35, 
        temp: 12, 
        probe_mass: 1025, 
        current_speed: 1.5 
      },
      mentor_opening: "Welcome to the Ocean Layer Diving Lab. Try asking: 'Why does salinity increase buoyancy force?' or adjust the sliders to begin exploring.",
      understanding_scores: { 
        conceptual_clarity: 38, 
        spatial_reasoning: 62, 
        cause_effect: 44, 
        formula_understanding: 33 
      }
    };
  }

  // Default: Gravity Lab
  return {
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
    mentor_opening: "Welcome to the Gravity Acceleration Lab. Try asking: 'If we double the mass of the ball, does it fall faster?' or adjust the sliders to begin exploring.",
    understanding_scores: { 
      conceptual_clarity: 35, 
      spatial_reasoning: 60, 
      cause_effect: 40, 
      formula_understanding: 25 
    }
  };
}
