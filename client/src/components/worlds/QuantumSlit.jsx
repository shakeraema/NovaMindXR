import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function QuantumSimulation({ sceneConfig = {}, onConfigChange }) {
  const isObserverOn = sceneConfig.is_observer_on !== undefined ? sceneConfig.is_observer_on : false;
  const slitWidth = sceneConfig.slit_width !== undefined ? sceneConfig.slit_width : 0.4;
  const wavelength = sceneConfig.wavelength !== undefined ? sceneConfig.wavelength : 0.5;

  const [particles, setParticles] = useState([]);
  const [detectorHits, setDetectorHits] = useState([]);
  const waveRef = useRef();

  // Handle periodic particle launching in useFrame
  const lastLaunchTime = useRef(0);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    // Rotate wave function phase if observer is off
    if (!isObserverOn && waveRef.current) {
      waveRef.current.material.dashOffset = -elapsed * 3;
    }

    // Launch particles
    if (elapsed - lastLaunchTime.current > 0.08) {
      lastLaunchTime.current = elapsed;
      
      if (isObserverOn) {
        // Create new particle
        setParticles(prev => [
          ...prev,
          {
            id: Math.random(),
            x: -4,
            y: 0,
            z: 0,
            vx: 6,
            vy: (Math.random() - 0.5) * 1.5,
            vz: 0,
            hasCollided: false
          }
        ]);
      }
    }

    // Animate active particles
    if (isObserverOn && particles.length > 0) {
      setParticles(prev => {
        const next = [];
        prev.forEach(p => {
          let nx = p.x + p.vx * 0.016;
          let ny = p.y + p.vy * 0.016;
          
          // Check collision with double-slit barrier at x = 0
          if (p.x < 0 && nx >= 0) {
            // Check if it passes through slits
            const slitOffset = 0.8; // Distance between slits
            const passedSlit1 = Math.abs(ny - slitOffset) < slitWidth;
            const passedSlit2 = Math.abs(ny + slitOffset) < slitWidth;

            if (!passedSlit1 && !passedSlit2) {
              // Collide with barrier, kill particle
              return;
            } else {
              // Passed through! Keep going
            }
          }

          // Check collision with detector screen at x = 4
          if (nx >= 4) {
            // Log a hit
            setDetectorHits(hits => [
              ...hits.slice(-150), // Keep last 150 hits
              { id: Math.random(), y: ny, z: p.z }
            ]);
            // Increment understanding score via config change trigger
            if (onConfigChange) {
              onConfigChange({ _hit_trigger: Math.random() });
            }
            return; // Kill particle
          }

          next.push({ ...p, x: nx, y: ny });
        });
        return next;
      });
    }
  });

  // Calculate interference profile values for wave representation when observer is OFF
  const wavePoints = [];
  if (!isObserverOn) {
    const segments = 120;
    for (let i = 0; i <= segments; i++) {
      const x = -4 + (i / segments) * 8;
      let y = 0;
      if (x > 0) {
        // Superposition of two slit sources
        const slitOffset = 0.8;
        const d1 = Math.sqrt(x * x + (y - slitOffset) * (y - slitOffset));
        const d2 = Math.sqrt(x * x + (y + slitOffset) * (y + slitOffset));
        const phase1 = (d1 * Math.PI * 2) / wavelength;
        const phase2 = (d2 * Math.PI * 2) / wavelength;
        y = (Math.sin(phase1) + Math.sin(phase2)) * 0.5;
      } else {
        // Standard plane wave approaching slits
        y = Math.sin((x * Math.PI * 2) / wavelength);
      }
      wavePoints.push(new THREE.Vector3(x, y * 0.8, 0));
    }
  }

  // Draw detector hits based on observation
  const getDetectorPosition = (hit) => {
    // If observer is on, particles align with the two slits
    // If observer is off, we draw a full interference pattern
    return [4, hit.y, hit.z];
  };

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />

      {/* Particle Gun */}
      <mesh position={[-4.5, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[-4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Double Slit Barrier (Top, Middle, Bottom panels) */}
      <group position={[0, 0, 0]}>
        {/* Top Panel */}
        <mesh position={[0, 2.2, 0]}>
          <boxGeometry args={[0.15, 2.0, 3.0]} />
          <meshStandardMaterial color="#334155" opacity={0.9} transparent />
        </mesh>
        {/* Middle Divider Panel */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.15, 0.8, 3.0]} />
          <meshStandardMaterial color="#334155" opacity={0.9} transparent />
        </mesh>
        {/* Bottom Panel */}
        <mesh position={[0, -2.2, 0]}>
          <boxGeometry args={[0.15, 2.0, 3.0]} />
          <meshStandardMaterial color="#334155" opacity={0.9} transparent />
        </mesh>

        {/* Labels for Slits */}
        <Text position={[0, 1.0, 1.6]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.2} color="#60a5fa">
          Slit A
        </Text>
        <Text position={[0, -1.0, 1.6]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.2} color="#60a5fa">
          Slit B
        </Text>
      </group>

      {/* Detector Screen */}
      <mesh position={[4, 0, 0]}>
        <boxGeometry args={[0.1, 4.0, 3.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Detector Hits */}
      {isObserverOn ? (
        // Observer ON: Two simple bands directly behind slits
        detectorHits.map((h, i) => {
          // Align hit randomly behind Slit A (0.8) or Slit B (-0.8) with small spread
          const isA = Math.random() > 0.5;
          const targetY = isA ? 0.8 + (Math.random() - 0.5) * 0.4 : -0.8 + (Math.random() - 0.5) * 0.4;
          return (
            <mesh key={h.id} position={[3.94, targetY, (Math.random() - 0.5) * 1.5]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ef4444" toneMapped={false} />
            </mesh>
          );
        })
      ) : (
        // Observer OFF: Quantum Interference fringes (cosine squared diffraction pattern)
        detectorHits.map((h, i) => {
          // Sample from cosine-squared distribution
          let targetY = 0;
          let found = false;
          while (!found) {
            const testY = (Math.random() - 0.5) * 6; // range [-3, 3]
            const p = Math.pow(Math.cos((testY * Math.PI) / (wavelength * 2.5)), 2) * Math.pow(Math.sin(testY + 0.0001)/(testY + 0.0001), 2);
            if (Math.random() < p) {
              targetY = testY;
              found = true;
            }
          }
          return (
            <mesh key={h.id} position={[3.94, targetY, (Math.random() - 0.5) * 1.5]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#34d399" toneMapped={false} />
            </mesh>
          );
        })
      )}

      {/* Observer / Detector icon */}
      {isObserverOn && (
        <group position={[0, 2.0, 0]}>
          <mesh>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshBasicMaterial color="#3b82f6" opacity={0.6} transparent />
          </mesh>
          <mesh position={[0, 0, 0.15]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <Text position={[0, 0.4, 0]} fontSize={0.25} color="#60a5fa">
            👁️ DETECTOR ACTIVE
          </Text>
        </group>
      )}

      {/* Active particles (Sphere bullets) */}
      {isObserverOn && particles.map(p => (
        <mesh key={p.id} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      ))}

      {/* Wave Function representation when observer is OFF */}
      {!isObserverOn && wavePoints.length > 1 && (
        <line ref={waveRef}>
          <bufferGeometry attach="geometry" callback={(geom) => {
            geom.setFromPoints(wavePoints);
          }} />
          <lineBasicMaterial attach="material" color="#34d399" linewidth={2} />
        </line>
      )}
      
      {!isObserverOn && (
        <Text position={[0, 2.4, 0]} fontSize={0.25} color="#34d399">
          〰 WAVE SUPERPOSITION MODE
        </Text>
      )}
    </>
  );
}

export default function QuantumSlit({ sceneConfig = {}, onConfigChange }) {
  const isObserverOn = sceneConfig.is_observer_on !== undefined ? sceneConfig.is_observer_on : false;
  const slitWidth = sceneConfig.slit_width !== undefined ? sceneConfig.slit_width : 0.4;
  const wavelength = sceneConfig.wavelength !== undefined ? sceneConfig.wavelength : 0.5;

  const handleObserverToggle = () => {
    if (onConfigChange) {
      onConfigChange({ is_observer_on: !isObserverOn });
    }
  };

  const handleWidthChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ slit_width: val });
    }
  };

  const handleLambdaChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ wavelength: val });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Viewport */}
      <div style={{
        width: '100%',
        height: '420px',
        background: 'radial-gradient(circle at center, #0a0a20 0%, #030308 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
          <QuantumSimulation sceneConfig={sceneConfig} onConfigChange={onConfigChange} />
          <OrbitControls enableZoom={true} maxDistance={15} minDistance={4} />
        </Canvas>
      </div>

      {/* Telemetry Dashboard Controls */}
      <div style={{
        marginTop: '16px',
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        padding: '16px',
        color: 'white',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
            Quantum Telemetry Control Deck
          </span>
          <span style={{
            fontSize: '11px',
            background: isObserverOn ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
            border: isObserverOn ? '1px solid #ef4444' : '1px solid #34d399',
            color: isObserverOn ? '#f87171' : '#34d399',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {isObserverOn ? "PARTICLE STATE DETECTED" : "COHERENT WAVE SUPERPOSITION"}
          </span>
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Slit Width */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Slit Gap Width</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{slitWidth.toFixed(2)} nm</span>
            </div>
            <input 
              type="range"
              min="0.15"
              max="0.8"
              step="0.05"
              value={slitWidth}
              onChange={e => handleWidthChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          {/* Wavelength */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>De Broglie Wavelength ($\lambda$)</span>
              <span style={{ color: '#34d399', fontWeight: 'bold' }}>{wavelength.toFixed(2)} nm</span>
            </div>
            <input 
              type="range"
              min="0.25"
              max="0.8"
              step="0.05"
              value={wavelength}
              onChange={e => handleLambdaChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#34d399', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleObserverToggle}
            style={{
              flex: 1,
              padding: '10px',
              background: isObserverOn ? 'rgba(59, 130, 246, 0.15)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: isObserverOn ? '1px solid #3b82f6' : 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px',
              boxShadow: isObserverOn ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            {isObserverOn ? "🚫 TURN OFF DETECTOR" : "👁️ MEASURE SLIT PASSAGE (OBSERVER EFFECT)"}
          </button>
          
          <button
            onClick={() => setDetectorHits([])}
            style={{
              padding: '10px 16px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear Screen
          </button>
        </div>
      </div>
    </div>
  );
}
