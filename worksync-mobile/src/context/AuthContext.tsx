import { createContext, useMemo, useState, useEffect, type ReactNode } from 'react';
import type { AuthContextType, AuthResponse, User } from '../types/auth';
import { clearAuth, loadAuth, saveAuth } from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = (jwtToken: string): boolean => {
    try {
      const parts = jwtToken.split('.');
      if (parts.length < 2) return true;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      if (decoded && typeof decoded.exp === 'number') {
        return decoded.exp * 1000 < Date.now();
      }
      return false;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const initialAuth = loadAuth();
    if (initialAuth) {
      if (isTokenExpired(initialAuth.token)) {
        clearAuth();
        setUser(null);
        setToken(null);
      } else {
        setUser(initialAuth.user);
        setToken(initialAuth.token);
      }
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
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
