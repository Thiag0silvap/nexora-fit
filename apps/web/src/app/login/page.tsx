'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { canAccessAdmin } from '../../services/api';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  );
}

function LoginContent() {
  const router = useRouter();
  const { login, user, loading, isAdminAllowed } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedProfile, setBlockedProfile] = useState(false);

  useEffect(() => {
    if (!loading && user?.role === 'INSTRUTOR') {
      router.replace('/admin/fichas');
      return;
    }

    if (!loading && user && isAdminAllowed) {
      router.replace('/admin');
    }
  }, [isAdminAllowed, loading, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setBlockedProfile(false);

    try {
      const authUser = await login(email, senha);

      if (authUser.role === 'INSTRUTOR') {
        router.replace('/admin/fichas');
        return;
      }

      if (!canAccessAdmin(authUser.role)) {
        setBlockedProfile(true);
        return;
      }

      router.replace('/admin');
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Nao foi possivel acessar o painel.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-hero" aria-labelledby="login-title">
        <div className="login-brand">
          <div className="brand-mark">NF</div>
          <span>Nexora Fit</span>
        </div>
        <p className="eyebrow">Painel administrativo</p>
        <h1 id="login-title">Sua evolução, todos os dias.</h1>
        <p className="login-copy">
          Acompanhe alunos, instrutores, fichas e avaliações em uma operação clara,
          rápida e pronta para crescer.
        </p>
      </section>

      <section className="login-card" aria-label="Login administrativo">
        <div className="login-card-header">
          <span>Acesso restrito</span>
          <h2>Entrar no painel</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@fitgestao.com"
              required
              type="email"
              value={email}
            />
          </label>

          <label>
            Senha
            <input
              autoComplete="current-password"
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Sua senha"
              required
              type="password"
              value={senha}
            />
          </label>

          {blockedProfile ? (
            <div className="form-warning">
              Este perfil não possui acesso ao painel administrativo.
            </div>
          ) : null}

          {error ? <div className="form-error">{error}</div> : null}

          <button disabled={submitting} type="submit">
            {submitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
