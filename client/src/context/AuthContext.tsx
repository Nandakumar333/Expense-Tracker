import React, { createContext, useContext, useState } from 'react';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currency: string;
  theme: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
}

const dummyUser: UserProfile = {
  name: 'Admin User',
  email: 'admin@example.com',
  avatar: '',
  currency: 'USD',
  theme: 'light'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('token');
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    const storedProfile = localStorage.getItem('userProfile');
    return storedProfile ? JSON.parse(storedProfile) : null;
  });

  const login = (username: string, password: string) => {
    // Dummy authentication logic
    if (username === 'admin' && password === 'admin123') {
      const token = 'dummy-jwt-token';
      localStorage.setItem('token', token);
      localStorage.setItem('userProfile', JSON.stringify(dummyUser));
      setIsAuthenticated(true);
      setUserProfile(dummyUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    setIsAuthenticated(false);
    setUserProfile(null);
  };

  const register = (name: string, email: string, password: string) => {
    // Dummy registration logic
    const newUser: UserProfile = {
      name,
      email,
      avatar: '',
      currency: 'USD',
      theme: 'light'
    };

    const token = 'dummy-jwt-token';
    localStorage.setItem('token', token);
    localStorage.setItem('userProfile', JSON.stringify(newUser));
    setIsAuthenticated(true);
    setUserProfile(newUser);
    return true;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userProfile, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};