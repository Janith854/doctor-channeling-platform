import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const responseBody = res.data;
    const authData = responseBody?.data || responseBody;

    const accessToken = authData?.accessToken;
    const refreshToken = authData?.refreshToken;
    const userData = authData?.user;

    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }

    return userData || authData;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    return res.data?.data || res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore logout API errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await userApi.getCurrentUser();
      const userData = res.data?.data || res.data;
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
      return userData;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = !!user;

  const hasRole = useCallback(
    (roleName) => {
      if (!user?.role) return false;
      const name = user.role.name || user.role;
      return name === roleName || name === `ROLE_${roleName}`;
    },
    [user]
  );

  const getRolePath = useCallback(() => {
    if (!user?.role) return '/login';
    const name = user.role.name || user.role;
    if (name === 'ROLE_ADMIN') return '/admin';
    if (name === 'ROLE_DOCTOR') return '/doctor';
    return '/patient';
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    hasRole,
    getRolePath,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
