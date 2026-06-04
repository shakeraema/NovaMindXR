import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function Tube({ position, color, label, opacity = 0.35, metalness = 0.8, roughness = 0.2 }) {
  return (
    <group position={position}>
      {/* Outer Tube */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.6, 4.2, 32, 1, true]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity} 
          side={THREE.DoubleSide}
          metalness={metalness}
          roughness={roughness}
        />
      </mesh>
      {/* Inner Tube Wall for depth */}
      <mesh scale={[0.95, 1, 0.95]}>
        <cylinderGeometry args={[0.55, 0.55, 4.2, 32, 1, true]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={opacity * 0.5} 
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Tube Label */}
      <Text position={[0, -2.4, 0]} fontSize={0.25} color="#cbd5e1" anchorY="top">
        {label}
      </Text>
    </group>
  );
}

function FallingCylinder({ positionY, isMagnet, color, glowColor, eddyGlowIntensity }) {
  return (
    <group>
      {/* The falling magnet/cylinder */}
      <mesh position={[0, positionY, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.5, 16]} />
        <meshStandardMaterial 
          color={isMagnet ? "#ef4444" : "#78716c"} 
          metalness={0.9} 
          roughness={0.1}
          emissive={isMagnet ? "#ef4444" : "#000000"}
          emissiveIntensity={isMagnet ? 0.3 : 0}
        />
        {/* If it's a magnet, show North/South pole division */}
        {isMagnet && (
          <mesh position={[0, 0.125, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.25, 16]} />
            <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.3} />
          </mesh>
        )}
      </mesh>

      {/* Visualizing Magnetic Field Lines around magnet */}
      {isMagnet && positionY > -2.1 && positionY < 2.1 && (
        <group position={[0, positionY, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.6, 0.02, 8, 24]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.3} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} scale={[1.3, 1.3, 1]}>
            <torusGeometry args={[0.6, 0.015, 8, 24]} />
            <meshBasicMaterial color="#a855f7" transparent opacity={0.15} />
          </mesh>
        </group>
      )}

      {/* Glowing Eddy Currents inside the tube wall */}
      {eddyGlowIntensity > 0.05 && positionY > -2.0 && positionY < 2.0 && (
        <mesh position={[0, positionY, 0]}>
          <cylinderGeometry args={[0.54, 0.54, 0.2, 16, 1, true]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent 
            opacity={Math.min(0.8, eddyGlowIntensity)} 
            side={THREE.DoubleSide} 
          />
        </mesh>
      )}
    </group>
  );
}

function LenzsLawSimulation({ 
  isMagnet = true, 
  magnetStrength = 3.0, 
  cylinderMass = 1.0, 
  isFalling, 
  setIsFalling, 
  telemetry, 
  setTelemetry 
}) {
  const gSim = 3.2; // simulated gravity acceleration
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.03);

    if (isFalling) {
      timeRef.current += dt;
      let allStopped = true;

      // Tube 1: Acrylic (No eddy currents, k = 0)
      const kAcrylic = 0;
      const vAcrylic = telemetry.acrylic.v + (gSim - (kAcrylic / cylinderMass) * telemetry.acrylic.v) * dt;
      let yAcrylic = telemetry.acrylic.y - vAcrylic * dt;
      let timeAcrylic = telemetry.acrylic.time;

      if (yAcrylic <= -2.0) {
        yAcrylic = -2.0;
        if (timeAcrylic === null) timeAcrylic = timeRef.current;
      } else {
        allStopped = false;
      }

      // Tube 2: Iron (Ferromagnetic attraction drag + small conduction, k = moderate)
      // If it's a magnet, iron has a dragging magnetic effect
      const kIron = isMagnet ? 1.4 * magnetStrength : 0;
      const vIron = telemetry.iron.v + (gSim - (kIron / cylinderMass) * telemetry.iron.v) * dt;
      let yIron = telemetry.iron.y - vIron * dt;
      let timeIron = telemetry.iron.time;

      if (yIron <= -2.0) {
        yIron = -2.0;
        if (timeIron === null) timeIron = timeRef.current;
      } else {
        allStopped = false;
      }

      // Tube 3: Copper (High conductivity, strong Eddy currents, k = large)
      const kCopper = isMagnet ? 3.8 * magnetStrength : 0;
      const vCopper = telemetry.copper.v + (gSim - (kCopper / cylinderMass) * telemetry.copper.v) * dt;
      let yCopper = telemetry.copper.y - vCopper * dt;
      let timeCopper = telemetry.copper.time;

      if (yCopper <= -2.0) {
        yCopper = -2.0;
        if (timeCopper === null) timeCopper = timeRef.current;
      } else {
        allStopped = false;
      }

      // Update state
      setTelemetry({
        acrylic: { y: yAcrylic, v: yAcrylic <= -2.0 ? 0 : vAcrylic, time: timeAcrylic },
        iron: { y: yIron, v: yIron <= -2.0 ? 0 : vIron, time: timeIron },
        copper: { y: yCopper, v: yCopper <= -2.0 ? 0 : vCopper, time: timeCopper }
      });

      if (allStopped) {
        setIsFalling(false);
      }
    }
  });

  // Calculate induced Eddy current intensity (proportional to velocity * magnet strength)
  const getEddyIntensity = (v, kCoeff) => {
    if (!isMagnet) return 0;
    return (v * magnetStrength * kCoeff) * 0.08;
  };

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <Stars radius={100} depth={50} count={200} factor={4} saturation={0.5} fade speed={1} />

      {/* Tube 1: Acrylic (Left) */}
      <group position={[-2.2, 0, 0]}>
        <Tube position={[0, 0, 0]} color="#94a3b8" label="Acrylic Tube" opacity={0.2} metalness={0.1} roughness={0.9} />
        <FallingCylinder 
          positionY={telemetry.acrylic.y} 
          isMagnet={isMagnet} 
          color="#38bdf8" 
          glowColor="#38bdf8" 
          eddyGlowIntensity={getEddyIntensity(telemetry.acrylic.v, 0)} 
        />
      </group>

      {/* Tube 2: Iron (Center) */}
      <group position={[0, 0, 0]}>
        <Tube position={[0, 0, 0]} color="#475569" label="Iron Tube" opacity={0.45} metalness={0.9} roughness={0.3} />
        <FallingCylinder 
          positionY={telemetry.iron.y} 
          isMagnet={isMagnet} 
          color="#f43f5e" 
          glowColor="#ef4444" 
          eddyGlowIntensity={getEddyIntensity(telemetry.iron.v, 0.4)} 
        />
      </group>

      {/* Tube 3: Copper (Right) */}
      <group position={[2.2, 0, 0]}>
        <Tube position={[0, 0, 0]} color="#ea580c" label="Copper Tube" opacity={0.5} metalness={0.95} roughness={0.15} />
        <FallingCylinder 
          positionY={telemetry.copper.y} 
          isMagnet={isMagnet} 
          color="#34d399" 
          glowColor="#10b981" 
          eddyGlowIntensity={getEddyIntensity(telemetry.copper.v, 1.2)} 
        />
      </group>
    </>
  );
}

export default function LenzsLaw({ sceneConfig = {}, onConfigChange }) {
  const isMagnet = sceneConfig.object_type !== 'non_magnetic';
  const magnetStrength = sceneConfig.magnet_strength !== undefined ? sceneConfig.magnet_strength : 3.0;
  const cylinderMass = sceneConfig.cylinder_mass !== undefined ? sceneConfig.cylinder_mass : 1.0;

  const [isFalling, setIsFalling] = useState(false);
  const [telemetry, setTelemetry] = useState({
    acrylic: { y: 2.0, v: 0, time: null },
    iron: { y: 2.0, v: 0, time: null },
    copper: { y: 2.0, v: 0, time: null }
  });

  const handleStartDrop = () => {
    setTelemetry({
      acrylic: { y: 2.0, v: 0, time: null },
      iron: { y: 2.0, v: 0, time: null },
      copper: { y: 2.0, v: 0, time: null }
    });
    setIsFalling(true);
  };

  const handleReset = () => {
    setIsFalling(false);
    setTelemetry({
      acrylic: { y: 2.0, v: 0, time: null },
      iron: { y: 2.0, v: 0, time: null },
      copper: { y: 2.0, v: 0, time: null }
    });
  };

  const handleObjectTypeChange = (type) => {
    if (onConfigChange) {
      onConfigChange({ object_type: type });
    }
  };

  const handleStrengthChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ magnet_strength: val });
    }
  };

  const handleMassChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ cylinder_mass: val });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Viewport */}
      <div style={{
        width: '100%',
        height: '420px',
        background: 'radial-gradient(circle at center, #0b0f19 0%, #020408 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <Canvas camera={{ position: [0, 1.0, 5.5], fov: 45 }}>
          <LenzsLawSimulation 
            isMagnet={isMagnet} 
            magnetStrength={magnetStrength} 
            cylinderMass={cylinderMass} 
            isFalling={isFalling}
            setIsFalling={setIsFalling}
            telemetry={telemetry}
            setTelemetry={setTelemetry}
          />
          <OrbitControls enableZoom={true} maxDistance={10} minDistance={3} />
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
            Lenz's Law Electromagnetic Induction Telemetry
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={handleStartDrop}
              disabled={isFalling}
              style={{
                fontSize: '11px',
                background: isFalling ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.85)',
                border: 'none',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: isFalling ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              ⚡ DROP CYLINDERS
            </button>
            <button 
              onClick={handleReset}
              style={{
                fontSize: '11px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#fca5a5',
                padding: '3px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              🔄 RESET
            </button>
          </div>
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          
          {/* Object Type Selection */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Dropped Cylinder Type</span>
            </div>
            <select 
              value={isMagnet ? 'magnetic' : 'non_magnetic'} 
              onChange={e => handleObjectTypeChange(e.target.value)}
              style={{ 
                width: '100%', 
                background: 'rgba(30, 41, 59, 0.8)', 
                border: '1px solid rgba(148, 163, 184, 0.3)', 
                color: 'white', 
                padding: '6px', 
                borderRadius: '6px',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="magnetic">🧲 Neodymium Magnet</option>
              <option value="non_magnetic">🪵 Non-Magnetic Cylinder</option>
            </select>
          </div>

          {/* Magnet Strength */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Magnet Flux Density ($B$)</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{isMagnet ? `${magnetStrength.toFixed(1)} Tesla` : '0 T (Wood)'}</span>
            </div>
            <input 
              type="range"
              min="1.0"
              max="6.0"
              step="0.5"
              disabled={!isMagnet}
              value={magnetStrength}
              onChange={e => handleStrengthChange(parseFloat(e.target.value))}
              style={{ 
                width: '100%', 
                accentColor: '#3b82f6', 
                cursor: isMagnet ? 'pointer' : 'not-allowed',
                opacity: isMagnet ? 1 : 0.4 
              }}
            />
          </div>

          {/* Cylinder Mass */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Cylinder Mass ($m$)</span>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{cylinderMass.toFixed(2)} kg</span>
            </div>
            <input 
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={cylinderMass}
              onChange={e => handleMassChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Real-time stats box */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          background: 'rgba(10, 10, 26, 0.4)',
          borderRadius: '8px',
          padding: '10px',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          <div>
            <span style={{ color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Acrylic Tube</span>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Velocity: <strong style={{ color: '#38bdf8' }}>{telemetry.acrylic.v.toFixed(2)} m/s</strong>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Fall Time: <strong style={{ color: '#fff' }}>{telemetry.acrylic.time ? `${telemetry.acrylic.time.toFixed(2)}s` : 'falling...'}</strong>
            </div>
          </div>
          <div>
            <span style={{ color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Iron Tube</span>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Velocity: <strong style={{ color: '#f43f5e' }}>{telemetry.iron.v.toFixed(2)} m/s</strong>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Fall Time: <strong style={{ color: '#fff' }}>{telemetry.iron.time ? `${telemetry.iron.time.toFixed(2)}s` : 'falling...'}</strong>
            </div>
          </div>
          <div>
            <span style={{ color: '#cbd5e1', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Copper Tube</span>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Velocity: <strong style={{ color: '#34d399' }}>{telemetry.copper.v.toFixed(2)} m/s</strong>
            </div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Fall Time: <strong style={{ color: '#fff' }}>{telemetry.copper.time ? `${telemetry.copper.time.toFixed(2)}s` : 'falling...'}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
