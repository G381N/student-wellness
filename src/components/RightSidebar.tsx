'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSettings, FiLogOut, FiChevronLeft, FiPlus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCreatePost?: () => void;
}

// Sample "What's happening" data
const whatsHappeningData = [
  { title: "Mental Health Awareness Week", category: "Events", time: "Next week" },
  { title: "New campus counseling services available", category: "Resources", time: "Today" },
  { title: "Stress management workshop", category: "Workshop", time: "Tomorrow" },
];

export default function RightSidebar({ isCollapsed, onToggle, onCreatePost }: RightSidebarProps) {
  const { user, signOut } = useAuth();
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

  // Don't render on mobile or when collapsed
  if (isMobile || isCollapsed) {
    return null;
  }

  return (
    <div
      className="h-full w-80 bg-gray-900 border-l border-gray-800 z-40 overflow-y-auto scrollbar-hide"
    >
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-800 relative">
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-gray-800 transition-colors bg-gray-800"
        >
          <FiChevronLeft className="text-gray-400" />
        </button>
        
        <h2 className="text-white font-semibold">Profile & Updates</h2>
      </div>
      
      {/* Profile Section */}
      <div className="p-6 border-b border-gray-800">
        {user ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-white text-2xl" />
            </div>
            <h3 className="text-white font-bold text-lg">
              {user.displayName || user.email?.split('@')[0]}
            </h3>
            <p className="text-gray-400 text-sm mb-4">{user.email}</p>
            
            <div className="grid grid-cols-3 gap-2 w-full">
              <button 
                className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                onClick={() => router.push('/profile')}
              >
                <FiUser className="text-blue-400 text-lg" />
                <span className="text-xs text-gray-300 mt-1">Profile</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                onClick={() => router.push('/settings')}
              >
                <FiSettings className="text-blue-400 text-lg" />
                <span className="text-xs text-gray-300 mt-1">Settings</span>
              </button>
              <button 
                className="flex flex-col items-center justify-center p-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
                onClick={() => signOut()}
              >
                <FiLogOut className="text-blue-400 text-lg" />
                <span className="text-xs text-gray-300 mt-1">Logout</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Link 
              href="/login"
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700 transition-colors mb-2"
            >
              Log In
            </Link>
            <Link 
              href="/signup"
              className="w-full py-2 bg-gray-800 text-white rounded-lg text-center font-medium hover:bg-gray-700 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {/* What's happening section */}
      <div className="p-6 border-b border-gray-800">
        <h3 className="text-white font-bold text-lg mb-4">What's happening</h3>
        <div className="space-y-4">
          {whatsHappeningData.map((item, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-3 hover:bg-gray-700 transition-colors cursor-pointer">
              <span className="text-xs text-gray-400">{item.category} · {item.time}</span>
              <p className="text-white text-sm font-medium mt-1">{item.title}</p>
            </div>
          ))}
        </div>
        <button className="text-blue-400 text-sm mt-4 hover:text-blue-300 transition-colors">
          Show more
        </button>
      </div>
      
      {/* Quick actions */}
      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-4">Quick actions</h3>
        <button
          onClick={onCreatePost}
          className="w-full py-3 bg-blue-600 text-white rounded-xl flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="text-lg" />
          <span>Create Post</span>
        </button>
      </div>
    </div>
  );
} 