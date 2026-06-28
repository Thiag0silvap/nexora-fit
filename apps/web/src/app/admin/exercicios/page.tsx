'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExercicioFormModal } from '../../../components/admin/ExercicioFormModal';
import { AdminShell } from '../../../components/layout/AdminShell';
import { AuthProvider, useAuth } from '../../../contexts/AuthContext';
import {
  createExercicio,
  deleteExercicio,
  getExercicios,
  updateExercicio,
} from '../../../services/api';
import {
  CreateExercicioPayload,
  Exercicio,
  GrupoMuscular,
  UpdateExercicioPayload,
} from '../../../types';

export const dynamic = 'force-dynamic';

type LibraryCategory =
  | 'TODOS'
  | 'PEITO'
  | 'COSTAS'
  | 'OMBRO'
  | 'TRAPEZIO'
  | 'BICEPS'
  | 'TRICEPS'
  | 'QUADRICEPS'
  | 'POSTERIOR'
  | 'GLUTEO'
  | 'PANTURRILHA'
  | 'ABDOMEN'
  | 'CARDIO';

const filterOptions: Array<{ value: LibraryCategory; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'PEITO', label: 'Peito' },
  { value: 'COSTAS', label: 'Costas' },
  { value: 'OMBRO', label: 'Ombro' },
  { value: 'TRAPEZIO', label: 'Trapézio' },
  { value: 'BICEPS', label: 'Bíceps' },
  { value: 'TRICEPS', label: 'Tríceps' },
  { value: 'QUADRICEPS', label: 'Quadríceps' },
  { value: 'POSTERIOR', label: 'Posterior' },
  { value: 'GLUTEO', label: 'Glúteo' },
  { value: 'PANTURRILHA', label: 'Panturrilha' },
  { value: 'ABDOMEN', label: 'Abdômen' },
  { value: 'CARDIO', label: 'Cardio' },
];

const categoryLabels: Record<LibraryCategory, string> = filterOptions.reduce(
  (accumulator, option) => ({ ...accumulator, [option.value]: option.label }),
  {} as Record<LibraryCategory, string>,
);

const fallbackCategoryByGroup: Record<GrupoMuscular, LibraryCategory> = {
  PEITO: 'PEITO',
  COSTAS: 'COSTAS',
  OMBRO: 'OMBRO',
  BICEPS: 'BICEPS',
  TRICEPS: 'TRICEPS',
  PERNAS: 'QUADRICEPS',
  GLUTEOS: 'GLUTEO',
  ABDOMEN: 'ABDOMEN',
  CARDIO: 'CARDIO',
};

const categoryByExerciseName: Record<string, LibraryCategory> = {
  'Peck Deck': 'PEITO',
  'Peck Deck Fly': 'PEITO',
  'Supino Reto': 'PEITO',
  'Supino Inclinado': 'PEITO',
  'Supino Declinado': 'PEITO',
  'Supino Sentado': 'PEITO',
  Crossover: 'PEITO',
  Crucifixo: 'PEITO',
  'Pull Over': 'PEITO',
  'Puxador Frontal': 'COSTAS',
  'Remada Banco Inclinado': 'COSTAS',
  'Remada Curvada': 'COSTAS',
  'Remada Sentada': 'COSTAS',
  'Remada Unilateral': 'COSTAS',
  'Remada Cavalinho': 'COSTAS',
  'Crucifixo Invertido': 'COSTAS',
  'Extensão de Ombro': 'COSTAS',
  'Barra Fixa': 'COSTAS',
  Graviton: 'COSTAS',
  'Face Pull': 'COSTAS',
  'Desenvolvimento Barra': 'OMBRO',
  'Elevação Lateral': 'OMBRO',
  'Elevação Frontal': 'OMBRO',
  'Ombro Máquina': 'OMBRO',
  'Elevação Escapular': 'TRAPEZIO',
  'Encolhimento de Ombros': 'TRAPEZIO',
  'Remada Alta': 'TRAPEZIO',
  'Rosca Direta': 'BICEPS',
  'Rosca Martelo': 'BICEPS',
  'Rosca Scott': 'BICEPS',
  'Rosca Alternada': 'BICEPS',
  'Rosca Concentrada': 'BICEPS',
  'Rosca Inversa': 'BICEPS',
  'Tríceps Pronado': 'TRICEPS',
  'Tríceps Supinado': 'TRICEPS',
  'Tríceps Francês': 'TRICEPS',
  'Tríceps Testa': 'TRICEPS',
  'Tríceps Corda': 'TRICEPS',
  'Tríceps Mergulho': 'TRICEPS',
  'Tríceps Coice': 'TRICEPS',
  Extensora: 'QUADRICEPS',
  Agachamento: 'QUADRICEPS',
  Hack: 'QUADRICEPS',
  'Hack Squat Articulado': 'QUADRICEPS',
  'Leg Press Horizontal': 'QUADRICEPS',
  'Leg Articulado': 'QUADRICEPS',
  Adução: 'QUADRICEPS',
  Avanço: 'QUADRICEPS',
  Afundo: 'QUADRICEPS',
  Passada: 'QUADRICEPS',
  'Step Up': 'QUADRICEPS',
  'Sissy Squat': 'QUADRICEPS',
  'Flexora em Pé': 'POSTERIOR',
  'Flexora Sentada': 'POSTERIOR',
  'Flexora Horizontal': 'POSTERIOR',
  Stiff: 'POSTERIOR',
  'Banco Romano': 'POSTERIOR',
  'Extensão do Quadril': 'GLUTEO',
  'Elevação Pélvica': 'GLUTEO',
  'Quatro Apoios': 'GLUTEO',
  Sumô: 'GLUTEO',
  Recuo: 'GLUTEO',
  Búlgaro: 'GLUTEO',
  Abdução: 'GLUTEO',
  'Panturrilha em Pé': 'PANTURRILHA',
  'Panturrilha Sentada': 'PANTURRILHA',
  'Flexão Tibial': 'PANTURRILHA',
  'Abdominal Tradicional': 'ABDOMEN',
  'Abdominal Infra': 'ABDOMEN',
  'Abdominal Oblíquo': 'ABDOMEN',
  Prancha: 'ABDOMEN',
  'Elevação de Pernas': 'ABDOMEN',
  Esteira: 'CARDIO',
  Bicicleta: 'CARDIO',
  Elíptico: 'CARDIO',
  Escada: 'CARDIO',
};

export default function AdminExerciciosPage() {
  return (
    <AuthProvider>
      <AdminExerciciosContent />
    </AuthProvider>
  );
}

function AdminExerciciosContent() {
  const router = useRouter();
  const { accessToken, loading: authLoading, user, isAdminAllowed } = useAuth();
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LibraryCategory>('TODOS');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredExercicios = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return exercicios.filter((exercicio) => {
      const category = resolveLibraryCategory(exercicio);
      const matchesCategory = selectedCategory === 'TODOS' || category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        exercicio.nome.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [exercicios, search, selectedCategory]);

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

    void loadExercicios();
  }, [accessToken, isAdminAllowed]);

  async function loadExercicios() {
    if (!accessToken) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getExercicios(accessToken);
      setExercicios(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Não foi possível carregar os exercícios.',
      );
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setSelectedExercicio(null);
    setFormError(null);
    setModalMode('create');
  }

  function openEditModal(exercicio: Exercicio) {
    setSelectedExercicio(exercicio);
    setFormError(null);
    setModalMode('edit');
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModalMode(null);
    setSelectedExercicio(null);
    setFormError(null);
  }

  async function handleSubmit(payload: CreateExercicioPayload | UpdateExercicioPayload) {
    if (!accessToken) {
      setFormError('Sua sessão expirou. Faça login novamente.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (modalMode === 'create') {
        await createExercicio(accessToken, payload as CreateExercicioPayload);
      }

      if (modalMode === 'edit' && selectedExercicio) {
        await updateExercicio(
          accessToken,
          selectedExercicio.id,
          payload as UpdateExercicioPayload,
        );
      }

      closeModal();
      await loadExercicios();
    } catch (submitError) {
      setFormError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível salvar o exercício.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleInactivate(exercicio: Exercicio) {
    if (!accessToken) {
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja inativar ${exercicio.nome}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await deleteExercicio(accessToken, exercicio.id);
      await loadExercicios();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Não foi possível inativar o exercício.',
      );
    }
  }

  if (authLoading || !user || !isAdminAllowed) {
    return (
      <main className="admin-loading">
        <div className="loading-orb" />
        <span>Carregando biblioteca...</span>
      </main>
    );
  }

  return (
    <AdminShell>
      <section className="page-toolbar">
        <div>
          <p className="eyebrow">Biblioteca profissional</p>
          <h2>Exercícios</h2>
          <span>
            {filteredExercicios.length} de {exercicios.length} exercício
            {exercicios.length === 1 ? '' : 's'} ativo
            {exercicios.length === 1 ? '' : 's'}
          </span>
        </div>
        <button className="primary-button" type="button" onClick={openCreateModal}>
          + Novo exercício
        </button>
      </section>

      <section className="library-controls">
        <label className="exercise-search">
          Buscar por nome
          <input
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Digite o nome do exercício"
            value={search}
          />
        </label>

        <div className="filter-tabs" aria-label="Filtros por grupo muscular">
          {filterOptions.map((option) => (
            <button
              className={selectedCategory === option.value ? 'filter-tab filter-tab-active' : 'filter-tab'}
              key={option.value}
              onClick={() => setSelectedCategory(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="table-card">
        {error ? (
          <div className="table-state table-state-error">
            <strong>Erro ao carregar</strong>
            <p>{error}</p>
            <button className="ghost-button" type="button" onClick={loadExercicios}>
              Tentar novamente
            </button>
          </div>
        ) : loading ? (
          <div className="table-state">
            <div className="loading-orb" />
            <span>Carregando biblioteca de exercícios...</span>
          </div>
        ) : filteredExercicios.length === 0 ? (
          <div className="table-state">
            <strong>Nenhum exercício encontrado</strong>
            <p>Ajuste os filtros ou cadastre um novo exercício para a biblioteca.</p>
            <button className="primary-button" type="button" onClick={openCreateModal}>
              + Novo exercício
            </button>
          </div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Grupo Muscular</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercicios.map((exercicio) => (
                  <tr key={exercicio.id}>
                    <td>
                      <strong>{exercicio.nome}</strong>
                    </td>
                    <td>{categoryLabels[resolveLibraryCategory(exercicio)]}</td>
                    <td>
                      <span className="status-pill">
                        {exercicio.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" onClick={() => openEditModal(exercicio)}>
                          Editar
                        </button>
                        <button
                          className="danger-action"
                          type="button"
                          onClick={() => void handleInactivate(exercicio)}
                        >
                          Inativar
                        </button>
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
        <ExercicioFormModal
          error={formError}
          exercicio={selectedExercicio}
          mode={modalMode}
          onClose={closeModal}
          onSubmit={handleSubmit}
          saving={saving}
        />
      ) : null}
    </AdminShell>
  );
}

function resolveLibraryCategory(exercicio: Exercicio): LibraryCategory {
  return categoryByExerciseName[exercicio.nome] ?? fallbackCategoryByGroup[exercicio.grupoMuscular];
}
