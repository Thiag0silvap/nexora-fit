'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Aluno,
  CreateAlunoPayload,
  Sexo,
  TrainingGoal,
  UpdateAlunoPayload,
} from '../../types';

type AlunoFormModalProps = {
  mode: 'create' | 'edit';
  aluno?: Aluno | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateAlunoPayload | UpdateAlunoPayload) => Promise<void>;
};

const goals: Array<{ value: TrainingGoal; label: string }> = [
  { value: 'HIPERTROFIA', label: 'Hipertrofia' },
  { value: 'EMAGRECIMENTO', label: 'Emagrecimento' },
  { value: 'CONDICIONAMENTO', label: 'Condicionamento' },
];

const sexos: Array<{ value: Sexo; label: string }> = [
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'OUTRO', label: 'Outro' },
];

export function AlunoFormModal({
  mode,
  aluno,
  saving,
  error,
  onClose,
  onSubmit,
}: AlunoFormModalProps) {
  const [nome, setNome] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState('');
  const [altura, setAltura] = useState('');
  const [pesoAtual, setPesoAtual] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === 'create' ? 'Novo aluno' : 'Editar aluno'),
    [mode],
  );

  useEffect(() => {
    setNome(aluno?.usuario.nome ?? '');
    setUsername(aluno?.usuario.username ?? '');
    setEmail(aluno?.usuario.email ?? '');
    setSenha('');
    setDataNascimento('');
    setSexo('');
    setAltura(toInputNumber(aluno?.altura));
    setPesoAtual(toInputNumber(aluno?.pesoAtual));
    setObjetivo(aluno?.objetivo ?? '');
    setAtivo(aluno?.ativo ?? true);
    setValidationError(null);
  }, [aluno, mode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (nome.trim().length < 2) {
      setValidationError('Informe o nome do aluno.');
      return;
    }

    if (username.trim().length < 3) {
      setValidationError('Informe um username com pelo menos 3 caracteres.');
      return;
    }

    const normalizedAltura = normalizeOptionalNumber(altura);
    const normalizedPeso = normalizeOptionalNumber(pesoAtual);

    if (altura.trim() && normalizedAltura === undefined) {
      setValidationError('Informe uma altura valida.');
      return;
    }

    if (pesoAtual.trim() && normalizedPeso === undefined) {
      setValidationError('Informe um peso valido.');
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
        username: username.trim(),
        email: email.trim() || undefined,
        senha,
        dataNascimento: dataNascimento || undefined,
        sexo: (sexo || undefined) as Sexo | undefined,
        altura: normalizedAltura,
        pesoAtual: normalizedPeso,
        objetivo: (objetivo || undefined) as TrainingGoal | undefined,
      });
      return;
    }

    setValidationError(null);
    await onSubmit({
      nome: nome.trim(),
      username: username.trim(),
      email: email.trim() || null,
      altura: normalizedAltura,
      pesoAtual: normalizedPeso,
      objetivo: (objetivo || undefined) as TrainingGoal | undefined,
      ativo,
    });
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal-panel" aria-labelledby="aluno-form-title" role="dialog">
        <div className="modal-header">
          <div>
            <span>Alunos</span>
            <h2 id="aluno-form-title">{title}</h2>
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
                placeholder="Thiago Pereira"
                required
                value={nome}
              />
            </label>

            <label>
              Usuário
              <input
                autoCapitalize="none"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="thiago.pereira"
                required
                value={username}
              />
            </label>

            <label>
              E-mail opcional
              <input
                onChange={(event) => setEmail(event.target.value)}
                placeholder="thiago@e-mail.com"
                type="email"
                value={email}
              />
            </label>

            {mode === 'create' ? (
              <>
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

                <label>
                  Data de nascimento
                  <input
                    onChange={(event) => setDataNascimento(event.target.value)}
                    type="date"
                    value={dataNascimento}
                  />
                </label>

                <label>
                  Sexo
                  <select onChange={(event) => setSexo(event.target.value)} value={sexo}>
                    <option value="">Não informado</option>
                    {sexos.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : null}

            <label>
              Altura
              <input
                inputMode="decimal"
                onChange={(event) => setAltura(event.target.value)}
                placeholder="1.70"
                value={altura}
              />
            </label>

            <label>
              Peso atual
              <input
                inputMode="decimal"
                onChange={(event) => setPesoAtual(event.target.value)}
                placeholder="88.25"
                value={pesoAtual}
              />
            </label>

            <label>
              Objetivo
              <select onChange={(event) => setObjetivo(event.target.value)} value={objetivo}>
                <option value="">Não informado</option>
                {goals.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
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
                Aluno ativo
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
              {saving ? 'Salvando...' : mode === 'create' ? 'Cadastrar aluno' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function normalizeOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const normalized = Number(value.replace(',', '.'));
  return Number.isFinite(normalized) && normalized >= 0 ? normalized : undefined;
}

function toInputNumber(value?: string | number | null) {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  return String(value);
}
