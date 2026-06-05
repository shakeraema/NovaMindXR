export default function WhatIfControls({ config = {}, onConfigChange, onReset }) {
  const {
    gravity = 9.8,
    mass = 5.0,
    show_force_vectors = true,
    time_scale = 1.0
  } = config;

  return (
    <div style={{
      background: 'rgba(13, 13, 33, 0.75)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      color: '#f8fafc',
      marginTop: '16px',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, letterSpacing: '0.05em', color: '#93c5fd' }}>
          WHAT-IF SIMULATION LAB
        </h3>
        <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '12px', color: '#60a5fa' }}>
          Active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Gravity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Gravity (g)</span>
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>{gravity.toFixed(1)} m/s²</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="25" 
            step="0.1" 
            value={gravity}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }}
            onChange={e => onConfigChange({ gravity: parseFloat(e.target.value) })}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            <span>0.0 (Zero-G)</span>
            <span>9.8 (Earth)</span>
            <span>24.8 (Jupiter)</span>
          </div>
        </div>

        {/* Mass Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Mass (m)</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>{mass.toFixed(1)} kg</span>
          </div>
          <input 
            type="range" 
            min="0.5" 
            max="30" 
            step="0.5" 
            value={mass}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#10b981' }}
            onChange={e => onConfigChange({ mass: parseFloat(e.target.value) })}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            <span>0.5 kg (Feather)</span>
            <span>30.0 kg (Cannonball)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
        {/* Time Scale Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8' }}>Time Flow (Speed)</span>
            <span style={{ color: '#a855f7', fontWeight: 600 }}>{time_scale.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.1" 
            max="2.0" 
            step="0.1" 
            value={time_scale}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7' }}
            onChange={e => onConfigChange({ time_scale: parseFloat(e.target.value) })}
          />
        </div>

        {/* Vectors Checkbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: '#e2e8f0' }}>
            <input 
              type="checkbox" 
              checked={show_force_vectors}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444' }}
              onChange={e => onConfigChange({ show_force_vectors: e.target.checked })}
            />
            Show Gravity Force Vector (F_g)
          </label>
          <span style={{ fontSize: '11px', color: '#64748b', paddingLeft: '24px' }}>
            Visualizes the downward gravitational pull.
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          onClick={onReset}
          style={{
            flex: 1,
            padding: '12px',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            transition: 'all 0.2s ease',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          RELEASE BALL
        </button>
        
        <button
          onClick={() => {
            onConfigChange({ gravity: 9.8, mass: 5.0, show_force_vectors: true, time_scale: 1.0 });
          }}
          style={{
            padding: '12px 16px',
            background: 'rgba(30, 41, 59, 0.8)',
            color: '#94a3b8',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '10px',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(51, 65, 85, 0.8)';
            e.currentTarget.style.color = '#e2e8f0';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          Reset Lab
        </button>
      </div>
    </div>
  );
}
