'use client';

import { useAuth } from '../../contexts/AuthContext';

export function AdminHeader({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div>
        <p className="admin-header-kicker">Nexora Fit · Painel administrativo</p>
        <h1>Painel</h1>
      </div>

      <div className="user-area">
        <div className="user-avatar">{user?.nome.charAt(0).toUpperCase() ?? 'F'}</div>
        <div className="user-meta">
          <strong>{user?.nome ?? 'Usuário'}</strong>
          <span>{formatRole(user?.role)}</span>
        </div>
        <button className="logout-button" type="button" onClick={onLogout}>
          Sair
        </button>
      </div>
    </header>
  );
}

function formatRole(role?: string) {
  if (!role) {
    return '-';
  }

  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
