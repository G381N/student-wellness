'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiWind, FiPlay, FiPause, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GuidedBreathing from '@/components/GuidedBreathing';

export default function BreathingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading breathing exercises...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiWind className="text-blue-500 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Breathing Exercises
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Find calm and focus through guided breathing
          </p>
        </motion.div>
      </div>

      {/* Breathing Exercise Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8"
      >
        <GuidedBreathing />
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-700 mb-8"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Benefits of Breathing Exercises</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="text-white font-medium">Reduces Stress</h4>
              <p className="text-gray-400 text-sm">Deep breathing activates your body's relaxation response</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="text-white font-medium">Improves Focus</h4>
              <p className="text-gray-400 text-sm">Mindful breathing enhances concentration and mental clarity</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="text-white font-medium">Better Sleep</h4>
              <p className="text-gray-400 text-sm">Regular practice can improve sleep quality and duration</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <div>
              <h4 className="text-white font-medium">Emotional Balance</h4>
              <p className="text-gray-400 text-sm">Helps regulate emotions and reduce anxiety</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Tips for Better Practice</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">1</span>
            </div>
            <p className="text-gray-300">Find a quiet, comfortable space where you won't be disturbed</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">2</span>
            </div>
            <p className="text-gray-300">Sit or lie down in a comfortable position with your spine straight</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">3</span>
            </div>
            <p className="text-gray-300">Focus on your breath and let other thoughts pass without judgment</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">4</span>
            </div>
            <p className="text-gray-300">Practice regularly, even if just for a few minutes each day</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">5</span>
            </div>
            <p className="text-gray-300">Be patient with yourself - breathing exercises take time to master</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 