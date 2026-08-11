'use client';

import { useState, useEffect } from 'react';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

export default function CompliancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/licenses')
      .then(res => res.json())
      .then(resData => {
        setData(resData.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch licenses', err);
        setLoading(false);
      });
  }, []);

  const getLLExpiryBadge = (expiryStr) => {
    if (!expiryStr) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <StatusBadge status="expired" size="sm" />;
    } else if (diffDays <= 30) {
      return <StatusBadge status="expiring_soon" size="sm" />;
    } else {
      return <StatusBadge status="valid" size="sm" />;
    }
  };

  const columns = [
    { label: 'Student Name', key: 'studentName' },
    { label: 'LL Number', key: 'llNumber', render: (row) => row.llNumber || 'N/A' },
    { 
      label: 'LL Expiry', 
      key: 'llExpiryDate',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{row.llExpiryDate ? new Date(row.llExpiryDate).toLocaleDateString() : 'N/A'}</span>
          {getLLExpiryBadge(row.llExpiryDate)}
        </div>
      )
    },
    { 
      label: 'DL Test Date', 
      key: 'dlTestDate',
      render: (row) => row.dlTestDate ? new Date(row.dlTestDate).toLocaleDateString() : 'Not Scheduled'
    },
    { 
      label: 'DL Status', 
      key: 'dlStatus',
      render: (row) => <StatusBadge status={row.dlStatus || 'pending'} size="sm" />
    }
  ];

  return (
    <div style={{ padding: 'var(--space-xl)' }} id="compliance-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 var(--space-xs) 0' }}>RTO Compliance Tracker</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Monitor learner license expirations and driving test schedules</p>
        </div>
      </div>
      
      <DataTable 
        columns={columns} 
        data={data} 
        loading={loading} 
        emptyMessage="No license records found" 
      />
    </div>
  );
}
