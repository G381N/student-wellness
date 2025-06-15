'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiArrowRight, FiShield, FiUsers, FiHeart } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.endsWith('christuniversity.in')) {
      newErrors.email = 'Please use your Christ University email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setGeneralError('');
    
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Login error:', error);
      
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setGeneralError('No account found with this email address. Please sign up first.');
          break;
        case 'auth/wrong-password':
          setErrors({ password: 'Incorrect password. Please try again.' });
          break;
        case 'auth/invalid-email':
          setErrors({ email: 'Invalid email address format.' });
          break;
        case 'auth/user-disabled':
          setGeneralError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setGeneralError('Too many failed login attempts. Please try again later or reset your password.');
          break;
        case 'auth/network-request-failed':
          setGeneralError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setGeneralError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
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
      
      console.log('✅ Google sign-in successful');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      
      const firebaseError = error as { code?: string; customData?: { email?: string } };
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        const email = firebaseError.customData?.email;
        if (email) {
          try {
            const signInMethods = await fetchSignInMethodsForEmail(auth, email);
            
            if (signInMethods.includes('password')) {
              setGeneralError(`An account with this email already exists. Please sign in with your password instead, or reset your password if you've forgotten it.`);
            } else {
              setGeneralError('This email is already associated with another sign-in method. Please use the original sign-in method.');
            }
          } catch (fetchError) {
            console.error('Error fetching sign-in methods:', fetchError);
            setGeneralError('An account with this email already exists with a different sign-in method.');
          }
        } else {
          setGeneralError('An account with this email already exists with a different sign-in method.');
        }
      } else if (firebaseError.code === 'auth/popup-closed-by-user') {
        setGeneralError('Sign-in was cancelled. Please try again.');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setGeneralError('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (firebaseError.code === 'auth/network-request-failed') {
        setGeneralError('Network error. Please check your internet connection and try again.');
      } else {
        setGeneralError('Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }
    
    if (!formData.email.endsWith('christuniversity.in')) {
      setErrors({ email: 'Please use your Christ University email address' });
      return;
    }
    
    setLoading(true);
    setGeneralError('');
    
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setResetEmailSent(true);
      setErrors({});
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      const firebaseError = error as { code?: string };
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setErrors({ email: 'No account found with this email address' });
          break;
        case 'auth/invalid-email':
          setErrors({ email: 'Invalid email address format' });
          break;
        case 'auth/network-request-failed':
          setGeneralError('Network error. Please check your internet connection and try again.');
          break;
        default:
          setGeneralError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-8">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                <span className="text-2xl font-bold text-black">CU</span>
              </div>
              <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
                Welcome to<br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Student Wellness
                </span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Connect with your campus community, share experiences, and prioritize your mental health journey.
              </p>
            </div>

            <div className="space-y-6">
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-blue-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FiUsers className="text-blue-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Community Connection</h3>
                  <p className="text-gray-400 text-sm">Join thousands of Christ University students</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-purple-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FiShield className="text-purple-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Safe & Anonymous</h3>
                  <p className="text-gray-400 text-sm">Share your thoughts without judgment</p>
                </div>
              </motion.div>

              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="w-12 h-12 bg-pink-600 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <FiHeart className="text-pink-400 text-xl" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Mental Wellness</h3>
                  <p className="text-gray-400 text-sm">Access resources and support when you need it</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-md w-full space-y-8"
          >
            {/* Mobile Header */}
            <div className="text-center lg:hidden">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-2xl font-bold text-black">CU</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
              <p className="text-gray-400">Sign in to your Christ University account</p>
            </div>

            {/* Desktop Header */}
            <div className="text-center hidden lg:block">
              <h2 className="text-3xl font-bold text-white mb-2">Sign in to your account</h2>
              <p className="text-gray-400">Enter your credentials to access the platform</p>
            </div>

            {/* Success/Error Messages */}
            <AnimatePresence>
              {resetEmailSent && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiCheckCircle className="text-green-400 text-sm" />
                    </div>
                    <div>
                      <p className="text-green-400 font-medium text-sm">Password reset email sent!</p>
                      <p className="text-green-300 text-xs mt-1">Check your inbox and follow the instructions to reset your password.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {generalError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiAlertCircle className="text-red-400 text-sm" />
                    </div>
                    <p className="text-red-400 text-sm">{generalError}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'email' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <FiMail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                        : focusedField === 'email'
                        ? 'border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="your.email@christuniversity.in"
                  />
                  <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 ${
                    focusedField === 'email' ? 'ring-1 ring-blue-400/20' : ''
                  }`}></div>
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1.5 text-xs text-red-400 flex items-center"
                    >
                      <FiAlertCircle className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 ${
                    focusedField === 'password' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    <FiLock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg bg-gray-900/50 backdrop-blur-sm text-white placeholder-gray-400 focus:outline-none transition-all duration-200 text-sm ${
                      errors.password 
                        ? 'border-red-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20' 
                        : focusedField === 'password'
                        ? 'border-blue-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-800/50 rounded-r-lg transition-colors duration-200"
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FiEye className="h-4 w-4 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                  <div className={`absolute inset-0 rounded-lg pointer-events-none transition-all duration-200 ${
                    focusedField === 'password' ? 'ring-1 ring-blue-400/20' : ''
                  }`}></div>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-1.5 text-xs text-red-400 flex items-center"
                    >
                      <FiAlertCircle className="mr-1.5 h-3 w-3 flex-shrink-0" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                  disabled={loading}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  <>
                    Sign In
                    <FiArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-black text-gray-400 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In Button */}
              <motion.button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-700 rounded-lg shadow-lg bg-gray-900/50 backdrop-blur-sm text-white hover:bg-gray-800/50 hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm"
              >
                <FcGoogle className="h-4 w-4 mr-2" />
                Sign in with Google
              </motion.button>

              {/* Sign Up Link */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">
                  Don&apos;t have an account?{' '}
                  <a 
                    href="/signup" 
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium hover:underline"
                  >
                    Sign up here
                  </a>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
} 