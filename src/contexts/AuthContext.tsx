import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateCredentials, getMockUserById } from '../utils/mockData';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const mockToken = localStorage.getItem('mock_auth_token');
    if (mockToken) {
      // Validate mock token (just check if user exists)
      const userData = getMockUserById(mockToken);
      if (userData) {
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions
        });
      } else {
        localStorage.removeItem('mock_auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userData = validateCredentials(username, password);
      if (userData) {
        // Store mock token (just the user ID)
        localStorage.setItem('mock_auth_token', userData.id);
        setUser({
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mock login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('mock_auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}