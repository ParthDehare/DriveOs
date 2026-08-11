'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/StatCard';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        // Handle if response is wrapped in { data: ... } or just the object
        const statsData = data.data || data;
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch stats', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 var(--space-xs) 0' }}>Business Analytics</h1>
        <div style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>Loading analytics...</div>
      </div>
    );
  }

  // Fallback values in case API misses something
  const safeStats = stats || {};
  const collectionRate = safeStats.collectionRate ? Number(Number(safeStats.collectionRate).toFixed(1)) : 0;

  return (
    <div style={{ padding: 'var(--space-xl)' }} id="analytics-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: '0 0 var(--space-xs) 0' }}>Business Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Overview of business performance and key metrics</p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-xl)' }}>
        <StatCard 
          title="Monthly Revenue" 
          value={`₹${(safeStats.monthlyRevenue || 0).toLocaleString()}`} 
          icon="💵" 
          color="green" 
        />
        <StatCard 
          title="Total Students" 
          value={safeStats.totalStudents || 0} 
          icon="👨‍🎓" 
          color="blue" 
        />
        <StatCard 
          title="Today's Sessions" 
          value={safeStats.todaySessions || 0} 
          icon="🚗" 
          color="indigo" 
        />
        <StatCard 
          title="Pending Payments" 
          value={`₹${(safeStats.pendingPayments || 0).toLocaleString()}`} 
          icon="⏳" 
          color="amber" 
        />
        <StatCard 
          title="Overdue Payments" 
          value={`₹${(safeStats.overduePayments || 0).toLocaleString()}`} 
          icon="⚠️" 
          color="red" 
        />
      </div>

      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.2rem', fontWeight: 600 }}>Fee Collection Rate</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ flex: 1, backgroundColor: 'var(--bg-elevated)', height: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ 
              width: `${collectionRate}%`, 
              height: '100%', 
              backgroundColor: 'var(--success)',
              transition: 'width 1s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingRight: '12px'
            }}>
              {collectionRate > 10 && <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 'bold' }}>{collectionRate}%</span>}
            </div>
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.2rem', width: '60px', textAlign: 'right', color: 'var(--text-primary)' }}>
            {collectionRate}%
          </div>
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 'var(--space-sm)' }}>
          Percentage of total fees collected vs expected total fees for active students.
        </p>
      </div>
    </div>
  );
}
