'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiHeart } from 'react-icons/fi';
import { useState } from 'react';

export default function HomePage() {
  const [isLogoAnimating, setIsLogoAnimating] = useState(true);

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Side - Logo and Branding */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 1.2, 
              type: "spring", 
              stiffness: 100,
              onComplete: () => setIsLogoAnimating(false)
            }}
            className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <motion.div
              animate={isLogoAnimating ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FiHeart className="text-black text-6xl" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-4">CampusWell</h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              Connect. Share. Support.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login/Signup */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="max-w-md w-full"
        >
          <div className="mb-12">
            <h2 className="text-6xl font-bold mb-6">Happening now</h2>
            <h3 className="text-3xl font-bold mb-8">Join today.</h3>
          </div>

          <div className="space-y-4">
            <Link
              href="/signup"
              className="w-full bg-white text-black py-4 px-8 rounded-full font-bold text-lg hover:bg-gray-200 transition-all duration-200 block text-center"
            >
              Create account
            </Link>

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-gray-500 text-sm">or</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            <div className="mb-6">
              <p className="text-lg font-bold mb-4">Already have an account?</p>
              <Link
                href="/login"
                className="w-full border border-gray-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:bg-gray-900 transition-all duration-200 block text-center"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-8">
            <p>
              By signing up, you agree to the{' '}
              <a href="#" className="text-white hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-white hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
