'use client';
import { useState, useEffect } from 'react';

export default function StudentLedger() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch ledger
    // GET /api/enrollments -> get enrollmentId -> GET /api/payments/ledger/[id]
    setTimeout(() => {
      setLedger([
        { id: 101, date: '2026-08-01', description: 'Initial Deposit', amount: 200, type: 'payment' },
        { id: 102, date: '2026-08-01', description: 'Package Fee (10 Sessions)', amount: 600, type: 'charge' },
        { id: 103, date: '2026-08-15', description: 'Installment Payment', amount: 150, type: 'payment' },
      ]);
      setLoading(false);
    }, 400);
  }, []);

  const totalCharges = ledger.filter(l => l.type === 'charge').reduce((sum, l) => sum + l.amount, 0);
  const totalPaid = ledger.filter(l => l.type === 'payment').reduce((sum, l) => sum + l.amount, 0);
  const balance = totalCharges - totalPaid;

  return (
    <div style={{ position: 'relative' }}>
      {/* Background Decor */}
      <div className="animate-float" style={{
        position: 'absolute', top: '10%', left: '-15%', width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(50px)', zIndex: 0
      }} />

      <header className="mobile-page-header" style={{ position: 'relative', zIndex: 1, borderBottom: 'none', background: 'transparent' }}>
        <h1 className="page-title" style={{ fontSize: '1.8rem', margin: 0, letterSpacing: '-0.5px' }}>Payment Ledger</h1>
      </header>

      <main style={{ padding: '0 var(--space-md) var(--space-md)', position: 'relative', zIndex: 1 }}>
        <div className="card stat-card animate-slide-up" style={{ 
          marginBottom: 'var(--space-xl)',
          background: 'var(--bg-card)',
          boxShadow: balance > 0 ? '0 4px 15px rgba(239, 68, 68, 0.15)' : '0 4px 15px rgba(16, 185, 129, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--space-xs)' }}>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-secondary)' }}>Outstanding Balance</p>
          </div>
          <p style={{ 
            margin: '8px 0 0 44px', fontSize: '2.5rem', fontWeight: '800', 
            color: balance > 0 ? 'var(--danger)' : 'var(--success)',
            textShadow: 'none',
            letterSpacing: '-1px'
          }}>
            ${Math.abs(balance).toFixed(2)}
          </p>
        </div>

        <h3 style={{ margin: '0 0 var(--space-md) 0', fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Transaction History</h3>
        
        {loading ? (
          <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-lg)' }}></div>
        ) : (
          <div className="card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((tx, idx) => (
                    <tr key={tx.id} style={{ animationDelay: `${0.1 * idx}s` }} className="animate-fade-in">
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{tx.date}</td>
                      <td>
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{tx.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{tx.type}</div>
                      </td>
                      <td style={{ 
                        textAlign: 'right', fontWeight: '700', fontSize: '1.05rem',
                        color: tx.type === 'payment' ? 'var(--success)' : 'var(--text-primary)' 
                      }}>
                        {tx.type === 'payment' ? '-' : ''}${tx.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
