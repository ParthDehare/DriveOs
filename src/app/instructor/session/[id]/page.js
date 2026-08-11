'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionDetail({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, ready, evaluating, completed
  const [evalData, setEvalData] = useState({
    clutch: 3,
    steering: 3,
    parking: 3,
    lane: 3,
    awareness: 3
  });

  useEffect(() => {
    // Mock fetch session detail
    setTimeout(() => {
      setSession({
        id: unwrappedParams.id,
        studentName: unwrappedParams.id === '102' ? 'Bob Smith' : 'Alice Johnson',
        time: '09:00 AM - 10:00 AM',
        vehicle: 'Toyota Corolla (AT)',
        phone: '+1 (555) 123-4567'
      });
      setStatus('ready');
    }, 400);
  }, [unwrappedParams.id]);

  const markAttendance = async (present) => {
    // mock POST /api/attendance
    // await fetch('/api/attendance', { method: 'POST', body: JSON.stringify({ sessionId: session.id, present }) });
    if (present) {
      setStatus('evaluating');
    } else {
      setStatus('completed');
      alert('Student marked as No-Show');
      router.push('/instructor');
    }
  };

  const submitEvaluation = async () => {
    // mock POST /api/evaluations
    // await fetch('/api/evaluations', { method: 'POST', body: JSON.stringify({ sessionId: session.id, scores: evalData }) });
    setStatus('completed');
    alert('Evaluation submitted successfully!');
    router.push('/instructor');
  };

  const [isTripActive, setIsTripActive] = useState(false);
  const [routeHistory, setRouteHistory] = useState([]);
  const [watchId, setWatchId] = useState(null);

  const startTrip = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setIsTripActive(true);
    setRouteHistory([]);

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setRouteHistory(prev => [...prev, { lat: latitude, lng: longitude, time: new Date().toISOString() }]);
        
        // Post current location to telematics API
        fetch('/api/telematics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId: session?.id, 
            lat: latitude, 
            lng: longitude 
          })
        }).catch(err => console.error('Telematics error:', err));
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
    
    setWatchId(id);
  };

  const endTrip = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTripActive(false);

    // Post end trip
    fetch('/api/telematics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: session?.id,
        isEnded: true,
        routeHistory
      })
    }).catch(err => console.error('Telematics end error:', err));
    
    alert('Trip ended successfully');
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  if (status === 'loading') {
    return <div style={{ padding: 'var(--space-md)' }}>Loading...</div>;
  }

  return (
    <div>
      <header className="mobile-page-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h1 className="page-title" style={{ fontSize: '1.2rem', margin: 0 }}>Session Details</h1>
      </header>

      <main style={{ padding: 'var(--space-md)' }}>
        <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
              <div className="avatar">{session.studentName.charAt(0)}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{session.studentName}</h2>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{session.phone}</p>
              </div>
            </div>
            
            <div className="grid-2">
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Time</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{session.time}</p>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>Vehicle</p>
                <p style={{ margin: 0, fontWeight: '500' }}>{session.vehicle}</p>
              </div>
            </div>
          </div>
        </div>

        {status === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h3 style={{ margin: 0 }}>Telematics</h3>
            {!isTripActive ? (
              <button className="btn btn-primary" onClick={startTrip} id="btn-start-trip">
                Start Trip
              </button>
            ) : (
              <button className="btn btn-danger" onClick={endTrip} id="btn-end-trip">
                End Trip (Recording)
              </button>
            )}
            
            <h3 style={{ margin: 'var(--space-md) 0 0' }}>Attendance</h3>
            <button className="btn btn-secondary" onClick={() => markAttendance(true)} id="btn-mark-present">
              Evaluate Student
            </button>
            <button className="btn btn-danger" onClick={() => markAttendance(false)} id="btn-mark-noshow">
              Mark No-Show
            </button>
          </div>
        )}

        {status === 'evaluating' && (
          <div className="card animate-slide-up">
            <div className="card-header">
              Session Evaluation
            </div>
            <div className="card-body evaluation-sliders">
              {[
                { key: 'clutch', label: 'Clutch/Gear Control' },
                { key: 'steering', label: 'Steering & Handling' },
                { key: 'parking', label: 'Parallel Parking' },
                { key: 'lane', label: 'Lane Discipline' },
                { key: 'awareness', label: 'Traffic Awareness' }
              ].map(skill => (
                <div key={skill.key} className="evaluation-slider">
                  <div className="slider-labels">
                    <span>{skill.label}</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{evalData[skill.key]} / 5</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="5" step="1"
                    value={evalData[skill.key]}
                    onChange={(e) => setEvalData({...evalData, [skill.key]: parseInt(e.target.value)})}
                  />
                  <div className="slider-labels" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>Needs Work</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 'var(--space-md)' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={submitEvaluation} id="btn-submit-eval">
                  Submit Evaluation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
