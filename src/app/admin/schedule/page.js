'use client';

import { useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import ScheduleCalendar from '../../../components/ScheduleCalendar';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export default function SchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({ date: '', time: '', studentId: '', instructorId: '', vehicleId: '' });

  useEffect(() => {
    // Generate some fake sessions for the current week for demo purposes
    const today = new Date();
    const d1 = new Date(today); d1.setHours(9, 0, 0, 0);
    const d2 = new Date(today); d2.setHours(14, 0, 0, 0);
    const d3 = new Date(today); d3.setDate(d3.getDate() + 1); d3.setHours(11, 0, 0, 0);
    
    setSessions([
      { id: 1, date: d1.toISOString(), duration: 45, studentName: 'Alice Smith', instructorName: 'Mike R.', vehiclePlate: 'ABC-123', status: 'completed' },
      { id: 2, date: d2.toISOString(), duration: 90, studentName: 'Bob Jones', instructorName: 'Sarah W.', vehiclePlate: 'XYZ-789', status: 'scheduled' },
      { id: 3, date: d3.toISOString(), duration: 45, studentName: 'Charlie Brown', instructorName: 'Mike R.', vehiclePlate: 'ABC-123', status: 'scheduled' },
    ]);
  }, []);

  const handleCreateSession = (dateObj) => {
    // Convert to local input values
    const pad = n => n.toString().padStart(2, '0');
    const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`;
    const timeStr = `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    
    setFormData({ date: dateStr, time: timeStr, studentId: '', instructorId: '', vehicleId: '' });
    setIsModalOpen(true);
  };

  const handleEditSession = (session) => {
    toast.info(`Editing session for ${session.studentName}`);
    // Real implementation would populate modal
  };

  const onSubmit = (e) => {
    e.preventDefault();
    toast.success('Session scheduled successfully');
    
    // Optimistic add for demo
    const d = new Date(`${formData.date}T${formData.time}`);
    setSessions([...sessions, {
      id: Date.now(),
      date: d.toISOString(),
      duration: 45,
      studentName: 'New Student',
      instructorName: 'Selected Instructor',
      vehiclePlate: 'Selected Vehicle',
      status: 'scheduled'
    }]);
    
    setIsModalOpen(false);
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
            <label className="input-label">Student</label>
            <select className="select" required value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})}>
              <option value="">Select Student...</option>
              <option value="1">Alice Smith (Full Course - 6 left)</option>
              <option value="2">Bob Jones (Refresher - 2 left)</option>
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
                <option value="1">Mike R. (Available)</option>
                <option value="2">Sarah W. (Available)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Vehicle</label>
              <select className="select" required value={formData.vehicleId} onChange={e => setFormData({...formData, vehicleId: e.target.value})}>
                <option value="">Select Vehicle...</option>
                <option value="1">ABC-123 (Toyota Yaris)</option>
                <option value="2">XYZ-789 (Honda Civic)</option>
              </select>
            </div>
          </div>
          
          <div className="modal-footer" style={{ border: 'none', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Booking</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
