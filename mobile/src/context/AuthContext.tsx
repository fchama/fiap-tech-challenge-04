import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as authService from '@/services/auth';
import { ApiError, setAuthToken, setUnauthorizedHandler } from '@/services/api';
import type { User } from '@/types';

const STORAGE_KEY = '@blog-escolar/session';

interface AuthContextValue {
  /** true enquanto a sessão salva é restaurada na abertura do app */
  loading: boolean;
  user: User | null;
  /** Existe sessão de professor/aluno ou visitante */
  hasSession: boolean;
  isGuest: boolean;
  isTeacher: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);

  const clearSession = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setIsGuest(false);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw) as { token: string; user: User };
        setAuthToken(saved.token);

        try {
          // Revalida o token e atualiza os dados do usuário.
          const fresh = await authService.fetchMe();
          if (active) setUser(fresh);
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await clearSession();
          } else if (active) {
            // Sem conexão: mantém a sessão salva.
            setUser(saved.user);
          }
        }
      } catch {
        await clearSession();
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [clearSession]);

  // Token expirado/inválido durante o uso: volta para o login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    setAuthToken(token);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedUser }));
    setIsGuest(false);
    setUser(loggedUser);
  }, []);

  const signInAsGuest = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setIsGuest(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      hasSession: user !== null || isGuest,
      isGuest,
      isTeacher: user?.role === 'teacher',
      signIn,
      signInAsGuest,
      signOut: clearSession,
    }),
    [loading, user, isGuest, signIn, signInAsGuest, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
