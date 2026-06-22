'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Aluno, Instrutor } from '../../types';

type Props = {
  mode: 'create' | 'duplicate';
  alunos: Aluno[];
  instrutores: Instrutor[];
  initialName?: string;
  initialObservation?: string | null;
  fixedInstrutorId?: string;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    alunoId?: string;
    instrutorId?: string;
    nome: string;
    observacao?: string;
  }) => Promise<void>;
};

export function FichaFormModal(props: Props) {
  const [alunoId, setAlunoId] = useState('');
  const [instrutorId, setInstrutorId] = useState('');
  const [nome, setNome] = useState('');
  const [observacao, setObservacao] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setAlunoId(props.alunos[0]?.id ?? '');
    setInstrutorId(props.fixedInstrutorId ?? props.instrutores[0]?.id ?? '');
    setNome(props.initialName ?? '');
    setObservacao(props.initialObservation ?? '');
    setValidationError(null);
  }, [props.alunos, props.fixedInstrutorId, props.initialName, props.initialObservation, props.instrutores]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (nome.trim().length < 2) {
      setValidationError('Informe um nome válido para a ficha.');
      return;
    }

    if (props.mode === 'create' && (!alunoId || !instrutorId)) {
      setValidationError('Selecione o aluno e o instrutor.');
      return;
    }

    setValidationError(null);
    await props.onSubmit({
      alunoId: props.mode === 'create' ? alunoId : undefined,
      instrutorId: props.mode === 'create' ? instrutorId : undefined,
      nome: nome.trim(),
      observacao: observacao.trim() || undefined,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog" aria-labelledby="ficha-modal-title">
        <div className="modal-header">
          <div>
            <span>Fichas de treino</span>
            <h2 id="ficha-modal-title">
              {props.mode === 'create' ? 'Nova ficha' : 'Duplicar ficha'}
            </h2>
          </div>
          <button disabled={props.saving} type="button" onClick={props.onClose}>Fechar</button>
        </div>

        <form className="student-form" onSubmit={submit}>
          <div className="form-grid">
            {props.mode === 'create' ? (
              <>
                <label>
                  Aluno
                  <select value={alunoId} onChange={(event) => setAlunoId(event.target.value)} required>
                    {props.alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>{aluno.usuario.nome}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Instrutor
                  <select
                    disabled={Boolean(props.fixedInstrutorId)}
                    value={instrutorId}
                    onChange={(event) => setInstrutorId(event.target.value)}
                    required
                  >
                    {props.instrutores.map((instrutor) => (
                      <option key={instrutor.id} value={instrutor.id}>{instrutor.usuario.nome}</option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}
            <label>
              Nome da ficha
              <input value={nome} onChange={(event) => setNome(event.target.value)} required />
            </label>
            <label>
              Observação
              <textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} />
            </label>
          </div>
          {validationError || props.error ? <div className="form-error">{validationError ?? props.error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" disabled={props.saving} type="button" onClick={props.onClose}>Cancelar</button>
            <button className="primary-button" disabled={props.saving} type="submit">
              {props.saving ? 'Salvando...' : props.mode === 'create' ? 'Criar ficha' : 'Duplicar ficha'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
