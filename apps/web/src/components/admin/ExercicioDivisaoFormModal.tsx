'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Exercicio, ExercicioDivisao } from '../../types';

type Props = {
  exercicios: Exercicio[];
  exercicioDivisao?: ExercicioDivisao | null;
  nextOrder: number;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: {
    exercicioId?: string;
    series: number;
    repeticoes: string;
    descansoSegundos?: number;
    observacao?: string;
    ordem: number;
  }) => Promise<void>;
};

export function ExercicioDivisaoFormModal(props: Props) {
  const [exercicioId, setExercicioId] = useState('');
  const [series, setSeries] = useState(3);
  const [repeticoes, setRepeticoes] = useState('12');
  const [descanso, setDescanso] = useState('60');
  const [observacao, setObservacao] = useState('');
  const [ordem, setOrdem] = useState(props.nextOrder);

  useEffect(() => {
    setExercicioId(props.exercicioDivisao?.exercicioId ?? props.exercicios[0]?.id ?? '');
    setSeries(props.exercicioDivisao?.series ?? 3);
    setRepeticoes(props.exercicioDivisao?.repeticoes ?? '12');
    setDescanso(String(props.exercicioDivisao?.descansoSegundos ?? 60));
    setObservacao(props.exercicioDivisao?.observacao ?? '');
    setOrdem(props.exercicioDivisao?.ordem ?? props.nextOrder);
  }, [props.exercicioDivisao, props.exercicios, props.nextOrder]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await props.onSubmit({
      exercicioId: props.exercicioDivisao ? undefined : exercicioId,
      series,
      repeticoes: repeticoes.trim(),
      descansoSegundos: descanso === '' ? undefined : Number(descanso),
      observacao: observacao.trim() || undefined,
      ordem,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" role="dialog">
        <div className="modal-header">
          <div><span>Exercícios do treino</span><h2>{props.exercicioDivisao ? 'Editar exercício' : 'Adicionar exercício'}</h2></div>
          <button disabled={props.saving} type="button" onClick={props.onClose}>Fechar</button>
        </div>
        <form className="student-form" onSubmit={submit}>
          <div className="form-grid">
            {!props.exercicioDivisao ? (
              <label>Exercício<select required value={exercicioId} onChange={(event) => setExercicioId(event.target.value)}>{props.exercicios.map((item) => <option key={item.id} value={item.id}>{item.nome} · {item.grupoMuscular}</option>)}</select></label>
            ) : null}
            <label>Séries<input min={1} required type="number" value={series} onChange={(event) => setSeries(Number(event.target.value))} /></label>
            <label>Repetições<input required value={repeticoes} onChange={(event) => setRepeticoes(event.target.value)} /></label>
            <label>Descanso (segundos)<input min={0} type="number" value={descanso} onChange={(event) => setDescanso(event.target.value)} /></label>
            <label>Ordem<input min={1} required type="number" value={ordem} onChange={(event) => setOrdem(Number(event.target.value))} /></label>
            <label className="form-field-wide">Observação<textarea value={observacao} onChange={(event) => setObservacao(event.target.value)} /></label>
          </div>
          {props.error ? <div className="form-error">{props.error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" disabled={props.saving} type="button" onClick={props.onClose}>Cancelar</button>
            <button className="primary-button" disabled={props.saving} type="submit">{props.saving ? 'Salvando...' : 'Salvar exercício'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
