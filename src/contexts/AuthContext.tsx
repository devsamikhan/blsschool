import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { loginUser as apiLoginUser } from '../lib/api';
import { dispatchCustomEvent, EVENTS } from '../lib/events';
import { Cookies } from '../lib/CookieManager';
import { AuthContext } from './AuthContext/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResumedSession, setIsResumedSession] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // Dual-layer check: LocalStorage or Cookies
      const storedUser = localStorage.getItem('bls_user') || Cookies.get('bls_user');
      const storedSession = localStorage.getItem('bls_session') || Cookies.get('bls_session');
      
      if (storedUser && storedSession) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && parsed.id) {
            // Restore user immediately
            setUser(parsed);
            setIsResumedSession(true);
            
            // Sync both layers if one was missing
            if (!localStorage.getItem('bls_user')) localStorage.setItem('bls_user', storedUser!);
            if (!Cookies.get('bls_user')) Cookies.set('bls_user', storedUser!);
            
            // Background Integrity Check: Fetch latest state and verify session
            const res = await fetch(`${API_BASE}/users/${parsed.id}`);
            if (res.ok) {
              const latestUser = await res.json();
              if (latestUser && latestUser.status === 'active') {
                setUser(latestUser);
                const userStr = JSON.stringify(latestUser);
                localStorage.setItem('bls_user', userStr);
                Cookies.set('bls_user', userStr, 30); // 30 days persistence for active users
              } else {
                // User disabled or not found
                logout();
              }
            }
          }
        } catch (e) {
          console.error('Session Integrity Corrupted', e);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();

    const handleUserChange = () => {};
    window.addEventListener(EVENTS.USER_CHANGE, handleUserChange);
    return () => window.removeEventListener(EVENTS.USER_CHANGE, handleUserChange);
  }, []);

  const login = async (schoolId: string, password: string) => {
    const loggedInUser = await apiLoginUser(schoolId, password);
    setUser(loggedInUser);
    const userStr = JSON.stringify(loggedInUser);
    localStorage.setItem('bls_user', userStr);
    Cookies.set('bls_user', userStr, 7); // Default 7 days
    
    // Generate session token
    const sessionToken = btoa(`${loggedInUser.id}-${Date.now()}`);
    localStorage.setItem('bls_session', sessionToken);
    Cookies.set('bls_session', sessionToken, 7);
    
    dispatchCustomEvent(EVENTS.USER_CHANGE);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bls_user');
    localStorage.removeItem('bls_session');
    Cookies.remove('bls_user');
    Cookies.remove('bls_session');
    dispatchCustomEvent(EVENTS.USER_CHANGE);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading, isResumedSession }}>
      {children}
    </AuthContext.Provider>
  );
}



