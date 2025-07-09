'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSettings, FiLogOut, FiChevronLeft, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WhatsHappening from './WhatsHappening';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCreatePost?: () => void;
}

export default function RightSidebar({ isCollapsed, onToggle, onCreatePost }: RightSidebarProps) {
  const { user, signOut, isAdmin, isModerator, isDepartmentHead } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <div className="flex items-center justify-between p-4 h-16 border-b border-border-primary relative">
        {/* Collapse/Expand Toggle Button */}
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
            <div className="relative w-full flex justify-end mb-2">
              <ThemeToggle className="absolute top-0 right-0" />
            </div>
            <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
              <FiUser className="text-text-primary text-2xl" />
            </div>
            <h3 className="text-text-primary font-bold text-lg">
              {user.displayName || user.email?.split('@')[0]}
            </h3>
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
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    // TODO: Implement account deletion
                    alert('Account deletion is not yet implemented.');
                  }
                }}
              >
                <div className="flex items-center">
                  <FiTrash2 className="text-error text-lg mr-3" />
                  <span className="text-error">Delete Account</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative w-full flex justify-end mb-2">
              <ThemeToggle className="absolute top-0 right-0" />
            </div>
            <Link 
              href="/login"
              className="w-full py-2 bg-accent-blue text-text-primary rounded-lg text-center font-medium hover:bg-accent-blue-hover transition-colors mb-2"
            >
              Log In
            </Link>
            <Link 
              href="/signup"
              className="w-full py-2 bg-bg-tertiary text-text-primary rounded-lg text-center font-medium hover:bg-hover-bg transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
      
      {/* What's happening section */}
      <div className="p-6 border-b border-border-primary">
        <WhatsHappening />
      </div>
      
      {/* Quick actions */}
      <div className="p-6">
        <h3 className="text-text-primary font-bold text-lg mb-4">Quick actions</h3>
        <button
          onClick={onCreatePost}
          className="w-full py-3 bg-accent-blue text-text-primary rounded-xl flex items-center justify-center space-x-2 hover:bg-accent-blue-hover transition-colors"
        >
          <FiPlus className="text-lg" />
          <span>Create Post</span>
        </button>
      </div>
    </motion.div>
  );
} 