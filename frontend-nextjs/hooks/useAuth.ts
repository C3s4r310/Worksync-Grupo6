import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AuthContextType } from '../types/auth';

export default function useAuth() {
  const context = useContext(AuthContext) as AuthContextType | undefined;
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
