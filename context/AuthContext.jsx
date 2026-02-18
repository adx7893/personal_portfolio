import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  changePasswordApi,
  fetchProfileApi,
  getAuthToken,
  loginApi,
  logoutApi,
  setAuthToken,
  signupApi,
  updateProfileApi,
} from '../services/authApi';

const AuthContext = createContext(null);
const AUTH_USER_KEY = 'auth-user';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getAuthToken());
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(Boolean(getAuthToken()));

  // Keep users authenticated as long as a token exists.
  // User profile fetch can fail transiently; that should not force a local logout.
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    fetchProfileApi(token)
      .then((profile) => {
        if (active) {
          setUser(profile);
          setStoredUser(profile);
        }
      })
      .catch((error) => {
        if (active) {
          // Only clear session on explicit auth failures.
          if (error?.status === 401 || error?.status === 403) {
            setToken('');
            setAuthToken('');
            setUser(null);
            setStoredUser(null);
          }
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const signup = async (input) => {
    const data = await signupApi(input);
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);
    setStoredUser(data.user);
    return data;
  };

  const login = async (input) => {
    const data = await loginApi(input);
    setToken(data.token);
    setAuthToken(data.token);
    setUser(data.user);
    setStoredUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // no-op: local logout still proceeds
    }
    setToken('');
    setAuthToken('');
    setUser(null);
    setStoredUser(null);
  };

  const refreshProfile = async () => {
    if (!token) return null;
    const data = await fetchProfileApi(token);
    setUser(data);
    setStoredUser(data);
    return data;
  };

  const updateProfile = async (updates) => {
    const data = await updateProfileApi(token, updates);
    setUser(data);
    setStoredUser(data);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    return changePasswordApi(token, currentPassword, newPassword);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      isAuthenticated,
      signup,
      login,
      logout,
      refreshProfile,
      updateProfile,
      changePassword,
    }),
    [token, user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export { AuthProvider, useAuth };
