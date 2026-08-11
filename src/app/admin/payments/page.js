'use client';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/Toast';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [recordModal, setRecordModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : data.payments || []);
      }
    } catch (err) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleMarkOverdue = async () => {
    try {
      setSubmitting(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_overdue' })
      });
      if (res.ok) {
        toast.success('Overdue payments marked successfully');
        fetchPayments();
      } else {
        toast.error('Failed to mark overdue payments');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!recordModal) return;
    
    try {
      setSubmitting(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record_payment',
          paymentId: recordModal.id,
          method: paymentMethod,
          transactionId
        })
      });
      
      if (res.ok) {
        toast.success('Payment recorded successfully');
        setRecordModal(null);
        setPaymentMethod('cash');
        setTransactionId('');
        fetchPayments();
      } else {
        toast.error('Failed to record payment');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = useMemo(() => {
    return payments.reduce((acc, p) => {
      acc.total += p.amount || 0;
      if (p.status === 'paid') acc.collected += p.amount || 0;
      else if (p.status === 'pending') acc.pending += p.amount || 0;
      else if (p.status === 'overdue') acc.overdue += p.amount || 0;
      return acc;
    }, { total: 0, collected: 0, pending: 0, overdue: 0 });
  }, [payments]);

  const collectionRate = stats.total > 0 ? (stats.collected / stats.total) * 100 : 0;

  const filteredPayments = useMemo(() => {
    if (filter === 'All') return payments;
    return payments.filter(p => p.status.toLowerCase() === filter.toLowerCase());
  }, [payments, filter]);

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-lg)', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Revenue & Payments</h1>
          <p className="page-description">Manage student payments and track revenue</p>
        </div>
        <button id="btn-mark-overdue" className="btn btn-secondary" onClick={handleMarkOverdue} disabled={submitting}>
          {submitting ? 'Processing...' : 'Mark Overdue'}
        </button>
      </div>

      <div className="payment-summary-grid">
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Revenue</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{formatCurrency(stats.total)}</div>
          <div className="collection-progress">
            <div className="collection-progress-bar" style={{ width: `${collectionRate}%` }}></div>
          </div>
          <div className="collection-progress-label">
            <span>Collection Rate</span>
            <span>{collectionRate.toFixed(1)}%</span>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Collected</div>
          <div className="amount-paid" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.collected)}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pending</div>
          <div className="amount-pending" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.pending)}</div>
        </div>
        <div className="stat-card">
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Overdue</div>
          <div className="amount-overdue" style={{ fontSize: '1.8rem' }}>{formatCurrency(stats.overdue)}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Payment History</span>
          <div className="payment-filter-bar" style={{ margin: 0 }}>
            <select 
              id="payment-status-filter" 
              className="select" 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '150px', padding: '6px 10px' }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
        
        <div className="table-container">
          {loading ? (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
              <div className="skeleton" style={{ height: '200px', width: '100%' }}></div>
            </div>
          ) : filteredPayments.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Package</th>
                  <th>Tranche #</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Paid Date</th>
                  <th>Method</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, idx) => (
                  <tr key={payment._id || payment.id || idx}>
                    <td>{payment.studentName || payment.student_name || 'N/A'}</td>
                    <td>{payment.package || 'Standard'}</td>
                    <td>{payment.tranche || payment.tranche_num || 1}</td>
                    <td className={
                      payment.status === 'paid' ? 'amount-paid' : 
                      payment.status === 'overdue' ? 'amount-overdue' : 'amount-pending'
                    }>{formatCurrency(payment.amount)}</td>
                    <td>{new Date(payment.dueDate || payment.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        payment.status === 'paid' ? 'badge-success' :
                        payment.status === 'overdue' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>{payment.paidDate || payment.paid_date ? new Date(payment.paidDate || payment.paid_date).toLocaleDateString() : '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{payment.method || payment.payment_method || '-'}</td>
                    <td>
                      <div className="payment-actions">
                        {payment.status !== 'paid' && (
                          <button 
                            id={`btn-record-${payment.id}`}
                            className="btn btn-sm btn-primary"
                            onClick={() => setRecordModal(payment)}
                          >
                            Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: '3rem' }}>💸</div>
              <h3>No Payments Found</h3>
              <p>There are no payments matching your current filter.</p>
            </div>
          )}
        </div>
      </div>

      {recordModal && (
        <div className="modal-overlay">
          <div className="modal md glass">
            <div className="modal-header">
              <h3>Record Payment</h3>
              <button id="btn-close-modal" className="btn btn-ghost btn-sm" onClick={() => setRecordModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 'var(--space-md)', padding: 'var(--space-md)', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Student:</span>
                  <span style={{ fontWeight: 600 }}>{recordModal.studentName || recordModal.student_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Amount Due:</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{formatCurrency(recordModal.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Due Date:</span>
                  <span>{new Date(recordModal.dueDate || recordModal.due_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <form id="record-payment-form" className="record-payment-form" onSubmit={handleRecordPayment}>
                <div className="input-group">
                  <label className="input-label" htmlFor="payment-method">Payment Method</label>
                  <select 
                    id="payment-method" 
                    className="select" 
                    value={paymentMethod} 
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                
                <div className="input-group">
                  <label className="input-label" htmlFor="transaction-id">Transaction ID (Optional)</label>
                  <input 
                    id="transaction-id" 
                    type="text" 
                    className="input" 
                    placeholder="e.g. UPI Ref / Receipt No" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button id="btn-cancel-payment" className="btn btn-ghost" onClick={() => setRecordModal(null)}>Cancel</button>
              <button id="btn-submit-payment" className="btn btn-primary" onClick={handleRecordPayment} disabled={submitting}>
                {submitting ? 'Saving...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
