import React, { createContext, useContext } from 'react';
import { User } from '../../types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (schoolId: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isResumedSession: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
