import { useState } from 'react';
import SimulationScene from './components/SimulationScene';
import WhatIfControls from './components/WhatIfControls';

export default function App() {
  const [config, setConfig] = useState({
    gravity: 9.8,
    mass: 5.0,
    show_force_vectors: true,
    time_scale: 1.0
  });

  const [resetKey, setResetKey] = useState(0);

  const handleConfigChange = (newConfig) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at bottom, #09091e 0%, #030308 100%)',
      color: '#e2e8f0',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      boxSizing: 'border-box'
    }}>
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto 24px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        paddingBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#60a5fa', fontWeight: 600 }}>
            Workspace: Mehrab (3D Graphics & Physics)
          </span>
          <h1 style={{ margin: '4px 0 0', fontSize: '24px', fontWeight: 600, color: '#f8fafc' }}>
            NovaMind XR - 3D Simulation Testing
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Status:</span>
          <span style={{ fontSize: '12px', color: '#10b981', marginLeft: '6px', fontWeight: 600 }}>● Sandbox Running</span>
        </div>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 340px',
        gap: '24px'
      }}>
        {/* Left Column: 3D Viewport */}
        <div>
          <SimulationScene config={config} resetKey={resetKey} />
          
          <div style={{
            marginTop: '16px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5
          }}>
            <strong style={{ color: '#f8fafc' }}>Interaction Guide:</strong>
            <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
              <li><strong>Left-Click & Drag:</strong> Rotate Orbit Camera</li>
              <li><strong>Right-Click & Drag:</strong> Pan camera position</li>
              <li><strong>Scroll Wheel:</strong> Zoom in / out</li>
              <li>Toggle parameters in the control deck to witness active physics forces.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Control Deck */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <WhatIfControls 
            config={config} 
            onConfigChange={handleConfigChange} 
            onReset={handleReset} 
          />
          
          <div style={{
            marginTop: '16px',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px dashed rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#38bdf8' }}>Component Exports</p>
            <p style={{ margin: 0 }}>
              This sandbox tests the exact <code>SimulationScene</code> and <code>WhatIfControls</code> component configurations. Ema and Zahid can drop these directly into the main shell during integration phase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
