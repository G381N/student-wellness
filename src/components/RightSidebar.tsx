'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSettings, FiLogOut, FiChevronLeft, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WhatsHappening from './WhatsHappening';
import ThemeToggle from './ThemeToggle';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCreatePost?: () => void;
}

export default function RightSidebar({ isCollapsed, onToggle, onCreatePost }: RightSidebarProps) {
  const { user, signOut, isAdmin, isModerator, isDepartmentHead } = useAuth();
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

  // Get user role text
  const getUserRole = () => {
    if (isAdmin) return 'Administrator';
    if (isModerator) return 'Moderator';
    if (isDepartmentHead) return 'Department Head';
    return 'Student';
  };

  // Don't render on mobile or when collapsed
  if (isMobile || isCollapsed) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-80 bg-bg-secondary border-l border-border-primary z-40 overflow-y-auto scrollbar-hide"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-border-primary">
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-hover-bg transition-colors bg-bg-tertiary"
        >
          <FiChevronLeft className="text-text-secondary" />
        </button>
        <h2 className="text-text-primary font-semibold">Profile & Updates</h2>
      </div>
      
      {/* Profile Section */}
      <div className="p-6 border-b border-border-primary">
        {user ? (
          <div className="flex flex-col items-center">
            {/* Profile Header with Theme Toggle */}
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-bold text-lg">
                {user.displayName || user.email?.split('@')[0]}
              </h3>
              <ThemeToggle />
            </div>
            
            <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-text-primary text-2xl" />
            </div>
            <p className="text-text-tertiary text-sm mb-1">{user.email}</p>
            <span className="px-3 py-1 rounded-full text-xs bg-bg-tertiary text-text-secondary mb-4">
              {getUserRole()}
            </span>
            
            <div className="w-full space-y-2">
              <button 
                className="flex items-center justify-between w-full p-3 bg-bg-tertiary rounded-xl hover:bg-hover-bg transition-colors"
                onClick={() => router.push('/profile')}
              >
                <div className="flex items-center">
                  <FiEdit className="text-text-secondary text-lg mr-3" />
                  <span className="text-text-secondary">Edit Profile</span>
                </div>
              </button>
              
              <button 
                className="flex items-center justify-between w-full p-3 bg-bg-tertiary rounded-xl hover:bg-hover-bg transition-colors"
                onClick={() => signOut()}
              >
                <div className="flex items-center">
                  <FiLogOut className="text-text-secondary text-lg mr-3" />
                  <span className="text-text-secondary">Logout</span>
                </div>
              </button>
              
              <button 
                className="flex items-center justify-between w-full p-3 bg-bg-tertiary rounded-xl hover:bg-hover-bg transition-colors"
                onClick={() => {
                  // Handle account deletion
                  if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // Add account deletion logic here
                  }
                }}
              >
                <div className="flex items-center">
                  <FiTrash2 className="text-red-500 text-lg mr-3" />
                  <span className="text-red-500">Delete Account</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <Link href="/login" className="text-accent-blue hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* What's Happening Section */}
      <WhatsHappening />
    </motion.div>
  );
} 