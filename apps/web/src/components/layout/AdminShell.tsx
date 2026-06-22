'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { AdminHeader } from './AdminHeader';
import { Sidebar } from './Sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  return (
    <main className="admin-shell">
      <Sidebar />
      <section className="admin-main">
        <AdminHeader onLogout={handleLogout} />
        {children}
      </section>
    </main>
  );
}
