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
    const fetchStudentData = async () => {
      try {
        const id = resolvedParams.id;
        
        // Fetch user data
        const userRes = await fetch(`/api/users/${id}`);
        if (!userRes.ok) throw new Error('User not found');
        const userData = await userRes.json();
        
        // Fetch enrollments
        const enrollRes = await fetch('/api/enrollments');
        const enrollData = await enrollRes.json();
        const studentEnrollment = enrollData.find(e => e.studentId?._id === id || e.student_id === id);
        
        // Fetch sessions
        const sessionRes = await fetch('/api/sessions');
        const sessionData = await sessionRes.json();
        const studentSessions = sessionData.filter(s => s.enrollmentId?.studentId?._id === id || s.enrollmentId?.studentId === id || s.enrollment_id === studentEnrollment?._id);
        
        // Fetch payments
        const paymentRes = await fetch('/api/payments');
        const paymentData = await paymentRes.json();
        const studentPayments = paymentData.filter(p => p.enrollmentId?.studentId?._id === id || p.enrollmentId?.studentId === id || p.enrollment_id === studentEnrollment?._id);

        setStudent({
          id: userData._id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          status: userData.isActive ? 'active' : 'inactive',
          enrollment: studentEnrollment ? {
            package: studentEnrollment.packageId?.name || 'Unknown Package',
            progress: studentEnrollment.packageId ? (studentEnrollment.sessionsCompleted / studentEnrollment.packageId.totalSessions) * 100 : 0,
            completedSessions: studentEnrollment.sessionsCompleted || 0,
            totalSessions: studentEnrollment.packageId?.totalSessions || 0
          } : null,
          sessions: studentSessions.map(s => ({
            date: new Date(s.scheduledAt || s.scheduled_at).toLocaleDateString(),
            time: new Date(s.scheduledAt || s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            instructor: s.instructorId?.name || 'Unknown',
            vehicle: s.vehicleId?.licensePlate || s.vehicleId?.license_plate || 'Unknown',
            status: s.status
          })),
          payments: studentPayments.map(p => ({
            tranche: `Installment ${p.trancheNumber || p.tranche_number || 1}`,
            amount: `$${p.amount}`,
            due: new Date(p.dueDate || p.due_date).toLocaleDateString(),
            status: p.status
          }))
        });
      } catch (err) {
        console.error(err);
        toast.error('Failed to load student data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
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
            {student.enrollment ? (
              <>
                <p>Package: {student.enrollment.package}</p>
                <p>Sessions: {student.enrollment.completedSessions} / {student.enrollment.totalSessions}</p>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', marginTop: 'var(--space-md)' }}>
                  <div style={{ width: `${student.enrollment.progress}%`, height: '100%', background: 'var(--success)' }}></div>
                </div>
              </>
            ) : (
              <p>No active enrollment.</p>
            )}
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
