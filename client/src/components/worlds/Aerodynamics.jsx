import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function AirflowSimulation({ angleOfAttack = 5, windSpeed = 15, airDensity = 1.2 }) {
  const pointsRef = useRef();
  const particleCount = 100;
  const particles = useRef([]);

  // Initialize flow particles
  useEffect(() => {
    const list = [];
    for (let i = 0; i < particleCount; i++) {
      list.push({
        x: -5 + Math.random() * 10,
        y: (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 1.5,
        speedMult: 0.8 + Math.random() * 0.4
      });
    }
    particles.current = list;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.03);
    const alphaRad = (angleOfAttack * Math.PI) / 180;
    const isStalled = angleOfAttack > 18;

    const positions = pointsRef.current.geometry.attributes.position.array;

    particles.current.forEach((p, idx) => {
      // Basic horizontal translation
      p.x += windSpeed * p.speedMult * 0.3 * dt;

      // Deflect path around airfoil wing cross section in center
      // Wing profile represented around x = 0, y = 0
      const distToWing = Math.sqrt(p.x * p.x + p.y * p.y);
      if (distToWing < 1.5 && p.x < 1.0) {
        // Upper vs Lower flow deflection based on Angle of Attack
        const topProfile = 0.4 + Math.sin(p.x * 2.0) * 0.15 + (p.x * -0.1) + Math.sin(alphaRad) * 0.4;
        const bottomProfile = -0.3 + Math.sin(p.x * 2.0) * 0.05 + (p.x * -0.05) - Math.sin(alphaRad) * 0.2;

        if (p.y > 0) {
          // Flow over the top
          if (isStalled && p.x > 0) {
            // Stall: create turbulent separation (random high amplitude vibration)
            p.y = topProfile + (Math.random() - 0.5) * 0.6;
            p.x += (Math.random() - 0.5) * 0.2;
          } else {
            // Coherent flow
            p.y = THREE.MathUtils.lerp(p.y, topProfile + 0.1, 0.1);
          }
        } else {
          // Flow underneath
          p.y = THREE.MathUtils.lerp(p.y, bottomProfile - 0.1, 0.1);
        }
      }

      // Recycle particles crossing boundary
      if (p.x > 5) {
        p.x = -5;
        p.y = (Math.random() - 0.5) * 4;
      }

      // Write to position array
      positions[idx * 3] = p.x;
      positions[idx * 3 + 1] = p.y;
      positions[idx * 3 + 2] = p.z;
    });

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[0, 10, 0]} intensity={0.6} />

      {/* Airfoil Wing Model */}
      <group rotation={[0, 0, (angleOfAttack * Math.PI) / 180]}>
        <mesh>
          <extrudeGeometry args={[
            (() => {
              const shape = new THREE.Shape();
              // Standard wing profile coordinates
              shape.moveTo(-1.2, 0);
              shape.quadraticCurveTo(-0.6, 0.45, 0, 0.4);
              shape.quadraticCurveTo(0.8, 0.2, 1.4, 0.02);
              shape.lineTo(1.4, -0.02);
              shape.quadraticCurveTo(0.6, -0.15, 0, -0.2);
              shape.quadraticCurveTo(-0.6, -0.22, -1.2, 0);
              return shape;
            })(),
            { depth: 2.0, bevelEnabled: false }
          ]} />
          {/* Shift mesh center to origin */}
          <meshStandardMaterial 
            color="#334155" 
            metalness={0.7} 
            roughness={0.3} 
            emissive={angleOfAttack > 18 ? "#7f1d1d" : "#1e3a8a"}
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>

      {/* Airflow Particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(particleCount * 3), 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.08} color="#38bdf8" transparent opacity={0.6} />
      </points>

      {/* Lift Force Vector Arrow (Green) */}
      {windSpeed > 5 && (
        <group>
          {/* Lift Vector (Y-axis) */}
          <mesh position={[0, 1.2, 0]}>
            <cylinderGeometry args={[0.04, 0.04, Math.max(0.2, (windSpeed * Math.sin((angleOfAttack + 5) * Math.PI / 180)) * 0.15), 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, 1.2 + Math.max(0.2, (windSpeed * Math.sin((angleOfAttack + 5) * Math.PI / 180)) * 0.15)/2, 0]}>
            <coneGeometry args={[0.12, 0.3, 8]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      )}

      {/* Drag Force Vector Arrow (Red) */}
      <group>
        <mesh position={[1.2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, Math.max(0.2, windSpeed * 0.08 + (angleOfAttack > 18 ? 1.5 : 0.2)), 8]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </>
  );
}

export default function Aerodynamics({ sceneConfig = {}, onConfigChange }) {
  const angleOfAttack = sceneConfig.angle_of_attack !== undefined ? sceneConfig.angle_of_attack : 6;
  const windSpeed = sceneConfig.wind_speed !== undefined ? sceneConfig.wind_speed : 15;
  const airDensity = sceneConfig.air_density !== undefined ? sceneConfig.air_density : 1.2;

  const isStalled = angleOfAttack > 18;
  
  // Lift equation: L = 1/2 * rho * V^2 * Cl
  const Cl = isStalled ? 0.2 : Math.sin(2 * angleOfAttack * Math.PI / 180) * 1.5 + 0.1;
  const liftForce = 0.5 * airDensity * windSpeed * windSpeed * 0.05 * Cl;
  
  // Drag equation: D = 1/2 * rho * V^2 * Cd
  const Cd = 0.05 + Math.pow(Cl, 2) / (Math.PI * 1.2) + (isStalled ? 0.45 : 0);
  const dragForce = 0.5 * airDensity * windSpeed * windSpeed * 0.05 * Cd;

  const handleAngleChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ angle_of_attack: val });
    }
  };

  const handleSpeedChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ wind_speed: val });
    }
  };

  const handleDensityChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ air_density: val });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Viewport */}
      <div style={{
        width: '100%',
        height: '420px',
        background: 'radial-gradient(circle at center, #050b18 0%, #010206 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <Canvas camera={{ position: [0, 0, 6.0], fov: 45 }}>
          <AirflowSimulation angleOfAttack={angleOfAttack} windSpeed={windSpeed} airDensity={airDensity} />
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
            Aerodynamic Telemetry Dashboard
          </span>
          <span style={{
            fontSize: '11px',
            background: isStalled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
            border: isStalled ? '1px solid #ef4444' : '1px solid #34d399',
            color: isStalled ? '#f87171' : '#34d399',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {isStalled ? "⚠️ AIRFOIL WING STALLED" : "COHERENT LIFT COEFF ACTIVE"}
          </span>
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
          
          {/* Angle of Attack */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Angle of Attack ($\alpha$)</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{angleOfAttack.toFixed(0)}°</span>
            </div>
            <input 
              type="range"
              min="-10"
              max="30"
              step="1"
              value={angleOfAttack}
              onChange={e => handleAngleChange(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          {/* Wind Speed */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Air Velocity ($V$)</span>
              <span style={{ color: '#34d399', fontWeight: 'bold' }}>{windSpeed.toFixed(0)} m/s</span>
            </div>
            <input 
              type="range"
              min="5"
              max="35"
              step="1"
              value={windSpeed}
              onChange={e => handleSpeedChange(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* Air Density */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Air Density ($\rho$)</span>
              <span style={{ color: '#a855f7', fontWeight: 'bold' }}>{airDensity.toFixed(2)} $kg/m^3$</span>
            </div>
            <input 
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={airDensity}
              onChange={e => handleDensityChange(parseFloat(e.target.value))}
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
            <span style={{ color: '#64748b', display: 'block' }}>Lift Force ($F_L$)</span>
            <strong style={{ color: isStalled ? '#f87171' : '#10b981' }}>{liftForce.toFixed(1)} N</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Drag Force ($F_D$)</span>
            <strong style={{ color: '#ef4444' }}>{dragForce.toFixed(1)} N</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Lift-to-Drag Ratio</span>
            <strong style={{ color: '#60a5fa' }}>{(liftForce / Math.max(0.1, dragForce)).toFixed(2)}</strong>
          </div>
        </div>

      </div>
    </div>
  );
}
