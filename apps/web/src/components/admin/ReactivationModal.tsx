'use client';

import { FormEvent, useEffect, useState } from 'react';

type Props = {
  entity: 'Aluno' | 'Instrutor';
  record: {
    nome: string;
    username: string;
    email?: string | null;
    matricula?: string;
  };
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onReactivate: (senha: string) => Promise<void>;
};

export function ReactivationModal({ entity, record, saving, error, onClose, onReactivate }: Props) {
  const [step, setStep] = useState<'confirm' | 'password'>('confirm');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setStep('confirm');
    setSenha('');
    setConfirmacao('');
    setValidationError(null);
  }, [record.username]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 'confirm') {
      setStep('password');
      return;
    }

    if (senha.length < 6) {
      setValidationError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmacao) {
      setValidationError('As senhas informadas não são iguais.');
      return;
    }

    setValidationError(null);
    await onReactivate(senha);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel modal-panel-compact" role="dialog" aria-labelledby="reactivation-title">
        <div className="modal-header">
          <div>
            <span>Cadastro inativo</span>
            <h2 id="reactivation-title">
              {step === 'confirm' ? `${entity} encontrado como INATIVO` : `Nova senha do ${entity.toLowerCase()}`}
            </h2>
          </div>
          <button disabled={saving} type="button" onClick={onClose}>Fechar</button>
        </div>

        <form className="student-form" onSubmit={submit}>
          {step === 'confirm' ? (
            <div className="reactivation-summary">
              <p>Deseja reativar este cadastro mantendo todo o histórico existente?</p>
              <dl>
                <div><dt>Nome</dt><dd>{record.nome}</dd></div>
                <div><dt>Username</dt><dd>{record.username}</dd></div>
                <div><dt>Email</dt><dd>{record.email ?? 'Não informado'}</dd></div>
                {record.matricula ? <div><dt>Matrícula</dt><dd>{record.matricula}</dd></div> : null}
              </dl>
            </div>
          ) : (
            <div className="form-grid">
              <label>Nova senha<input minLength={6} required type="password" value={senha} onChange={(event) => setSenha(event.target.value)} /></label>
              <label>Confirmar senha<input minLength={6} required type="password" value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} /></label>
            </div>
          )}

          {validationError || error ? <div className="form-error">{validationError ?? error}</div> : null}
          <div className="modal-actions">
            <button className="ghost-button" disabled={saving} type="button" onClick={step === 'password' ? () => setStep('confirm') : onClose}>
              {step === 'password' ? 'Voltar' : 'Cancelar'}
            </button>
            <button className="primary-button" disabled={saving} type="submit">
              {saving ? 'Reativando...' : step === 'confirm' ? 'Reativar' : 'Confirmar reativação'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
