const router = require('express').Router();
const Anthropic = require('@anthropic-ai/sdk');

function getSocraticSystemPrompt(context, lang) {
  const { misconceptionType, domain, activeEnv, liveConfig = {} } = context || {};
  
  let prompt = `You are a Socratic mentor inside NovaMind XR, an AI-powered 3D and WebXR educational physics laboratory.
Your goal is to guide students to resolve their science misconceptions by asking ONE short, clear, Socratic question (max 2 sentences).
NEVER give the answer directly.
Guide the student to look at the visual elements in the simulation, adjust the sliders, and notice the relationship between cause and effect.

Student's Active Environment: ${activeEnv || 'gravity_lab'}
Domain: ${domain || 'physics'}
Misconception Type: ${misconceptionType || 'conflation of mass and weight'}
Current Sliders/State values: ${JSON.stringify(liveConfig)}

`;

  if (activeEnv === 'gravity_lab') {
    prompt += `Specific Context for Gravity Lab:
- The student is exploring freefall acceleration.
- Sliders: gravity (m/s²), mass (kg).
- Visuals: Force vectors (arrows) showing gravity pulling the object, fall speed tracker.
- Socratic Goal: Guide them to discover that gravity acceleration is independent of mass (i.e. changing mass does not change the time to fall, but it changes the force vector size because F = m * g). Ask them to look at the gravity force arrow vs the fall rate when changing mass.`;
  } else if (activeEnv === 'orbit_sim') {
    prompt += `Specific Context for Keplerian Orbit Simulator:
- The student is exploring gravitational orbits.
- Sliders: sun_mass, orbital_speed_mult.
- Visuals: velocity vectors, gravity force vectors, orbit path lines.
- Socratic Goal: Guide them to see that orbital stability depends on a balance between centripetal gravitational pull and velocity. If velocity is too low, the orbit decays and the planet crashes. If velocity is too high, it escapes.`;
  } else if (activeEnv === 'wave_lab') {
    prompt += `Specific Context for Wave Superposition Lab:
- The student is exploring wave interference.
- Sliders: freqA, ampA, freqB, ampB, phaseB (degrees).
- Visuals: Oscilloscope graphing wave A, wave B, and their combined sum.
- Socratic Goal: Guide them to understand constructive and destructive interference. For example, if phaseB is 180 degrees, the waves cancel out completely (destructive). If phaseB is 0 degrees, they reinforce each other.`;
  } else if (activeEnv === 'molecular') {
    prompt += `Specific Context for Molecular Thermal Sandbox:
- The student is exploring thermal ionic dissociation.
- Sliders: temp (°C), zoom, show_charges, show_bond_energy.
- Visuals: 3D crystal lattice of NaCl (salt).
- Socratic Goal: Guide them to see that heating causes the atoms to vibrate faster and break bonds (melting/dissociation), but it is a physical/thermal separation, not a chemical destruction into dangerous sodium metal.`;
  } else if (activeEnv === 'circuit_flow') {
    prompt += `Specific Context for Ohm's Law Circuit Sandbox:
- The student is exploring voltage, current, and resistance.
- Sliders: voltage (V), resistance (Ω).
- Visuals: Electron speed indicators, bulb brightness, voltage drops.
- Socratic Goal: Guide them to see that current is conserved throughout the loop (electrons do not get "consumed" by the bulb, they just lose electrical potential energy). Let them compare current flow speed before and after passing the resistor/bulb.`;
  } else if (activeEnv === 'ocean') {
    prompt += `Specific Context for Ocean Layer Diving:
- The student is exploring density, salinity, and buoyancy.
- Sliders: salinity (ppt), depth (m), temp, current_speed.
- Visuals: Upward buoyancy force vector arrow (Fb), downward gravity force vector (Fg).
- Socratic Goal: Guide them to see that increasing salinity increases fluid density, which increases the Archimedes buoyancy force (upward force arrow).`;
  } else if (activeEnv === 'quantum_slit') {
    prompt += `Specific Context for Quantum Double-Slit Lab:
- The student is exploring quantum superposition and measurement.
- Sliders/Toggles: observer (detector ON/OFF), wavelength, slitWidth.
- Visuals: Wave pattern vs particle impact markers on the screen.
- Socratic Goal: Guide them to see that turning the detector (observer) ON collapses the wave function, forcing particles to act like classical bullets (no interference pattern), whereas turning it OFF shows a wave interference pattern.`;
  } else if (activeEnv === 'relativity_run') {
    prompt += `Specific Context for Einsteinian Relativity Sandbox:
- The student is exploring special relativity.
- Sliders: speed (fraction of light speed, c).
- Visuals: Space-ship length contraction and slow-motion clocks (time dilation).
- Socratic Goal: Guide them to discover that as speed approaches light speed, time dilates (clocks tick slower relative to observer) and length contracts in the direction of motion.`;
  } else if (activeEnv === 'maxwell_demon') {
    prompt += `Specific Context for Maxwell's Demon Thermodynamics:
- The student is exploring entropy and thermal sorting.
- Sliders: demonSpeed, particleSpeed, doorOpen.
- Visuals: Two gas chambers separated by a slider door, hot and cold particles.
- Socratic Goal: Guide them to see that sorting hot and cold particles requires intelligent action (work/information), which is why entropy doesn't decrease spontaneously.`;
  } else if (activeEnv === 'aerodynamics') {
    prompt += `Specific Context for Aerodynamic Wind Tunnel:
- The student is exploring lift, drag, and airfoil aerodynamics.
- Sliders: angle_of_attack (degrees), wind_speed, air_density.
- Visuals: Air particle flow lines, lift force arrow, drag force arrow.
- Socratic Goal: Guide them to see that increasing the angle of attack increases lift up to a critical point, after which airflow separates from the wing and causes a stall (loss of lift).`;
  } else if (activeEnv === 'lenzs_law') {
    prompt += `Specific Context for Lenz's Law Induction Lab:
- The student is exploring electromagnetic braking.
- Sliders: magnet_strength, cylinder_mass, object_type (magnetic/non-magnetic).
- Visuals: Falling magnets through Copper (inductive) and Acrylic (non-inductive) tubes, eddy current circular loops.
- Socratic Goal: Guide them to see that falling magnets induce eddy currents in conductor tubes, creating a magnetic field that opposes the change (Lenz's law), slowing the magnet down.`;
  }

  if (lang === 'BN') {
    prompt += `\n\nLANGUAGE RULE:
- The student is communicating in Bengali.
- You MUST respond ONLY in Bengali.
- Write your short Socratic response using natural, student-friendly Bengali script (Unicode).
- Example style: "আপনি যদি বলটির ভর দ্বিগুণ করেন, তাহলে পতনের বেগের ওপর কী প্রভাব পড়বে বলে আপনি মনে করেন? স্লাইডারটি পরিবর্তন করে লক্ষ্য করুন।"`;
  } else {
    prompt += `\n\nLANGUAGE RULE:
- Respond ONLY in English.
- Use a supportive, curious tone.`;
  }

  return prompt;
}

router.post('/mentor', async (req, res) => {
  const { question, context, history = [], lang = 'EN' } = req.body;

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const systemPrompt = getSocraticSystemPrompt(context, lang);

  if (geminiApiKey && !geminiApiKey.includes('your_key_here')) {
    try {
      console.log("Using Gemini API for Mentor Response");
      const contents = [
        ...history.map(h => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: question }] }
      ];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const mentorReply = data.candidates[0].content.parts[0].text;
      return res.json({ response: mentorReply });
    } catch (err) {
      console.error('Gemini mentor error, trying fallback:', err);
    }
  }

  if (anthropicApiKey && !anthropicApiKey.includes('your_key_here')) {
    try {
      console.log("Using Anthropic API for Mentor Response");
      const client = new Anthropic({ apiKey: anthropicApiKey });
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: question }
      ];
      const message = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        system: systemPrompt,
        messages
      });
      return res.json({ response: message.content[0].text });
    } catch (err) {
      console.error('Anthropic mentor error, falling back to mock response:', err);
    }
  }

  console.log("Using Mock Mentor Response (No API keys configured or active)");
  
  const MOCK_SOCRATIC_RESPONSES = {
    gravity_lab: "If you change the mass of the ball, does the rate of acceleration or the time to reach the ground change? Look at the green gravity force arrow.",
    orbit_sim: "Look at the speed vector (blue arrow). What happens to the planet's path if you reduce the orbital speed? Does it fall into the sun?",
    wave_lab: "With wave B offset by 180 degrees, why does the combined output wave become a flat line? What happens at 90 degrees?",
    molecular: "Try raising the temperature slider above 100°C. Do the sodium and chlorine ions stay bound together, or do they dissociate? Why?",
    circuit_flow: "Compare the speed of the moving electrons before and after they pass through the light bulb. Is any current consumed?",
    ocean: "Look at the buoyancy arrow (Fb) vs the gravity arrow (Fg). How does increasing salinity change the size of the buoyancy vector?",
    quantum_slit: "Observe the patterns when the detector is ON vs OFF. Why does the wave interference pattern collapse into two bands when observed?",
    relativity_run: "Set the speed slider close to the speed of light. What happens to the length of the ship and the clock rate?",
    maxwell_demon: "Turn on the Demon filter to sort the particles. How does the partition of hot and cold particles change the entropy graph?",
    aerodynamics: "Increase the angle of attack slider above 18 degrees. Why does the lift force suddenly drop while drag spikes?",
    lenzs_law: "Click Drop Magnet. Why does the magnet fall so much slower in the Copper tube compared to the Acrylic tube?"
  };

  const environment = context?.activeEnv || 'gravity_lab';
  const mockText = MOCK_SOCRATIC_RESPONSES[environment] || MOCK_SOCRATIC_RESPONSES.gravity_lab;
  
  let finalMock = mockText;
  if (lang === 'BN') {
    const BN_MOCK = {
      gravity_lab: "বলটির ভর পরিবর্তন করলে পতনের ত্বরণ বা মাটিতে পৌঁছানোর সময়ে কি কোনো পরিবর্তন হচ্ছে? সবুজ রঙের মহাকর্ষ বলের তীরটি খেয়াল করুন।",
      orbit_sim: "বেগের ভেক্টরটি (নীল তীর) লক্ষ্য করুন। আপনি যদি কক্ষীয় বেগ হ্রাস করেন তবে গ্রহটির গতিপথের কী ঘটবে? এটি কি সূর্যের দিকে পতিত হচ্ছে?",
      wave_lab: "তরঙ্গ B-কে ১৮০ ডিগ্রিতে স্থানান্তর করলে কেন সম্মিলিত আউটপুট তরঙ্গটি একটি সোজা লাইনে পরিণত হচ্ছে? ৯০ ডিগ্রিতে কী ঘটে?",
      molecular: "তাপমাত্রা স্লাইডারটি ১০০°C এর উপরে বাড়িয়ে দেখুন। সোডিয়াম এবং ক্লোরিন আয়নগুলো কি একসাথে যুক্ত থাকে নাকি আলাদা হয়ে যায়? কেন?",
      circuit_flow: "ইলেকট্রনগুলো বাল্ব অতিক্রম করার আগে এবং পরে তাদের গতি তুলনা করুন। কোনো কারেন্ট কি খরচ হচ্ছে?",
      ocean: "প্লবতা তীর (Fb) বনাম মহাকর্ষ তীর (Fg) লক্ষ্য করুন। লবণাক্ততা বাড়ালে কীভাবে প্লবতা বলের আকার পরিবর্তিত হয়?",
      quantum_slit: "ডিটেক্টর চালু (ON) এবং বন্ধ (OFF) থাকার সময় প্যাটার্নগুলো লক্ষ্য করুন। পর্যবেক্ষণের ফলে তরঙ্গের ব্যতিচার প্যাটার্ন কেন দুটি ব্যান্ডে ভেঙে যায়?",
      relativity_run: "গতি স্লাইডারটি আলোর গতির কাছাকাছি সেট করুন। জাহাজের দৈর্ঘ্য এবং ঘড়ির হারের কী পরিবর্তন ঘটছে?",
      maxwell_demon: "কণাগুলো ফিল্টার করতে ডেমন চালু করুন। গরম এবং ঠান্ডা কণার বিভাজন কীভাবে এনট্রপি গ্রাফকে প্রভাবিত করে?",
      aerodynamics: "উইং-এর কোণ ১৮ ডিগ্রির উপরে বাড়িয়ে দিন। লিফট ফোর্স হঠাৎ কমে গিয়ে ড্র্যাগ ফোর্স কেন বৃদ্ধি পেল?",
      lenzs_law: "ড্রপ ম্যাগনেট ক্লিক করুন। এক্রিলিক টিউবের তুলনায় কপার টিউবের ভেতর দিয়ে চুম্বকটি এত আস্তে পড়ে কেন?"
    };
    finalMock = BN_MOCK[environment] || BN_MOCK.gravity_lab;
  }
  
  return res.json({
    response: finalMock,
    _debug_info: "Mock response generated because no API keys were configured or both failed."
  });
});

module.exports = router;
