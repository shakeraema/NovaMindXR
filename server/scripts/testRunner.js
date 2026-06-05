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
  }
}

runTest();
