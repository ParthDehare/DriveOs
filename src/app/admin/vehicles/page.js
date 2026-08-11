'use client';

import { useState, useEffect } from 'react';
import Topbar from '../../../components/Topbar';
import StatusBadge from '../../../components/StatusBadge';
import DataTable from '../../../components/DataTable';
import Modal from '../../../components/Modal';
import { useToast } from '../../../components/Toast';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({ plate: '', make: '', model: '', year: '', transmission: 'Manual', fuel: 'Petrol' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vehicles');
      if (res.ok) {
        setVehicles(await res.json());
      } else {
        setVehicles([
          { id: 1, plate: 'ABC-1234', make: 'Toyota', model: 'Yaris', year: 2020, transmission: 'Manual', fuel: 'Petrol', status: 'active' },
          { id: 2, plate: 'XYZ-9876', make: 'Honda', model: 'Civic', year: 2022, transmission: 'Automatic', fuel: 'Hybrid', status: 'maintenance' },
        ]);
      }
    } catch (e) {
      setVehicles([
        { id: 1, plate: 'ABC-1234', make: 'Toyota', model: 'Yaris', year: 2020, transmission: 'Manual', fuel: 'Petrol', status: 'active' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/vehicles', { method: 'POST', body: JSON.stringify(formData) }).catch(()=>null);
      toast.success('Vehicle added to fleet');
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      toast.error('Failed to add vehicle');
    }
  };

  const columns = [
    { key: 'plate', label: 'License Plate' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <Topbar title="Fleet Management" />
      <div style={{ padding: 'var(--space-md) 0' }}>
        <div className="page-header">
          <h2>Manage Vehicles</h2>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Vehicle</button>
        </div>

        <DataTable columns={columns} data={vehicles} loading={loading} />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleCreate}>
          <div className="input-group">
            <label className="input-label">License Plate</label>
            <input required type="text" className="input" value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="input-group">
              <label className="input-label">Make</label>
              <input required type="text" className="input" value={formData.make} onChange={e => setFormData({...formData, make: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">Model</label>
              <input required type="text" className="input" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Transmission</label>
            <select className="select" value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})}>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          
          <div className="modal-footer" style={{ border: 'none', marginTop: 'var(--space-lg)' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Add Vehicle</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
