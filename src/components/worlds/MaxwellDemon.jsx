import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

function DemonParticles({ sceneConfig = {}, onConfigChange }) {
  const isAutoSorting = sceneConfig.is_auto_sorting !== undefined ? sceneConfig.is_auto_sorting : false;
  const demonSpeed = sceneConfig.demon_speed !== undefined ? sceneConfig.demon_speed : 1.0;
  const initialParticleSpeed = sceneConfig.particle_speed !== undefined ? sceneConfig.particle_speed : 2.5;

  const [particles, setParticles] = useState([]);
  const [doorOpen, setDoorOpen] = useState(false);
  
  // Initialize particles once on mount
  useEffect(() => {
    const list = [];
    const count = 30;
    for (let i = 0; i < count; i++) {
      // 15 Fast (Red), 15 Slow (Blue)
      const isFast = i < 15;
      const speed = isFast ? initialParticleSpeed * 1.5 : initialParticleSpeed * 0.5;
      const angle = Math.random() * Math.PI * 2;
      
      list.push({
        id: i,
        x: (Math.random() - 0.5) * 6,
        y: (Math.random() - 0.5) * 3.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        isFast
      });
    }
    setParticles(list);
  }, [initialParticleSpeed]);

  useFrame((state, delta) => {
    // Limit delta to prevent huge jumps on lag spikes
    const dt = Math.min(delta, 0.03);

    // Sync door state
    const doorSize = 1.0;

    // Automatic Demon Sorting Action
    let tempDoorOpen = false;
    if (isAutoSorting) {
      // Demon monitors boundaries:
      // If a FAST particle (red) in Right chamber (x > 0) is heading Left (vx < 0) and is close to center (x in [0, 0.5]), OR
      // a SLOW particle (blue) in Left chamber (x < 0) is heading Right (vx > 0) and is close to center (x in [-0.5, 0]).
      particles.forEach(p => {
        if (Math.abs(p.y) < doorSize) {
          const fastHeadingLeft = p.isFast && p.x > 0 && p.x < 0.6 && p.vx < 0;
          const slowHeadingRight = !p.isFast && p.x < 0 && p.x > -0.6 && p.vx > 0;
          
          if (fastHeadingLeft || slowHeadingRight) {
            // Demon reacts at sorting speed
            if (Math.random() < demonSpeed * 0.3) {
              tempDoorOpen = true;
            }
          }
        }
      });
    }

    setDoorOpen(prev => isAutoSorting ? tempDoorOpen : prev);

    // Update particle positions and check wall/door collisions
    setParticles(prev => {
      let leftFastCount = 0;
      let rightFastCount = 0;
      let leftSlowCount = 0;
      let rightSlowCount = 0;

      const next = prev.map(p => {
        let nx = p.x + p.vx * dt;
        let ny = p.y + p.vy * dt;

        const boundsX = 3.8;
        const boundsY = 2.4;

        // Bounce Y-axis boundaries
        if (Math.abs(ny) >= boundsY) {
          p.vy = -p.vy;
          ny = ny > 0 ? boundsY - 0.05 : -boundsY + 0.05;
        }

        // Bounce Outer X-axis boundaries
        if (Math.abs(nx) >= boundsX) {
          p.vx = -p.vx;
          nx = nx > 0 ? boundsX - 0.05 : -boundsX + 0.05;
        }

        // Center Divider trapdoor boundary at x = 0
        const isDoorActive = isAutoSorting ? tempDoorOpen : doorOpen;
        if (p.x * nx <= 0) { // Crossed the divider
          if (Math.abs(ny) > doorSize || !isDoorActive) {
            // Collision with center wall! Bounce back
            p.vx = -p.vx;
            nx = p.x > 0 ? 0.05 : -0.05;
          }
        }

        // Tally particle chamber distribution for temperatures
        if (nx < 0) {
          if (p.isFast) leftFastCount++;
          else leftSlowCount++;
        } else {
          if (p.isFast) rightFastCount++;
          else rightSlowCount++;
        }

        return { ...p, x: nx, y: ny };
      });

      // Update parent telemetry dynamically
      const tempDiff = Math.abs(
        (leftFastCount * 1.5 + leftSlowCount * 0.5) - 
        (rightFastCount * 1.5 + rightSlowCount * 0.5)
      );
      if (onConfigChange && Math.random() < 0.1) {
        onConfigChange({ 
          _temp_diff: tempDiff, 
          _left_temp: (leftFastCount * 2 + leftSlowCount * 0.5) * 5,
          _right_temp: (rightFastCount * 2 + rightSlowCount * 0.5) * 5
        });
      }

      return next;
    });
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />

      {/* Chamber Outlines */}
      <mesh position={[0, 0, -0.5]}>
        <boxGeometry args={[8.0, 5.0, 0.1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      {/* Chamber Outer Boundaries */}
      <line>
        <bufferGeometry attach="geometry" callback={(geom) => {
          const points = [
            new THREE.Vector3(-4, 2.5, 0),
            new THREE.Vector3(4, 2.5, 0),
            new THREE.Vector3(4, -2.5, 0),
            new THREE.Vector3(-4, -2.5, 0),
            new THREE.Vector3(-4, 2.5, 0)
          ];
          geom.setFromPoints(points);
        }} />
        <lineBasicMaterial attach="material" color="#475569" linewidth={2} />
      </line>

      {/* Center Divider Wall (Top & Bottom divider blocks) */}
      <group position={[0, 0, 0]}>
        {/* Top Divider block */}
        <mesh position={[0, 1.8, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.4]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        {/* Bottom Divider block */}
        <mesh position={[0, -1.8, 0]}>
          <boxGeometry args={[0.1, 1.5, 0.4]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>

        {/* Dynamic Door Mesh */}
        <mesh 
          position={[0, 0, 0]} 
          scale={[1, doorOpen ? 0.05 : 1, 1]}
          style={{ transition: 'all 0.1s ease' }}
        >
          <boxGeometry args={[0.15, 2.0, 0.4]} />
          <meshStandardMaterial color={doorOpen ? "#22c55e" : "#ef4444"} emissive={doorOpen ? "#22c55e" : "#ef4444"} emissiveIntensity={0.2} />
        </mesh>
      </group>

      {/* Particles */}
      {particles.map(p => (
        <mesh key={p.id} position={[p.x, p.y, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial 
            color={p.isFast ? "#ef4444" : "#3b82f6"} 
            emissive={p.isFast ? "#ef4444" : "#3b82f6"}
            emissiveIntensity={p.isFast ? 0.5 : 0.2}
            roughness={0.1}
          />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[-2.0, 2.8, 0]} fontSize={0.3} color="#cbd5e1">
        LEFT CHAMBER
      </Text>
      <Text position={[2.0, 2.8, 0]} fontSize={0.3} color="#cbd5e1">
        RIGHT CHAMBER
      </Text>
    </>
  );
}

export default function MaxwellDemon({ sceneConfig = {}, onConfigChange }) {
  const isAutoSorting = sceneConfig.is_auto_sorting !== undefined ? sceneConfig.is_auto_sorting : false;
  const demonSpeed = sceneConfig.demon_speed !== undefined ? sceneConfig.demon_speed : 0.8;
  const particleSpeed = sceneConfig.particle_speed !== undefined ? sceneConfig.particle_speed : 2.5;

  // Read temperatures from state (reported dynamically from frames)
  const leftTemp = sceneConfig._left_temp || 50;
  const rightTemp = sceneConfig._right_temp || 50;
  const tempDiff = sceneConfig._temp_diff || 0;
  
  // Entropy calculation: scales downwards as temperature splits
  const entropy = Math.max(10, 100 - tempDiff * 6);

  const handleAutoToggle = () => {
    if (onConfigChange) {
      onConfigChange({ is_auto_sorting: !isAutoSorting });
    }
  };

  const handleDemonSpeedChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ demon_speed: val });
    }
  };

  const handleSpeedChange = (val) => {
    if (onConfigChange) {
      onConfigChange({ particle_speed: val });
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Viewport */}
      <div style={{
        width: '100%',
        height: '420px',
        background: 'radial-gradient(circle at center, #050510 0%, #010103 100%)',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}>
        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
          <DemonParticles sceneConfig={sceneConfig} onConfigChange={onConfigChange} />
          <OrbitControls enableZoom={true} maxDistance={12} minDistance={4} />
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
            Thermodynamic Entropy & Temperature Telemetry
          </span>
          <span style={{
            fontSize: '11px',
            background: isAutoSorting ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: isAutoSorting ? '1px solid #34d399' : '1px solid #ef4444',
            color: isAutoSorting ? '#34d399' : '#f87171',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {isAutoSorting ? "MAXWELL DEMON FILTER ACTIVE" : "MANUAL SYSTEM EQUILIBRIUM"}
          </span>
        </div>

        {/* Controls Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Demon sorting response rate */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Demon Sorting Response Speed</span>
              <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>{(demonSpeed * 100).toFixed(0)}% Reaction</span>
            </div>
            <input 
              type="range"
              min="0.2"
              max="1.0"
              step="0.1"
              disabled={!isAutoSorting}
              value={demonSpeed}
              onChange={e => handleDemonSpeedChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', cursor: isAutoSorting ? 'pointer' : 'not-allowed' }}
            />
          </div>

          {/* Average Particle Velocity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>System Thermal Velocity</span>
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{particleSpeed.toFixed(1)} m/s</span>
            </div>
            <input 
              type="range"
              min="1.0"
              max="5.0"
              step="0.5"
              value={particleSpeed}
              onChange={e => handleSpeedChange(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#ef4444', cursor: 'pointer' }}
            />
          </div>

        </div>

        {/* Temperature Indicators & Entropy progress */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', background: 'rgba(10, 10, 26, 0.4)', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
          
          {/* Temperatures */}
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Left Chamber Temp</span>
              <strong style={{ color: '#ef4444', fontSize: '16px' }}>{leftTemp.toFixed(0)} K</strong>
            </div>
            <div style={{ fontSize: '16px', color: '#64748b' }}>➔</div>
            <div>
              <span style={{ color: '#64748b', display: 'block', fontSize: '11px', textTransform: 'uppercase' }}>Right Chamber Temp</span>
              <strong style={{ color: '#3b82f6', fontSize: '16px' }}>{rightTemp.toFixed(0)} K</strong>
            </div>
          </div>

          {/* Entropy progress */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
              <span>SYSTEM ENTROPY ($S$)</span>
              <strong style={{ color: entropy < 40 ? '#ef4444' : '#60a5fa' }}>{entropy.toFixed(0)}%</strong>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${entropy}%`,
                background: entropy < 40 ? 'linear-gradient(90deg, #ef4444, #f97316)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                transition: 'width 0.2s ease-in-out'
              }} />
            </div>
          </div>

        </div>

        {/* Auto Demon sorting toggle button */}
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={handleAutoToggle}
            style={{
              width: '100%',
              padding: '10px',
              background: isAutoSorting ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(59, 130, 246, 0.1)',
              border: isAutoSorting ? 'none' : '1px solid rgba(59, 130, 246, 0.3)',
              color: isAutoSorting ? 'white' : '#60a5fa',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s',
              boxShadow: isAutoSorting ? '0 4px 10px rgba(16, 185, 129, 0.2)' : 'none'
            }}
          >
            {isAutoSorting ? "✓ DEMON sorting AUTOMATICALLY" : "🔬 DEPLOY MAXWELL'S DEMON"}
          </button>
        </div>
      </div>
    </div>
  );
}
