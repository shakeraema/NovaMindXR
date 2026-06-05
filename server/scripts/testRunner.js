const { TEST_INPUTS } = require('./testCases.js');

const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function diagnoseConfusion(studentInput) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: studentInput })
    });
    
    if (!response.ok) throw new Error('Diagnosis failed');
    return await response.json();
  } catch (err) {
    console.error('Diagnosis error:', err.message);
    return null;
  }
}

async function testMentor() {
  try {
    console.log("\n--- Testing Mentor Socratic Chat Endpoint (English) ---");
    console.log("Asking: 'Why isn't the planet falling into the sun?' (Orbit Simulator, speed=0.5, sun_mass=2.0)");
    const response = await fetch(`${BACKEND_URL}/api/mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "Why isn't the planet falling into the sun?",
        context: {
          activeEnv: "orbit_sim",
          liveConfig: { sun_mass: 2.0, orbital_speed_mult: 0.5 }
        },
        lang: "EN"
      })
    });
    if (!response.ok) throw new Error('Mentor endpoint failed');
    const data = await response.json();
    console.log("\n[SUCCESS] Received Socratic response:");
    console.log(data.response);
  } catch (err) {
    console.error('Mentor test error:', err.message);
  }
}

async function testMentorBN() {
  try {
    console.log("\n--- Testing Mentor Socratic Chat Endpoint (Bengali) ---");
    console.log("Asking: 'ভারী জিনিস কেন আগে পড়বে না?' (Gravity Lab, gravity=9.8, mass=15.0)");
    const response = await fetch(`${BACKEND_URL}/api/mentor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: "ভারী জিনিস কেন আগে পড়বে না?",
        context: {
          activeEnv: "gravity_lab",
          liveConfig: { gravity: 9.8, mass: 15.0 }
        },
        lang: "BN"
      })
    });
    if (!response.ok) throw new Error('Mentor BN endpoint failed');
    const data = await response.json();
    console.log("\n[SUCCESS] Received Socratic response in Bengali:");
    console.log(data.response);
  } catch (err) {
    console.error('Mentor BN test error:', err.message);
  }
}

async function runTest() {
  console.log("=== NovaMind XR - AI Engine Test Runner ===");
  console.log("Loading test inputs...");
  
  const testInput = TEST_INPUTS[0];
  console.log(`\nTesting Input: "${testInput}"`);
  console.log("Sending request to local backend (make sure the backend is running on port 5000)...");
  
  const result = await diagnoseConfusion(testInput);
  
  if (result) {
    console.log("\n[SUCCESS] Received response from backend:");
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("\n[WARNING] Could not connect to local backend.");
    console.log("Please run the Express server first.");
    return;
  }

  await testMentor();
  await testMentorBN();
}

runTest();
