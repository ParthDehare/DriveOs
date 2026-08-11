'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    // Mock fetch dashboard data
    setTimeout(() => {
      setData({
        studentName: 'Alice Johnson',
        nextSession: {
          date: 'Tomorrow',
          time: '09:00 AM - 10:00 AM',
          instructor: 'John Doe'
        },
        progress: {
          completed: 4,
          total: 10
        },
        payment: {
          due: 150,
          dueDate: '2026-08-15'
        }
      });
    }, 300);
  }, []);

  const handlePayNow = () => {
    setToast('Payment integration pending!');
    setTimeout(() => setToast(''), 3000);
  };

  if (!data) return <div style={{ padding: 'var(--space-md)' }}>Loading dashboard...</div>;

  const progressPercent = (data.progress.completed / data.progress.total) * 100;

  return (
    <div style={{ position: 'relative' }}>
      {/* Background Decor */}
      <div className="animate-float" style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.05) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', zIndex: 0
      }} />

      <header className="mobile-page-header" style={{ position: 'relative', zIndex: 1, borderBottom: 'none', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: 0, letterSpacing: '-0.5px' }}>Welcome back,</h1>
          <p className="page-description text-gradient" style={{ fontSize: '1.4rem', fontWeight: '700' }}>{data.studentName}</p>
        </div>
        <button onClick={() => window.location.href = '/'} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-secondary)' }} aria-label="Logout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
      </header>

      <main style={{ padding: '0 var(--space-md) var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', position: 'relative', zIndex: 1 }}>
        {toast && (
          <div className="toast" style={{ position: 'fixed', top: '20px', left: '20px', right: '20px', zIndex: 9999 }}>
            <svg className="text-info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            {toast}
          </div>
        )}

        <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-sm)' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.15)', padding: '8px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-primary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Next Session</h3>
          </div>
          
          {data.nextSession ? (
            <div style={{ paddingLeft: '44px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '700' }}>{data.nextSession.date} at {data.nextSession.time}</p>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Instructor: <span style={{ color: 'var(--text-primary)' }}>{data.nextSession.instructor}</span></p>
            </div>
          ) : (
            <p style={{ paddingLeft: '44px', color: 'var(--text-muted)' }}>No upcoming sessions scheduled.</p>
          )}
          
          <Link href="/student/schedule" className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-md)', alignSelf: 'flex-start', marginLeft: '44px' }}>
            View Full Schedule
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </Link>
        </div>

        <div className="card stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-md)' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: 'var(--radius-sm)', color: 'var(--accent-secondary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Course Progress</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>{data.progress.completed} of {data.progress.total} Sessions</span>
            <span style={{ color: 'var(--accent-secondary)', fontWeight: '800' }}>{Math.round(progressPercent)}%</span>
          </div>
          <div className="collection-progress" style={{ height: '10px', background: 'rgba(0,0,0,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
            <div className="collection-progress-bar" style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-gradient)' }}></div>
          </div>
        </div>

        <div className="card stat-card animate-slide-up" style={{ 
          animationDelay: '0.3s',
          background: 'var(--danger-bg)',
          borderColor: 'rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-sm)' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: 'var(--radius-sm)', color: '#f87171' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Next Payment Due</h3>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingLeft: '44px' }}>
            <div>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800', color: '#ef4444' }}>
                ${data.payment.due.toFixed(2)}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Due by {data.payment.dueDate}</p>
            </div>
            <button className="btn btn-primary" onClick={handlePayNow} id="btn-pay-now" style={{ background: '#ef4444', border: 'none' }}>
              Pay Now
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
