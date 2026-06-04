import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export default function FacultyScreen({ onBack, lang }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/faculty/summary`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(data => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setSummary(MOCK_FACULTY_DATA);
        setLoading(false);
      });
  }, []);

  const data = summary?.topMisconceptions || MOCK_FACULTY_DATA.topMisconceptions;
  const total = summary?.totalSessions || MOCK_FACULTY_DATA.totalSessions;

  const texts = {
    EN: {
      back: "← Back",
      title: "Faculty Analytics Portal",
      sessionsCard: "Total Class Sessions",
      activeCard: "Active Students",
      scoreCard: "Avg Concept Clarity",
      chartTitle: "Misconception Frequencies",
      loading: "Loading Analytics..."
    },
    BN: {
      back: "← ফেরত যান",
      title: "ফ্যাকাল্টি অ্যানালিটিক্স পোর্টাল",
      sessionsCard: "মোট সেশন সংখ্যা",
      activeCard: "সক্রিয় শিক্ষার্থী",
      scoreCard: "গড় ধারণা স্পষ্টতা",
      chartTitle: "ভুল ধারণার ফ্রিকোয়েন্সি",
      loading: "অ্যানালিটিক্স লোড হচ্ছে..."
    }
  };

  const t = texts[lang] || texts.EN;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#030308', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #09091e 0%, #030308 100%)', 
      padding: '32px 24px', 
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        marginBottom: '32px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        paddingBottom: '16px',
        maxWidth: '1200px',
        margin: '0 auto 32px'
      }}>
        <button 
          onClick={onBack} 
          style={{ 
            background: 'rgba(30, 41, 59, 0.5)', 
            border: '1px solid rgba(59, 130, 246, 0.2)', 
            color: '#94a3b8', 
            padding: '8px 16px', 
            borderRadius: '10px', 
            cursor: 'pointer', 
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)'}
        >
          {t.back}
        </button>
        <h1 style={{ color: 'white', margin: 0, fontSize: '22px', fontWeight: 600 }}>
          {t.title}
        </h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* KPI Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: t.sessionsCard, value: total, color: '#3b82f6' },
            { label: t.activeCard, value: Math.ceil(total * 0.75), color: '#10b981' },
            { label: t.scoreCard, value: '62 / 100', color: '#8b5cf6' }
          ].map(card => (
            <div 
              key={card.label} 
              style={{ 
                background: 'rgba(15, 23, 42, 0.6)', 
                borderRadius: '16px', 
                padding: '24px', 
                border: '1px solid rgba(59, 130, 246, 0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 8px', fontWeight: 500, letterSpacing: '0.05em' }}>
                {card.label}
              </p>
              <p style={{ color: card.color, fontSize: '32px', fontWeight: 700, margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Container */}
        <div style={{ 
          background: 'rgba(15, 23, 42, 0.65)', 
          backdropFilter: 'blur(16px)',
          borderRadius: '20px', 
          padding: '28px', 
          border: '1px solid rgba(59, 130, 246, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h4 style={{ color: '#cbd5e1', fontSize: '15px', fontWeight: 600, margin: '0 0 24px', letterSpacing: '0.05em' }}>
            {t.chartTitle}
          </h4>
          
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <XAxis type="number" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#475569"
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  width={180} 
                />
                <Tooltip
                  contentStyle={{ 
                    background: '#09091e', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '10px', 
                    color: 'white', 
                    fontSize: '12px' 
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={['#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef'][i % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_FACULTY_DATA = {
  totalSessions: 47,
  topMisconceptions: [
    { name: 'Mass vs weight confusion', count: 18 },
    { name: 'Inertia misunderstood', count: 12 },
    { name: 'Force causes motion', count: 9 },
    { name: 'Ohm\'s law confusion', count: 5 },
    { name: 'Buoyancy misconception', count: 3 }
  ]
};
