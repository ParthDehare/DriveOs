'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></> },
    { name: 'Students', path: '/admin/students', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> },
    { name: 'Vehicles', path: '/admin/vehicles', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M19 11l-2-6H7l-2 6"/><circle cx="7" cy="16" r="1.5"/><circle cx="17" cy="16" r="1.5"/></> },
    { name: 'Instructors', path: '/admin/instructors', icon: <><path d="M2 22h20"/><path d="M16 2v20"/><path d="M8 2v20"/><path d="M2 12h20"/></> },
    { name: 'Schedule', path: '/admin/schedule', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { name: 'Payments', path: '/admin/payments', icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> },
    { name: 'Compliance', path: '/admin/compliance', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> },
    { name: 'Analytics', path: '/admin/analytics', icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> },
  ];

  return (
    <aside style={{
      width: '260px', height: '100vh', position: 'fixed', top: 0, left: 0,
      display: 'flex', flexDirection: 'column', zIndex: 100,
      background: 'var(--bg-primary)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border)',
      boxShadow: '10px 0 30px rgba(0,0,0,0.05)',
      animation: 'slideRight var(--transition-normal)'
    }}>
      <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
          Drive<span style={{ color: 'var(--accent-primary)' }}>OS</span>
        </h2>
      </div>

      <nav style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item, idx) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <li key={idx}>
                <Link href={item.path} style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--accent-gradient)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isActive ? '0 4px 15px rgba(79, 70, 229, 0.2)' : 'none',
                  position: 'relative', overflow: 'hidden'
                }} className="sidebar-link">
                  {isActive && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#fff', opacity: 0.5 }} />}
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '14px', opacity: isActive ? 1 : 0.7 }}>
                    {item.icon}
                  </svg>
                  <span style={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 500, letterSpacing: '0.3px' }}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{
        padding: '24px', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '16px',
        background: 'rgba(0,0,0,0.02)'
      }}>
        <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '1rem', background: 'var(--accent-gradient)' }}>
          {session?.user?.name ? session.user.name.charAt(0) : 'A'}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)' }}>
            {session?.user?.name || 'Admin User'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Administrator</div>
        </div>
        <button className="btn btn-ghost" onClick={() => signOut({ callbackUrl: '/' })} title="Sign Out" style={{ padding: '8px', color: 'var(--text-muted)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
        </button>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .sidebar-link:hover {
          background-color: rgba(0,0,0,0.05);
          color: var(--text-primary) !important;
          transform: translateX(4px);
        }
      `}} />
    </aside>
  );
}
