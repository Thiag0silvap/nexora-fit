'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlunoFormModal } from '../../../components/admin/AlunoFormModal';
import { ReactivationModal } from '../../../components/admin/ReactivationModal';
import { AdminShell } from '../../../components/layout/AdminShell';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import {
  createAluno,
  deleteAluno,
  findInactiveAlunoByEmail,
  getAlunos,
  reactivateAluno,
  updateAluno,
} from '../../../services/api';
import { Aluno, CreateAlunoPayload, UpdateAlunoPayload } from '../../../types';

export const dynamic = 'force-dynamic';

export default function AdminAlunosPage() {
  return (
    <AuthProvider>
      <AdminAlunosContent />
    </AuthProvider>
  );
}

function AdminAlunosContent() {
  const router = useRouter();
  const { accessToken, loading: authLoading, user, isAdminAllowed } = useAuth();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativos' | 'inativos'>('ativos');
  const [inactiveAluno, setInactiveAluno] = useState<Aluno | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalAlunos = useMemo(() => alunos.length, [alunos]);

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

    void loadAlunos();
  }, [accessToken, isAdminAllowed, statusFilter]);

  async function loadAlunos() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAlunos(accessToken, statusFilter);
      setAlunos(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Nao foi possivel carregar os alunos.',
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedAluno(null);
    setFormError(null);
    setModalMode('create');
    setSuccess(null);
  }

  function openEditModal(aluno: Aluno) {
    setSelectedAluno(aluno);
    setFormError(null);
    setModalMode('edit');
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalMode(null);
    setSelectedAluno(null);
    setFormError(null);
  }

  async function handleSubmit(payload: CreateAlunoPayload | UpdateAlunoPayload) {
    if (!accessToken) {
      setFormError('Sessao expirada. Faca login novamente.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        const createPayload = payload as CreateAlunoPayload;
        const inactive = await findInactiveAlunoByEmail(accessToken, createPayload.email);

        if (inactive) {
          setModalMode(null);
          setInactiveAluno(inactive);
          return;
        }

        await createAluno(accessToken, createPayload);
        setSuccess('Aluno cadastrado com sucesso.');
      }

      if (modalMode === 'edit' && selectedAluno) {
        await updateAluno(accessToken, selectedAluno.id, payload as UpdateAlunoPayload);
      }

      closeModal();
      await loadAlunos();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Nao foi possivel salvar o aluno.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate(senha: string) {
    if (!accessToken || !inactiveAluno) return;

    setSaving(true);
    setFormError(null);
    try {
      await reactivateAluno(accessToken, inactiveAluno.id, senha);
      setInactiveAluno(null);
      setStatusFilter('ativos');
      setSuccess('Aluno reativado com sucesso.');
      await loadAlunos();
    } catch (reactivationError) {
      setFormError(
        reactivationError instanceof Error
          ? reactivationError.message
          : 'Nao foi possivel reativar o aluno.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleInactivate(aluno: Aluno) {
    if (!accessToken) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja inativar ${aluno.usuario.nome}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await deleteAluno(accessToken, aluno.id);
      await loadAlunos();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Nao foi possivel inativar o aluno.',
      );
    }
  }

  if (authLoading || !user || !isAdminAllowed) {
    return (
      <main className="admin-loading">
        <div className="loading-orb" />
        <span>Carregando alunos...</span>
      </main>
    );
  }

  return (
    <AdminShell>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Gestao administrativa</p>
          <h2>Alunos</h2>
          <span>{totalAlunos} aluno{totalAlunos === 1 ? '' : 's'} na seleção</span>
        </div>
        <button className="primary-button" type="button" onClick={openCreateModal}>
          + Novo aluno
        </button>
      </section>

      <div className="status-filter" aria-label="Filtrar alunos por status">
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
            <button className="ghost-button" type="button" onClick={loadAlunos}>
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="table-state">
            <div className="loading-orb" />
            <span>Carregando lista de alunos...</span>
          </div>
        ) : alunos.length === 0 ? (
          <div className="table-state">
            <strong>Nenhum aluno encontrado</strong>
            <p>Não há alunos para o filtro selecionado.</p>
            <button className="primary-button" type="button" onClick={openCreateModal}>
              + Novo aluno
            </button>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Matrícula</th>
                  <th>Objetivo</th>
                  <th>Peso atual</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>
                      <strong>{aluno.usuario.nome}</strong>
                    </td>
                    <td>{aluno.usuario.email}</td>
                    <td>{aluno.matricula}</td>
                    <td>{formatEnum(aluno.objetivo)}</td>
                    <td>{formatWeight(aluno.pesoAtual)}</td>
                    <td>
                      <span className={aluno.ativo ? 'status-pill' : 'status-pill status-pill-muted'}>
                        {aluno.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {aluno.ativo ? <><button type="button" onClick={() => openEditModal(aluno)}>Editar</button><button className="danger-action" type="button" onClick={() => void handleInactivate(aluno)}>Inativar</button></> : <button type="button" onClick={() => { setFormError(null); setInactiveAluno(aluno); }}>Reativar</button>}
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
        <AlunoFormModal
          aluno={selectedAluno}
          error={formError}
          mode={modalMode}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
        />
      ) : null}

      {inactiveAluno ? (
        <ReactivationModal
          entity="Aluno"
          record={{ nome: inactiveAluno.usuario.nome, email: inactiveAluno.usuario.email, matricula: inactiveAluno.matricula }}
          saving={saving}
          error={formError}
          onClose={() => { if (!saving) { setInactiveAluno(null); setFormError(null); } }}
          onReactivate={handleReactivate}
        />
      ) : null}
    </AdminShell>
  );
}

function formatEnum(value?: string | null) {
  if (!value) {
    return '-';
  }

  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatWeight(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '-';
  }

  return `${Number(value).toFixed(1)} kg`;
}
