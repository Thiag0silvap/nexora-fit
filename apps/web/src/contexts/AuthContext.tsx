'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  canAccessAdmin,
  getMe,
  login as loginRequest,
} from '../services/api';
import { AuthUser } from '../types';

type AuthContextValue = {
  accessToken: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<AuthUser>;
  logout: () => void;
  isAdminAllowed: boolean;
};

const ACCESS_TOKEN_KEY = 'fitgestao:web:accessToken';
const USER_KEY = 'fitgestao:web:user';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((token: string, authUser: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(authUser));
    setAccessToken(token);
    setUser(authUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedToken || !storedUser) {
      setLoading(false);
      return;
    }

    try {
      const persistedUser = JSON.parse(storedUser) as AuthUser;
      setAccessToken(storedToken);
      setUser(persistedUser);

      void getMe(storedToken)
        .then((freshUser) =>
          persistSession(storedToken, {
            ...freshUser,
            instrutorId: freshUser.instrutorId ?? persistedUser.instrutorId,
          }),
        )
        .catch(clearSession)
        .finally(() => setLoading(false));
    } catch {
      clearSession();
      setLoading(false);
    }
  }, [clearSession, persistSession]);

  const login = useCallback(
    async (email: string, senha: string) => {
      const response = await loginRequest(email, senha);
      persistSession(response.accessToken, response.user);
      return response.user;
    },
    [persistSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      user,
      loading,
      login,
      logout: clearSession,
      isAdminAllowed: canAccessAdmin(user?.role),
    }),
    [accessToken, clearSession, loading, login, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}
