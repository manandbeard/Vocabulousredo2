import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('vocab_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem('vocab_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setUser(data);
    return data;
  };

  const signup = async (name, email, password, role) => {
    const data = await authApi.signup({ name, email, password, role });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('vocab_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
