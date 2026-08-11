'use client';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function InstructorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would be: fetch('/api/sessions?date=today')
    // Mocking for the frontend demo
    setTimeout(() => {
      setSessions([
        { id: '101', studentName: 'Alice Johnson', time: '09:00 AM - 10:00 AM', vehicle: 'Toyota Corolla (AT)', status: 'scheduled' },
        { id: '102', studentName: 'Bob Smith', time: '10:30 AM - 11:30 AM', vehicle: 'Honda Civic (MT)', status: 'scheduled' },
        { id: '103', studentName: 'Charlie Davis', time: '01:00 PM - 02:00 PM', vehicle: 'Toyota Corolla (AT)', status: 'completed' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div>
      <header className="mobile-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>Today's Schedule</h1>
          <p className="page-description" style={{ fontSize: '0.9rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-ghost" style={{ padding: '8px', color: 'var(--text-secondary)' }} aria-label="Sign Out" title="Sign Out">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </button>
      </header>

      <main style={{ padding: 'var(--space-md)' }}>
        {loading ? (
          <div className="skeleton" style={{ height: '100px', width: '100%', marginBottom: '16px' }}></div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No sessions scheduled for today.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {sessions.map(session => (
              <Link href={`/instructor/session/${session.id}`} key={session.id} style={{ textDecoration: 'none' }}>
                <div className="card stat-card" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{session.studentName}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{session.time}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{session.vehicle}</p>
                    </div>
                    <div>
                      {session.status === 'completed' ? (
                        <span className="badge badge-success">Completed</span>
                      ) : (
                        <span className="badge badge-info">Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
