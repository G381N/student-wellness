'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiEdit2, 
  FiSettings, 
  FiLogOut,
  FiPlus,
  FiFlag,
  FiTrendingUp,
  FiUsers,
  FiChevronRight,
  FiX,
  FiMenu
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCreatePost: () => void;
}

const whatsHappeningData = [
  {
    category: 'Campus Life',
    title: 'Mental Health Awareness Week',
    posts: '2.4K posts',
    trending: true
  },
  {
    category: 'Academic',
    title: 'Final Exams Preparation',
    posts: '1.8K posts',
    trending: true
  },
  {
    category: 'Wellness',
    title: 'Meditation Sessions',
    posts: '892 posts',
    trending: false
  },
  {
    category: 'Social',
    title: 'Campus Events',
    posts: '1.2K posts',
    trending: false
  }
];

export default function RightSidebar({ isCollapsed, onToggle, onCreatePost }: RightSidebarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    closed: {
      x: isMobile ? 320 : 280,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? "closed" : "open"}
        className="fixed right-0 top-0 h-full w-80 bg-black border-l border-gray-800 z-50 flex flex-col overflow-y-auto"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Dashboard</h2>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiX className="text-white text-xl" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-6">
          {/* Profile Section */}
          {user && (
            <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <FiUser className="text-gray-300 text-xl" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {user.displayName || user.email?.split('@')[0]}
                  </h3>
                  <p className="text-gray-400 text-sm truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiEdit2 className="text-gray-400" />
                    <span className="text-white">Edit Profile</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={() => router.push('/settings')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiSettings className="text-gray-400" />
                    <span className="text-white">Settings</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </button>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FiLogOut className="text-gray-400" />
                    <span className="text-white">Sign Out</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={onCreatePost}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiPlus className="text-white" />
                  <span className="text-white font-medium">Create Post</span>
                </div>
              </button>
              
              <button
                onClick={() => router.push('/dashboard/complaints')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <FiFlag className="text-gray-400" />
                  <span className="text-white">Report Issue</span>
                </div>
                <FiChevronRight className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* What's Happening */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">What's happening</h3>
            <div className="space-y-3">
              {whatsHappeningData.map((item, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-gray-400 text-sm">{item.category}</p>
                        {item.trending && (
                          <FiTrendingUp className="text-blue-500 text-sm" />
                        )}
                      </div>
                      <h4 className="font-medium text-white mt-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{item.posts}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 p-3 text-blue-500 hover:bg-gray-800 rounded-lg transition-colors">
              Show more
            </button>
          </div>

          {/* Community Stats */}
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiUsers className="text-blue-500" />
                  <span className="text-white">Active Users</span>
                </div>
                <span className="text-gray-400">1.2K</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiTrendingUp className="text-green-500" />
                  <span className="text-white">Posts Today</span>
                </div>
                <span className="text-gray-400">89</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiFlag className="text-yellow-500" />
                  <span className="text-white">Resolved Issues</span>
                </div>
                <span className="text-gray-400">24</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button for Desktop */}
      <button
        onClick={onToggle}
        className={`fixed top-4 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all duration-200 ${
          isCollapsed ? 'right-4' : 'right-[336px]'
        }`}
      >
        <FiMenu className="text-white text-xl" />
      </button>
    </>
  );
} 