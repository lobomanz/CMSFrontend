import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from './useAuth';

interface AuthContextType {
  token: string | null;
  user: any | null; // UserDto from types.ts
  login: (token: string, user: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, login, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // This effect can be used to react to auth state changes, e.g., redirect on logout
    if (!token && isAuthenticated()) {
      // If token becomes null but isAuthenticated returns true (meaning it was true before), it's a logout
      // This is a bit redundant with the axios interceptor, but good for explicit handling
      navigate('/login');
    }
  }, [token, isAuthenticated, navigate]);

  // Provide a logout function that also navigates
  const contextLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout: contextLogout, isAuthenticated: isAuthenticated() }}>
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
