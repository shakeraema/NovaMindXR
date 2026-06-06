import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// 300 Stars Background
function StarsBackground() {
  const stars = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 300; i++) {
      // Uniform random distribution on a sphere shell of radius 80 to 100
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 80 + Math.random() * 20;
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  return (
    <group>
      {stars.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

// Earth with atmospheric glow and Moon
function CelestialBodies() {
  return (
    <group>
      {/* Earth */}
      <group position={[-14, 5, -25]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[5, 32, 32]} />
          <meshStandardMaterial color="#1e3a8a" roughness={0.8} metalness={0.1} emissive="#0d9488" emissiveIntensity={0.15} />
        </mesh>
        {/* Glow */}
        <mesh>
          <sphereGeometry args={[5.3, 32, 32]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Moon (40% scale of Earth) */}
      <mesh position={[12, 8, -25]} castShadow receiveShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.1} />
      </mesh>
    </group>
  );
}

// Gravity simulation balls
function PhysicsBalls({ config, resetKey, selectedIdx, onBallClick }) {
  const { gravity, masses, show_force_vectors, time_scale } = config;

  const ballsData = [
    { id: 0, radius: 0.35, color: '#06b6d4', startX: -2 },
    { id: 1, radius: 0.5, color: '#ec4899', startX: 0 },
    { id: 2, radius: 0.7, color: '#f59e0b', startX: 2 }
  ];

  // Ref arrays for positions and velocities
  const positions = useRef(ballsData.map(b => [b.startX, 6, 0]));
  const velocities = useRef(ballsData.map(() => [0, 0, 0]));
  const meshRefs = useRef([]);

  // Reset ball states
  useEffect(() => {
    ballsData.forEach((b, i) => {
      positions.current[i] = [b.startX, 6, 0];
      velocities.current[i] = [0, 0, 0];
      if (meshRefs.current[i]) {
        meshRefs.current[i].position.set(b.startX, 6, 0);
      }
    });
  }, [resetKey]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05) * time_scale;

    ballsData.forEach((b, i) => {
      const mass = masses[i];
      // gravity acceleration
      velocities.current[i][1] -= gravity * dt;

      // drag factor
      const drag = 0.08 * velocities.current[i][1] * Math.abs(velocities.current[i][1]) / mass;
      velocities.current[i][1] -= drag * dt;

      positions.current[i][1] += velocities.current[i][1] * dt;

      // collision with platform (y = 0 is the surface of platform)
      const platformY = 0;
      if (positions.current[i][1] <= platformY + b.radius) {
        positions.current[i][1] = platformY + b.radius;
        // bounce with restitution 0.5
        velocities.current[i][1] = -velocities.current[i][1] * 0.5;

        // stop rolling/micro-bouncing
        if (Math.abs(velocities.current[i][1]) < 0.25) {
          velocities.current[i][1] = 0;
        }
      }

      if (meshRefs.current[i]) {
        meshRefs.current[i].position.set(
          positions.current[i][0],
          positions.current[i][1],
          positions.current[i][2]
        );
      }
    });
  });

  return (
    <group>
      {ballsData.map((b, i) => {
        const isSelected = selectedIdx === i;
        const force = masses[i] * gravity;
        const arrowLength = Math.max(0.4, Math.min(force / 10, 4.0));

        return (
          <group key={b.id}>
            <mesh
              ref={el => (meshRefs.current[i] = el)}
              position={[b.startX, 6, 0]}
              castShadow
              onClick={(e) => {
                e.stopPropagation();
                onBallClick(i);
              }}
            >
              <sphereGeometry args={[b.radius, 32, 32]} />
              <meshStandardMaterial
                color={b.color}
                roughness={0.3}
                metalness={0.7}
                emissive={b.color}
                emissiveIntensity={isSelected ? 0.3 : 0.05}
              />
              {/* Highlight Ring for selected ball */}
              {isSelected && (
                <mesh>
                  <torusGeometry args={[b.radius + 0.12, 0.03, 8, 32]} rotation={[Math.PI / 2, 0, 0]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              )}
              {/* Force vector arrow */}
              {show_force_vectors && gravity > 0 && (
                <group position={[0, 0, 0]}>
                  <arrowHelper
                    args={[
                      new THREE.Vector3(0, -1, 0),
                      new THREE.Vector3(0, 0, 0),
                      arrowLength,
                      '#f87171',
                      0.2,
                      0.1
                    ]}
                  />
                </group>
              )}
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Gravity Lab Scene HUD
function GravityHUD({ gravity, mass, selectedIdx }) {
  const force = gravity * mass;

  return (
    <group position={[-8, 6.5, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.4}
        color="#60a5fa"
        anchorX="left"
      >
        {`g = ${gravity.toFixed(2)} m/s²`}
      </Text>
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.35}
        color="#f87171"
        anchorX="left"
      >
        {`F = m·g = ${force.toFixed(1)} N (Ball ${selectedIdx + 1})`}
      </Text>
      
      {gravity === 0 && (
        <Text
          position={[8, -3.5, 0]}
          fontSize={0.8}
          color="#38bdf8"
          anchorX="center"
        >
          Zero-G Mode 🌌
        </Text>
      )}
      {gravity > 20 && (
        <Text
          position={[8, -3.5, 0]}
          fontSize={0.8}
          color="#f43f5e"
          anchorX="center"
        >
          Jupiter Gravity! 🪐
        </Text>
      )}
    </group>
  );
}

export default function GravityLab({ sceneConfig = {}, onConfigChange }) {
  const [resetKey, setResetKey] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(1); // Default select medium ball (index 1)
  const [showTooltip, setShowTooltip] = useState(false);

  // Read config from parent or default
  const gravity = sceneConfig.gravity !== undefined ? sceneConfig.gravity : 9.8;
  const show_force_vectors = sceneConfig.show_force_vectors !== undefined ? sceneConfig.show_force_vectors : true;
  const time_scale = sceneConfig.time_scale !== undefined ? sceneConfig.time_scale : 1.0;

  // We maintain masses array for the 3 balls. If sceneConfig.mass is changed, it affects the selected ball.
  const [masses, setMasses] = useState([2.0, 5.0, 15.0]);

  // Sync sceneConfig.mass into our masses state when it changes
  useEffect(() => {
    if (sceneConfig.mass !== undefined) {
      setMasses(prev => {
        const next = [...prev];
        next[selectedIdx] = sceneConfig.mass;
        return next;
        });
    }
  }, [sceneConfig.mass, selectedIdx]);

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  const handleMassSliderChange = (val) => {
    setMasses(prev => {
      const next = [...prev];
      next[selectedIdx] = val;
      return next;
    });
    handleSliderChange({ mass: val });
  };

  const currentMass = masses[selectedIdx];

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: 'radial-gradient(circle at center, #0a0a20 0%, #030308 100%)', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        position: 'relative'
      }}>
        <Canvas shadows camera={{ position: [0, 4, 11], fov: 50 }}>
          <color attach="background" args={['#030308']} />
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 8, -5]} intensity={0.4} />

          <StarsBackground />
          <CelestialBodies />
          
          {/* Floating Platform */}
          <group position={[0, -0.15, 0]}>
            <mesh receiveShadow castShadow>
              <boxGeometry args={[8, 0.3, 5]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.8} roughnessMap={null} />
            </mesh>
            {/* Grid overlay for aesthetic */}
            <gridHelper args={[8, 8, '#3b82f6', '#1e293b']} position={[0, 0.16, 0]} />
          </group>

          <PhysicsBalls 
            config={{ gravity, masses, show_force_vectors, time_scale }} 
            resetKey={resetKey}
            selectedIdx={selectedIdx}
            onBallClick={setSelectedIdx}
          />

          <GravityHUD gravity={gravity} mass={currentMass} selectedIdx={selectedIdx} />
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>

        {/* Info Tooltip Button inside Canvas */}
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
            transition: 'all 0.2s'
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
              <strong>Gravity Lab:</strong> This lab demonstrates freefall mechanics under gravity. In a vacuum, all objects fall with the same gravitational acceleration ($g$) regardless of their mass. Observe how changing mass does not affect drop speed, while modifying gravity changes the fall rate and scales the force vector ($F = m \cdot g$).
            </p>
          </div>
        )}
      </div>

      {/* Control Sliders (HTML/CSS below Canvas) */}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Gravity Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Gravity (g)</span>
              <span style={{ color: '#3b82f6', fontWeight: 600 }}>{gravity.toFixed(1)} m/s²</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="25" 
              step="0.1" 
              value={gravity}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
              onChange={e => handleSliderChange({ gravity: parseFloat(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              <span onClick={() => handleSliderChange({ gravity: 0 })} style={{ cursor: 'pointer' }}>0 (Zero-G 🌌)</span>
              <span onClick={() => handleSliderChange({ gravity: 3.7 })} style={{ cursor: 'pointer' }}>3.7 (Mars)</span>
              <span onClick={() => handleSliderChange({ gravity: 9.8 })} style={{ cursor: 'pointer' }}>9.8 (Earth)</span>
              <span onClick={() => handleSliderChange({ gravity: 24.8 })} style={{ cursor: 'pointer' }}>24.8 (Jupiter)</span>
            </div>
          </div>

          {/* Mass Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Mass (m) of Selected Ball ({selectedIdx + 1})</span>
              <span style={{ color: '#ec4899', fontWeight: 600 }}>{currentMass.toFixed(1)} kg</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="20" 
              step="0.5" 
              value={currentMass}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#ec4899' }}
              onChange={e => handleMassSliderChange(parseFloat(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              <span>0.5 kg (Feather)</span>
              <span>20.0 kg (Heavy)</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
          
          {/* Time Scale Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Time Scale (Speed)</span>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>{time_scale.toFixed(1)}x</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="3" 
              step="0.1" 
              value={time_scale}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
              onChange={e => handleSliderChange({ time_scale: parseFloat(e.target.value) })}
            />
          </div>

          {/* Toggle vectors and ball selection list */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={show_force_vectors}
                style={{ width: '16px', height: '16px', accentColor: '#f87171' }}
                onChange={e => handleSliderChange({ show_force_vectors: e.target.checked })}
              />
              Show Force Vectors
            </label>

            {/* Ball selection helper buttons */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Select ball:</span>
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  style={{
                    background: selectedIdx === idx ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                    border: selectedIdx === idx ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    color: selectedIdx === idx ? '#93c5fd' : '#94a3b8',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setResetKey(prev => prev + 1)}
            style={{
              flex: 1,
              padding: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
              fontSize: '13px'
            }}
          >
            RELEASE BALLS
          </button>
          <button
            onClick={() => {
              setMasses([2.0, 5.0, 15.0]);
              handleSliderChange({ gravity: 9.8, mass: 5.0, show_force_vectors: true, time_scale: 1.0 });
              setResetKey(prev => prev + 1);
            }}
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
            Reset Lab
          </button>
        </div>
      </div>
    </div>
  );
}
