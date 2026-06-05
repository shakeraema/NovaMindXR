import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function RelativisticShip({ speed = 0.5, massDensity = 1.0 }) {
  const shipRef = useRef();
  const bodyRef = useRef();
  const clockRef = useRef();

  // Lorentz Factor: gamma = 1 / sqrt(1 - v^2/c^2)
  const gamma = 1 / Math.sqrt(1 - speed * speed);
  const lengthContractionFactor = 1 / gamma;

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (shipRef.current) {
      // Spacecraft moving back and forth on X axis
      const loopWidth = 10;
      const x = (elapsed * 2) % (loopWidth * 2) - loopWidth; // range [-10, 10]
      const dir = Math.sin(elapsed * 2) > 0 ? 1 : -1;
      
      shipRef.current.position.x = x;
      
      // Determine Doppler color shift: approaching (blueshift) vs receding (redshift)
      // Moving right (+X) is approaching the camera/observer at X = 0 from X < 0, etc.
      const isApproaching = (x < 0 && dir > 0) || (x > 0 && dir < 0);
      const dopplerColor = isApproaching 
        ? new THREE.Color(0.2, 0.4, 0.9 + speed * 0.1) // Blueshift
        : new THREE.Color(0.9 + speed * 0.1, 0.2, 0.2); // Redshift
      
      if (bodyRef.current && bodyRef.current.material) {
        bodyRef.current.material.color.lerp(dopplerColor, 0.1);
      }

      // Rotate spaceship clock pointer (Time Dilation effect)
      if (clockRef.current) {
        // Spin rate scales by 1/gamma
        clockRef.current.rotation.y = elapsed * 5 * lengthContractionFactor;
      }
    }
  });

  return (
    <group ref={shipRef}>
      {/* Ship Body - Length contracted along X-axis */}
      <mesh ref={bodyRef} scale={[lengthContractionFactor * 1.5, 0.4, 0.4]}>
        <coneGeometry args={[0.5, 2.0, 16]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} color="#60a5fa" />
      </mesh>
      
      {/* Thruster Flame */}
      <mesh position={[-lengthContractionFactor * 1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshBasicMaterial color="#f97316" />
      </mesh>

      {/* Onboard Relativistic Clock */}
      <group position={[0, 0.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {/* Clock Face */}
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Clock Hand */}
        <mesh ref={clockRef} position={[0, 0.04, 0]}>
          <boxGeometry args={[0.03, 0.02, 0.22]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

function RelativitySimulation({ speed = 0.5, massDensity = 1.0 }) {
  const gridRef = useRef();
  const stationaryHandRef = useRef();

  // Space-Time grid warp inside useFrame
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (gridRef.current) {
      gridRef.current.position.y = -1.2 + Math.sin(elapsed) * 0.05 * massDensity;
    }
    if (stationaryHandRef.current) {
      stationaryHandRef.current.rotation.y = elapsed * 5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />
      <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1} />

      {/* Space-Time Grid (Visualizing Mass warping grid) */}
      <group ref={gridRef} position={[0, -1.2, 0]}>
        <gridHelper args={[20, 20, "#3b82f6", "#1e293b"]} />
      </group>

      {/* Relativistic Spaceship */}
      <RelativisticShip speed={speed} massDensity={massDensity} />

      {/* Stationary Observer Post */}
      <group position={[0, 1.8, 0]}>
        <mesh>
          <cylinderGeometry args={[0.6, 0.6, 0.2, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
        {/* Stationary Clock */}
        <group position={[0, 0.4, 0]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.4, 0.06, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          {/* Hand spins at absolute normal speed */}
          <mesh ref={stationaryHandRef}>
            <boxGeometry args={[0.04, 0.02, 0.3]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        </group>
        <Text position={[0, 1.0, 0]} fontSize={0.25} color="#34d399">
          STATIONARY OBSERVER
        </Text>
      </group>

      {/* Center gravitational warp visualizer */}
      {massDensity > 1.2 && (
        <mesh position={[0, -1.2, 0]}>
          <sphereGeometry args={[massDensity * 0.4, 32, 32]} />
          <meshBasicMaterial color="#8b5cf6" opacity={0.15} transparent wireframe />
        </mesh>
      )}
    </>
  );
}

export default function RelativityRun({ sceneConfig = {}, onConfigChange }) {
  const speed = sceneConfig.speed !== undefined ? sceneConfig.speed : 0.6; // v/c
  const massDensity = sceneConfig.mass_density !== undefined ? sceneConfig.mass_density : 1.0;

  // Lorentz Factor: gamma = 1 / sqrt(1 - v^2/c^2)
  const gamma = 1 / Math.sqrt(1 - speed * speed);

  const handleSpeedChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ speed: val });
    }
  };

  const handleMassChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ mass_density: val });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Viewport */}
      <div style={{
        width: '100%',
        height: '420px',
        background: 'radial-gradient(circle at center, #070716 0%, #020206 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
          <RelativitySimulation speed={speed} massDensity={massDensity} />
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
            Einsteinian Relativistic Telemetry
          </span>
          <span style={{
            fontSize: '11px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid #8b5cf6',
            color: '#a5b4fc',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            LORENTZ FACTOR ($\gamma$): {gamma.toFixed(3)}
          </span>
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Speed Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Spacecraft Speed ($v/c$)</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{(speed * 100).toFixed(0)}% Light Speed</span>
            </div>
            <input 
              type="range"
              min="0.0"
              max="0.99"
              step="0.01"
              value={speed}
              onChange={e => handleSpeedChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          {/* Local Mass Warp Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Space-Time Mass Density</span>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{massDensity.toFixed(1)}x Solar Mass</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={massDensity}
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
            <span style={{ color: '#64748b', display: 'block' }}>Length Contraction</span>
            <strong style={{ color: '#60a5fa' }}>{(100 / gamma).toFixed(1)}% (Rest size)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Clock Speed</span>
            <strong style={{ color: '#34d399' }}>{(1 / gamma).toFixed(3)}x (Normal)</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Doppler Shift</span>
            <strong style={{ color: '#fca5a5' }}>
              {speed > 0.8 ? "Extreme Blueshift" : speed > 0.4 ? "Normal Shift" : "Classical"}
            </strong>
          </div>
        </div>

      </div>
    </div>
  );
}
