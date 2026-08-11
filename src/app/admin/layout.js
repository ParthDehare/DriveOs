import Sidebar from '../../components/Sidebar';
import { ToastProvider } from '../../components/Toast';

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-xl)', flex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
