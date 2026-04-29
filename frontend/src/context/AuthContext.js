import React, { createContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';

export const AuthContext = createContext();

// Helper functions for sessionStorage
const getStorageItem = (key) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const setStorageItem = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const removeStorageItem = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initAuth = () => {
      const token = sessionStorage.getItem('token');
      const userData = getStorageItem('user');
      
      if (token && userData) {
        setUser(userData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback((userData, token) => {
    sessionStorage.setItem('token', token);
    setStorageItem('user', userData);
    setUser(userData);
    toast.success(`Welcome back, ${userData.name}!`);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    removeStorageItem('user');
    setUser(null);
    toast.info('You have been logged out');
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setStorageItem('user', newUser);
    setUser(newUser);
  }, [user]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated,
        isAdmin,
        isManager,
        isEmployee,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
