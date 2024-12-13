import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../lib/logger';

interface User {
  id: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  register: async () => false,
  logout: async () => false
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        logger.info('User session restored', { userId: parsedUser.id });
      } catch (err) {
        logger.error('Failed to parse stored user', err);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (users.some((u: User) => u.email === email)) {
        throw new Error('Email already exists');
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        createdAt: new Date().toISOString()
      };

      // Save user with password
      users.push({ ...newUser, password });
      localStorage.setItem('users', JSON.stringify(users));

      // Save user without password for session
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Initialize user-specific collections
      localStorage.setItem(`rooms_${newUser.id}`, JSON.stringify([]));
      localStorage.setItem(`staff_${newUser.id}`, JSON.stringify([]));
      localStorage.setItem(`assignments_${newUser.id}`, JSON.stringify([]));
      
      // Initialize onboarding progress
      localStorage.setItem('onboardingProgress', JSON.stringify({
        step: 'registration',
        completed: false,
        timestamp: new Date().toISOString(),
        completedSteps: {}
      }));

      setUser(newUser);
      logger.success('User registered successfully', { userId: newUser.id });
      
      // Navigate to dashboard after registration
      navigate('/', { replace: true });
      
      return true;
    } catch (err: any) {
      setError(err.message);
      logger.error('Registration failed', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Store user without password
      const { password: _, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      
      logger.success('User logged in successfully', { userId: user.id });

      // Navigate to dashboard after login
      navigate('/', { replace: true });

      return true;
    } catch (err: any) {
      setError(err.message);
      logger.error('Login failed', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      localStorage.removeItem('user');
      setUser(null);
      logger.info('User logged out');
      navigate('/signin', { replace: true });
      return true;
    } catch (err: any) {
      setError(err.message);
      logger.error('Logout failed', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};