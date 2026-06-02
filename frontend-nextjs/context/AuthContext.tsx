"use client";

import { createContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, AuthResponse, User } from '../types/auth';
import { clearAuth, loadAuth, saveAuth } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initialAuth = loadAuth();
    if (initialAuth) {
      setUser(initialAuth.user);
      setToken(initialAuth.token);
    }
    setIsLoading(false);
  }, []);

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
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
