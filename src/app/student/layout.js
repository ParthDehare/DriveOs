'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="mobile-container">
      {children}
      
      <nav className="bottom-nav">
        <Link href="/student" className={`bottom-nav-item ${pathname === '/student' ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          Home
        </Link>
        <Link href="/student/schedule" className={`bottom-nav-item ${pathname === '/student/schedule' ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          Schedule
        </Link>
        <Link href="/student/ledger" className={`bottom-nav-item ${pathname === '/student/ledger' ? 'active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
          Ledger
        </Link>
      </nav>
    </div>
  );
}
