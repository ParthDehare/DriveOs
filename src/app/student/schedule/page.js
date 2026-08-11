'use client';
import { useState, useEffect } from 'react';

export default function StudentSchedule() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [sessions, setSessions] = useState([]);
  
  useEffect(() => {
    // Mock sessions
    setSessions([
      { id: 1, date: 'Aug 11, 2026', time: '09:00 AM', instructor: 'John Doe', status: 'upcoming' },
      { id: 2, date: 'Aug 14, 2026', time: '10:00 AM', instructor: 'John Doe', status: 'upcoming' },
      { id: 3, date: 'Aug 04, 2026', time: '09:00 AM', instructor: 'John Doe', status: 'completed', rating: 4.5 },
      { id: 4, date: 'Jul 28, 2026', time: '11:00 AM', instructor: 'Jane Smith', status: 'completed', rating: 4.0 },
    ]);
  }, []);

  const filtered = sessions.filter(s => s.status === activeTab);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <header className="mobile-page-header" style={{ position: 'relative', zIndex: 1, borderBottom: 'none', background: 'transparent' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-0.5px' }}>My Schedule</h1>
      </header>

      <div style={{ padding: '0 var(--space-md) var(--space-sm)', position: 'sticky', top: '70px', zIndex: 5, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
        <div style={{ 
          display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', 
          padding: '4px', border: '1px solid var(--border)' 
        }}>
          <div 
            onClick={() => setActiveTab('upcoming')}
            style={{ 
              flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', 
              borderRadius: 'var(--radius-lg)', fontWeight: '600', fontSize: '0.95rem',
              background: activeTab === 'upcoming' ? 'var(--accent-gradient)' : 'transparent', 
              color: activeTab === 'upcoming' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Upcoming
          </div>
          <div 
            onClick={() => setActiveTab('completed')}
            style={{ 
              flex: 1, textAlign: 'center', padding: '10px', cursor: 'pointer', 
              borderRadius: 'var(--radius-lg)', fontWeight: '600', fontSize: '0.95rem',
              background: activeTab === 'completed' ? 'var(--accent-gradient)' : 'transparent', 
              color: activeTab === 'completed' ? '#fff' : 'var(--text-secondary)',
              boxShadow: activeTab === 'completed' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            Completed
          </div>
        </div>
      </div>

      <main style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state animate-fade-in" style={{ marginTop: 'var(--space-lg)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <p>No {activeTab} sessions found.</p>
          </div>
        ) : (
          filtered.map((s, idx) => (
            <div key={s.id} className="card stat-card animate-slide-up" style={{ padding: 'var(--space-lg)', animationDelay: `${0.1 * idx}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ 
                    background: activeTab === 'upcoming' ? 'var(--info-bg)' : 'var(--success-bg)', 
                    padding: '12px', borderRadius: 'var(--radius-md)', 
                    color: activeTab === 'upcoming' ? 'var(--accent-primary)' : 'var(--success)',
                    boxShadow: 'none'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.15rem', color: 'var(--text-primary)' }}>{s.date}</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent-secondary)', fontWeight: '600' }}>{s.time}</span> • {s.instructor}
                    </p>
                  </div>
                </div>
                {activeTab === 'completed' && s.rating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rating</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--warning-bg)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--warning)" stroke="var(--warning)" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--warning)' }}>{s.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
