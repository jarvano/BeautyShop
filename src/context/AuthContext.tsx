import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default users
const defaultUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@beautyshop.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'employee1',
    password: 'emp123',
    role: 'employee',
    name: 'Sarah Johnson',
    email: 'sarah@beautyshop.com',
    createdAt: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize default users if not exists
    const existingUsers = localStorage.getItem('beautyShopUsers');
    if (!existingUsers) {
      localStorage.setItem('beautyShopUsers', JSON.stringify(defaultUsers));
    }

    // Check for existing session
    const savedUser = localStorage.getItem('beautyShopCurrentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('beautyShopUsers') || '[]');
    const foundUser = users.find((u: User) => u.username === username && u.password === password);
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem('beautyShopCurrentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('beautyShopCurrentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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