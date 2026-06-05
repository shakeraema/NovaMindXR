import React from 'react';
import GravityLab from './worlds/GravityLab';
import OrbitSimulator from './worlds/OrbitSimulator';
import WaveLab from './worlds/WaveLab';
import MolecularWorld from './worlds/MolecularWorld';
import CircuitFlow from './worlds/CircuitFlow';
import OceanWorld from './worlds/OceanWorld';
import QuantumSlit from './worlds/QuantumSlit';
import RelativityRun from './worlds/RelativityRun';
import MaxwellDemon from './worlds/MaxwellDemon';
import Aerodynamics from './worlds/Aerodynamics';
import LenzsLaw from './worlds/LenzsLaw';

export default function SimulationRouter({ environment, sceneConfig, onConfigChange }) {
  
  // Resolve active world details
  let WorldComponent;
  let badgeText = '';

  switch (environment) {
    case 'gravity_lab':
      WorldComponent = GravityLab;
      badgeText = '🌍 Gravity Lab · Physics';
      break;
    case 'orbit_sim':
      WorldComponent = OrbitSimulator;
      badgeText = '🪐 Orbit Simulator · Physics';
      break;
    case 'wave_lab':
      WorldComponent = WaveLab;
      badgeText = '〰 Wave Lab · Physics';
      break;
    case 'molecular':
      WorldComponent = MolecularWorld;
      badgeText = '⚛ Molecular World · Chemistry';
      break;
    case 'circuit_flow':
      WorldComponent = CircuitFlow;
      badgeText = '⚡ Circuit Flow · EEE';
      break;
    case 'ocean':
      WorldComponent = OceanWorld;
      badgeText = '🌊 Ocean Diving · Oceanography';
      break;
    case 'quantum_slit':
      WorldComponent = QuantumSlit;
      badgeText = '🔬 Quantum Double-Slit · Physics';
      break;
    case 'relativity_run':
      WorldComponent = RelativityRun;
      badgeText = '🚀 Relativity Racetrack · Physics';
      break;
    case 'maxwell_demon':
      WorldComponent = MaxwellDemon;
      badgeText = '😈 Maxwell\'s Demon · Thermodynamics';
      break;
    case 'aerodynamics':
      WorldComponent = Aerodynamics;
      badgeText = '✈ Aerodynamic Wind Tunnel · Physics';
      break;
    case 'lenzs_law':
      WorldComponent = LenzsLaw;
      badgeText = '🧲 Lenz\'s Law Induction · Physics';
      break;
    default:
      WorldComponent = GravityLab;
      badgeText = '🌍 Gravity Lab · Physics';
      break;
  }

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Top-Left Canvas Badge overlay */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: 'rgba(10, 10, 26, 0.75)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderRadius: '20px',
        color: '#93c5fd',
        padding: '6px 14px',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        pointerEvents: 'none', // Allow clicking through
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        zIndex: 50
      }}>
        {badgeText}
      </div>

      {/* The active simulation world */}
      <WorldComponent 
        sceneConfig={sceneConfig} 
        onConfigChange={onConfigChange} 
      />
    </div>
  );
}
