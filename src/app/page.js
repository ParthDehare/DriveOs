'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Fetch session to determine role
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();

      if (sessionData?.user?.role === 'instructor') {
        window.location.href = '/instructor';
      } else if (sessionData?.user?.role === 'student') {
        window.location.href = '/student';
      } else {
        window.location.href = '/admin/dashboard';
      }
      
    } catch (err) {
      setError("An error occurred during sign in.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-md)',
      position: 'relative'
    }}>
      {/* Decorative Neon Orbs */}
      <div className="animate-float" style={{
        position: 'absolute', top: '20%', left: '15%', width: '300px', height: '300px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(40px)', zIndex: 0
      }} />
      <div className="animate-float" style={{
        position: 'absolute', bottom: '15%', right: '15%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
        borderRadius: '50%', filter: 'blur(60px)', zIndex: 0, animationDelay: '2s'
      }} />

      <div className="card glass animate-slide-up" style={{
        width: '100%', maxWidth: '440px', zIndex: 1, padding: 'var(--space-xl)',
        borderTop: '2px solid var(--accent-primary)',
        boxShadow: 'var(--shadow-lg), var(--shadow-glow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{
            fontSize: '3.5rem', margin: '0 auto var(--space-sm)',
            background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'inline-block', filter: 'drop-shadow(0 4px 10px rgba(79,70,229,0.3))'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
              <circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
              <defs>
                <linearGradient id="paint0_linear" x1="2" y1="7" x2="22" y2="17" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4f46e5" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: 'var(--space-xs)', letterSpacing: '-0.5px' }}>
            Drive<span style={{ color: 'var(--accent-secondary)' }}>OS</span>
          </h1>
          <p className="text-secondary" style={{ fontSize: '1.05rem' }}>Welcome back, sign in to continue.</p>
        </div>

        {error && (
          <div className="badge badge-danger animate-fade-in" style={{ width: '100%', marginBottom: 'var(--space-lg)', padding: 'var(--space-sm) var(--space-md)', fontSize: '0.9rem', justifyContent: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">Email Address</label>
            <input 
              id="login-email" type="email" className="input" 
              value={email} onChange={e => setEmail(e.target.value)} 
              placeholder="e.g. admin@driveos.com" required 
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: 'var(--space-xl)' }}>
            <label className="input-label" htmlFor="login-password">Password</label>
            <input 
              id="login-password" type="password" className="input" 
              value={password} onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', fontSize: '1.05rem', letterSpacing: '0.5px' }} disabled={loading}>
            {loading ? (
               <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                 Authenticating...
               </span>
            ) : 'Access Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 'var(--space-xs)' }}>Demo Access Credentials</p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Admin: admin@driveos.com / admin123</span>
            <span className="badge badge-info">Instructor: john@driveos.com / instructor123</span>
            <span className="badge badge-success" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>Student: student1@driveos.com / student123</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
