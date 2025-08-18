'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { User, startActivityCleanup, stopActivityCleanup, checkDepartmentHeadStatus } from '@/lib/firebase-utils';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  userRole: string;
  userDepartment: string | null;
  isAdmin: boolean;
  isModerator: boolean;
  isDepartmentHead: boolean;
  signOut: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  userRole: 'user',
  userDepartment: null,
  isAdmin: false,
  isModerator: false,
  isDepartmentHead: false,
  signOut: async () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      // First, reload the Firebase Auth user to get latest profile data
      await user.reload();
      
      // Get the refreshed user from auth
      const refreshedUser = auth.currentUser;
      if (refreshedUser) {
        setUser(refreshedUser);
      }
      
      // Then update Firestore data
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data() as User;
        setUserData(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            // User exists - update their data with latest info from Firebase Auth
            const existingUserData = userSnap.data() as User;
            
            // Check if user is department head
            let isDeptHead = false;
            let departmentInfo = null;
            if (firebaseUser.email) {
              const deptHeadCheck = await checkDepartmentHeadStatus(firebaseUser.email);
              isDeptHead = deptHeadCheck.isDepartmentHead;
              departmentInfo = deptHeadCheck.department;
            }
            
            // Prepare updated data
            const updatedData = {
              ...existingUserData,
              uid: firebaseUser.uid,
              email: firebaseUser.email || existingUserData.email,
              displayName: firebaseUser.displayName || existingUserData.displayName,
              photoURL: firebaseUser.photoURL || existingUserData.photoURL,
              lastLogin: serverTimestamp(),
              // Update role, but preserve admin/moderator status
              role: (existingUserData.role === 'admin' || existingUserData.role === 'moderator') 
                ? existingUserData.role 
                : (isDeptHead ? 'department_head' : (existingUserData.role || 'user')),
              department: departmentInfo?.id || existingUserData.department
            };
            
            // Only update if there are actual changes
            const hasChanges = 
              existingUserData.email !== updatedData.email ||
              existingUserData.displayName !== updatedData.displayName ||
              existingUserData.photoURL !== updatedData.photoURL ||
              existingUserData.role !== updatedData.role ||
              existingUserData.department !== updatedData.department;
            
            if (hasChanges) {
              await updateDoc(userRef, updatedData);
              console.log('✅ User data updated with latest auth info');
            } else {
              // Just update last login
              await updateDoc(userRef, { lastLogin: serverTimestamp() });
            }
            
            setUserData(updatedData as User);
          } else {
            // New user - create user document
            const email = firebaseUser.email || '';
            const displayName = firebaseUser.displayName || email.split('@')[0] || 'Anonymous';
            
            // Check if user is department head
            let isDeptHead = false;
            let departmentInfo = null;
            if (email) {
              const deptHeadCheck = await checkDepartmentHeadStatus(email);
              isDeptHead = deptHeadCheck.isDepartmentHead;
              departmentInfo = deptHeadCheck.department;
            }
            
            // Try to extract first and last name from display name or email
            let firstName = '', lastName = '';
            
            if (displayName && displayName.includes(' ')) {
              // If display name has a space, use it to split into first and last name
              const nameParts = displayName.split(' ');
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(' ');
            } else if (email && email.includes('.') && email.includes('@')) {
              // Try to extract from email if it's in the format firstname.lastname@domain
              const localPart = email.split('@')[0];
              if (localPart.includes('.')) {
                const nameParts = localPart.split('.');
                firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
                lastName = nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1);
              } else {
                firstName = displayName;
                lastName = '';
              }
            } else {
              firstName = displayName;
              lastName = '';
            }
            
            const newUserData: User = {
              uid: firebaseUser.uid,
              email,
              displayName,
              firstName,
              lastName,
              photoURL: firebaseUser.photoURL || undefined,
              role: isDeptHead ? 'department_head' : 'user', // Set role based on department head status
              department: departmentInfo?.id || undefined,
              createdAt: serverTimestamp()
            };
            
            // Save user data to Firestore
            await setDoc(userRef, {
              ...newUserData,
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });
            
            console.log('✅ New user created in Firestore');
            setUserData(newUserData);
          }
        } catch (error) {
          console.error('Error handling user authentication:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Start activity cleanup service when the provider mounts
  useEffect(() => {
    startActivityCleanup();
    
    // Note: stopActivityCleanup doesn't need to be called as startActivityCleanup() 
    // handles cleanup automatically and returns void
    return () => {
      // No cleanup needed as the function manages its own intervals
    };
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const userRole = userData?.role || 'user';
  const userDepartment = userData?.department || null;
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || userRole === 'admin';
  const isDepartmentHead = userRole === 'department_head';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading, 
      userRole, 
      userDepartment,
      isAdmin, 
      isModerator, 
      isDepartmentHead,
      signOut,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 