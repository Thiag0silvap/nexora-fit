'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DivisaoFormModal } from '../../../components/admin/DivisaoFormModal';
import { ExercicioDivisaoFormModal } from '../../../components/admin/ExercicioDivisaoFormModal';
import { FichaFormModal } from '../../../components/admin/FichaFormModal';
import { AdminShell } from '../../../components/layout/AdminShell';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import {
  createDivisaoTreino,
  createExercicioDivisao,
  createFichaTreino,
  deleteDivisaoTreino,
  deleteExercicioDivisao,
  duplicateFichaTreino,
  getAlunos,
  getExercicios,
  getFichaTreinoById,
  getFichasTreino,
  getInstrutores,
  updateDivisaoTreino,
  updateExercicioDivisao,
  updateFichaTreino,
} from '../../../services/api';
import {
  Aluno,
  DivisaoTreino,
  Exercicio,
  ExercicioDivisao,
  FichaTreino,
  Instrutor,
  StatusFicha,
} from '../../../types';

export const dynamic = 'force-dynamic';

type ModalState =
  | { type: 'create-ficha' }
  | { type: 'duplicate-ficha' }
  | { type: 'create-divisao' }
  | { type: 'edit-divisao'; divisao: DivisaoTreino }
  | { type: 'create-exercicio'; divisao: DivisaoTreino }
  | { type: 'edit-exercicio'; divisao: DivisaoTreino; item: ExercicioDivisao }
  | null;

export default function AdminFichasPage() {
  return <AuthProvider><AdminFichasContent /></AuthProvider>;
}

function AdminFichasContent() {
  const router = useRouter();
  const { accessToken, loading: authLoading, user } = useAuth();
  const canManage = user?.role === 'ADMIN_ACADEMIA' || user?.role === 'INSTRUTOR';
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [fichas, setFichas] = useState<FichaTreino[]>([]);
  const [selectedFicha, setSelectedFicha] = useState<FichaTreino | null>(null);
  const [expandedDivisaoId, setExpandedDivisaoId] = useState<string | null>(null);
  const [alunoFilter, setAlunoFilter] = useState('');
  const [instrutorFilter, setInstrutorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | 'ATIVA' | 'ARQUIVADA'>('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const ownInstructor = useMemo<Instrutor[]>(() => {
    if (user?.role !== 'INSTRUTOR' || !user.instrutorId) return [];
    return [{
      id: user.instrutorId,
      ativo: true,
      usuario: { id: user.id, nome: user.nome, email: user.email, role: user.role },
    }];
  }, [user]);

  const availableInstrutores = user?.role === 'INSTRUTOR' ? ownInstructor : instrutores;
  const orderedDivisoes = useMemo(
    () => [...(selectedFicha?.divisoes ?? [])].sort((a, b) => a.ordem - b.ordem),
    [selectedFicha],
  );

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
    if (!authLoading && user && !canManage) router.replace('/login');
  }, [authLoading, canManage, router, user]);

  const loadFichas = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFichasTreino(accessToken, {
        alunoId: alunoFilter || undefined,
        instrutorId: instrutorFilter || undefined,
        status: statusFilter || undefined,
      });
      setFichas(data);
    } catch (loadError) {
      setError(messageFrom(loadError, 'Não foi possível carregar as fichas.'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, alunoFilter, instrutorFilter, statusFilter]);

  useEffect(() => {
    if (!accessToken || !canManage) return;

    async function loadDependencies() {
      try {
        const [students, exercises, instructors] = await Promise.all([
          getAlunos(accessToken!),
          getExercicios(accessToken!),
          user?.role === 'ADMIN_ACADEMIA' ? getInstrutores(accessToken!) : Promise.resolve([]),
        ]);
        setAlunos(students);
        setExercicios(exercises);
        setInstrutores(instructors);
      } catch (loadError) {
        setError(messageFrom(loadError, 'Não foi possível carregar os dados de apoio.'));
      }
    }

    void loadDependencies();
  }, [accessToken, canManage, user?.role]);

  useEffect(() => { if (accessToken && canManage) void loadFichas(); }, [accessToken, canManage, loadFichas]);

  async function openFicha(fichaId: string) {
    if (!accessToken) return;
    setDetailLoading(true);
    setError(null);
    try {
      const detail = await getFichaTreinoById(accessToken, fichaId);
      setSelectedFicha(detail);
      setExpandedDivisaoId(detail.divisoes?.[0]?.id ?? null);
    } catch (loadError) {
      setError(messageFrom(loadError, 'Não foi possível abrir a ficha.'));
    } finally {
      setDetailLoading(false);
    }
  }

  async function reloadSelected(fichaId = selectedFicha?.id, expandId?: string | null) {
    if (!accessToken || !fichaId) return;
    const detail = await getFichaTreinoById(accessToken, fichaId);
    setSelectedFicha(detail);
    if (expandId !== undefined) setExpandedDivisaoId(expandId);
    await loadFichas();
  }

  function openModal(nextModal: ModalState) {
    setFormError(null);
    setSuccess(null);
    setModal(nextModal);
  }

  function closeModal() {
    if (!saving) { setModal(null); setFormError(null); }
  }

  async function submitFicha(payload: { alunoId?: string; instrutorId?: string; nome: string; observacao?: string }) {
    if (!accessToken) return;
    setSaving(true); setFormError(null);
    try {
      if (modal?.type === 'create-ficha' && payload.alunoId && payload.instrutorId) {
        const created = await createFichaTreino(accessToken, {
          alunoId: payload.alunoId, instrutorId: payload.instrutorId,
          nome: payload.nome, observacao: payload.observacao,
        });
        setModal(null); setSuccess('Ficha criada com sucesso.');
        await reloadSelected(created.id, null);
      } else if (modal?.type === 'duplicate-ficha' && selectedFicha) {
        const created = await duplicateFichaTreino(accessToken, selectedFicha.id, {
          nome: payload.nome, observacao: payload.observacao,
        });
        setModal(null); setSuccess('Ficha duplicada com sucesso.');
        await reloadSelected(created.id, created.divisoes?.[0]?.id);
      }
    } catch (submitError) {
      setFormError(messageFrom(submitError, 'Não foi possível salvar a ficha.'));
    } finally { setSaving(false); }
  }

  async function archiveFicha() {
    if (!accessToken || !selectedFicha || !window.confirm('Arquivar esta ficha de treino?')) return;
    try {
      await updateFichaTreino(accessToken, selectedFicha.id, { status: 'ARQUIVADA' });
      setSuccess('Ficha arquivada com sucesso.');
      await reloadSelected();
    } catch (archiveError) { setError(messageFrom(archiveError, 'Não foi possível arquivar a ficha.')); }
  }

  async function submitDivisao(payload: { nome: string; ordem: number }) {
    if (!accessToken || !selectedFicha) return;
    setSaving(true); setFormError(null);
    try {
      let divisaoId: string;
      if (modal?.type === 'edit-divisao') {
        const updated = await updateDivisaoTreino(accessToken, modal.divisao.id, payload);
        divisaoId = updated.id;
      } else {
        const created = await createDivisaoTreino(accessToken, selectedFicha.id, payload);
        divisaoId = created.id;
      }
      setModal(null); setSuccess('Treino salvo com sucesso.');
      await reloadSelected(undefined, divisaoId);
    } catch (submitError) { setFormError(messageFrom(submitError, 'Não foi possível salvar o treino.')); }
    finally { setSaving(false); }
  }

  async function removeDivisao(divisao: DivisaoTreino) {
    if (!accessToken || !window.confirm(`Excluir ${divisao.nome} e seus exercícios?`)) return;
    try {
      await deleteDivisaoTreino(accessToken, divisao.id);
      setSuccess('Treino excluído com sucesso.');
      await reloadSelected(undefined, undefined);
    } catch (removeError) { setError(messageFrom(removeError, 'Não foi possível excluir o treino.')); }
  }

  async function submitExercicio(payload: {
    exercicioId?: string; series: number; repeticoes: string; descansoSegundos?: number;
    observacao?: string; ordem: number;
  }) {
    if (!accessToken || !modal || !('divisao' in modal)) return;
    setSaving(true); setFormError(null);
    try {
      if (modal.type === 'edit-exercicio') {
        await updateExercicioDivisao(accessToken, modal.item.id, payload);
      } else if (modal.type === 'create-exercicio' && payload.exercicioId) {
        await createExercicioDivisao(accessToken, modal.divisao.id, {
          exercicioId: payload.exercicioId, series: payload.series,
          repeticoes: payload.repeticoes, descansoSegundos: payload.descansoSegundos,
          observacao: payload.observacao, ordem: payload.ordem,
        });
      }
      const divisaoId = modal.divisao.id;
      setModal(null); setSuccess('Exercício salvo com sucesso.');
      await reloadSelected(undefined, divisaoId);
    } catch (submitError) { setFormError(messageFrom(submitError, 'Não foi possível salvar o exercício.')); }
    finally { setSaving(false); }
  }

  async function removeExercicio(item: ExercicioDivisao, divisaoId: string) {
    if (!accessToken || !window.confirm(`Remover ${item.exercicio.nome} deste treino?`)) return;
    try {
      await deleteExercicioDivisao(accessToken, item.id);
      setSuccess('Exercício removido com sucesso.');
      await reloadSelected(undefined, divisaoId);
    } catch (removeError) { setError(messageFrom(removeError, 'Não foi possível remover o exercício.')); }
  }

  if (authLoading || !user || !canManage) {
    return <main className="admin-loading"><div className="loading-orb" /><span>Carregando fichas...</span></main>;
  }

  const nextDivisionOrder = Math.max(0, ...orderedDivisoes.map((item) => item.ordem)) + 1;

  return (
    <AdminShell>
      <section className="page-toolbar">
        <div><p className="eyebrow">Prescrição de treino</p><h2>Fichas</h2><span>{fichas.length} ficha{fichas.length === 1 ? '' : 's'} encontrada{fichas.length === 1 ? '' : 's'}</span></div>
        <button className="primary-button" type="button" onClick={() => openModal({ type: 'create-ficha' })}>+ Nova ficha</button>
      </section>

      <section className="workout-filters">
        <label>Aluno<select value={alunoFilter} onChange={(event) => setAlunoFilter(event.target.value)}><option value="">Todos</option>{alunos.map((item) => <option key={item.id} value={item.id}>{item.usuario.nome}</option>)}</select></label>
        {user.role === 'ADMIN_ACADEMIA' ? <label>Instrutor<select value={instrutorFilter} onChange={(event) => setInstrutorFilter(event.target.value)}><option value="">Todos</option>{instrutores.map((item) => <option key={item.id} value={item.id}>{item.usuario.nome}</option>)}</select></label> : null}
        <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as '' | 'ATIVA' | 'ARQUIVADA')}><option value="">Todas</option><option value="ATIVA">Ativa</option><option value="ARQUIVADA">Arquivada</option></select></label>
      </section>

      {error ? <div className="page-feedback page-feedback-error">{error}</div> : null}
      {success ? <div className="page-feedback page-feedback-success">{success}</div> : null}

      <section className="table-card">
        {loading ? <div className="table-state"><div className="loading-orb" /><span>Carregando fichas...</span></div> : fichas.length === 0 ? <div className="table-state"><strong>Nenhuma ficha encontrada</strong><p>Use os filtros ou crie a primeira ficha da academia.</p></div> : (
          <div className="responsive-table"><table><thead><tr><th>Nome da ficha</th><th>Aluno</th><th>Instrutor</th><th>Status</th><th>Data criação</th><th>Ações</th></tr></thead><tbody>{fichas.map((ficha) => <tr key={ficha.id}><td><strong>{ficha.nome}</strong></td><td>{ficha.aluno.usuario.nome}</td><td>{ficha.instrutor.usuario.nome}</td><td><span className={`status-pill ${ficha.status === 'ARQUIVADA' ? 'status-pill-muted' : ''}`}>{formatStatus(ficha.status)}</span></td><td>{formatDate(ficha.createdAt)}</td><td><div className="table-actions"><button type="button" onClick={() => void openFicha(ficha.id)}>Abrir ficha</button></div></td></tr>)}</tbody></table></div>
        )}
      </section>

      {detailLoading ? <div className="workout-detail-loading"><div className="loading-orb" /> Abrindo ficha...</div> : null}
      {selectedFicha ? (
        <section className="workout-builder">
          <header className="workout-builder-header">
            <div><p className="eyebrow">Ficha selecionada</p><h3>{selectedFicha.nome}</h3><p>{selectedFicha.observacao || 'Sem observações.'}</p><span>{selectedFicha.aluno.usuario.nome} · {selectedFicha.instrutor.usuario.nome}</span></div>
            <div className="builder-actions"><button className="ghost-button" type="button" onClick={() => openModal({ type: 'duplicate-ficha' })}>Duplicar ficha</button>{selectedFicha.status !== 'ARQUIVADA' ? <button className="danger-button" type="button" onClick={() => void archiveFicha()}>Arquivar ficha</button> : null}<button className="primary-button" type="button" onClick={() => openModal({ type: 'create-divisao' })}>+ Adicionar treino</button></div>
          </header>

          {orderedDivisoes.length === 0 ? <div className="builder-empty"><strong>Nenhum treino cadastrado ainda.</strong><p>Adicione a primeira divisão para começar a montar esta ficha.</p></div> : (
            <div className="workout-accordion">{orderedDivisoes.map((divisao) => {
              const expanded = expandedDivisaoId === divisao.id;
              const items = [...divisao.exerciciosDivisao].sort((a, b) => a.ordem - b.ordem);
              return <article className={`division-card ${expanded ? 'division-card-open' : ''}`} key={divisao.id}>
                <button className="division-toggle" type="button" onClick={() => setExpandedDivisaoId(expanded ? null : divisao.id)}><span className="division-order">{divisao.ordem}</span><span><strong>{divisao.nome}</strong><small>{items.length} exercício{items.length === 1 ? '' : 's'}</small></span><b>{expanded ? '−' : '+'}</b></button>
                {expanded ? <div className="division-content">
                  <div className="division-actions"><button type="button" onClick={() => openModal({ type: 'edit-divisao', divisao })}>Editar treino</button><button className="danger-action" type="button" onClick={() => void removeDivisao(divisao)}>Excluir treino</button><button className="primary-button" type="button" onClick={() => openModal({ type: 'create-exercicio', divisao })}>+ Adicionar exercício</button></div>
                  {items.length === 0 ? <div className="division-empty">Nenhum exercício nesta divisão.</div> : <div className="exercise-card-grid">{items.map((item) => <div className="workout-exercise-card" key={item.id}><div className="exercise-card-heading"><span>{item.exercicio.grupoMuscular}</span><strong>{item.exercicio.nome}</strong></div><div className="exercise-metrics"><span><b>{item.series}</b>Séries</span><span><b>{item.repeticoes}</b>Repetições</span><span><b>{item.descansoSegundos ?? 0}s</b>Descanso</span></div>{item.observacao ? <p>{item.observacao}</p> : null}<div className="table-actions"><button type="button" onClick={() => openModal({ type: 'edit-exercicio', divisao, item })}>Editar</button><button className="danger-action" type="button" onClick={() => void removeExercicio(item, divisao.id)}>Excluir</button></div></div>)}</div>}
                </div> : null}
              </article>;
            })}</div>
          )}
        </section>
      ) : null}

      {modal?.type === 'create-ficha' || modal?.type === 'duplicate-ficha' ? <FichaFormModal mode={modal.type === 'create-ficha' ? 'create' : 'duplicate'} alunos={alunos} instrutores={availableInstrutores} fixedInstrutorId={user.role === 'INSTRUTOR' ? user.instrutorId : undefined} initialName={modal.type === 'duplicate-ficha' ? `Cópia de ${selectedFicha?.nome ?? ''}` : ''} initialObservation={modal.type === 'duplicate-ficha' ? selectedFicha?.observacao : ''} saving={saving} error={formError} onClose={closeModal} onSubmit={submitFicha} /> : null}
      {modal?.type === 'create-divisao' || modal?.type === 'edit-divisao' ? <DivisaoFormModal divisao={modal.type === 'edit-divisao' ? modal.divisao : null} nextOrder={nextDivisionOrder} saving={saving} error={formError} onClose={closeModal} onSubmit={submitDivisao} /> : null}
      {modal?.type === 'create-exercicio' || modal?.type === 'edit-exercicio' ? <ExercicioDivisaoFormModal exercicios={exercicios} exercicioDivisao={modal.type === 'edit-exercicio' ? modal.item : null} nextOrder={Math.max(0, ...modal.divisao.exerciciosDivisao.map((item) => item.ordem)) + 1} saving={saving} error={formError} onClose={closeModal} onSubmit={submitExercicio} /> : null}
    </AdminShell>
  );
}

function formatStatus(status: StatusFicha) {
  return status === 'ATIVA' ? 'Ativa' : status === 'ARQUIVADA' ? 'Arquivada' : 'Inativa';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

function messageFrom(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
