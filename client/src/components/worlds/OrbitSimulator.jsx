import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Pre-allocated static vectors to avoid recreation and R3F reconstructs
const ARROW_DIR = new THREE.Vector3(1, 0, 0);
const ARROW_ORIGIN = new THREE.Vector3(0, 0, 0);
const tempDir = new THREE.Vector3();

// Planet Component
function Planet({ name, radius, period, color, size, isSelected, showVel, showGrav, sunMass, orbitalSpeedMult, onClick }) {
  const meshRef = useRef();
  
  // Track angle using ref to avoid React state re-renders inside frame loops
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame((state, delta) => {
    // angle increments by (2*PI / period) * delta * orbitalSpeedMult
    const speed = (2 * Math.PI) / period;
    angle.current += speed * delta * orbitalSpeedMult;
    
    const x = radius * Math.cos(angle.current);
    const z = radius * Math.sin(angle.current);
    
    if (meshRef.current) {
      meshRef.current.position.set(x, 0, z);
      // rotate planet mesh on its axis
      meshRef.current.rotation.y += delta * 0.5;

      // Update arrow vectors directly inside this frame loop using scratch Vector3
      if (showVel) {
        const velArrow = meshRef.current.getObjectByName('velArrow');
        if (velArrow) {
          tempDir.set(-Math.sin(angle.current), 0, Math.cos(angle.current));
          velArrow.setDirection(tempDir);
        }
      }

      if (showGrav) {
        const gravArrow = meshRef.current.getObjectByName('gravArrow');
        if (gravArrow) {
          tempDir.set(-Math.cos(angle.current), 0, -Math.sin(angle.current));
          gravArrow.setDirection(tempDir);
          gravArrow.setLength(sunMass * 1.5);
        }
      }
    }
  });

  const forceScale = sunMass * 1.5;
  const velScale = 1.8;

  return (
    <group ref={meshRef}>
      {/* Clickable Sphere */}
      <mesh 
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        castShadow
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7} 
          metalness={0.2} 
          emissive={color}
          emissiveIntensity={isSelected ? 0.25 : 0.02}
        />
      </mesh>

      {/* Selected Highlight Wireframe Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[size + 0.15, 0.02, 8, 32]} />
          <meshBasicMaterial color="#a7f3d0" wireframe />
        </mesh>
      )}

      {/* Velocity Vector (Green, Tangent) */}
      {showVel && (
        <arrowHelper
          name="velArrow"
          args={[
            ARROW_DIR,
            ARROW_ORIGIN,
            velScale,
            '#10b981', // emerald-500
            0.3,
            0.15
          ]}
        />
      )}

      {/* Gravitational pull vector (Red, pointing to sun) */}
      {showGrav && (
        <arrowHelper
          name="gravArrow"
          args={[
            ARROW_DIR,
            ARROW_ORIGIN,
            forceScale,
            '#f43f5e', // rose-500
            0.3,
            0.15
          ]}
        />
      )}
    </group>
  );
}

// Draw Orbital Trail Ring
function OrbitTrail({ radius, visible }) {
  if (!visible) return null;
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      {/* Very thin torus to act as orbit ring line */}
      <torusGeometry args={[radius, 0.015, 4, 128]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
    </mesh>
  );
}

export default function OrbitSimulator({ sceneConfig = {}, onConfigChange }) {
  const [selectedPlanetIdx, setSelectedPlanetIdx] = useState(0); // Default: Earth-like (index 0)
  const [showTooltip, setShowTooltip] = useState(false);

  // Read config values
  const orbitalSpeedMult = sceneConfig.orbital_speed_mult !== undefined ? sceneConfig.orbital_speed_mult : 1.0;
  const sunMass = sceneConfig.sun_mass !== undefined ? sceneConfig.sun_mass : 1.0;
  const showVel = sceneConfig.show_velocity_vectors !== undefined ? sceneConfig.show_velocity_vectors : true;
  const showGrav = sceneConfig.show_gravity_vectors !== undefined ? sceneConfig.show_gravity_vectors : true;
  const showTrails = sceneConfig.show_orbit_paths !== undefined ? sceneConfig.show_orbit_paths : true;

  const planetsData = useMemo(() => [
    { name: 'Planet 3 (Inner)', radius: 4, period: 5.0, color: '#94a3b8', size: 0.25, baseSpeed: 47.8 },
    { name: 'Planet 1 (Earth-like)', radius: 6, period: 8.0, color: '#3b82f6', size: 0.4, baseSpeed: 29.8 },
    { name: 'Planet 2 (Outer)', radius: 10, period: 14.0, color: '#ef4444', size: 0.5, baseSpeed: 24.1 }
  ], []);

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  const selectedPlanet = planetsData[selectedPlanetIdx];
  // Calculate simulated speed: base speed * speed multiplier * sqrt(sunMass) (by Kepler's laws, v is proportional to sqrt(GM/r))
  const simulatedSpeed = selectedPlanet.baseSpeed * orbitalSpeedMult * Math.sqrt(sunMass);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: '#000000', 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        position: 'relative'
      }}>
        <Canvas shadows camera={{ position: [0, 10, 16], fov: 50 }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.1} />
          
          {/* Glowing yellow Sun at center */}
          <group position={[0, 0, 0]}>
            <mesh>
              <sphereGeometry args={[1.2, 32, 32]} />
              <meshBasicMaterial color="#f59e0b" />
            </mesh>
            {/* Sun Bloom Glow Effect */}
            <mesh>
              <sphereGeometry args={[1.5, 32, 32]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.25} />
            </mesh>
            <pointLight position={[0, 0, 0]} intensity={2.5} distance={50} decay={1.5} />
          </group>

          {/* Orbit paths & Planets */}
          {planetsData.map((p, idx) => (
            <group key={p.name}>
              <OrbitTrail radius={p.radius} visible={showTrails} />
              <Planet
                name={p.name}
                radius={p.radius}
                period={p.period}
                color={p.color}
                size={p.size}
                isSelected={selectedPlanetIdx === idx}
                showVel={showVel}
                showGrav={showGrav}
                sunMass={sunMass}
                orbitalSpeedMult={orbitalSpeedMult}
                onClick={() => setSelectedPlanetIdx(idx)}
              />
            </group>
          ))}

          {/* HUD Text inside Canvas */}
          <group position={[-8, 6.5, 0]}>
            <Text
              position={[0, 0, 0]}
              fontSize={0.4}
              color="#60a5fa"
              anchorX="left"
            >
              {`Orbital Speed: ${simulatedSpeed.toFixed(1)} km/s`}
            </Text>
            <Text
              position={[0, -0.5, 0]}
              fontSize={0.35}
              color="#888888"
              anchorX="left"
            >
              {`Planet: ${selectedPlanet.name}`}
            </Text>
          </group>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.05}
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
              <strong>Orbit Simulator:</strong> This model simulates circular orbits of planets around a star. The green arrow shows the tangential **Velocity Vector**, while the red arrow shows the radial **Gravitational Pull Vector** drawing the planet toward the Sun. A larger Sun mass increases the gravity force and speed required to maintain a stable orbit.
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
        
        {/* Row 1: Sliders & Planet Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', marginBottom: '14px' }}>
          
          {/* Sliders Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Orbital Speed Multiplier */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Orbital Speed Multiplier</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>{orbitalSpeedMult.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={orbitalSpeedMult}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
                onChange={e => handleSliderChange({ orbital_speed_mult: parseFloat(e.target.value) })}
              />
            </div>

            {/* Sun Mass */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Sun Mass (Gravity strength)</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{sunMass.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={sunMass}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24' }}
                onChange={e => handleSliderChange({ sun_mass: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          {/* Planet Stats Panel */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12px'
          }}>
            <div style={{ fontWeight: 'bold', color: selectedPlanet.color, fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
              🪐 {selectedPlanet.name.toUpperCase()} Stats
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Orbit Radius:</span>
              <span style={{ fontWeight: 600 }}>{selectedPlanet.radius.toFixed(1)} AU</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Orbital Period:</span>
              <span style={{ fontWeight: 600 }}>{selectedPlanet.period.toFixed(1)} yr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8' }}>Current Speed:</span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>{simulatedSpeed.toFixed(1)} km/s</span>
            </div>
          </div>

        </div>

        {/* Row 2: Toggles & Reset */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Toggles */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showVel}
                style={{ accentColor: '#10b981' }}
                onChange={e => handleSliderChange({ show_velocity_vectors: e.target.checked })}
              />
              Show Velocity Vectors (v)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showGrav}
                style={{ accentColor: '#f43f5e' }}
                onChange={e => handleSliderChange({ show_gravity_vectors: e.target.checked })}
              />
              Show Gravity Pull (F_g)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showTrails}
                style={{ accentColor: '#ffffff' }}
                onChange={e => handleSliderChange({ show_orbit_paths: e.target.checked })}
              />
              Show Orbit Paths
            </label>
          </div>

          {/* Quick selections and Reset */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Select Planet:</span>
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPlanetIdx(idx)}
                style={{
                  background: selectedPlanetIdx === idx ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: selectedPlanetIdx === idx ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: selectedPlanetIdx === idx ? '#93c5fd' : '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                {idx === 0 ? 'P3' : idx === 1 ? 'P1' : 'P2'}
              </button>
            ))}
            <button
              onClick={() => {
                setSelectedPlanetIdx(1);
                handleSliderChange({
                  orbital_speed_mult: 1.0,
                  sun_mass: 1.0,
                  show_velocity_vectors: true,
                  show_gravity_vectors: true,
                  show_orbit_paths: true
                });
              }}
              style={{
                marginLeft: '8px',
                padding: '6px 12px',
                background: 'rgba(30, 41, 59, 0.8)',
                color: '#94a3b8',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Reset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
