import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'TECHNICIAN' | 'USER' | 'SUPERVISOR' | 'AUDITOR';
  department?: {
    id: string;
    name: string;
    code: string;
  };
  branch?: {
    id: string;
    name: string;
    code: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
  canViewAllTickets: () => boolean;
  canManageUsers: () => boolean;
  canManageConfig: () => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: string;
  departmentId?: string;
  branchId?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar token del localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verificar token y obtener información del usuario
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await authService.getMe(tokenToVerify);
      setUser(response);
      setToken(tokenToVerify);
    } catch (error) {
      // Token inválido, limpiar
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
    } catch (error: any) {
      console.error('[Login Error]', error);
      console.error('[Login Error Response]', error.response);
      const errorMessage = error.response?.data?.error || 
                           error.response?.data?.details || 
                           error.message || 
                           'Error al iniciar sesión';
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Debe estar autenticado para registrar usuarios');
      }
      await authService.register(data, token);
      // Después de registrar, no cambiamos el usuario actual
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al registrar usuario');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canViewAllTickets = (): boolean => {
    return hasRole(['ADMIN', 'AUDITOR']);
  };

  const canManageUsers = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const canManageConfig = (): boolean => {
    return hasRole(['ADMIN']);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
    hasRole,
    canViewAllTickets,
    canManageUsers,
    canManageConfig,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

