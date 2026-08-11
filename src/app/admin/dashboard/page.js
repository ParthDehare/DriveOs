'use client';

import { useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import StatCard from '../../../components/StatCard';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import { useToast } from '../../../components/Toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInstructors: 0,
    fleetSize: 0,
    todaySessions: 0,
    pendingPayments: 0,
    overduePayments: 0
  });

  const [recentEnrollments, setRecentEnrollments] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalStudents: data.totalStudents || 0,
            activeInstructors: data.totalInstructors || 0,
            fleetSize: data.totalVehicles || 0,
            todaySessions: data.todaySessions || 0,
            pendingPayments: data.pendingPayments || 0,
            overduePayments: data.overduePayments || 0
          });
          
          // Map backend enrollments to frontend format
          const mappedEnrollments = (data.recentEnrollments || []).map(e => ({
            id: e._id,
            name: e.studentId?.name || 'Unknown',
            package: e.packageId?.name || 'Standard',
            date: new Date(e.createdAt).toLocaleDateString(),
            status: e.status
          }));
          
          setRecentEnrollments(mappedEnrollments.length > 0 ? mappedEnrollments : []);
          
          // API doesn't return todaySchedule yet, map if it exists
          const mappedSchedule = (data.todaySchedule || []).map(s => ({
            id: s._id,
            time: new Date(s.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            student: s.studentId?.name || 'Unknown',
            instructor: s.instructorId?.name || 'Unknown',
            status: s.status
          }));
          setTodaySchedule(mappedSchedule);
        } else {
          // Mock data for UI presentation when backend isn't ready
          setStats({
            totalStudents: 142,
            activeInstructors: 8,
            fleetSize: 12,
            todaySessions: 24,
            pendingPayments: '$4,250',
            overduePayments: '$850'
          });
          setRecentEnrollments([
            { id: 1, name: 'Alice Smith', package: 'Full Course', date: '2023-10-25', status: 'Active' },
            { id: 2, name: 'Bob Johnson', package: 'Refresher 5h', date: '2023-10-24', status: 'Pending' }
          ]);
          setTodaySchedule([
            { id: 101, time: '09:00 AM', student: 'Charlie Davis', instructor: 'Mike R.', status: 'Scheduled' },
            { id: 102, time: '10:30 AM', student: 'Diana Prince', instructor: 'Sarah W.', status: 'Completed' }
          ]);
        }
      } catch (err) {
        toast.error("Failed to load dashboard data. Using mock data.");
        // Fallback mock
        setStats({ totalStudents: 142, activeInstructors: 8, fleetSize: 12, todaySessions: 24, pendingPayments: '$4,250', overduePayments: '$850' });
        setRecentEnrollments([{ id: 1, name: 'Alice Smith', package: 'Full Course', date: '2023-10-25', status: 'Active' }]);
        setTodaySchedule([{ id: 101, time: '09:00 AM', student: 'Charlie Davis', instructor: 'Mike R.', status: 'Scheduled' }]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const enrollmentCols = [
    { key: 'name', label: 'Student Name' },
    { key: 'package', label: 'Package' },
    { key: 'date', label: 'Enrollment Date' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  const scheduleCols = [
    { key: 'time', label: 'Time' },
    { key: 'student', label: 'Student' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
  ];

  return (
    <>
      <Topbar title="Dashboard Overview" />
      
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: 'var(--space-lg)',
          marginBottom: 'var(--space-xl)'
        }}>
          <StatCard title="Total Students" value={loading ? '-' : stats.totalStudents} icon="👨‍🎓" trend={{ value: 12, isUp: true }} color="indigo" />
          <StatCard title="Active Instructors" value={loading ? '-' : stats.activeInstructors} icon="👨‍🏫" color="blue" />
          <StatCard title="Fleet Size" value={loading ? '-' : stats.fleetSize} icon="🚗" color="green" />
          <StatCard title="Today's Sessions" value={loading ? '-' : stats.todaySessions} icon="📅" color="amber" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-lg)' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem' }}>Recent Enrollments</h3>
            <DataTable columns={enrollmentCols} data={recentEnrollments} loading={loading} emptyMessage="No recent enrollments" />
          </div>
          
          <div>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem' }}>Today's Schedule</h3>
            <DataTable columns={scheduleCols} data={todaySchedule} loading={loading} emptyMessage="No sessions scheduled for today" />
          </div>
        </div>
      </div>
    </>
  );
}
