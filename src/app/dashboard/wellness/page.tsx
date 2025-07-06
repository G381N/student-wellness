'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiSun, FiMoon, FiActivity, FiBookOpen, FiMusic } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import GuidedBreathing from '@/components/GuidedBreathing';

export default function WellnessPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('breathing');

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
          <p className="text-white text-lg">Loading wellness center...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wellnessTools = [
    {
      id: 'breathing',
      title: 'Guided Breathing',
      icon: FiHeart,
      description: 'Calm your mind with breathing exercises',
      color: 'blue',
      component: <GuidedBreathing />
    },
    {
      id: 'meditation',
      title: 'Meditation',
      icon: FiSun,
      description: 'Find inner peace with meditation',
      color: 'yellow',
      component: (
        <div className="text-center py-16">
          <FiSun className="text-yellow-500 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Meditation Center</h3>
          <p className="text-gray-400 mb-6">Coming soon - guided meditation sessions</p>
        </div>
      )
    },
    {
      id: 'sleep',
      title: 'Sleep Wellness',
      icon: FiMoon,
      description: 'Improve your sleep quality',
      color: 'purple',
      component: (
        <div className="text-center py-16">
          <FiMoon className="text-purple-500 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Sleep Wellness</h3>
          <p className="text-gray-400 mb-6">Coming soon - sleep tracking and tips</p>
        </div>
      )
    },
    {
      id: 'fitness',
      title: 'Fitness Tracker',
      icon: FiActivity,
      description: 'Track your physical wellness',
      color: 'green',
      component: (
        <div className="text-center py-16">
          <FiActivity className="text-green-500 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Fitness Tracker</h3>
          <p className="text-gray-400 mb-6">Coming soon - activity tracking and goals</p>
        </div>
      )
    },
    {
      id: 'journal',
      title: 'Mood Journal',
      icon: FiBookOpen,
      description: 'Track your emotional wellbeing',
      color: 'indigo',
      component: (
        <div className="text-center py-16">
          <FiBookOpen className="text-indigo-500 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Mood Journal</h3>
          <p className="text-gray-400 mb-6">Coming soon - daily mood tracking</p>
        </div>
      )
    },
    {
      id: 'music',
      title: 'Relaxing Music',
      icon: FiMusic,
      description: 'Soothing sounds for relaxation',
      color: 'pink',
      component: (
        <div className="text-center py-16">
          <FiMusic className="text-pink-500 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Relaxing Music</h3>
          <p className="text-gray-400 mb-6">Coming soon - curated relaxation playlists</p>
        </div>
      )
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      green: 'text-green-500 bg-green-500/10 border-green-500/20',
      indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      pink: 'text-pink-500 bg-pink-500/10 border-pink-500/20'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const activeTabData = wellnessTools.find(tool => tool.id === activeTab);

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
            <FiHeart className="text-pink-500 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Wellness Center
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Your personal space for mental and physical wellbeing
          </p>
        </motion.div>
      </div>

      {/* Wellness Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
      >
        {wellnessTools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                isActive
                  ? getColorClasses(tool.color)
                  : 'bg-gray-900 border-gray-700 hover:border-gray-600'
              }`}
            >
              <Icon className={`text-2xl mx-auto mb-2 ${
                isActive ? '' : 'text-gray-400'
              }`} />
              <h3 className={`font-semibold text-sm ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}>
                {tool.title}
              </h3>
            </button>
          );
        })}
      </motion.div>

      {/* Active Tool Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        {activeTabData?.component}
      </motion.div>

      {/* Wellness Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-8 bg-gray-900 rounded-2xl p-6 border border-gray-700"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Daily Wellness Tips</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Take regular breaks from screens to rest your eyes</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Practice deep breathing for 5 minutes daily</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Stay hydrated throughout the day</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-300">Get adequate sleep (7-9 hours) for better mental health</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 