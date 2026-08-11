'use client';
import { useSession } from 'next-auth/react';

export default function InstructorProfilePage() {
  const { data: session } = useSession();

  return (
    <div style={{ padding: 'var(--space-md)', paddingBottom: '80px' }}>
      <h1 style={{ marginBottom: 'var(--space-lg)' }}>My Profile</h1>
      
      <div className="card glass animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'var(--accent-gradient)', margin: '0 auto var(--space-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: '#fff', fontWeight: 'bold'
          }}>
            {session?.user?.name ? session.user.name.charAt(0) : 'I'}
          </div>
          <h2 style={{ marginBottom: '4px' }}>{session?.user?.name || 'Instructor'}</h2>
          <p className="text-secondary">{session?.user?.email}</p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span className="text-secondary">Role</span>
            <span className="badge badge-primary">Instructor</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-sm)' }}>
            <span className="text-secondary">School ID</span>
            <span style={{ fontSize: '0.9rem' }}>{session?.user?.schoolId || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center' }}>
        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>DriveOS v1.0.0</p>
      </div>
    </div>
  );
}
