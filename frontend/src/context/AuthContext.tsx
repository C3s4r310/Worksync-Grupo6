import { createContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthContextType, AuthResponse, User } from '../types/auth';
import { clearAuth, loadAuth, saveAuth } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuth = loadAuth();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(initialAuth?.user ?? null);
  const [token, setToken] = useState<string | null>(initialAuth?.token ?? null);

  const login = (auth: AuthResponse) => {
    setUser(auth.user);
    setToken(auth.token);
    saveAuth(auth);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuth();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
