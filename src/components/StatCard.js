'use client';

export default function StatCard({ title, value, icon, trend, color = 'blue' }) {
  const colors = {
    blue: 'var(--info)',
    green: 'var(--success)',
    amber: 'var(--warning)',
    red: 'var(--danger)',
    indigo: 'var(--accent-primary)'
  };

  const bgColors = {
    blue: 'var(--info-bg)',
    green: 'var(--success-bg)',
    amber: 'var(--warning-bg)',
    red: 'var(--danger-bg)',
    indigo: 'rgba(79, 70, 229, 0.1)'
  };

  const activeColor = colors[color] || colors.blue;
  const activeBg = bgColors[color] || bgColors.blue;

  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>
          {title}
        </h3>
        <div style={{ 
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)', 
          background: activeBg, color: activeColor, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.2rem'
        }}>
          {icon}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </div>
        
        {trend && (
          <div style={{ 
            fontSize: '0.85rem', fontWeight: 600,
            color: trend.isUp ? 'var(--success)' : 'var(--danger)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
}
