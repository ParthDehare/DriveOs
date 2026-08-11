'use client';

import { useRouter } from 'next/navigation';

export default function Topbar({ title, backUrl }) {
  const router = useRouter();

  return (
    <header style={{
      height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-xl)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 90,
      background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {backUrl && (
          <button 
            onClick={() => router.push(backUrl)}
            className="btn btn-ghost" 
            style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
          {title || 'Dashboard'}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{ 
          position: 'relative', display: 'flex', alignItems: 'center',
          background: 'var(--bg-input)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '6px 12px', width: '250px',
          transition: 'all var(--transition-fast)'
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px' }}>
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" placeholder="Search..." id="global-search" 
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-primary)', 
              width: '100%', paddingLeft: '24px', outline: 'none', fontSize: '0.9rem' 
            }} 
          />
        </div>

        <button className="btn btn-ghost" style={{ position: 'relative', padding: '8px', borderRadius: '50%', color: 'var(--text-secondary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{
            position: 'absolute', top: '6px', right: '8px',
            width: '8px', height: '8px', background: 'var(--danger)',
            borderRadius: '50%', border: '2px solid var(--bg-card)'
          }}></span>
        </button>
      </div>
    </header>
  );
}
