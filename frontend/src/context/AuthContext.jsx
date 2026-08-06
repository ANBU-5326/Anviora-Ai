import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { BASE_URL } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Safety timeout: Never stay stuck on loading screen for more than 2.5s
    const timeoutTimer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2500);

    const initAuth = async () => {
      try {
        const token = localStorage.getItem('anviora_token');
        if (token) {
          try {
            const fetchedUser = await authService.getCurrentUser();
            if (mounted) {
              setUser(fetchedUser);
              setConnectionError(false);
            }
          } catch (err) {
            const isNetwork = err.message && (
              err.message.includes('fetch') || 
              err.message.includes('NetworkError') || 
              err.message.includes('Failed to fetch') || 
              err.message.includes('Failed to connect') ||
              err.message.includes('Cannot reach backend')
            );
            if (isNetwork) {
              if (mounted) setConnectionError(true);
              const storedUser = localStorage.getItem('anviora_user');
              if (storedUser && mounted) {
                try { setUser(JSON.parse(storedUser)); } catch (e) {}
              }
            } else {
              localStorage.removeItem('anviora_token');
              localStorage.removeItem('anviora_user');
            }
          }
        } else {
          try {
            const controller = new AbortController();
            const signalTimer = setTimeout(() => controller.abort(), 1500);
            const res = await fetch(`${BASE_URL}/`, { signal: controller.signal });
            clearTimeout(signalTimer);
            if (mounted) setConnectionError(!res.ok);
          } catch (err) {
            if (mounted) setConnectionError(true);
          }
        }
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(timeoutTimer);
      }
    };

    initAuth();

    return () => {
      mounted = false;
      clearTimeout(timeoutTimer);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setConnectionError(false);
      return { success: true };
    } catch (err) {
      const isNetwork = err.message && (
        err.message.includes('fetch') || 
        err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError')
      );
      if (isNetwork) {
        setConnectionError(true);
        return { success: false, message: 'Cannot connect to backend server. Please verify backend is running.' };
      }
      return { success: false, message: err.message || 'Invalid credentials' };
    }
  };

  const googleLogin = async (email, name, avatar = null) => {
    try {
      const data = await authService.googleLogin(email, name, avatar);
      setUser(data.user);
      setConnectionError(false);
      return { success: true };
    } catch (err) {
      const isNetwork = err.message && (
        err.message.includes('fetch') || 
        err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError')
      );
      if (isNetwork) {
        setConnectionError(true);
        return { success: false, message: 'Cannot connect to backend server. Please verify backend is running.' };
      }
      return { success: false, message: err.message || 'Google Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setConnectionError(false);
      return { success: true };
    } catch (err) {
      const isNetwork = err.message && (
        err.message.includes('fetch') || 
        err.message.includes('Failed to fetch') || 
        err.message.includes('NetworkError')
      );
      if (isNetwork) {
        setConnectionError(true);
        return { success: false, message: 'Cannot connect to backend server. Please verify backend is running.' };
      }
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateUserProfile = async (updatedData) => {
    if (!user) return;
    try {
      const response = await userService.updateProfile(updatedData);
      setUser(response);
      localStorage.setItem('anviora_user', JSON.stringify(response));
      return { success: true };
    } catch (err) {
      // Fallback
      const updatedUser = { ...user, ...updatedData };
      setUser(updatedUser);
      localStorage.setItem('anviora_user', JSON.stringify(updatedUser));
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, connectionError, login, googleLogin, register, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

