'use client';

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiHeart, FiArrowLeft, FiCheck, FiX, FiAlertCircle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  const extractNameFromEmail = (email: string) => {
    const emailPrefix = email.split('@')[0];
    const nameParts = emailPrefix.split('.');
    
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1).toLowerCase(),
        lastName: nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1).toLowerCase()
      };
    }
    
    return { firstName: '', lastName: '' };
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
      general: ''
    };
    
    // Email validation
    if (!formData.email.endsWith('christuniversity.in')) {
      newErrors.email = 'Please use your Christ University email address';
    } else {
      const emailParts = formData.email.split('@');
      if (emailParts.length !== 2) {
        newErrors.email = 'Invalid email format';
      } else {
        const localPart = emailParts[0];
        if (!localPart.includes('.')) {
          newErrors.email = 'Email must be in format: firstname.lastname@course.christuniversity.in';
        }
      }
    }
    
    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    // Validate names match email
    if (formData.email && formData.firstName && formData.lastName) {
      const extractedNames = extractNameFromEmail(formData.email);
      if (extractedNames.firstName.toLowerCase() !== formData.firstName.toLowerCase() ||
          extractedNames.lastName.toLowerCase() !== formData.lastName.toLowerCase()) {
        newErrors.email = 'Email and name do not match. Please use firstname.lastname@course.christuniversity.in';
      }
    }
    
    // Password validation
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  const saveUserToFirestore = async (userId: string, userData: any) => {
    try {
      // Ensure photoURL is never undefined (convert to null if needed)
      const sanitizedUserData = {
        ...userData,
        photoURL: userData.photoURL || null
      };
      
      await setDoc(doc(db, 'users', userId), {
        ...sanitizedUserData,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: 'user',
        verified: false
      });
    } catch (error) {
      console.error('Error saving user to Firestore:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      // Check if user already exists
      const signInMethods = await fetchSignInMethodsForEmail(auth, formData.email);
      if (signInMethods.length > 0) {
        setGeneralError('An account with this email already exists. Please sign in instead.');
        setLoading(false);
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      // Save additional user data to Firestore
      await saveUserToFirestore(user.uid, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        role: 'student',
        createdAt: new Date().toISOString(),
        isActive: true
      });
      
      console.log('✅ Account created successfully');
      window.location.href = '/dashboard'; // Force page refresh after signup
    } catch (error: unknown) {
      console.error('Signup error:', error);
      
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/email-already-in-use':
          setGeneralError('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/weak-password':
          setErrors(prev => ({ ...prev, password: 'Password is too weak. Please choose a stronger password.' }));
          break;
        case 'auth/invalid-email':
          setErrors(prev => ({ ...prev, email: 'Invalid email address format.' }));
          break;
        case 'auth/network-request-failed':
          setGeneralError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setGeneralError('Account creation failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setGeneralError('');
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      if (!user.email?.endsWith('christuniversity.in')) {
        await auth.signOut();
        setGeneralError('Please use your Christ University email address (@christuniversity.in)');
        return;
      }
      
      // Extract name from email or use display name
      const displayName = user.displayName || extractNameFromEmail(user.email);
      const nameString = typeof displayName === 'string' ? displayName : `${displayName.firstName} ${displayName.lastName}`;
      const [firstName, ...lastNameParts] = nameString.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      // Save user data to Firestore
      await saveUserToFirestore(user.uid, {
        email: user.email,
        firstName,
        lastName,
        displayName: nameString,
        role: 'student',
        createdAt: new Date().toISOString(),
        isActive: true,
        photoURL: user.photoURL
      });
      
      console.log('✅ Google sign-up successful');
      window.location.href = '/dashboard'; // Force page refresh after signup
    } catch (error: unknown) {
      console.error('Google sign-up error:', error);
      
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        setGeneralError('An account with this email already exists with a different sign-in method. Please use the original sign-in method.');
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        setGeneralError('Sign-up was cancelled. Please try again.');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setGeneralError('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setGeneralError('Network error. Please check your internet connection and try again.');
      } else {
        setGeneralError('Google sign-up failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill names when email changes
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
    if (email.endsWith('christuniversity.in')) {
      const extractedNames = extractNameFromEmail(email);
      if (extractedNames.firstName && extractedNames.lastName) {
        setFormData(prev => ({
          ...prev,
          email,
          firstName: extractedNames.firstName,
          lastName: extractedNames.lastName
        }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-white hover:text-gray-300 mb-4 sm:mb-6 transition-colors text-sm"
          >
            <FiArrowLeft className="mr-2 w-4 h-4" />
            Back to Home
          </Link>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
            className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg"
          >
            <FiHeart className="text-black text-lg sm:text-2xl" />
          </motion.div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join CampusWell</h1>
          <p className="text-gray-400 text-sm sm:text-base">Create your account to get started</p>
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-800"
        >
          {/* Google Sign-up Button */}
          <motion.button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-lg bg-gray-900/50 backdrop-blur-sm text-white hover:bg-gray-800/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs sm:text-sm"
          >
            <FcGoogle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Sign up with Google
          </motion.button>

          <div className="relative my-4 sm:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* General Error */}
            {generalError && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-900 border border-red-700 text-red-300 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm"
              >
                {generalError}
              </motion.div>
            )}

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 sm:py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-xs sm:text-sm ${
                  errors.firstName 
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                    : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="mt-1 sm:mt-1.5 text-xs text-red-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleInputChange}
                className={`block w-full px-3 py-2 sm:py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-xs sm:text-sm ${
                  errors.lastName 
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                    : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="mt-1 sm:mt-1.5 text-xs text-red-400">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleEmailChange}
                className={`block w-full px-3 py-2 sm:py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-xs sm:text-sm ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                    : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20'
                }`}
                placeholder="your.email@christuniversity.in"
              />
              {errors.email && (
                <p className="mt-1 sm:mt-1.5 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full px-3 pr-8 sm:pr-10 py-2 sm:py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-xs sm:text-sm ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                      : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20'
                  }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 sm:mt-1.5 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full px-3 pr-8 sm:pr-10 py-2 sm:py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-xs sm:text-sm ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                      : 'border-gray-700 hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-400/20'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 sm:mt-1.5 text-xs text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-lg shadow-lg text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </motion.button>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400">
                Already have an account?{' '}
                <a 
                  href="/login" 
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
                >
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
} 