'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiHeart, FiUsers, FiShield, FiMessageCircle, FiActivity, FiStar } from 'react-icons/fi';
import { useState } from 'react';

export default function HomePage() {
  const [isLogoAnimating, setIsLogoAnimating] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Mobile-First Responsive Layout */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        
        {/* Left Side - Hero Section */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="max-w-lg text-center lg:text-left">
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
              className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto lg:mx-0 mb-6 lg:mb-8 shadow-2xl"
            >
              <motion.div
                animate={isLogoAnimating ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiHeart className="text-white text-3xl sm:text-4xl lg:text-6xl" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mb-8 lg:mb-12"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                CampusWell
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed mb-6">
                Your Safe Space for Mental Wellness
              </p>
              <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-md mx-auto lg:mx-0">
                Connect with peers, share experiences, and access mental health resources in a supportive university community.
              </p>
            </motion.div>

            {/* Feature Highlights - Hidden on mobile, shown on larger screens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="hidden lg:grid grid-cols-2 gap-4 text-sm"
            >
              <div className="flex items-center space-x-2 text-gray-300">
                <FiShield className="text-blue-400" />
                <span>Anonymous Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <FiUsers className="text-green-400" />
                <span>Peer Community</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <FiActivity className="text-purple-400" />
                <span>Wellness Activities</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <FiMessageCircle className="text-yellow-400" />
                <span>24/7 Resources</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Auth Section */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-black/20 backdrop-blur-sm lg:bg-transparent">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="max-w-md w-full"
          >
            <div className="mb-8 lg:mb-12 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 lg:mb-6">
                Start Your
                <span className="block text-transparent bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text">
                  Wellness Journey
                </span>
              </h2>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 text-gray-300">
                Join our community today.
              </h3>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Link
                href="/signup"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 block text-center shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Account
              </Link>

              <div className="flex items-center my-6">
                <div className="flex-1 border-t border-gray-600"></div>
                <span className="px-4 text-gray-400 text-sm font-medium">or</span>
                <div className="flex-1 border-t border-gray-600"></div>
              </div>

              <div className="space-y-4">
                <p className="text-base sm:text-lg font-semibold text-gray-300 text-center lg:text-left">
                  Already part of our community?
                </p>
                <Link
                  href="/login"
                  className="w-full border-2 border-gray-600 text-white py-4 sm:py-5 px-6 sm:px-8 rounded-2xl font-bold text-base sm:text-lg hover:bg-white hover:text-black hover:border-white transition-all duration-300 block text-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Mobile Feature Highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.8 }}
              className="lg:hidden mt-8 grid grid-cols-2 gap-3 text-xs sm:text-sm"
            >
              <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 p-3 rounded-xl">
                <FiShield className="text-blue-400 flex-shrink-0" />
                <span>Safe & Anonymous</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 p-3 rounded-xl">
                <FiUsers className="text-green-400 flex-shrink-0" />
                <span>Peer Support</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 p-3 rounded-xl">
                <FiActivity className="text-purple-400 flex-shrink-0" />
                <span>Wellness Tools</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 bg-gray-800/50 p-3 rounded-xl">
                <FiStar className="text-yellow-400 flex-shrink-0" />
                <span>24/7 Access</span>
              </div>
            </motion.div>

            <div className="text-xs sm:text-sm text-gray-500 mt-8 text-center lg:text-left">
              <p>
                By joining, you agree to our{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
