'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CreateExercicioPayload,
  Exercicio,
  GrupoMuscular,
  UpdateExercicioPayload,
} from '../../types';

type ExercicioFormModalProps = {
  mode: 'create' | 'edit';
  exercicio?: Exercicio | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateExercicioPayload | UpdateExercicioPayload) => Promise<void>;
};

const grupoOptions: Array<{ value: GrupoMuscular; label: string }> = [
  { value: 'PEITO', label: 'Peito' },
  { value: 'COSTAS', label: 'Costas' },
  { value: 'OMBRO', label: 'Ombro' },
  { value: 'BICEPS', label: 'Bíceps' },
  { value: 'TRICEPS', label: 'Tríceps' },
  { value: 'PERNAS', label: 'Pernas' },
  { value: 'GLUTEOS', label: 'Glúteos' },
  { value: 'ABDOMEN', label: 'Abdômen' },
  { value: 'CARDIO', label: 'Cardio' },
];

export function ExercicioFormModal({
  mode,
  exercicio,
  saving,
  error,
  onClose,
  onSubmit,
}: ExercicioFormModalProps) {
  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState<GrupoMuscular>('PEITO');
  const [ativo, setAtivo] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === 'create' ? 'Novo exercício' : 'Editar exercício'),
    [mode],
  );

  useEffect(() => {
    setNome(exercicio?.nome ?? '');
    setGrupoMuscular(exercicio?.grupoMuscular ?? 'PEITO');
    setAtivo(exercicio?.ativo ?? true);
    setValidationError(null);
  }, [exercicio, mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (nome.trim().length < 2) {
      setValidationError('Informe o nome do exercício.');
      return;
    }

    setValidationError(null);

    if (mode === 'create') {
      await onSubmit({
        nome: nome.trim(),
        grupoMuscular,
      });
      return;
    }

    await onSubmit({
      nome: nome.trim(),
      grupoMuscular,
      ativo,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-labelledby="exercicio-form-title" role="dialog">
        <div className="modal-header">
          <div>
            <span>Biblioteca de exercícios</span>
            <h2 id="exercicio-form-title">{title}</h2>
          </div>
          <button disabled={saving} type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <form className="student-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Nome
              <input
                onChange={(event) => setNome(event.target.value)}
                placeholder="Supino Reto"
                required
                value={nome}
              />
            </label>

            <label>
              Grupo muscular
              <select
                onChange={(event) => setGrupoMuscular(event.target.value as GrupoMuscular)}
                required
                value={grupoMuscular}
              >
                {grupoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {mode === 'edit' ? (
              <label className="checkbox-field">
                <input
                  checked={ativo}
                  onChange={(event) => setAtivo(event.target.checked)}
                  type="checkbox"
                />
                Exercício ativo
              </label>
            ) : null}
          </div>

          {validationError || error ? (
            <div className="form-error">{validationError ?? error}</div>
          ) : null}

          <div className="modal-actions">
            <button className="ghost-button" disabled={saving} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="primary-button" disabled={saving} type="submit">
              {saving
                ? 'Salvando...'
                : mode === 'create'
                  ? 'Cadastrar exercício'
                  : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
