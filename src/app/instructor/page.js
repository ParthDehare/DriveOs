'use client';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function InstructorDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await fetch('/api/sessions');
        if (res.ok) {
          const data = await res.json();
          setSessions(Array.isArray(data) ? data : []);
        } else {
          setSessions([]);
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  const formatTime = (dateString, durationMinutes) => {
    if (!dateString) return '';
    const start = new Date(dateString);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}`;
  };

  const getStudentName = (session) => {
    if (session.enrollmentId && session.enrollmentId.studentId && session.enrollmentId.studentId.name) {
      return session.enrollmentId.studentId.name;
    }
    return 'Unknown Student';
  };
  
  const getVehicleName = (session) => {
    if (session.vehicleId) {
      const make = session.vehicleId.make || '';
      const model = session.vehicleId.model || '';
      const transmissionType = session.vehicleId.transmissionType || '';
      if (make || model) {
        return `${make} ${model} ${transmissionType ? `(${transmissionType === 'automatic' ? 'AT' : 'MT'})` : ''}`.trim();
      }
    }
    return 'Unknown Vehicle';
  };

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
              <Link href={`/instructor/session/${session._id}`} key={session._id} style={{ textDecoration: 'none' }}>
                <div className="card stat-card" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{getStudentName(session)}</h3>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{formatTime(session.scheduledAt, session.duration)}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{getVehicleName(session)}</p>
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
