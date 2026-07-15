import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setAuthToken } from '@/lib/api';
import { AUTH_TOKEN_KEY } from '@/constants';
import type { AuthSession, AuthStatus, AuthUser } from '@/types/auth';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_TOKEN_KEY);
      if (stored) {
        const session: AuthSession = JSON.parse(stored) as AuthSession;
        setToken(session.accessToken);
        setUser(session.user);
        setAuthToken(session.accessToken);
        setStatus('authenticated');
      } else {
        setStatus('anonymous');
      }
    } catch {
      setStatus('anonymous');
    }
  }, []);

  const signIn = useCallback((session: AuthSession) => {
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(session));
    setToken(session.accessToken);
    setUser(session.user);
    setAuthToken(session.accessToken);
    setStatus('authenticated');
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({ status, user, token, signIn, signOut }),
    [status, user, token, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
