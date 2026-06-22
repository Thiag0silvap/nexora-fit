'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { InstrutorFormModal } from '../../../components/admin/InstrutorFormModal';
import { ReactivationModal } from '../../../components/admin/ReactivationModal';
import { AdminShell } from '../../../components/layout/AdminShell';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import {
  createInstrutor,
  deleteInstrutor,
  findInactiveInstrutorByEmail,
  getInstrutores,
  reactivateInstrutor,
  updateInstrutor,
} from '../../../services/api';
import {
  CreateInstrutorPayload,
  Instrutor,
  UpdateInstrutorPayload,
} from '../../../types';

export const dynamic = 'force-dynamic';

export default function AdminInstrutoresPage() {
  return (
    <AuthProvider>
      <AdminInstrutoresContent />
    </AuthProvider>
  );
}

function AdminInstrutoresContent() {
  const router = useRouter();
  const { accessToken, loading: authLoading, user, isAdminAllowed } = useAuth();
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedInstrutor, setSelectedInstrutor] = useState<Instrutor | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [inactiveInstrutor, setInactiveInstrutor] = useState<Instrutor | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalInstrutores = useMemo(() => instrutores.length, [instrutores]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
      return;
    }

    if (!authLoading && user && !isAdminAllowed) {
      router.replace('/login');
    }
  }, [authLoading, isAdminAllowed, router, user]);

  useEffect(() => {
    if (!accessToken || !isAdminAllowed) {
      return;
    }

    void loadInstrutores();
  }, [accessToken, isAdminAllowed, statusFilter]);

  async function loadInstrutores() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getInstrutores(accessToken, statusFilter);
      setInstrutores(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar os instrutores.',
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedInstrutor(null);
    setFormError(null);
    setModalMode('create');
    setSuccess(null);
  }

  function openEditModal(instrutor: Instrutor) {
    setSelectedInstrutor(instrutor);
    setFormError(null);
    setModalMode('edit');
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalMode(null);
    setSelectedInstrutor(null);
    setFormError(null);
  }

  async function handleSubmit(payload: CreateInstrutorPayload | UpdateInstrutorPayload) {
    if (!accessToken) {
      setFormError('Sessao expirada. Faca login novamente.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        const createPayload = payload as CreateInstrutorPayload;
        const inactive = await findInactiveInstrutorByEmail(accessToken, createPayload.email);

        if (inactive) {
          setModalMode(null);
          setInactiveInstrutor(inactive);
          return;
        }

        await createInstrutor(accessToken, createPayload);
        setSuccess('Instrutor cadastrado com sucesso.');
      }

      if (modalMode === 'edit' && selectedInstrutor) {
        await updateInstrutor(
          accessToken,
          selectedInstrutor.id,
          payload as UpdateInstrutorPayload,
        );
      }

      closeModal();
      await loadInstrutores();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel salvar o instrutor.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate(senha: string) {
    if (!accessToken || !inactiveInstrutor) return;

    setSaving(true);
    setFormError(null);
    try {
      await reactivateInstrutor(accessToken, inactiveInstrutor.id, senha);
      setInactiveInstrutor(null);
      setStatusFilter('ativos');
      setSuccess('Instrutor reativado com sucesso.');
      await loadInstrutores();
    } catch (reactivationError) {
      setFormError(
        reactivationError instanceof Error
          ? reactivationError.message
          : 'Nao foi possivel reativar o instrutor.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleInactivate(instrutor: Instrutor) {
    if (!accessToken) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja inativar ${instrutor.usuario.nome}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await deleteInstrutor(accessToken, instrutor.id);
      await loadInstrutores();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Nao foi possivel inativar o instrutor.',
      );
    }
  }

  if (authLoading || !user || !isAdminAllowed) {
    return (
      <main className="admin-loading">
        <div className="loading-orb" />
        <span>Carregando instrutores...</span>
      </main>
    );
  }

  return (
    <AdminShell>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Gestao administrativa</p>
          <h2>Instrutores</h2>
          <span>
            {totalInstrutores} instrutor{totalInstrutores === 1 ? '' : 'es'} na seleção
          </span>
        </div>
        <button className="primary-button" type="button" onClick={openCreateModal}>
          + Novo instrutor
        </button>
      </section>

      <div className="status-filter" aria-label="Filtrar instrutores por status">
        {(['todos', 'ativos', 'inativos'] as const).map((status) => (
          <button className={statusFilter === status ? 'filter-tab filter-tab-active' : 'filter-tab'} key={status} type="button" onClick={() => setStatusFilter(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {success ? <div className="page-feedback page-feedback-success">{success}</div> : null}

      <section className="table-card">
        {error ? (
          <div className="table-state table-state-error">
            <strong>Erro ao carregar</strong>
            <p>{error}</p>
            <button className="ghost-button" type="button" onClick={loadInstrutores}>
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="table-state">
            <div className="loading-orb" />
            <span>Carregando lista de instrutores...</span>
          </div>
        ) : instrutores.length === 0 ? (
          <div className="table-state">
            <strong>Nenhum instrutor encontrado</strong>
            <p>Não há instrutores para o filtro selecionado.</p>
            <button className="primary-button" type="button" onClick={openCreateModal}>
              + Novo instrutor
            </button>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>CREF</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {instrutores.map((instrutor) => (
                  <tr key={instrutor.id}>
                    <td>
                      <strong>{instrutor.usuario.nome}</strong>
                    </td>
                    <td>{instrutor.usuario.email}</td>
                    <td>{instrutor.cref || '-'}</td>
                    <td>{instrutor.especialidade || '-'}</td>
                    <td>
                      <span className={instrutor.ativo ? 'status-pill' : 'status-pill status-pill-muted'}>
                        {instrutor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {instrutor.ativo ? <><button type="button" onClick={() => openEditModal(instrutor)}>Editar</button><button className="danger-action" type="button" onClick={() => void handleInactivate(instrutor)}>Inativar</button></> : <button type="button" onClick={() => { setFormError(null); setInactiveInstrutor(instrutor); }}>Reativar</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalMode ? (
        <InstrutorFormModal
          error={formError}
          instrutor={selectedInstrutor}
          mode={modalMode}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
        />
      ) : null}

      {inactiveInstrutor ? (
        <ReactivationModal
          entity="Instrutor"
          record={{ nome: inactiveInstrutor.usuario.nome, email: inactiveInstrutor.usuario.email }}
          saving={saving}
          error={formError}
          onClose={() => { if (!saving) { setInactiveInstrutor(null); setFormError(null); } }}
          onReactivate={handleReactivate}
        />
      ) : null}
    </AdminShell>
  );
}
