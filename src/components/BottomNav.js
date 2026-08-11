'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></> },
    { name: 'Students', path: '/admin/students', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></> },
    { name: 'Schedule', path: '/admin/schedule', icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></> },
    { name: 'More', path: '#', icon: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>, isMenu: true },
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
        return (
          <Link 
            key={idx} 
            href={item.path} 
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
