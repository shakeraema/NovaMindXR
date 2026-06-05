import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const NUM_POINTS = 200;
const WAVE_WIDTH = 12; // wave stretches from x = -6 to x = 6

function WaveOscilloscope({ config }) {
  const { freqA, ampA, freqB, ampB, phaseB, speed, timeScale } = config;

  const geomRefA = useRef();
  const geomRefB = useRef();
  const geomRefC = useRef();

  const pointsRefA = useRef();
  const pointsRefB = useRef();
  const pointsRefC = useRef();

  const clock = useRef(0);

  // Initialize Float32Arrays once
  const [positionsA, colorsA] = useMemo(() => {
    const pos = new Float32Array(NUM_POINTS * 3);
    const col = new Float32Array(NUM_POINTS * 3);
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = -WAVE_WIDTH / 2 + (i / (NUM_POINTS - 1)) * WAVE_WIDTH;
      pos[i * 3] = x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return [pos, col];
  }, []);

  const [positionsB, colorsB] = useMemo(() => {
    const pos = new Float32Array(NUM_POINTS * 3);
    const col = new Float32Array(NUM_POINTS * 3);
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = -WAVE_WIDTH / 2 + (i / (NUM_POINTS - 1)) * WAVE_WIDTH;
      pos[i * 3] = x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return [pos, col];
  }, []);

  const [positionsC, colorsC] = useMemo(() => {
    const pos = new Float32Array(NUM_POINTS * 3);
    const col = new Float32Array(NUM_POINTS * 3);
    for (let i = 0; i < NUM_POINTS; i++) {
      const x = -WAVE_WIDTH / 2 + (i / (NUM_POINTS - 1)) * WAVE_WIDTH;
      pos[i * 3] = x;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }
    return [pos, col];
  }, []);

  useFrame((state, delta) => {
    // Advance internal clock based on timeScale and speed
    clock.current += delta * speed * timeScale;
    const t = clock.current;

    const phaseRad = (phaseB * Math.PI) / 180;

    for (let i = 0; i < NUM_POINTS; i++) {
      const x = -WAVE_WIDTH / 2 + (i / (NUM_POINTS - 1)) * WAVE_WIDTH;
      
      // WAVE A: y = ampA * sin(2pi * freqA * x - t)
      const yA = ampA * Math.sin(2 * Math.PI * freqA * (x / WAVE_WIDTH) - t * 2);
      positionsA[i * 3 + 1] = yA + 2.0; // Offset Wave A upward

      // Color A based on displacement: Positive displacement = Blue, Negative = Orange, Zero = White
      if (yA >= 0) {
        const factor = Math.min(yA / ampA, 1.0);
        colorsA[i * 3] = 1.0 - factor * 0.9;     // Red
        colorsA[i * 3 + 1] = 1.0 - factor * 0.4; // Green
        colorsA[i * 3 + 2] = 1.0;                 // Blue (stay bright)
      } else {
        const factor = Math.min(-yA / ampA, 1.0);
        colorsA[i * 3] = 1.0;                     // Red (stay bright)
        colorsA[i * 3 + 1] = 1.0 - factor * 0.5; // Green (half)
        colorsA[i * 3 + 2] = 1.0 - factor * 0.9; // Blue (faded)
      }

      // WAVE B: y = ampB * sin(2pi * freqB * x - t + phase)
      const yB = ampB * Math.sin(2 * Math.PI * freqB * (x / WAVE_WIDTH) - t * 2 + phaseRad);
      positionsB[i * 3 + 1] = yB + 0.0; // Center Wave B at 0

      // Color B (similar spectrum displacement mapping)
      if (yB >= 0) {
        const factor = Math.min(yB / ampB, 1.0);
        colorsB[i * 3] = 1.0;
        colorsB[i * 3 + 1] = 1.0 - factor * 0.9;
        colorsB[i * 3 + 2] = 1.0 - factor * 0.1; // Magentaish purple displacement
      } else {
        const factor = Math.min(-yB / ampB, 1.0);
        colorsB[i * 3] = 1.0 - factor * 0.3;
        colorsB[i * 3 + 1] = 1.0 - factor * 0.8;
        colorsB[i * 3 + 2] = 1.0;
      }

      // COMBINED WAVE C: Wave A + Wave B (Offset downward)
      const yC = yA + yB;
      positionsC[i * 3 + 1] = yC - 2.5;

      // Color C: Green for constructive (signs match), Red for destructive (signs differ)
      const signsMatch = (yA >= 0 && yB >= 0) || (yA <= 0 && yB <= 0);
      if (Math.abs(yA) < 0.05 || Math.abs(yB) < 0.05) {
        // Neutral color (yellow-greenish or white)
        colorsC[i * 3] = 0.8;
        colorsC[i * 3 + 1] = 0.8;
        colorsC[i * 3 + 2] = 0.8;
      } else if (signsMatch) {
        // Constructive: Green [0.1, 0.9, 0.2]
        colorsC[i * 3] = 0.1;
        colorsC[i * 3 + 1] = 0.9;
        colorsC[i * 3 + 2] = 0.2;
      } else {
        // Destructive: Red [0.95, 0.1, 0.1]
        colorsC[i * 3] = 0.95;
        colorsC[i * 3 + 1] = 0.1;
        colorsC[i * 3 + 2] = 0.1;
      }
    }

    // Trigger update flags
    if (geomRefA.current) {
      geomRefA.current.attributes.position.needsUpdate = true;
      geomRefA.current.attributes.color.needsUpdate = true;
    }
    if (geomRefB.current) {
      geomRefB.current.attributes.position.needsUpdate = true;
      geomRefB.current.attributes.color.needsUpdate = true;
    }
    if (geomRefC.current) {
      geomRefC.current.attributes.position.needsUpdate = true;
      geomRefC.current.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Wave A (Cyan/Blue neon theme) */}
      <line ref={pointsRefA}>
        <bufferGeometry ref={geomRefA}>
          <bufferAttribute
            attach="attributes-position"
            array={positionsA}
            count={NUM_POINTS}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colorsA}
            count={NUM_POINTS}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial window={null} vertexColors linewidth={2.0} />
      </line>

      {/* Wave B (Magenta/Purple neon theme) */}
      <line ref={pointsRefB}>
        <bufferGeometry ref={geomRefB}>
          <bufferAttribute
            attach="attributes-position"
            array={positionsB}
            count={NUM_POINTS}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colorsB}
            count={NUM_POINTS}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors linewidth={2.0} />
      </line>

      {/* Combined Wave C */}
      <line ref={pointsRefC}>
        <bufferGeometry ref={geomRefC}>
          <bufferAttribute
            attach="attributes-position"
            array={positionsC}
            count={NUM_POINTS}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={colorsC}
            count={NUM_POINTS}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial vertexColors linewidth={3.0} />
      </line>
    </group>
  );
}

export default function WaveLab({ sceneConfig = {}, onConfigChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // State configurations synced with parent
  const freqA = sceneConfig.freqA !== undefined ? sceneConfig.freqA : 1.5;
  const ampA = sceneConfig.ampA !== undefined ? sceneConfig.ampA : 0.8;
  const freqB = sceneConfig.freqB !== undefined ? sceneConfig.freqB : 1.5;
  const ampB = sceneConfig.ampB !== undefined ? sceneConfig.ampB : 0.8;
  const phaseB = sceneConfig.phaseB !== undefined ? sceneConfig.phaseB : 0; // in degrees
  const speed = sceneConfig.speed !== undefined ? sceneConfig.speed : 1.0;
  const timeScale = sceneConfig.time_scale !== undefined ? sceneConfig.time_scale : 1.0;

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  const handleResonance = () => {
    handleSliderChange({
      freqA: 2.0,
      freqB: 2.0,
      ampA: 1.0,
      ampB: 1.0,
      phaseB: 0,
      speed: 1.0
    });
  };

  const handleCancellation = () => {
    // Keep everything, set Phase of Wave B to 180 degrees and match frequencies
    handleSliderChange({
      freqA: freqA,
      freqB: freqA,
      ampA: ampA,
      ampB: ampA,
      phaseB: 180
    });
  };

  // Determine interference status
  // Wave A amp + Wave B amp compared to Combined Wave amplitude maximum
  // We can calculate constructive/destructive state based on phase offset if frequencies match, or general overlap
  const phaseRad = (phaseB * Math.PI) / 180;
  const maxCombinedAmp = Math.sqrt(ampA*ampA + ampB*ampB + 2*ampA*ampB*Math.cos(phaseRad));
  const isConstructive = maxCombinedAmp > Math.max(ampA, ampB);
  const isFlat = maxCombinedAmp < 0.1;

  // Wavelength = speed / frequency (simulated)
  const wavelengthA = speed / freqA;
  const wavelengthB = speed / freqB;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: 'radial-gradient(circle at center, #050520 0%, #020208 100%)', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        position: 'relative'
      }}>
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
          <color attach="background" args={['#020208']} />
          <ambientLight intensity={0.5} />

          <WaveOscilloscope config={{ freqA, ampA, freqB, ampB, phaseB, speed, timeScale }} />

          {/* HUD Overlay Labels */}
          <group position={[-5.8, 3.4, 0]}>
            <Text position={[0, 0, 0]} fontSize={0.28} color="#60a5fa" anchorX="left">
              Wave A (Top): {freqA.toFixed(1)} Hz | λ = {wavelengthA.toFixed(2)}m
            </Text>
            <Text position={[0, -0.35, 0]} fontSize={0.28} color="#f472b6" anchorX="left">
              Wave B (Middle): {freqB.toFixed(1)} Hz | Phase = {phaseB}°
            </Text>
            <Text position={[0, -0.7, 0]} fontSize={0.32} color="#10b981" anchorX="left">
              Combined Wave (Bottom): {isFlat ? 'Flat (Cancellation)' : isConstructive ? 'Constructive' : 'Destructive'}
            </Text>
          </group>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={15}
          />
        </Canvas>

        {/* Info Tooltip Button */}
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            borderRadius: '50%',
            color: '#60a5fa',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 90
          }}
        >
          ?
        </button>

        {showTooltip && (
          <div style={{
            position: 'absolute',
            bottom: '52px',
            right: '16px',
            background: 'rgba(10, 10, 30, 0.95)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: '12px',
            padding: '16px',
            color: 'white',
            maxWidth: '320px',
            fontSize: '12px',
            lineHeight: '1.5',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            zIndex: 100
          }}>
            <p style={{ margin: 0 }}>
              <strong>Wave Interference Lab:</strong> Waves propagating through the same medium superimpose. When peaks align with peaks (in-phase), they build **Constructive Interference** (green vertices, larger amplitude). When peaks align with troughs (180° out-of-phase), they form **Destructive Interference** (red vertices, flatter wave).
            </p>
          </div>
        )}
      </div>

      {/* Sliders Container below Canvas */}
      <div style={{
        background: 'rgba(10, 10, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(79, 142, 247, 0.3)',
        borderRadius: '12px',
        padding: '18px',
        marginTop: '12px',
        color: 'white',
        fontFamily: 'sans-serif'
      }}>
        
        {/* Wave Sliders grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Wave A Controls */}
          <div style={{ background: 'rgba(59, 130, 246, 0.03)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '10px', padding: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa', display: 'block', marginBottom: '8px' }}>WAVE A parameters</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span>Frequency (Hz)</span>
                  <span>{freqA.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="5.0" step="0.1" value={freqA}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#60a5fa' }}
                  onChange={e => handleSliderChange({ freqA: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span>Amplitude</span>
                  <span>{ampA.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.1" max="2.0" step="0.05" value={ampA}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#60a5fa' }}
                  onChange={e => handleSliderChange({ ampA: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Wave B Controls */}
          <div style={{ background: 'rgba(244, 114, 182, 0.03)', border: '1px solid rgba(244, 114, 182, 0.1)', borderRadius: '10px', padding: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f472b6', display: 'block', marginBottom: '8px' }}>WAVE B parameters</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span>Frequency (Hz)</span>
                  <span>{freqB.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range" min="0.5" max="5.0" step="0.1" value={freqB}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#f472b6' }}
                  onChange={e => handleSliderChange({ freqB: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '2px' }}>
                  <span>Amplitude</span>
                  <span>{ampB.toFixed(2)}</span>
                </div>
                <input
                  type="range" min="0.1" max="2.0" step="0.05" value={ampB}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#f472b6' }}
                  onChange={e => handleSliderChange({ ampB: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </div>

        </div>

        {/* Speed & Phase Offset */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Wave B Phase Offset</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>{phaseB}°</span>
            </div>
            <input
              type="range" min="0" max="360" step="5" value={phaseB}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24' }}
              onChange={e => handleSliderChange({ phaseB: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Propagation Speed</span>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.1" max="3.0" step="0.1" value={speed}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
              onChange={e => handleSliderChange({ speed: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        {/* Buttons (Resonance, Cancellation, Reset) */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleResonance}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid #10b981',
              color: '#34d399',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            ⚡ RESONANCE MODE
          </button>
          
          <button
            onClick={handleCancellation}
            style={{
              flex: 1,
              padding: '10px',
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              color: '#f87171',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            ❌ CANCELLATION MODE
          </button>

          <button
            onClick={() => {
              handleSliderChange({
                freqA: 1.5,
                ampA: 0.8,
                freqB: 1.5,
                ampB: 0.8,
                phaseB: 0,
                speed: 1.0,
                time_scale: 1.0
              });
            }}
            style={{
              padding: '10px 20px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset
          </button>
        </div>

      </div>
    </div>
  );
}
