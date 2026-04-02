import { useState, useEffect, useCallback } from 'react';
import { authService } from '../lib/authService.js';

/**
 * Hook to manage authentication state
 * Provides: user, token, isLoading, error, login, logout, register
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = authService.getUser();
        const storedToken = authService.getToken();

        if (storedToken && storedUser) {
          // Verify token is still valid
          const verified = await authService.verifyToken();
          if (verified) {
            setUser(storedUser);
            setToken(storedToken);
          } else {
            // Token expired or invalid
            authService.logout();
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.login(username, password);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const register = useCallback(async (username, password, role, entityId) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.register(username, password, role, entityId);
      setUser(data.user);
      setToken(data.token);
      return data;
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    register,
  };
}
