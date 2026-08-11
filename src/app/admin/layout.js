import Sidebar from '../../components/Sidebar';
import BottomNav from '../../components/BottomNav';
import { ToastProvider } from '../../components/Toast';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="admin-layout mobile-container">
        <div className="sidebar-container">
          <Sidebar />
        </div>
        <main className="admin-main">
          <div className="admin-content">
            {children}
          </div>
        </main>
        
        <div className="mobile-only-nav" style={{ display: 'none' }}>
          <BottomNav />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1024px) {
          .mobile-only-nav { display: block !important; }
        }
      `}} />
    </ToastProvider>
  );
}
