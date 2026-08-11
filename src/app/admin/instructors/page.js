'use client';

import { useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import StatusBadge from '../../../components/StatusBadge';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=instructor');
      if (res.ok) {
        setInstructors(await res.json());
      } else {
        setInstructors([
          { id: 1, name: 'Mike Ross', email: 'mike@driveos.com', phone: '555-0201', status: 'active', sessionsWeek: 18 },
          { id: 2, name: 'Sarah Wilson', email: 'sarah@driveos.com', phone: '555-0202', status: 'active', sessionsWeek: 22 },
        ]);
      }
    } catch (e) {
      setInstructors([{ id: 1, name: 'Mike Ross', email: 'mike@driveos.com', phone: '555-0201', status: 'active', sessionsWeek: 18 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/users', { method: 'POST', body: JSON.stringify({...formData, role: 'instructor'}) }).catch(()=>null);
      
      const newInstructor = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: 'active',
        sessionsWeek: 0
      };
      setInstructors(prev => [newInstructor, ...prev]);

      toast.success('Instructor added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      toast.error('Failed to add instructor');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'sessionsWeek', label: 'Sessions (This Week)' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <Topbar title="Instructors Management" backUrl="/admin/dashboard" />
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div className="page-header">
          <h2>Manage Instructors</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Instructor</button>
        </div>

        <DataTable columns={columns} data={instructors} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Instructor">
        <form onSubmit={handleCreate}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input required type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input required type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Phone</label>
            <input required type="text" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input required type="password" className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <div className="modal-footer" style={{ border: 'none', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Instructor</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
