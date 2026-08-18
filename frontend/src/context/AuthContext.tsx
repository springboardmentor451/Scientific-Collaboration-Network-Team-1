import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';

interface AuthContextType {
  user: UserAccount | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('user_account');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return {
      id: 'usr-101',
      name: 'Dr. Alena Vass',
      email: 'a.vass@stanford.edu',
      role: 'Researcher',
      institution: 'Stanford University',
      orcid: '0000-0002-1823-9912',
      domain: 'Quantum Computing',
    };
  });

  const role = user?.role || 'Researcher';

  const login = (email: string, selectedRole: UserRole = 'Researcher') => {
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase() || 'Dr. Researcher',
      email,
      role: selectedRole,
      institution: 'Stanford University',
      orcid: '0000-0002-9988-1122',
      domain: 'Quantum Computing',
    };
    setUser(newUser);
    localStorage.setItem('user_account', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user_account');
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('user_account', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        login,
        logout,
        setRole,
      }}
    >
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
