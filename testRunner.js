import { diagnoseConfusion } from './diagnosisService.js';
import { TEST_INPUTS } from './testCases.js';

async function runTest() {
  console.log("=== NovaMind XR - AI Engine Test Runner ===");
  console.log("Loading test inputs...");
  
  const testInput = TEST_INPUTS[0];
  console.log(`\nTesting Input: "${testInput}"`);
  console.log("Sending request to local backend (make sure Zahid's backend is running on port 5000)...");
  
  const result = await diagnoseConfusion(testInput);
  
  if (result) {
    console.log("\n[SUCCESS] Received response from backend:");
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("\n[WARNING] Could not connect to local backend.");
    console.log("Please run Zahid's Express server first, or deploy it and update BACKEND_URL in diagnosisService.js.");
    console.log("\nHere is what the expected response schema looks like (Mock Data):");
    console.log(JSON.stringify({
      misconception_type: "conflation of mass and weight",
      knowledge_gap: "Student conflates gravity acceleration with object mass",
      domain: "physics",
      confidence: 0.95,
      scene_config: {
        environment: "gravity_lab",
        gravity: 9.8,
        mass: 5.0,
        time_scale: 1.0,
        show_force_vectors: true,
        initial_velocity: 0,
        highlight_concept: "force vs acceleration"
      },
      mentor_opening: "If you doubled the mass of this ball, what do you think would happen to how fast it falls?",
      understanding_scores: {
        conceptual_clarity: 35,
        spatial_reasoning: 60,
        cause_effect: 40,
        formula_understanding: 25
      }
    }, null, 2));
  }
}

runTest();
