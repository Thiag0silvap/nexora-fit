'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardCard } from '../../components/dashboard/DashboardCard';
import { AdminShell } from '../../components/layout/AdminShell';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

export const dynamic = 'force-dynamic';

const dashboardCards = [
  { label: 'Alunos', value: '128', helper: 'Mock inicial para validar o painel' },
  { label: 'Instrutores', value: '12', helper: 'Equipe ativa da academia' },
  { label: 'Exercícios', value: '84', helper: 'Biblioteca de movimentos' },
  { label: 'Fichas', value: '46', helper: 'Treinos ativos e arquivados' },
  { label: 'Avaliações', value: '31', helper: 'Registros físicos recentes' },
];

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
}

function AdminContent() {
  const router = useRouter();
  const { loading, user, isAdminAllowed } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }

    if (!loading && user && !isAdminAllowed) {
      router.replace('/login');
    }
  }, [isAdminAllowed, loading, router, user]);

  if (loading || !user || !isAdminAllowed) {
    return (
      <main className="admin-loading">
        <div className="loading-orb" />
        <span>Carregando painel...</span>
      </main>
    );
  }

  return (
    <AdminShell>
      <section className="dashboard-intro">
        <div>
          <p className="eyebrow">Nexora Fit · Visão geral</p>
          <h2>Operação da academia</h2>
        </div>
        <p>
          Sua evolução, todos os dias. Acompanhe a operação da academia em um único
          painel.
        </p>
      </section>

      <section className="dashboard-grid" aria-label="Indicadores administrativos">
        {dashboardCards.map((card) => (
          <DashboardCard
            helper={card.helper}
            key={card.label}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>
    </AdminShell>
  );
}
