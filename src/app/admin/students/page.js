'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '../../../components/Topbar';
import DataTable from '../../../components/DataTable';
import StatusBadge from '../../../components/StatusBadge';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', package: 'full' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=student');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      } else {
        // Mock
        setStudents([
          { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', status: 'active', package: 'Full Course', sessionsStr: '4/10' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', status: 'pending', package: 'Refresher', sessionsStr: '0/5' },
        ]);
      }
    } catch (e) {
      setStudents([
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', status: 'active', package: 'Full Course', sessionsStr: '4/10' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'student' }) 
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create user in database');
      }
      
      const createdUser = await res.json();
      
      // Attempt enrollment but don't fail user creation if it fails (since we don't have real packageIds wired up yet)
      await fetch('/api/enrollments', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: createdUser._id, packageId: formData.package }) 
      }).catch(console.error);
      
      const newStudent = {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone,
        status: 'active',
        package: formData.package === 'full' ? 'Full Course' : formData.package === 'basic' ? 'Basic Course' : 'Refresher',
        sessionsStr: '0/' + (formData.package === 'full' ? '10' : formData.package === 'basic' ? '5' : '3'),
      };
      
      setStudents(prev => [newStudent, ...prev]);
      toast.success('Student created successfully!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: '', package: 'full' }); // Reset form
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to create student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'package', label: 'Package' },
    { key: 'sessionsStr', label: 'Sessions' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <Topbar title="Students Management" backUrl="/admin/dashboard" />
      
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div className="page-header">
          <div className="search-bar">
            <span style={{ marginRight: '8px', opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button id="add-student-btn" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Student
          </button>
        </div>

        <DataTable 
          columns={columns} 
          data={filteredStudents} 
          loading={loading}
          onRowClick={(row) => router.push(`/admin/students/${row.id}`)}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student" size="md">
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
            <input required type="tel" className="input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Temporary Password</label>
            <input required type="password" className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Select Package</label>
            <select className="select" value={formData.package} onChange={e => setFormData({...formData, package: e.target.value})}>
              <option value="full">Full Course (10 Sessions)</option>
              <option value="basic">Basic Course (5 Sessions)</option>
              <option value="refresher">Refresher (3 Sessions)</option>
            </select>
          </div>
          
          <div className="modal-footer" style={{ padding: 'var(--space-md) 0 0 0', border: 'none', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create & Enroll'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
