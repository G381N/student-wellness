'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { User, Department, startActivityCleanup, stopActivityCleanup, checkDepartmentHeadStatus } from '@/lib/firebase-utils';

interface AuthContextType {
  user: FirebaseUser | null;
  userInfo: any | null;
  loading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isDepartmentHead: boolean;
  department?: Department;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  const [department, setDepartment] = useState<Department | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        setUserInfo(userDoc.exists() ? { uid: user.uid, ...userDoc.data() } : null);

        // Check roles
        const adminDocRef = doc(db, 'admins', user.uid);
        const moderatorDocRef = doc(db, 'moderators', user.uid);
        
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());

        const moderatorDoc = await getDoc(moderatorDocRef);
        setIsModerator(moderatorDoc.exists());
        
        // Check if user is a department head
        if (user.email) {
            const departmentsQuery = query(collection(db, "departments"), where("headEmail", "==", user.email));
            const querySnapshot = await getDocs(departmentsQuery);
            if (!querySnapshot.empty) {
                setIsDepartmentHead(true);
                const deptDoc = querySnapshot.docs[0];
                setDepartment({ id: deptDoc.id, ...deptDoc.data() } as Department);
            } else {
                setIsDepartmentHead(false);
                setDepartment(undefined);
            }
        }

      } else {
        setUserInfo(null);
        setIsAdmin(false);
        setIsModerator(false);
        setIsDepartmentHead(false);
        setDepartment(undefined);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await firebaseSignOut(auth);
  };
  
  const refreshUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        // Re-run the logic from onAuthStateChanged
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        setUserInfo(userDoc.exists() ? { uid: currentUser.uid, ...userDoc.data() } : null);

        const adminDocRef = doc(db, 'admins', currentUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());

        const moderatorDocRef = doc(db, 'moderators', currentUser.uid);
        const moderatorDoc = await getDoc(moderatorDocRef);
        setIsModerator(moderatorDoc.exists());
        
        if (currentUser.email) {
            const departmentsQuery = query(collection(db, "departments"), where("headEmail", "==", currentUser.email));
            const querySnapshot = await getDocs(departmentsQuery);
            if (!querySnapshot.empty) {
                setIsDepartmentHead(true);
                const deptDoc = querySnapshot.docs[0];
                setDepartment({ id: deptDoc.id, ...deptDoc.data() } as Department);
            } else {
                setIsDepartmentHead(false);
                setDepartment(undefined);
            }
        }
    }
  }

  const value = {
    user,
    userInfo,
    isAdmin,
    isModerator,
    isDepartmentHead,
    department,
    loading,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 