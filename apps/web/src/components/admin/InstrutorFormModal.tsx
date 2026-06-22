'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CreateInstrutorPayload,
  Instrutor,
  UpdateInstrutorPayload,
} from '../../types';

type InstrutorFormModalProps = {
  mode: 'create' | 'edit';
  instrutor?: Instrutor | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateInstrutorPayload | UpdateInstrutorPayload) => Promise<void>;
};

export function InstrutorFormModal({
  mode,
  instrutor,
  saving,
  error,
  onClose,
  onSubmit,
}: InstrutorFormModalProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cref, setCref] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === 'create' ? 'Novo instrutor' : 'Editar instrutor'),
    [mode],
  );

  useEffect(() => {
    setNome(instrutor?.usuario.nome ?? '');
    setEmail(instrutor?.usuario.email ?? '');
    setSenha('');
    setCref(instrutor?.cref ?? '');
    setEspecialidade(instrutor?.especialidade ?? '');
    setAtivo(instrutor?.ativo ?? true);
    setValidationError(null);
  }, [instrutor, mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (nome.trim().length < 2) {
      setValidationError('Informe o nome do instrutor.');
      return;
    }

    if (!email.trim()) {
      setValidationError('Informe o email do instrutor.');
      return;
    }

    if (cref.trim() && cref.trim().length < 1) {
      setValidationError('Informe um CREF valido.');
      return;
    }

    if (especialidade.trim() && especialidade.trim().length < 2) {
      setValidationError('Informe uma especialidade valida.');
      return;
    }

    if (mode === 'create') {
      if (senha.trim().length < 6) {
        setValidationError('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }

      setValidationError(null);
      await onSubmit({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        cref: cref.trim() || undefined,
        especialidade: especialidade.trim() || undefined,
      });
      return;
    }

    setValidationError(null);
    await onSubmit({
      nome: nome.trim(),
      email: email.trim(),
      cref: cref.trim() || undefined,
      especialidade: especialidade.trim() || undefined,
      ativo,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-labelledby="instrutor-form-title" role="dialog">
        <div className="modal-header">
          <div>
            <span>Instrutores</span>
            <h2 id="instrutor-form-title">{title}</h2>
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
                placeholder="Instrutor Teste"
                required
                value={nome}
              />
            </label>

            <label>
              Email
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="instrutor@fitgestao.com"
                required
                type="email"
                value={email}
              />
            </label>

            {mode === 'create' ? (
              <label>
                Senha
                <input
                  minLength={6}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="123456"
                  required
                  type="password"
                  value={senha}
                />
              </label>
            ) : null}

            <label>
              CREF
              <input
                onChange={(event) => setCref(event.target.value)}
                placeholder="123456-G/CE"
                value={cref}
              />
            </label>

            <label>
              Especialidade
              <input
                onChange={(event) => setEspecialidade(event.target.value)}
                placeholder="Musculacao e hipertrofia"
                value={especialidade}
              />
            </label>

            {mode === 'edit' ? (
              <label className="checkbox-field">
                <input
                  checked={ativo}
                  onChange={(event) => setAtivo(event.target.checked)}
                  type="checkbox"
                />
                Instrutor ativo
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
                  ? 'Cadastrar instrutor'
                  : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
