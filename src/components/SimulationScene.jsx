import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import WhatIfControls from './WhatIfControls';

// Euler physics simulation component
function FallingBall({ config, resetKey }) {
  const {
    gravity = 9.8,
    mass = 5.0,
    show_force_vectors = true,
    time_scale = 1.0
  } = config;

  const meshRef = useRef();
  
  // Physics states stored in refs for high-frequency updates without re-renders
  const position = useRef([0, 8, 0]); // start at height 8
  const velocity = useRef([0, 0, 0]);
  
  // Reset position/velocity when resetKey changes or parameters change
  useEffect(() => {
    position.current = [0, 8, 0];
    velocity.current = [0, 0, 0];
    if (meshRef.current) {
      meshRef.current.position.set(0, 8, 0);
    }
  }, [resetKey, gravity, mass]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1) * time_scale; // Clamp dt to prevent tunneling
    
    // Accel under gravity with a tiny air drag factor
    const dragCoeff = 0.15;
    const accelY = -gravity - (dragCoeff * velocity.current[1]) / mass;
    
    velocity.current[1] += accelY * dt;
    position.current[1] += velocity.current[1] * dt;
    
    // Collision check
    if (position.current[1] <= 0.5) {
      position.current[1] = 0.5;
      velocity.current[1] = -velocity.current[1] * 0.65;
      
      if (Math.abs(velocity.current[1]) < 0.2) {
        velocity.current[1] = 0;
      }
    }
    
    if (meshRef.current) {
      meshRef.current.position.set(position.current[0], position.current[1], position.current[2]);
    }
  });

  const force = gravity * mass;
  const arrowLength = Math.max(0.5, Math.min(force / 15, 3.5));

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.7} 
          roughness={0.2}
          emissive="#1e3a8a"
          emissiveIntensity={0.2}
        />
        {show_force_vectors && (
          <group position={[0, 0, 0]}>
            <arrowHelper
              args={[
                new THREE.Vector3(0, -1, 0),
                new THREE.Vector3(0, 0, 0),
                arrowLength,
                '#ef4444',
                0.3,
                0.15
              ]}
            />
          </group>
        )}
      </mesh>
    </group>
  );
}

// Ground Grid Floor
function Ground() {
  return (
    <group>
      <gridHelper args={[30, 30, '#3b82f6', '#1e293b']} position={[0, 0, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0b0b1e" roughness={0.8} metalness={0.2} />
      </mesh>
    </group>
  );
}

// 3D Scene HUD Labels
function SceneHUD({ config }) {
  const { gravity = 9.8, mass = 5.0 } = config;
  const forceVal = gravity * mass;

  return (
    <group position={[-9, 7.5, 0]}>
      <Text position={[0, 0, 0]} fontSize={0.45} color="#60a5fa" anchorX="left" font="https://fonts.gstatic.com/s/outfit/v11/0oWqF3EKG2dy.woff">
        {`Gravity (g): ${gravity.toFixed(2)} m/s²`}
      </Text>
      <Text position={[0, -0.6, 0]} fontSize={0.45} color="#60a5fa" anchorX="left" font="https://fonts.gstatic.com/s/outfit/v11/0oWqF3EKG2dy.woff">
        {`Ball Mass (m): ${mass.toFixed(1)} kg`}
      </Text>
      <Text position={[0, -1.2, 0]} fontSize={0.4} color="#f87171" anchorX="left" font="https://fonts.gstatic.com/s/outfit/v11/0oWqF3EKG2dy.woff">
        {`Gravity Force (F = m·g): ${forceVal.toFixed(1)} N`}
      </Text>
    </group>
  );
}

export default function SimulationScene({ diagnosisConfig = {}, onConfigChange }) {
  const [liveConfig, setLiveConfig] = useState({
    gravity: diagnosisConfig.gravity ?? 9.8,
    mass: diagnosisConfig.mass ?? 5.0,
    show_force_vectors: diagnosisConfig.show_force_vectors ?? true,
    time_scale: diagnosisConfig.time_scale ?? 1.0
  });

  const [resetKey, setResetKey] = useState(0);

  // When a new diagnosis config comes from the API, reinitialize our states
  useEffect(() => {
    if (diagnosisConfig.gravity !== undefined) {
      setLiveConfig({
        gravity: diagnosisConfig.gravity,
        mass: diagnosisConfig.mass ?? 5.0,
        show_force_vectors: diagnosisConfig.show_force_vectors ?? true,
        time_scale: diagnosisConfig.time_scale ?? 1.0
      });
      // Force ball drop on new configurations
      setResetKey(prev => prev + 1);
    }
  }, [diagnosisConfig]);

  const handleSliderChange = (newConfig) => {
    const updated = { ...liveConfig, ...newConfig };
    setLiveConfig(updated);
    if (onConfigChange) {
      onConfigChange(updated);
    }
  };

  const handleReset = () => {
    setResetKey(prev => prev + 1);
  };

  return (
    <div style={{ width: '100%' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: 'radial-gradient(circle at center, #101030 0%, #06060f 100%)', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}>
        <Canvas 
          shadows 
          camera={{ position: [0, 5, 12], fov: 50 }}
        >
          <color attach="background" args={['#06060f']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 15, 10]} intensity={1.5} castShadow />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />

          <Ground />
          <FallingBall config={liveConfig} resetKey={resetKey} />
          <SceneHUD config={liveConfig} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
          />
        </Canvas>
      </div>

      {/* Control deck directly bound underneath */}
      <WhatIfControls 
        config={liveConfig} 
        onConfigChange={handleSliderChange} 
        onReset={handleReset}
      />
    </div>
  );
}
