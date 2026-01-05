import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

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

const AUTH_TOKEN_KEY = 'auth_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session (JWT token) and validate it with the backend.
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    const validate = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setUser(null);
          return;
        }

        const userData = await response.json();
        setUser({
          id: String(userData.id),
          username: userData.username,
          email: userData.email,
          role: userData.role,
          permissions: userData.permissions
        });
      } catch (error) {
        console.error('Session validation failed:', error);
        // Keep token; user may be offline. They will be forced to login on API errors.
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (!data?.token || !data?.user) {
        return false;
      }

      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      setUser({
        id: String(data.user.id),
        username: data.user.username,
        email: data.user.email,
        role: data.user.role,
        permissions: data.user.permissions
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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