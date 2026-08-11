'use client';

import React, { useState, useEffect } from 'react';
import Topbar from '../../../../components/Topbar';
import StatusBadge from '../../../../components/StatusBadge';
import DataTable from '../../../../components/DataTable';
import { useToast } from '../../../../components/Toast';

export default function StudentProfilePage({ params }) {
  const resolvedParams = React.use(params);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const toast = useToast();

  useEffect(() => {
    // Mocking fetch for specific student
    setTimeout(() => {
      setStudent({
        id: resolvedParams.id,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1 555-0101',
        status: 'active',
        enrollment: {
          package: 'Full Course',
          progress: 40,
          completedSessions: 4,
          totalSessions: 10
        },
        sessions: [
          { date: '2023-10-20', time: '10:00 AM', instructor: 'Sarah W.', vehicle: 'ABC-123', status: 'completed' },
          { date: '2023-10-22', time: '14:00 PM', instructor: 'Mike R.', vehicle: 'XYZ-789', status: 'completed' },
          { date: '2023-11-05', time: '09:00 AM', instructor: 'Mike R.', vehicle: 'ABC-123', status: 'scheduled' },
        ],
        payments: [
          { tranche: 'Deposit', amount: '$200', due: '2023-10-01', status: 'paid' },
          { tranche: 'Installment 1', amount: '$300', due: '2023-11-01', status: 'pending' },
        ]
      });
      setLoading(false);
    }, 800);
  }, [resolvedParams.id]);

  if (loading) return <div>Loading profile...</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <>
      <Topbar title="Student Profile" backUrl="/admin/students" />
      
      <div style={{ padding: 'var(--space-md) 0' }}>
        {/* Profile Header */}
        <div className="card glass" style={{ padding: 'var(--space-lg)', display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div className="avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
            {student.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 var(--space-xs) 0', fontSize: '1.8rem' }}>{student.name}</h2>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: 'var(--space-md)' }}>
              <span>📧 {student.email}</span>
              <span>📱 {student.phone}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <StatusBadge status={student.status} size="md" />
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <button className="btn btn-secondary btn-sm">Edit Profile</button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          {['overview', 'sessions', 'payments', 'license'].map(tab => (
            <button
              key={tab}
              className="btn btn-ghost"
              style={{
                borderRadius: '0',
                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
                padding: 'var(--space-sm) var(--space-lg)'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <h3>Enrollment Progress</h3>
            <p>Package: {student.enrollment.package}</p>
            <p>Sessions: {student.enrollment.completedSessions} / {student.enrollment.totalSessions}</p>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-md)' }}>
              <div style={{ width: `${student.enrollment.progress}%`, height: '100%', background: 'var(--success)' }}></div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <DataTable 
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'time', label: 'Time' },
              { key: 'instructor', label: 'Instructor' },
              { key: 'vehicle', label: 'Vehicle' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]} 
            data={student.sessions} 
          />
        )}

        {activeTab === 'payments' && (
          <DataTable 
            columns={[
              { key: 'tranche', label: 'Tranche' },
              { key: 'amount', label: 'Amount' },
              { key: 'due', label: 'Due Date' },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]} 
            data={student.payments} 
          />
        )}
        
        {activeTab === 'license' && (
          <div className="card empty-state">
            <span style={{ fontSize: '2rem' }}>🪪</span>
            <p>No license details uploaded yet.</p>
          </div>
        )}
      </div>
    </>
  );
}
