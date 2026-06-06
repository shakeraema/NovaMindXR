import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Single Water Molecule (H2O)
function WaterMolecule({ startPos, index, temp, time, isBoiling }) {
  const groupRef = useRef();

  // Pre-generate random trajectory for floating
  const driftDir = useMemo(() => {
    return new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    ).normalize();
  }, []);

  const pos = useRef(new THREE.Vector3(...startPos));

  // H1 and H2 offsets relative to O center (104.5 degree bond angle)
  const h1Offset = new THREE.Vector3(0.5, 0.4, 0);
  const h2Offset = new THREE.Vector3(-0.5, 0.4, 0);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    const speed = temp * 0.02; // speed of floating updates with temp

    // Base vibration
    const vibScale = temp * 0.003;
    const vx = Math.sin(elapsed * 25 + index) * vibScale;
    const vy = Math.cos(elapsed * 28 + index) * vibScale;
    const vz = Math.sin(elapsed * 22 + index) * vibScale;

    // Movement behavior
    if (isBoiling) {
      // Rise upward + drift
      pos.current.y += delta * 3.0;
      pos.current.x += Math.sin(elapsed * 4 + index) * 0.05;
      pos.current.z += Math.cos(elapsed * 3 + index) * 0.05;
      
      // Wrap around
      if (pos.current.y > 7) {
        pos.current.y = -6;
        pos.current.x = startPos[0];
      }
    } else if (temp > 25) {
      // Float around random walk
      pos.current.addScaledVector(driftDir, delta * speed * 0.5);
      // boundary check
      if (pos.current.length() > 10) {
        pos.current.setLength(9.5);
        driftDir.negate();
      }
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        pos.current.x + vx,
        pos.current.y + vy,
        pos.current.z + vz
      );
      // Rotate H2O molecule slightly over time
      groupRef.current.rotation.y = elapsed * 0.4 + index;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Oxygen (O) Center - Blue */}
      <mesh>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshStandardMaterial color="#3b82f6" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Hydrogen 1 (H1) - White */}
      <mesh position={h1Offset}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Hydrogen 2 (H2) - White */}
      <mesh position={h2Offset}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>

      {/* Covalent Bonds (lines/cylinders) */}
      <mesh position={[0.25, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[-0.25, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

// NaCl Crystal Lattice & Dissolution
function NaClLattice({ temp, showCharges }) {
  // Pre-generate grid values for 3x3x3 grid (27 ions)
  const ions = useMemo(() => {
    const list = [];
    let idx = 0;
    const spacing = 1.25;
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Alternating Na+ and Cl-
          const isNa = (x + y + z) % 2 === 0;
          const startX = x * spacing;
          const startY = y * spacing;
          const startZ = z * spacing;
          
          // Random drift direction for dissolution
          const driftDir = new THREE.Vector3(x, y, z).normalize();
          if (driftDir.length() === 0) {
            driftDir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          }

          list.push({
            id: idx++,
            isNa,
            gridX: startX,
            gridY: startY,
            gridZ: startZ,
            driftDir
          });
        }
      }
    }
    return list;
  }, []);

  const meshRefs = useRef([]);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();
    // Dissolution interpolation parameter (starts above 60°C, fully dissolved at 110°C)
    const dissolveT = Math.max(0, Math.min((temp - 60) / 50, 1.0));
    
    // Vibration amp based on temp
    const vibScale = temp * 0.0015;

    ions.forEach((ion, i) => {
      const mesh = meshRefs.current[i];
      if (mesh) {
        // Base coordinate (interpolated between grid and dissolved float away)
        const baseX = ion.gridX + ion.driftDir.x * dissolveT * 4.0;
        const baseY = ion.gridY + ion.driftDir.y * dissolveT * 4.0;
        const baseZ = ion.gridZ + ion.driftDir.z * dissolveT * 4.0;

        // Add temperature vibration
        const vx = Math.sin(elapsed * 35 + ion.id) * vibScale;
        const vy = Math.cos(elapsed * 32 + ion.id) * vibScale;
        const vz = Math.sin(elapsed * 38 + ion.id) * vibScale;

        mesh.position.set(baseX + vx, baseY + vy, baseZ + vz);
      }
    });
  });

  return (
    <group>
      {ions.map((ion, i) => (
        <mesh
          key={ion.id}
          ref={el => (meshRefs.current[i] = el)}
          position={[ion.gridX, ion.gridY, ion.gridZ]}
          castShadow
        >
          {/* Na+ is small yellow, Cl- is large green */}
          <sphereGeometry args={[ion.isNa ? 0.22 : 0.36, 16, 16]} />
          <meshStandardMaterial
            color={ion.isNa ? '#fbbf24' : '#10b981'}
            roughness={0.4}
            metalness={0.6}
            emissive={ion.isNa ? '#f59e0b' : '#059669'}
            emissiveIntensity={0.1}
          />
          {showCharges && (
            <Text
              position={[0, ion.isNa ? 0.35 : 0.5, 0]}
              fontSize={0.22}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {ion.isNa ? '+' : '-'}
            </Text>
          )}
        </mesh>
      ))}

      {/* Bond cylinders for adjacent grid points when temp < 70°C */}
      {temp < 75 && (
        <group>
          {/* We can draw some representative line grids to indicate crystal structure */}
          <gridHelper args={[3.2, 3, '#10b981', '#10b981']} position={[0, -0.62, 0]} rotation={[0, 0, 0]} transparent opacity={(75 - temp)/15} />
          <gridHelper args={[3.2, 3, '#10b981', '#10b981']} position={[0, 0.62, 0]} rotation={[0, 0, 0]} transparent opacity={(75 - temp)/15} />
          <gridHelper args={[3.2, 3, '#10b981', '#10b981']} position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]} transparent opacity={(75 - temp)/15} />
        </group>
      )}
    </group>
  );
}

// Camera zoom controller using sceneConfig.zoom
function ZoomController({ zoom }) {
  const { camera } = useThree();
  useEffect(() => {
    // Zoom range: 0.5 to 2.0. Interpolate camera position
    const distance = 11 / zoom;
    camera.position.set(0, 5, distance);
  }, [zoom, camera]);
  return null;
}

export default function MolecularWorld({ sceneConfig = {}, onConfigChange }) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync parameters
  const temp = sceneConfig.temp !== undefined ? sceneConfig.temp : 25;
  const zoom = sceneConfig.zoom !== undefined ? sceneConfig.zoom : 1.0;
  const showCharges = sceneConfig.show_charges !== undefined ? sceneConfig.show_charges : true;
  const showBondEnergy = sceneConfig.show_bond_energy !== undefined ? sceneConfig.show_bond_energy : false;

  const handleSliderChange = (update) => {
    if (onConfigChange) {
      onConfigChange(update);
    }
  };

  // Water initial starting positions
  const waterPositions = useMemo(() => [
    [-3.0, 3.0, 2.5],
    [3.5, -2.5, -3.0],
    [-4.0, -3.0, -1.0],
    [4.0, 2.0, 3.0],
    [-2.5, -2.0, 3.5],
    [3.0, 3.5, -2.0],
    [0.0, 4.5, -3.5],
    [-4.5, 0.0, -4.0]
  ], []);

  const isBoiling = temp >= 100;
  const isDissolving = temp > 60;

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
        <Canvas shadows camera={{ position: [0, 5, 11], fov: 50 }}>
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 15, 10]} intensity={1.5} />
          <directionalLight position={[-10, 5, -5]} intensity={0.3} />

          <gridHelper args={[20, 20, '#1e293b', '#1e293b']} position={[0, -5, 0]} />
          
          <ZoomController zoom={zoom} />
          
          <NaClLattice temp={temp} showCharges={showCharges} />

          {waterPositions.map((pos, i) => (
            <WaterMolecule
              key={i}
              index={i}
              startPos={pos}
              temp={temp}
              isBoiling={isBoiling}
            />
          ))}

          {/* HUD Overlay Labels */}
          <group position={[-5.8, 3.4, 0]}>
            <Text position={[0, 0, 0]} fontSize={0.32} color="#f59e0b" anchorX="left">
              {`Temperature: ${temp.toFixed(0)}°C`}
            </Text>
            {isBoiling && (
              <Text position={[0, -0.4, 0]} fontSize={0.28} color="#ef4444" anchorX="left">
                Boiling Point Reached! 🔥 (Gas Phase)
              </Text>
            )}
            {isDissolving && (
              <Text position={[0, isBoiling ? -0.8 : -0.4, 0]} fontSize={0.28} color="#10b981" anchorX="left">
                Ionic Dissolution Occurring 💧
              </Text>
            )}
            {showBondEnergy && (
              <Text position={[0, -1.2, 0]} fontSize={0.24} color="#60a5fa" anchorX="left">
                {`Bond energy: ${Math.max(10, 480 - temp * 3.5).toFixed(0)} kJ/mol`}
              </Text>
            )}
          </group>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={22}
          />
        </Canvas>

        {/* Floating notifications */}
        {isBoiling && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(239, 68, 68, 0.85)',
            border: '1px solid #ef4444',
            borderRadius: '20px',
            padding: '6px 16px',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '12px',
            animation: 'pulse 1.5s infinite',
            zIndex: 10
          }}>
            BOILING POINT REACHED!
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
              <strong>Molecular World (Dissolution):</strong> This simulator highlights how temperature impacts thermal vibration and ionic dissolution. At low temperatures, NaCl exists in a crystal lattice. Above 60°C, the water molecules' kinetic energy breaks the lattice apart, surrounding $Na^+$ and $Cl^-$ ions. Above 100°C, water molecules vaporize.
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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '16px', marginBottom: '14px' }}>
          
          {/* Temperature slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Temperature (°C)</span>
              <span style={{ color: temp >= 100 ? '#ef4444' : temp > 60 ? '#10b981' : '#fbbf24', fontWeight: 600 }}>{temp.toFixed(0)}°C</span>
            </div>
            <input
              type="range" min="0" max="150" step="1" value={temp}
              style={{ width: '100%', cursor: 'pointer', accentColor: temp >= 100 ? '#ef4444' : '#fbbf24' }}
              onChange={e => handleSliderChange({ temp: parseFloat(e.target.value) })}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '3px' }}>
              <span onClick={() => handleSliderChange({ temp: 0 })} style={{ cursor: 'pointer' }}>0°C (Freezing ❄️)</span>
              <span onClick={() => handleSliderChange({ temp: 25 })} style={{ cursor: 'pointer' }}>25°C (Room Temp)</span>
              <span onClick={() => handleSliderChange({ temp: 100 })} style={{ cursor: 'pointer' }}>100°C (Boiling 🔥)</span>
              <span onClick={() => handleSliderChange({ temp: 150 })} style={{ cursor: 'pointer' }}>150°C (Superheated)</span>
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ color: '#94a3b8' }}>Microscope Zoom</span>
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{(zoom * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range" min="0.5" max="2.0" step="0.05" value={zoom}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#60a5fa' }}
              onChange={e => handleSliderChange({ zoom: parseFloat(e.target.value) })}
            />
          </div>

        </div>

        {/* Toggles & Reset Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showCharges}
                style={{ accentColor: '#fbbf24' }}
                onChange={e => handleSliderChange({ show_charges: e.target.checked })}
              />
              Show Ion Charge Labels (+/-)
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showBondEnergy}
                style={{ accentColor: '#60a5fa' }}
                onChange={e => handleSliderChange({ show_bond_energy: e.target.checked })}
              />
              Show Bond Energy values
            </label>
          </div>

          <button
            onClick={() => {
              handleSliderChange({
                temp: 25,
                zoom: 1.0,
                show_charges: true,
                show_bond_energy: false
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
            Reset Temperature
          </button>

        </div>

      </div>
    </div>
  );
}
