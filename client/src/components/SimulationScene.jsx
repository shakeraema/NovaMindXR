import React, { useState, useEffect, useRef } from 'react';
import SimulationRouter from './SimulationRouter';

export default function SimulationScene({ diagnosisConfig = {}, onConfigChange, activeEnv: propActiveEnv, onEnvChange }) {
  // Map environment tabs/options
  const tabs = [
    { id: 'gravity_lab', label: '🌍 Gravity Lab', desc: 'Demonstrates freefall acceleration under gravity. Observe how mass does not affect the falling speed, while changing gravity modifies the drop rate and force vectors.' },
    { id: 'orbit_sim', label: '🪐 Orbit Simulator', desc: 'Simulates gravitational orbits and planetary motion. Toggle force and velocity vectors to see how gravity acts as a centripetal force holding planets in circular trajectories.' },
    { id: 'wave_lab', label: '〰 Wave Lab', desc: 'Explores wave superposition and interference patterns. Set frequencies and phase offsets to construct reinforcing waves or completely cancel out wave amplitudes.' },
    { id: 'molecular', label: '⚛ Molecular World', desc: 'Visualizes molecular thermal kinetic energy and lattice dissolution. Heat the NaCl crystal to watch water molecules pull Na+ and Cl- ions apart, then vaporize at the boiling point.' },
    { id: 'circuit_flow', label: '⚡ Circuit Flow', desc: 'Animates electrons in a simple circuit to study Ohm\'s Law (I = V/R). Toggle resistance and voltage to control current speed, power, and bulb brightness while avoiding short circuits.' },
    { id: 'ocean', label: '🌊 Ocean Diving', desc: 'Dives through ocean layers (Epipelagic, Mesopelagic, Bathypelagic) to study pressure, temperature, salinity, and water density. Observe how buoyancy is affected by temperature and salinity.' },
    { id: 'quantum_slit', label: '🔬 Quantum Double-Slit', desc: 'Explore wave-particle duality. Turn the Observer ON to collapse the particle wave function into two distinct bands, or OFF to witness the quantum interference pattern.' },
    { id: 'relativity_run', label: '🚀 Relativity Racetrack', desc: 'Accelerate a spaceship close to light speed. Observe physical contraction of the spaceship length and severe local clock time dilation, alongside Doppler shifts.' },
    { id: 'maxwell_demon', label: '😈 Maxwell\'s Demon', desc: 'Challenge the Second Law of Thermodynamics. Use a sorting filter to partition fast hot particles from slow cold ones, building a temperature gradient.' },
    { id: 'aerodynamics', label: '✈ Aerodynamic Wing', desc: 'Analyze airflow vectors and lift over an airfoil. Adjust velocity and angle of attack to observe the lift-to-drag ratio and trigger aerodynamic stall.' },
    { id: 'lenzs_law', label: '🧲 Lenz\'s Law Induction', desc: 'Demonstrate electromagnetic braking. Drop neodymium magnets down copper, iron, and acrylic tubes to observe Eddy currents opposing the motion.' }
  ];

  // Active world state (defaults to Gravity Lab)
  const [localActiveEnv, setLocalActiveEnv] = useState('gravity_lab');
  const activeEnv = propActiveEnv !== undefined ? propActiveEnv : localActiveEnv;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const setActiveEnv = (env) => {
    if (onEnvChange) {
      onEnvChange(env);
    } else {
      setLocalActiveEnv(env);
    }
  };
  
  // Merged live configuration
  const [liveConfig, setLiveConfig] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Sync diagnosisConfig when it changes from the parent (e.g. on new AI prompt submission)
  useEffect(() => {
    if (diagnosisConfig) {
      if (diagnosisConfig.environment) {
        setActiveEnv(diagnosisConfig.environment);
      }
      setLiveConfig(diagnosisConfig);
    }
  }, [diagnosisConfig]);

  const handleConfigChange = (newConfig) => {
    const updated = { ...liveConfig, ...newConfig };
    setLiveConfig(updated);
    if (onConfigChange) {
      onConfigChange(updated);
    }
  };

  const selectEnv = (envId) => {
    setActiveEnv(envId);
    setIsDropdownOpen(false);
    
    // Reset/initialize liveConfig with defaults for this specific world if needed
    const defaults = {};
    if (envId === 'gravity_lab') {
      defaults.gravity = 9.8;
      defaults.mass = 5.0;
      defaults.show_force_vectors = true;
      defaults.time_scale = 1.0;
    } else if (envId === 'orbit_sim') {
      defaults.orbital_speed_mult = 1.0;
      defaults.sun_mass = 1.0;
      defaults.show_velocity_vectors = true;
      defaults.show_gravity_vectors = true;
      defaults.show_orbit_paths = true;
    } else if (envId === 'wave_lab') {
      defaults.freqA = 1.5;
      defaults.ampA = 0.8;
      defaults.freqB = 1.5;
      defaults.ampB = 0.8;
      defaults.phaseB = 0;
      defaults.speed = 1.0;
      defaults.time_scale = 1.0;
    } else if (envId === 'molecular') {
      defaults.temp = 25;
      defaults.zoom = 1.0;
      defaults.show_charges = true;
      defaults.show_bond_energy = false;
    } else if (envId === 'circuit_flow') {
      defaults.voltage = 9.0;
      defaults.resistance = 10.0;
    } else if (envId === 'ocean') {
      defaults.depth = 150;
      defaults.salinity = 35;
      defaults.temp = 12;
      defaults.probe_mass = 1025;
      defaults.current_speed = 1.5;
    } else if (envId === 'quantum_slit') {
      defaults.slitWidth = 0.3;
      defaults.wavelength = 0.5;
      defaults.observer = false;
    } else if (envId === 'relativity_run') {
      defaults.speed = 0.6;
      defaults.mass_density = 1.0;
    } else if (envId === 'maxwell_demon') {
      defaults.demonSpeed = 1.5;
      defaults.doorWidth = 0.6;
      defaults.particleSpeed = 1.0;
      defaults.doorOpen = false;
    } else if (envId === 'aerodynamics') {
      defaults.angle_of_attack = 6;
      defaults.wind_speed = 15;
      defaults.air_density = 1.2;
    } else if (envId === 'lenzs_law') {
      defaults.object_type = 'magnetic';
      defaults.magnet_strength = 3.0;
      defaults.cylinder_mass = 1.0;
    }
    setLiveConfig(defaults);
  };

  const activeTab = tabs.find(t => t.id === activeEnv) || tabs[0];

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      
      {/* Sleek Custom Dropdown Selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        paddingBottom: '12px',
        position: 'relative',
        zIndex: 100
      }}>
        <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Active Misconception World:</span>
        <div ref={dropdownRef} style={{ position: 'relative', width: '320px' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(59, 130, 246, 0.45)',
              borderRadius: '8px',
              padding: '10px 16px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeTab.label}
            </span>
            <span style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: '12px', color: '#60a5fa' }}>
              ▼
            </span>
          </button>

          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '6px',
              background: '#0b0f19',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.85)',
              maxHeight: '280px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {tabs.map((tab) => {
                const isActive = activeEnv === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => selectEnv(tab.id)}
                    style={{
                      padding: '10px 16px',
                      color: isActive ? '#60a5fa' : '#cbd5e1',
                      background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      fontWeight: isActive ? 'bold' : 'normal',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'background 0.15s, color 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#cbd5e1';
                      }
                    }}
                  >
                    <span>{tab.label}</span>
                    {isActive && <span style={{ color: '#60a5fa', fontSize: '12px' }}>✓</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Simulation Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Router rendering active world */}
        <SimulationRouter
          environment={activeEnv}
          sceneConfig={liveConfig}
          onConfigChange={handleConfigChange}
        />

        {/* Floating Description Overlay (Overlay panel in bottom-right) */}
        <div style={{
          position: 'absolute',
          top: '64px',
          right: '16px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          padding: '12px 14px',
          color: '#cbd5e1',
          fontSize: '11px',
          lineHeight: '1.45',
          maxWidth: '280px',
          pointerEvents: 'none', // Allow user to click elements behind description
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          zIndex: 40
        }}>
          <span style={{ fontWeight: 'bold', color: '#60a5fa', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.05em' }}>
            Concept Overview
          </span>
          {activeTab.desc}
        </div>

      </div>

    </div>
  );
}
