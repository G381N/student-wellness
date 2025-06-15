import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUserDisplayInfo } from '@/lib/firebase-utils';

interface UserInfo {
  displayName: string;
  realName: string;
  email: string;
  photoURL?: string;
}

const userCache = new Map<string, UserInfo>();

export const useUserInfo = (userId: string) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    if (userCache.has(userId)) {
      setUserInfo(userCache.get(userId)!);
      setLoading(false);
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const { displayName, realName } = getUserDisplayInfo(userData);
          
          const info: UserInfo = {
            displayName,
            realName,
            email: userData.email || '',
            photoURL: userData.photoURL
          };
          
          // Cache the result
          userCache.set(userId, info);
          setUserInfo(info);
        } else {
          // Fallback for users not in Firestore
          const fallbackInfo: UserInfo = {
            displayName: 'Unknown User',
            realName: '',
            email: ''
          };
          userCache.set(userId, fallbackInfo);
          setUserInfo(fallbackInfo);
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        const errorInfo: UserInfo = {
          displayName: 'Unknown User',
          realName: '',
          email: ''
        };
        setUserInfo(errorInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  return { userInfo, loading };
};

// Utility function to clear cache when user updates profile
export const clearUserCache = (userId?: string) => {
  if (userId) {
    userCache.delete(userId);
  } else {
    userCache.clear();
  }
}; 