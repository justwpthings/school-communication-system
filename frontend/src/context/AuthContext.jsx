import { createContext, useEffect, useMemo, useState } from 'react';

import { authService } from '../services/authService';

export const AuthContext = createContext(null);

const getStoredAuth = () => {
  const token = localStorage.getItem('scs_token');
  const storedUser = localStorage.getItem('scs_user');

  return {
    token,
    user: storedUser ? JSON.parse(storedUser) : null
  };
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getStoredAuth);
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    setIsBooting(false);
  }, []);

  const setSession = ({ token, user }) => {
    localStorage.setItem('scs_token', token);
    localStorage.setItem('scs_user', JSON.stringify(user));
    setAuthState({ token, user });
  };

  const clearSession = () => {
    localStorage.removeItem('scs_token');
    localStorage.removeItem('scs_user');
    setAuthState({ token: null, user: null });
  };

  const login = async (payload) => {
    const data = await authService.login(payload);
    setSession(data);
    return data;
  };

  const signup = (payload) => authService.signup(payload);

  const value = useMemo(
    () => ({
      user: authState.user,
      token: authState.token,
      isAuthenticated: Boolean(authState.token && authState.user),
      isBooting,
      login,
      signup,
      logout: clearSession
    }),
    [authState.token, authState.user, isBooting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
