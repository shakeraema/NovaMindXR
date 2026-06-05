const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');

const SYSTEM_PROMPT = `You are a science misconception classifier for university students.
Given a student's confusion statement, return ONLY valid JSON with these exact fields:
{
  "misconception_type": "string",
  "knowledge_gap": "string",
  "domain": "physics | chemistry | eee | oceanography",
  "confidence": 0.0-1.0,
  "scene_config": {
    "environment": "gravity_lab | orbit_sim | wave_lab | molecular | circuit_flow | ocean | quantum_slit | relativity_run | maxwell_demon | aerodynamics | lenzs_law",
    "gravity": 9.8,
    "mass": 5.0,
    "time_scale": 1.0,
    "show_force_vectors": true,
    "initial_velocity": 0,
    "highlight_concept": "string"
  },
  "mentor_opening": "string",
  "understanding_scores": {
    "conceptual_clarity": 0-100,
    "spatial_reasoning": 0-100,
    "cause_effect": 0-100,
    "formula_understanding": 0-100
  }
}
Return ONLY the JSON. No markdown, no explanation.`;

function getMockDiagnosisForInput(input) {
  const text = (input || "").toLowerCase();
  
  if (text.includes("moon") || text.includes("orbit") || text.includes("planet") || text.includes("kepler") || text.includes("পৃথিবীতে")) {
    return {
      misconception_type: "orbital decay misunderstanding",
      knowledge_gap: "Student assumes orbit requires constant forward thrust instead of centripetal force gravity balance",
      domain: "physics",
      confidence: 0.95,
      scene_config: { 
        environment: "orbit_sim", 
        orbital_speed_mult: 1.0, 
        sun_mass: 1.0, 
        show_velocity_vectors: true, 
        show_gravity_vectors: true,
        show_orbit_paths: true
      },
      mentor_opening: "How does changing the Sun's mass affect the planet's orbital trajectory? Try adjusting it now.",
      understanding_scores: { 
        conceptual_clarity: 45, 
        spatial_reasoning: 70, 
        cause_effect: 50, 
        formula_understanding: 35 
      }
    };
  }
  
  if (text.includes("wave") || text.includes("interference") || text.includes("resonance") || text.includes("তরঙ্গ")) {
    return {
      misconception_type: "wave superposition confusion",
      knowledge_gap: "Student struggles to visualize how out-of-phase wave components produce destructive interference",
      domain: "eee",
      confidence: 0.95,
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
      mentor_opening: "What phase difference is required to achieve complete destructive wave cancellation? Let's check.",
      understanding_scores: { 
        conceptual_clarity: 50, 
        spatial_reasoning: 65, 
        cause_effect: 48, 
        formula_understanding: 40 
      }
    };
  }
  
  if (text.includes("salt") || text.includes("dissolve") || text.includes("molecular") || text.includes("atom") || text.includes("bond") || text.includes("লবণ")) {
    return {
      misconception_type: "thermal ionic dissociation",
      knowledge_gap: "Student confuses boiling and chemical decomposition, assuming heating NaCl splits it into sodium metal",
      domain: "chemistry",
      confidence: 0.95,
      scene_config: { 
        environment: "molecular", 
        temp: 25, 
        zoom: 1.0, 
        show_charges: true, 
        show_bond_energy: false 
      },
      mentor_opening: "Try raising the temperature slider above 100°C. What happens to the crystal structure?",
      understanding_scores: { 
        conceptual_clarity: 40, 
        spatial_reasoning: 60, 
        cause_effect: 52, 
        formula_understanding: 30 
      }
    };
  }
  
  if (text.includes("voltage") || text.includes("current") || text.includes("circuit") || text.includes("ohm") || text.includes("resistor") || text.includes("ভোল্টেজ")) {
    return {
      misconception_type: "current loop conservation",
      knowledge_gap: "Student believes current is consumed by the light bulb, leaving less current returning to the battery",
      domain: "eee",
      confidence: 0.95,
      scene_config: { 
        environment: "circuit_flow", 
        voltage: 9.0, 
        resistance: 10.0 
      },
      mentor_opening: "Compare the speed of electron flow before and after passing the light bulb resistor. What do you see?",
      understanding_scores: { 
        conceptual_clarity: 55, 
        spatial_reasoning: 75, 
        cause_effect: 58, 
        formula_understanding: 42 
      }
    };
  }

  if (text.includes("quantum") || text.includes("double slit") || text.includes("observer") || text.includes("slit") || text.includes("দ্বি-চিড়")) {
    return {
      misconception_type: "quantum wave function collapse",
      knowledge_gap: "Student assumes quantum particles behave like classical billiard balls even without measurement observation",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "quantum_slit",
        slitWidth: 0.3,
        wavelength: 0.5,
        observer: false
      },
      mentor_opening: "Observe what happens to the particle pattern when you turn the Detector/Observer ON vs OFF. What changes?",
      understanding_scores: {
        conceptual_clarity: 48,
        spatial_reasoning: 64,
        cause_effect: 50,
        formula_understanding: 38
      }
    };
  }

  if (text.includes("relativity") || text.includes("einstein") || text.includes("light speed") || text.includes("contraction") || text.includes("dilation") || text.includes("আপেক্ষিক")) {
    return {
      misconception_type: "special relativistic space-time distortion",
      knowledge_gap: "Student assumes time and space dimensions remain absolute and constant regardless of relative observer velocity",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "relativity_run",
        speed: 0.6,
        mass_density: 1.0
      },
      mentor_opening: "Drag the speed slider up to 99% light speed. What happens to the ship's length and onboard clock rate?",
      understanding_scores: {
        conceptual_clarity: 52,
        spatial_reasoning: 72,
        cause_effect: 56,
        formula_understanding: 45
      }
    };
  }

  if (text.includes("entropy") || text.includes("demon") || text.includes("thermo") || text.includes("sorting") || text.includes("ম্যাক্সওয়েল") || text.includes("এনট্রপি")) {
    return {
      misconception_type: "thermodynamic entropy limits",
      knowledge_gap: "Student assumes thermal heat can flow spontaneously from cold to hot chambers without external work or sorting mechanisms",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "maxwell_demon",
        demonSpeed: 1.5,
        doorWidth: 0.6,
        particleSpeed: 1.0,
        doorOpen: false
      },
      mentor_opening: "Try turning the Demon filter ON to sort hot and cold particles. How does this affect the temperature gradient and total entropy?",
      understanding_scores: {
        conceptual_clarity: 46,
        spatial_reasoning: 60,
        cause_effect: 55,
        formula_understanding: 35
      }
    };
  }

  if (text.includes("wing") || text.includes("airfoil") || text.includes("lift") || text.includes("drag") || text.includes("aerodynamic") || text.includes("উইং")) {
    return {
      misconception_type: "aerodynamic lift generation and stall",
      knowledge_gap: "Student believes lift continues to increase linearly with angle of attack without ever triggering flow stall/separation",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "aerodynamics",
        angle_of_attack: 6,
        wind_speed: 15,
        air_density: 1.2
      },
      mentor_opening: "Slowly increase the angle of attack above 18 degrees. What happens to the airflow particles above the wing and the lift force?",
      understanding_scores: {
        conceptual_clarity: 44,
        spatial_reasoning: 68,
        cause_effect: 52,
        formula_understanding: 40
      }
    };
  }

  if (text.includes("lenz") || text.includes("eddy") || text.includes("induction") || text.includes("tube") || text.includes("magnet braking") || text.includes("লেঞ্জ") || text.includes("আবেশন")) {
    return {
      misconception_type: "electromagnetic induction and back-EMF",
      knowledge_gap: "Student assumes falling magnets induce eddy currents that accelerate the descent instead of opposing the magnetic flux changes",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "lenzs_law",
        object_type: "magnetic",
        magnet_strength: 3.0,
        cylinder_mass: 1.0
      },
      mentor_opening: "Click 'Drop Cylinders' and watch them fall. Why does the magnet fall so much slower in the Copper tube compared to the Acrylic tube?",
      understanding_scores: {
        conceptual_clarity: 50,
        spatial_reasoning: 65,
        cause_effect: 58,
        formula_understanding: 42
      }
    };
  }

  if (text.includes("buoyancy") || text.includes("salinity") || text.includes("ocean") || text.includes("sink") || text.includes("float") || text.includes("dive") || text.includes("archimedes") || text.includes("পানির")) {
    return {
      misconception_type: "buoyancy and fluid density",
      knowledge_gap: "Student assumes salinity only increases fluid drag instead of scaling Archimedes upward forces",
      domain: "oceanography",
      confidence: 0.95,
      scene_config: { 
        environment: "ocean", 
        depth: 150, 
        salinity: 35, 
        temp: 12, 
        probe_mass: 1025, 
        current_speed: 1.5 
      },
      mentor_opening: "Try adjusting the salinity slider. How does it alter the net buoyancy force vectors $F_b$ and $F_g$?",
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
    confidence: 0.95,
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
}

router.post('/diagnose', async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'Input required' });

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (geminiApiKey && !geminiApiKey.includes('your_key_here')) {
    try {
      console.log("Using Gemini API for Diagnosis");
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: [
            { role: 'user', parts: [{ text: input }] }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText.trim());
      return res.json(parsed);
    } catch (err) {
      console.error('Gemini diagnose error, trying fallback:', err);
    }
  }

  if (anthropicApiKey && !anthropicApiKey.includes('your_key_here')) {
    try {
      console.log("Using Anthropic API for Diagnosis");
      const client = new Anthropic({ apiKey: anthropicApiKey });
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: input }]
      });

      const raw = message.content[0].text;
      const parsed = JSON.parse(raw.trim());
      return res.json(parsed);
    } catch (err) {
      console.error('Anthropic diagnose error, falling back to mock data:', err);
    }
  }

  console.log("Using Mock Diagnosis (No API keys configured or active)");
  const mockRes = getMockDiagnosisForInput(input);
  return res.json({
    ...mockRes,
    _debug_info: "Mock response generated because no API keys were configured or both failed."
  });
});

module.exports = router;
