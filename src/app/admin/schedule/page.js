'use client';

import { useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import ScheduleCalendar from '../../../components/ScheduleCalendar';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  
  // Data for dropdowns
  const [enrollments, setEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({ date: '', time: '', enrollmentId: '', instructorId: '', vehicleId: '', duration: 60 });

  const fetchAllData = async () => {
    try {
      const [sessRes, enrollRes, instRes, vehRes] = await Promise.all([
        fetch('/api/sessions').catch(()=>null),
        fetch('/api/enrollments').catch(()=>null),
        fetch('/api/users?role=instructor').catch(()=>null),
        fetch('/api/vehicles').catch(()=>null)
      ]);

      if (sessRes?.ok) {
        const data = await sessRes.json();
        setSessions(data.map(s => ({
          id: s._id,
          date: s.scheduledAt || s.scheduled_at,
          duration: s.duration,
          studentName: s.enrollmentId?.studentId?.name || 'Unknown Student',
          instructorName: s.instructorId?.name || 'Unknown Instructor',
          vehiclePlate: s.vehicleId?.licensePlate || s.vehicleId?.license_plate || 'Unknown Vehicle',
          status: s.status
        })));
      }

      if (enrollRes?.ok) {
        setEnrollments(await enrollRes.json());
      }
      if (instRes?.ok) {
        setInstructors(await instRes.json());
      }
      if (vehRes?.ok) {
        setVehicles(await vehRes.json());
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load schedule data');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCreateSession = (dateObj) => {
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`;
    const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    
    setFormData({ date: dateStr, time: timeStr, enrollmentId: '', instructorId: '', vehicleId: '', duration: 60 });
    setIsModalOpen(true);
  };

  const handleEditSession = (session) => {
    toast.info(`Editing coming soon...`);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const payload = {
        enrollmentId: formData.enrollmentId,
        instructorId: formData.instructorId,
        vehicleId: formData.vehicleId,
        scheduledAt,
        duration: parseInt(formData.duration)
      };

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to book session');
      }

      toast.success('Session scheduled successfully');
      setIsModalOpen(false);
      fetchAllData(); // Refresh the calendar
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Topbar title="Master Scheduler" />
      
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div className="page-header">
          <div>
            <h2 style={{ margin: 0 }}>This Week's Schedule</h2>
            <p className="text-secondary" style={{ margin: 0 }}>Manage classes, instructors, and vehicles</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleCreateSession(new Date())}>+ New Session</button>
        </div>

        <ScheduleCalendar 
          sessions={sessions} 
          onCreateSession={handleCreateSession}
          onEditSession={handleEditSession}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Book New Session">
        <form onSubmit={onSubmit}>
          <div className="input-group">
            <label className="input-label">Student Enrollment</label>
            <select className="select" required value={formData.enrollmentId} onChange={e => setFormData({...formData, enrollmentId: e.target.value})}>
              <option value="">Select Student...</option>
              {enrollments.filter(e => e.status === 'active').map(e => (
                <option key={e._id} value={e._id}>
                  {e.studentId?.name || 'Unknown'} ({e.packageId?.name || 'Package'}) - {e.sessionsCompleted || 0}/{e.packageId?.totalSessions || 0} done
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">Date</label>
              <input type="date" required className="input" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Time</label>
              <input type="time" required className="input" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">Instructor</label>
              <select className="select" required value={formData.instructorId} onChange={e => setFormData({...formData, instructorId: e.target.value})}>
                <option value="">Select Instructor...</option>
                {instructors.map(i => (
                  <option key={i._id} value={i._id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Vehicle</label>
              <select className="select" required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                <option value="">Select Vehicle...</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>{v.licensePlate} ({v.make} {v.model})</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="modal-footer" style={{ border: 'none', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
