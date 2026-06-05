import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Module level pre-allocated vectors to prevent R3F reconstruction garbage collection loops
const ARROW_DIR_UP = new THREE.Vector3(0, 1, 0);
const ARROW_DIR_DOWN = new THREE.Vector3(0, -1, 0);
const ARROW_ORIGIN = new THREE.Vector3(0, 0, 0);

// Plankton / Marine Dust Particles
function BubblesCurrent({ currentSpeed, count = 120 }) {
  const meshRef = useRef();

  // Initialize random bubble positions
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        ),
        speed: 0.5 + Math.random() * 1.5,
        size: 0.02 + Math.random() * 0.04
      });
    }
    return temp;
  }, [count]);

  const refs = useRef([]);

  useFrame((state, delta) => {
    particles.forEach((p, idx) => {
      // Particles drift horizontally based on current speed
      p.pos.x += currentSpeed * p.speed * delta * 0.5;

      // Wrap around bounds
      if (p.pos.x > 10) p.pos.x = -10;
      if (p.pos.x < -10) p.pos.x = 10;

      if (refs.current[idx]) {
        refs.current[idx].position.copy(p.pos);
      }
    });
  });

  return (
    <group ref={meshRef}>
      {particles.map((p, idx) => (
        <mesh key={idx} ref={el => (refs.current[idx] = el)}>
          <sphereGeometry args={[p.size, 8, 8]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

// 3D Research Probe Capsule
function SubmarineProbe({ density, mass, isDeployed, resetKey, onStateUpdate }) {
  const probeRef = useRef();
  
  // Physics states using refs for 60fps stability
  const yPos = useRef(1.5);
  const velocity = useRef(0);

  useEffect(() => {
    // Reset positions on restart/config switch
    yPos.current = 1.5;
    velocity.current = 0;
    if (probeRef.current) {
      probeRef.current.position.set(0, 1.5, 0);
    }
  }, [resetKey]);

  useFrame((state, delta) => {
    if (!isDeployed) return;

    const dt = Math.min(delta, 0.03);

    // V = 1.0 m^3 (Volume of probe)
    // F_buoyancy = density * V * g (pointing up)
    // F_gravity = mass * g (pointing down)
    // g = 9.8 m/s^2
    const g = 9.8;
    const Fb = density * 1.0 * g;
    const Fg = mass * g;
    const Fnet = Fb - Fg;

    // a = Fnet / mass
    const acc = Fnet / mass;

    // Apply simple drag to prevent infinite speed
    velocity.current += acc * dt;
    velocity.current *= 0.95; // Water damping drag

    yPos.current += velocity.current * dt;

    // Bounds check
    const surfaceY = 3.2;
    const floorY = -3.2;

    if (yPos.current > surfaceY) {
      yPos.current = surfaceY;
      velocity.current = 0;
    }
    if (yPos.current < floorY) {
      yPos.current = floorY;
      velocity.current = 0;
    }

    if (probeRef.current) {
      probeRef.current.position.y = yPos.current;
      probeRef.current.rotation.y += delta * 0.15;
    }

    // Call state report back to panel
    if (onStateUpdate) {
      onStateUpdate(yPos.current, velocity.current, Fb, Fg);
    }
  });

  // Calculate arrow helper scales
  const g = 9.8;
  const Fb = density * 1.0 * g;
  const Fg = mass * g;
  const maxForce = 25000;
  const bArrowLen = Math.max(0.5, Math.min((Fb / maxForce) * 5, 4));
  const gArrowLen = Math.max(0.5, Math.min((Fg / maxForce) * 5, 4));

  return (
    <group ref={probeRef} position={[0, 1.5, 0]}>
      {/* Outer shell (Metallic Cyan/Blue) */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Dome Top */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.6, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0f766e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glass Porthole Dome */}
      <mesh position={[0, 0.1, 0.58]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} emissive="#0ea5e9" emissiveIntensity={0.3} />
      </mesh>

      {/* Upward Buoyancy Vector Arrow (Green) */}
      {isDeployed && (
        <arrowHelper
          args={[
            ARROW_DIR_UP,
            ARROW_ORIGIN,
            bArrowLen,
            '#10b981', // green
            0.3,
            0.15
          ]}
          position={[0, 0.8, 0]}
        />
      )}

      {/* Downward Gravity Vector Arrow (Red) */}
      {isDeployed && (
        <arrowHelper
          args={[
            ARROW_DIR_DOWN,
            ARROW_ORIGIN,
            gArrowLen,
            '#f43f5e', // red
            0.3,
            0.15
          ]}
          position={[0, -0.8, 0]}
        />
      )}
    </group>
  );
}

// Oceanography Lab Component
export default function OceanWorld({ sceneConfig = {}, onConfigChange }) {
  const [resetKey, setResetKey] = useState(0);
  const [isDeployed, setIsDeployed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Dynamic simulation feedback states
  const [probeY, setProbeY] = useState(1.5);
  const [probeVel, setProbeVel] = useState(0);
  const [buoyancyForce, setBuoyancyForce] = useState(0);
  const [gravityForce, setGravityForce] = useState(0);

  // Sync config inputs
  const depth = sceneConfig.depth !== undefined ? sceneConfig.depth : 150; // meters
  const salinity = sceneConfig.salinity !== undefined ? sceneConfig.salinity : 35; // ppt
  const temp = sceneConfig.temp !== undefined ? sceneConfig.temp : 12; // °C
  const mass = sceneConfig.probe_mass !== undefined ? sceneConfig.probe_mass : 1025; // kg
  const currentSpeed = sceneConfig.current_speed !== undefined ? sceneConfig.current_speed : 1.5; // current vector scale

  // Salinity and Temperature determine water density (Physical state equation)
  // rho = 1000 + 0.8 * S - 0.15 * (T - 4)
  const density = useMemo(() => {
    return 1000 + 0.808 * salinity - 0.082 * (temp - 4);
  }, [salinity, temp]);

  // Determine Layer Name based on depth
  // Epipelagic (0-200m), Mesopelagic (200-1000m), Bathypelagic (1000-4000m)
  const layerInfo = useMemo(() => {
    if (depth < 200) {
      return { name: 'EPIPELAGIC (Sunlight Zone)', color: '#0ea5e9', desc: 'Photosynthesis occurs here. High oxygen, warm temperature.' };
    } else if (depth < 1000) {
      return { name: 'MESOPELAGIC (Twilight Zone)', color: '#1e3a8a', desc: 'Faint light penetrates. Rapid temperature thermocline drop.' };
    } else {
      return { name: 'BATHYPELAGIC (Midnight Zone)', color: '#090d16', desc: 'Complete darkness. High hydrostatic pressure, constant 4°C.' };
    }
  }, [depth]);

  // Map background color of water based on depth
  const waterBgColor = useMemo(() => {
    if (depth < 200) {
      // Lerp from #0d9488 (0m) to #0f172a (200m)
      const ratio = depth / 200;
      return new THREE.Color().lerpColors(new THREE.Color('#0ea5e9'), new THREE.Color('#0f172a'), ratio).getStyle();
    } else if (depth < 1000) {
      // Lerp from Mesopelagic navy to Bathypelagic dark black
      const ratio = (depth - 200) / 800;
      return new THREE.Color().lerpColors(new THREE.Color('#0f172a'), new THREE.Color('#020617'), ratio).getStyle();
    } else {
      return '#020617';
    }
  }, [depth]);

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  const handleStateUpdate = (y, v, fb, fg) => {
    setProbeY(y);
    setProbeVel(v);
    setBuoyancyForce(fb);
    setGravityForce(fg);
  };

  const netAcc = (buoyancyForce - gravityForce) / mass;

  // Accredit to Blockchain when buoyancy equilibrium or extreme depth achievements are unlocked
  useEffect(() => {
    if (isDeployed && Math.abs(probeVel) < 0.05 && Math.abs(netAcc) < 0.1 && probeY > -3.2 && probeY < 3.2) {
      // Student achieved Neutral Buoyancy!
      import('../../ai/blockchain').then(({ learningLedger }) => {
        learningLedger.addBlock({
          studentId: 'student-DIU',
          milestone: `Oceanography Lab: Achieved Neutral Buoyancy equilibrium at ${depth}m (Density: ${density.toFixed(1)} kg/m³)`
        });
      });
    }
  }, [isDeployed, probeVel, netAcc]);

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* 3D Canvas */}
      <div style={{ 
        width: '100%', 
        height: '420px', 
        background: waterBgColor, 
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        position: 'relative',
        transition: 'background 0.5s ease'
      }}>
        <Canvas shadows camera={{ position: [0, 0, 7], fov: 50 }}>
          <color attach="background" args={[waterBgColor]} />
          
          {/* ambient lighting based on depth */}
          <ambientLight intensity={Math.max(0.05, 0.8 - depth / 500)} />
          <pointLight position={[10, 10, 10]} intensity={Math.max(0.1, 1.5 - depth / 300)} castShadow />
          <directionalLight position={[-5, 5, -5]} intensity={0.2} />

          {/* Drifting current indicators */}
          <BubblesCurrent currentSpeed={currentSpeed} />

          {/* Submarine Probe */}
          <SubmarineProbe 
            density={density} 
            mass={mass} 
            isDeployed={isDeployed} 
            resetKey={resetKey}
            onStateUpdate={handleStateUpdate}
          />

          {/* Water Surface Line Visualizer */}
          <mesh position={[0, 3.3, 0]}>
            <boxGeometry args={[15, 0.05, 5]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} />
          </mesh>

          {/* Sea Floor Visualizer */}
          <mesh position={[0, -3.3, 0]}>
            <boxGeometry args={[15, 0.05, 5]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.6} />
          </mesh>

          {/* HUD Overlay text inside Canvas */}
          <group position={[-5.8, 3.4, 0]}>
            <Text position={[0, 0, 0]} fontSize={0.26} color="#38bdf8" anchorX="left">
              {`Water Density: ${density.toFixed(2)} kg/m³`}
            </Text>
            <Text position={[0, -0.35, 0]} fontSize={0.24} color="#f472b6" anchorX="left">
              {`Salinity: ${salinity} ppt | Temp: ${temp}°C`}
            </Text>
            <Text position={[0, -0.7, 0]} fontSize={0.24} color="#a7f3d0" anchorX="left">
              {`Depth Layer: ${layerInfo.name}`}
            </Text>
          </group>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={4}
            maxDistance={12}
          />
        </Canvas>

        {/* Layer Descriptor Overlay Banner */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          background: 'rgba(10, 10, 26, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          padding: '8px 12px',
          color: '#e2e8f0',
          fontSize: '11px',
          maxWidth: '240px',
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <strong style={{ color: layerInfo.color }}>{layerInfo.name}</strong>
          <div style={{ color: '#94a3b8', marginTop: '2px' }}>{layerInfo.desc}</div>
        </div>

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
              <strong>Oceanography Buoyancy:</strong> An object submerged in fluid experiences an upward force equal to the weight of fluid displaced (Archimedes' Principle). Water density increases with higher salinity (more dissolved ions) and lower temperature (particles contract). If water density is higher than the probe's density, buoyancy exceeds gravity, pushing the probe upwards.
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
        
        {/* Sliders Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Column 1: Salinity and Temp */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Salinity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Water Salinity (ppt)</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{salinity} ppt</span>
              </div>
              <input
                type="range" min="0" max="40" step="1" value={salinity}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#38bdf8' }}
                onChange={e => handleSliderChange({ salinity: parseInt(e.target.value) })}
              />
            </div>

            {/* Temperature */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Water Temperature (°C)</span>
                <span style={{ color: '#fb7185', fontWeight: 600 }}>{temp}°C</span>
              </div>
              <input
                type="range" min="0" max="30" step="1" value={temp}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#fb7185' }}
                onChange={e => handleSliderChange({ temp: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Column 2: Probe Mass and Depth Diving */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Probe Mass */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Probe Mass (kg)</span>
                <span style={{ color: '#ec4899', fontWeight: 600 }}>{mass} kg</span>
              </div>
              <input
                type="range" min="950" max="1100" step="5" value={mass}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ec4899' }}
                onChange={e => handleSliderChange({ probe_mass: parseInt(e.target.value) })}
              />
            </div>

            {/* Depth Diving */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: '#94a3b8' }}>Diving Depth (m)</span>
                <span style={{ color: '#fbbf24', fontWeight: 600 }}>{depth} m</span>
              </div>
              <input
                type="range" min="0" max="4000" step="50" value={depth}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#fbbf24' }}
                onChange={e => handleSliderChange({ depth: parseInt(e.target.value) })}
              />
            </div>
          </div>

        </div>

        {/* Ocean Current Speed Slider & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ width: '280px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
              <span style={{ color: '#64748b' }}>Ocean Current Speed Vector</span>
              <span style={{ color: '#a855f7', fontWeight: 600 }}>{currentSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.0" max="4.0" step="0.2" value={currentSpeed}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
              onChange={e => handleSliderChange({ current_speed: parseFloat(e.target.value) })}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setIsDeployed(!isDeployed)}
              style={{
                padding: '10px 18px',
                background: isDeployed ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '12px',
                boxShadow: isDeployed ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {isDeployed ? 'LOCK PROBE' : 'DEPLOY PROBE'}
            </button>
            <button
              onClick={() => {
                setIsDeployed(false);
                setResetKey(prev => prev + 1);
                handleSliderChange({
                  depth: 150,
                  salinity: 35,
                  temp: 12,
                  probe_mass: 1025,
                  current_speed: 1.5
                });
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
              Reset
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
