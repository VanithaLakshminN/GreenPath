import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { signIn, signUp, getSession, clearSession, type SessionUser } from '../services/localAuth';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  email?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function sessionToAuthUser(s: SessionUser): AuthUser {
  return {
    id: s.id,
    username: s.username,
    fullName: s.username,
    profilePicture: '',
    email: s.email,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(sessionToAuthUser(session));
    setLoading(false);
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    const session = await signIn(email, password);
    setUser(sessionToAuthUser(session));
  };

  const signupWithEmail = async (email: string, password: string, username: string) => {
    const session = await signUp(email, password, username);
    setUser(sessionToAuthUser(session));
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithEmail, signupWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
