import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/backend.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    return api.onSessionChanged(setUser);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    login: async (email, password) => {
      const nextUser = await api.loginUser(email, password);
      setUser(nextUser);
      return nextUser;
    },
    register: async (payload) => {
      const nextUser = await api.registerClient(payload);
      setUser(nextUser);
      return nextUser;
    },
    logout: async () => {
      await api.logoutUser();
      setUser(null);
    }
  }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
