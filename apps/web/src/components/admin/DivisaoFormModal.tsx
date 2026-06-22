'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DivisaoTreino } from '../../types';

type Props = {
  divisao?: DivisaoTreino | null;
  nextOrder: number;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: { nome: string; ordem: number }) => Promise<void>;
};

export function DivisaoFormModal({ divisao, nextOrder, saving, error, onClose, onSubmit }: Props) {
  const [nome, setNome] = useState('');
  const [ordem, setOrdem] = useState(nextOrder);

  useEffect(() => {
    setNome(divisao?.nome ?? '');
    setOrdem(divisao?.ordem ?? nextOrder);
  }, [divisao, nextOrder]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({ nome: nome.trim(), ordem });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel modal-panel-compact" role="dialog">
        <div className="modal-header">
          <div><span>Estrutura da ficha</span><h2>{divisao ? 'Editar treino' : 'Adicionar treino'}</h2></div>
          <button disabled={saving} type="button" onClick={onClose}>Fechar</button>
        </div>
        <form className="student-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Nome do treino<input minLength={2} required value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Treino A - Peito e Tríceps" /></label>
            <label>Ordem<input min={1} required type="number" value={ordem} onChange={(event) => setOrdem(Number(event.target.value))} /></label>
          </div>
          {error ? <div className="form-error">{error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" disabled={saving} type="button" onClick={onClose}>Cancelar</button>
            <button className="primary-button" disabled={saving} type="submit">{saving ? 'Salvando...' : 'Salvar treino'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
