'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkUserRole } from '@/lib/firebase-utils';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isModerator: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  isModerator: false,
  logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const { isAdmin: admin, isModerator: moderator } = await checkUserRole(user.uid);
        setIsAdmin(admin);
        setIsModerator(moderator);
      } else {
        setIsAdmin(false);
        setIsModerator(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, isModerator, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 