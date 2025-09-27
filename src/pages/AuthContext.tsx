import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getAuthInstance } from '../firebase';
import { User, signInWithCustomToken, signOut } from 'firebase/auth';

interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  profilePicture: string;
  email?: string;
  accessToken?: string;
  instagramId?: string; // Keep for backward compatibility
  facebookId?: string; // Add Facebook support
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (user: AuthUser, customToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuthInstance();

  useEffect(() => {
    // Skip Firebase auth if not configured
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged ? auth.onAuthStateChanged((firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (!firebaseUser) {
        setUser(null);
        localStorage.removeItem('instagramUser');
      }
      setLoading(false);
    }) : () => {
      setLoading(false);
    };

    // Check for stored user data
    const storedUser = localStorage.getItem('socialUser') || localStorage.getItem('instagramUser'); // Support both keys
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        // Migrate old storage key
        if (localStorage.getItem('instagramUser')) {
          localStorage.setItem('socialUser', storedUser);
          localStorage.removeItem('instagramUser');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('socialUser');
        localStorage.removeItem('instagramUser');
      }
    }

    return unsubscribe;
  }, [auth]);

  const login = async (userData: AuthUser, customToken?: string) => {
    try {
      if (customToken) {
        await signInWithCustomToken(auth, customToken);
      }
      setUser(userData);
      localStorage.setItem('socialUser', JSON.stringify(userData));
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Only try to sign out from Firebase if it's properly configured
      if (import.meta.env.VITE_FIREBASE_API_KEY && typeof auth.signOut === 'function') {
        await signOut(auth);
      }
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('socialUser');
      localStorage.removeItem('instagramUser'); // Clean up old key too
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if Firebase logout fails, clear local state
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('socialUser');
      localStorage.removeItem('instagramUser'); // Clean up old key too
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};