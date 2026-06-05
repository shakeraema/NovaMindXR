import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

export default function UnderstandingScore({ scores }) {
  const data = [
    { subject: 'Conceptual Clarity', value: scores?.conceptual_clarity ?? 35 },
    { subject: 'Spatial Reasoning', value: scores?.spatial_reasoning ?? 50 },
    { subject: 'Cause & Effect', value: scores?.cause_effect ?? 40 },
    { subject: 'Formula Application', value: scores?.formula_understanding ?? 30 }
  ];

  const avg = Math.round(data.reduce((s, d) => s + d.value, 0) / data.length);

  // Dynamic status based on average score
  let statusText = 'Initiating Assessment';
  let statusColor = '#f87171'; // red
  if (avg >= 70) {
    statusText = 'Mastery Achieved';
    statusColor = '#10b981'; // green
  } else if (avg >= 50) {
    statusText = 'Progressing Well';
    statusColor = '#60a5fa'; // blue
  } else if (avg >= 35) {
    statusText = 'Needs Guidance';
    statusColor = '#fbbf24'; // orange
  }

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '16px',
      padding: '20px',
      color: '#f8fafc',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
            COGNITIVE INDEX
          </span>
          <h4 style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 600 }}>Understanding Score</h4>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '28px', fontWeight: 700, color: '#60a5fa', lineHeight: 1 }}>
            {avg}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>/ 100</span>
        </div>
      </div>

      <div style={{ width: '100%', height: '220px', display: 'flex', justifyContent: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="rgba(96, 165, 250, 0.15)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#64748b', fontSize: 8 }}
              axisLine={false}
            />
            <Radar 
              name="Student" 
              dataKey="value" 
              stroke="#60a5fa" 
              fill="#3b82f6" 
              fillOpacity={0.25} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ 
        marginTop: '12px', 
        borderTop: '1px solid rgba(59, 130, 246, 0.1)', 
        paddingTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}>
        <span style={{ color: '#64748b' }}>Learning State:</span>
        <span style={{ color: statusColor, fontWeight: 600, letterSpacing: '0.05em' }}>
          {statusText}
        </span>
      </div>
    </div>
  );
}
