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
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', packageId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, packageId: data[0]._id || data[0].id }));
        }
      }
    } catch (e) {
      console.error("Failed to load packages");
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users?role=student');
      if (res.ok) {
        const data = await res.json();
        
        // Let's also fetch enrollments to show their package
        const enrollRes = await fetch('/api/enrollments').catch(()=>null);
        let enrollments = [];
        if (enrollRes?.ok) {
          enrollments = await enrollRes.json();
        }

        const mappedData = data.map(user => {
          const userEnrollments = enrollments.filter(e => e.studentId?._id === user._id || e.student_id === user._id);
          const activeEnrollment = userEnrollments.find(e => e.status === 'active') || userEnrollments[0];
          
          return {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            status: user.isActive ? 'active' : 'inactive',
            package: activeEnrollment?.packageId?.name || 'Not Enrolled',
            sessionsStr: activeEnrollment ? `${activeEnrollment.sessionsCompleted || 0}/${activeEnrollment.packageId?.totalSessions || 0}` : '0/0',
          };
        });

        setStudents(mappedData);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load students');
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
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          phone: formData.phone, 
          password: formData.password, 
          role: 'student' 
        }) 
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to create user in database');
      }
      
      const createdUser = await res.json();
      
      // Attempt enrollment using the real package UUID
      if (formData.packageId) {
        const enrollRes = await fetch('/api/enrollments', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: createdUser._id, packageId: formData.packageId }) 
        });
        
        if (!enrollRes.ok) {
          const errData = await enrollRes.json();
          toast.error(errData.message || 'Student created, but enrollment failed');
        }
      }
      
      toast.success('Student created and enrolled successfully!');
      setIsModalOpen(false);
      setFormData(prev => ({ name: '', email: '', phone: '', password: '', packageId: packages.length > 0 ? (packages[0]._id || packages[0].id) : '' })); // Reset form
      fetchStudents(); // Refresh list
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
            <select className="select" required value={formData.packageId} onChange={e => setFormData({...formData, packageId: e.target.value})}>
              <option value="">Select a package...</option>
              {packages.map(pkg => (
                <option key={pkg._id || pkg.id} value={pkg._id || pkg.id}>
                  {pkg.name} ({pkg.totalSessions || pkg.total_sessions} Sessions)
                </option>
              ))}
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
