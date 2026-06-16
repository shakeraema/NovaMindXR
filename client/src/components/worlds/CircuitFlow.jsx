import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Electron loop path calculations
function getPositionOnLoop(t) {
  const width = 8;
  const height = 4.5;
  const halfW = width / 2;
  const halfH = height / 2;
  
  // Perimeter segments:
  // Bottom: halfW (4) to the right, then up, then left, then down.
  // Segment lengths: Bottom = 8, Right = 4.5, Top = 8, Left = 4.5. Total = 25.
  const total = 25;
  const val = t % total;

  if (val < 8) {
    // Bottom segment: from [-4, -2.25] to [4, -2.25]
    return new THREE.Vector3(-halfW + val, -halfH, 0);
  } else if (val < 12.5) {
    // Right segment: from [4, -2.25] to [4, 2.25]
    return new THREE.Vector3(halfW, -halfH + (val - 8), 0);
  } else if (val < 20.5) {
    // Top segment: from [4, 2.25] to [-4, 2.25]
    return new THREE.Vector3(halfW - (val - 12.5), halfH, 0);
  } else {
    // Left segment: from [-4, 2.25] to [-4, -2.25]
    return new THREE.Vector3(-halfW, halfH - (val - 20.5), 0);
  }
}

function CircuitElements({ config, timeRef }) {
  const { voltage, resistance, current, power } = config;

  const electronsRef = useRef([]);
  const bulbRef = useRef();

  useFrame((state, delta) => {
    // Current drives the electron speed
    // Speed: 0 means stopped, 1 means moving, scaling with current
    const speedMult = 2.8; // scaling factor
    timeRef.current += current * delta * speedMult;

    // Animate 20 electrons
    for (let i = 0; i < 20; i++) {
      const t = timeRef.current + (i / 20) * 25;
      const pos = getPositionOnLoop(t);
      if (electronsRef.current[i]) {
        electronsRef.current[i].position.copy(pos);
      }
    }

    // Bulb emissive pulsing/glowing based on power
    if (bulbRef.current) {
      bulbRef.current.material.emissiveIntensity = Math.min(2.5, power * 0.08);
    }
  });

  // Wire color lerp from Cool Blue (low current) to Orange/Red (high current)
  // Max current is 24A (24V / 1ohm). Let's scale relative to 12A.
  const curRatio = Math.min(1.0, current / 10);
  const wireColor = useMemo(() => {
    const col = new THREE.Color('#3b82f6'); // blue
    const hotCol = new THREE.Color('#ef4444'); // red
    col.lerp(hotCol, curRatio);
    return col;
  }, [curRatio]);

  return (
    <group>
      {/* Wires (rectangular path) */}
      {/* Bottom wire segments */}
      <mesh position={[-2, -2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 4, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[2, -2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 4, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Right wire segments */}
      <mesh position={[4, -1.125, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.25, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[4, 1.125, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.25, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Top wire segments */}
      <mesh position={[-2, 2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 4, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      <mesh position={[2, 2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 4, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>
      {/* Left wire */}
      <mesh position={[-4, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 4.5, 8]} />
        <meshStandardMaterial color={wireColor} roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Battery (Bottom Center) */}
      <group position={[0, -2.25, 0]} rotation={[0, 0, Math.PI / 2]}>
        {/* Negative half (Black/Silver) */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.8} />
        </mesh>
        {/* Positive half (Bright Red) */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.4} metalness={0.4} />
        </mesh>
        {/* Positive terminal tip */}
        <mesh position={[0, -0.85, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Battery Label */}
        <Text position={[0, 0, 0.35]} fontSize={0.24} color="white" rotation={[0, 0, -Math.PI / 2]}>
          -  BATTERY  +
        </Text>
      </group>

      {/* Resistor (Right Center) */}
      <group position={[4, 0, 0]}>
        {/* Resistor body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.9, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {/* Color Bands (showing resistance indicator) */}
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.08, 16]} />
          <meshBasicMaterial color="#b45309" /> {/* Brown */}
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.08, 16]} />
          <meshBasicMaterial color="#000000" /> {/* Black */}
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.08, 16]} />
          {/* Third band changes based on resistance range */}
          <meshBasicMaterial color={resistance > 50 ? '#ef4444' : resistance > 10 ? '#f59e0b' : '#3b82f6'} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.08, 16]} />
          <meshBasicMaterial color="#fbbf24" /> {/* Gold */}
        </mesh>
        {/* Label */}
        <Text position={[0.45, 0, 0]} fontSize={0.2} color="#94a3b8" anchorX="left">
          Resistor (R)
        </Text>
      </group>

      {/* Light Bulb (Top Center) */}
      <group position={[0, 2.25, 0]}>
        {/* Socket base */}
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.3, 16]} />
          <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Glass Bulb Sphere */}
        <mesh ref={bulbRef} position={[0, 0.25, 0]}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.85}
            roughness={0.1}
            metalness={0.1}
            emissive="#fef08a"
            emissiveIntensity={0}
          />
        </mesh>
        {/* Bulb filament */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
          <meshStandardMaterial color="#fcd34d" emissive="#fbbf24" emissiveIntensity={0.8} />
        </mesh>
        {/* Label */}
        <Text position={[0, 0.9, 0]} fontSize={0.2} color="#94a3b8">
          Light Bulb
        </Text>
        {/* Point light emitted by bulb */}
        {current > 0 && (
          <pointLight position={[0, 0.25, 0.2]} intensity={Math.min(2.0, power * 0.06)} color="#fef08a" distance={10} />
        )}
      </group>

      {/* 20 Electron spheres */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} ref={el => (electronsRef.current[i] = el)}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#60a5fa" />
        </mesh>
      ))}
    </group>
  );
}

export default function CircuitFlow({ sceneConfig = {}, onConfigChange }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const timeRef = useRef(0);

  // Sync parameters
  const voltage = sceneConfig.voltage !== undefined ? sceneConfig.voltage : 9.0;
  const resistance = sceneConfig.resistance !== undefined ? sceneConfig.resistance : 10.0;

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  // Computations
  const current = voltage / resistance; // I = V / R
  const power = (voltage * voltage) / resistance; // P = V^2 / R
  const isShortCircuit = resistance < 2.0;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        position: 'relative'
      }}>
        <Canvas shadows camera={{ position: [0, 0, 7.5], fov: 50 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          
          <CircuitElements 
            config={{ voltage, resistance, current, power }} 
            timeRef={timeRef} 
          />

          {/* HUD Overlay inside Canvas */}
          <group position={[-5.8, 3.4, 0]}>
            <Text position={[0, 0, 0]} fontSize={0.32} color="#60a5fa" anchorX="left">
              {`Voltage (V): ${voltage.toFixed(1)} V`}
            </Text>
            <Text position={[0, -0.4, 0]} fontSize={0.32} color="#ec4899" anchorX="left">
              {`Resistance (R): ${resistance.toFixed(0)} Ω`}
            </Text>
            <Text position={[0, -0.8, 0]} fontSize={0.32} color="#10b981" anchorX="left">
              {`Current (I = V/R): ${current.toFixed(2)} A`}
            </Text>
            <Text position={[0, -1.2, 0]} fontSize={0.32} color="#fbbf24" anchorX="left">
              {`Power (P = V²/R): ${power.toFixed(1)} W`}
            </Text>
            <Text position={[0, -1.6, 0]} fontSize={0.28} color="#94a3b8" anchorX="left">
              {`Bulb Brightness: ${Math.min(100, power * 3).toFixed(0)}%`}
            </Text>
          </group>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>

        {/* Short circuit flash notification */}
        {isShortCircuit && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.9)',
            border: '1px solid #ef4444',
            borderRadius: '20px',
            padding: '6px 16px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            zIndex: 10
          }}>
            ⚠️ SHORT CIRCUIT RISK!
          </div>
        )}

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
              <strong>Circuit Flow:</strong> Demonstrates Ohm's Law ($I = V/R$) and electrical Power ($P = I \cdot V = V^2 / R$). The speed of the glowing electron spheres represents the electrical current flow. When resistance is high, current is low and the bulb is dim. High voltage or low resistance increases current density, making the bulb glow brighter.
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
        
        {/* Sliders row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Voltage slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Voltage (V)</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{voltage.toFixed(1)} V</span>
            </div>
            <input
              type="range" min="1" max="24" step="0.5" value={voltage}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#60a5fa' }}
              onChange={e => handleSliderChange({ voltage: parseFloat(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              <span>1V (Low voltage)</span>
              <span>12V (Medium)</span>
              <span>24V (High)</span>
            </div>
          </div>

          {/* Resistance slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Resistance (Ω)</span>
              <span style={{ color: isShortCircuit ? '#ef4444' : '#ec4899', fontWeight: 600 }}>{resistance.toFixed(0)} Ω</span>
            </div>
            <input
              type="range" min="1" max="100" step="1" value={resistance}
              style={{ width: '100%', cursor: 'pointer', accentColor: isShortCircuit ? '#ef4444' : '#ec4899' }}
              onChange={e => handleSliderChange({ resistance: parseFloat(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              <span>1 Ω (Short circuit limit)</span>
              <span>50 Ω (Medium)</span>
              <span>100 Ω (High)</span>
            </div>
          </div>

        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>
            {isShortCircuit ? (
              <span style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ WARNING: Resistance is extremely low. Wire color represents heating.</span>
            ) : (
              <span>Electron speed represents current. Spacing indicates spacing on wire loop.</span>
            )}
          </div>

          <button
            onClick={() => {
              handleSliderChange({
                voltage: 9.0,
                resistance: 10.0
              });
            }}
            style={{
              padding: '8px 16px',
              background: 'rgba(30, 41, 59, 0.8)',
              color: '#94a3b8',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Reset Circuit
          </button>

        </div>

      </div>
    </div>
  );
}
