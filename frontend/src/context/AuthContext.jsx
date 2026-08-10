import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { clearStoredToken, getStoredToken, setStoredToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => clearStoredToken())
      .finally(() => setInitializing(false));
  }, []);

  const login = useCallback(async (email, password, options = {}) => {
    const { remember = true, adminOnly = false } = options;
    const { data } = await api.post('/auth/login', { email, password });
    if (adminOnly && !data.user?.is_admin) {
      clearStoredToken();
      setUser(null);
      throw new Error('This account is not authorized for admin access.');
    }
    setStoredToken(data.token, remember);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setStoredToken(data.token, true);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* token already invalid */
    }
    clearStoredToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, setUser, initializing, login, register, logout, refreshUser }),
    [user, initializing, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
