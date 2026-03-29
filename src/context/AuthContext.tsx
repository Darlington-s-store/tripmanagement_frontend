import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ mfaRequired: boolean; email?: string; user?: User }>;
  adminLogin: (email: string, password: string) => Promise<{ mfaRequired: boolean; email?: string; user?: User }>;
  verifyMFA: (email: string, code: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (fullName?: string, phone?: string, bio?: string, avatarUrl?: string) => Promise<void>;
  toggleMFA: (enabled: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const profile = await authService.getProfile();
          setUser(profile);
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
        authService.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData, mfaRequired } = await authService.login(email, password);
      if (!mfaRequired && userData) {
        setUser(userData);
      }
      return { mfaRequired: !!mfaRequired, email, user: userData };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: userData, mfaRequired } = await authService.adminLogin(email, password);
      if (!mfaRequired && userData) {
        setUser(userData);
      }
      return { mfaRequired: !!mfaRequired, email, user: userData };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (email: string, code: string) => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.verifyMFA(email, code);
      if (userData) {
        setUser(userData);
      }
      return userData!;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { user: userData, token } = await authService.register(email, password, fullName, phone);
      authService.setToken(token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.clearToken();
    setUser(null);
  };

  const updateProfile = async (fullName?: string, phone?: string, bio?: string, avatarUrl?: string) => {
    try {
      const updatedUser = await authService.updateProfile(fullName, phone, bio, avatarUrl);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const toggleMFA = async (enabled: boolean) => {
    try {
      await authService.toggleMFA(enabled);
      // Update user in context
      if (user) {
        setUser({ ...user, two_factor_enabled: enabled });
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    adminLogin,
    verifyMFA,
    register,
    logout,
    updateProfile,
    toggleMFA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
