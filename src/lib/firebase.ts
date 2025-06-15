import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Check if Firebase is properly configured
const isFirebaseConfigured = firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'PASTE_YOUR_PROJECT_ID_HERE';

if (!isFirebaseConfigured) {
  console.warn('⚠️ Firebase not configured. Please set up your Firebase credentials in .env.local');
  console.log('📋 Follow the setup guide: https://console.firebase.google.com/');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db)
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firebase persistence could not be enabled: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Firebase persistence not supported in this browser');
      } else {
        console.error('Error enabling Firebase persistence:', err);
      }
    });
}

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app; 