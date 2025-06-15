'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiAlertCircle, 
  FiPlus, 
  FiHeart, 
  FiHome,
  FiUsers,
  FiUser,
  FiShield,
  FiSettings,
  FiWind,
  FiAlertTriangle,
  FiMessageCircle,
  FiLogOut,
  FiEdit,
  FiTrash2,
  FiChevronDown
} from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SideNavProps {
  onSelectSection: (section: string) => void;
  activeSection: string;
  onCreatePost: () => void;
  // Mobile profile props
  user?: any;
  userData?: any;
  onProfileClick?: () => void;
  showProfileDropdown?: boolean;
  onSignOut?: () => void;
  onEditProfile?: () => void;
  onDeleteAccount?: () => void;
  forceRefresh?: number;
}

export default function SideNav({ 
  onSelectSection, 
  activeSection, 
  onCreatePost,
  user,
  userData,
  onProfileClick,
  showProfileDropdown,
  onSignOut,
  onEditProfile,
  onDeleteAccount,
  forceRefresh
}: SideNavProps) {
  const { isModerator, isAdmin } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (onProfileClick) {
          // Only close if currently open
          if (showProfileDropdown) {
            onProfileClick();
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onProfileClick, showProfileDropdown]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Force page refresh after sign out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const navItems = [
    { id: 'feed', icon: FiHome, label: 'Home' },
    { id: 'activities', icon: FiActivity, label: 'Activities' },
    { id: 'concerns', icon: FiAlertCircle, label: 'Concerns' },
    { id: 'mindwall', icon: FiUsers, label: 'Mind Wall' },
    { id: 'wellness', icon: FiHeart, label: 'Wellness' },
    { id: 'breathing', icon: FiWind, label: 'Breathing' },
  ];

  const moderatorItems = [
    { id: 'anonymous-complaints', icon: FiMessageCircle, label: 'Complaints' },
    { id: 'moderator-announcements', icon: FiShield, label: 'Announcements' },
  ];

  const adminItems = [
    { id: 'manage-moderators', icon: FiSettings, label: 'Manage Mods' },
  ];

  const allItems = [
    ...navItems,
    ...(isModerator || isAdmin ? moderatorItems : []),
    ...(isAdmin ? adminItems : [])
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 sm:w-20 xl:w-64 bg-black border-r border-gray-800 z-50 flex flex-col">
      {/* Logo Section */}
      <div className="flex-shrink-0 p-3 xl:p-4 border-b border-gray-800">
        <div className="flex items-center justify-center xl:justify-start xl:px-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center xl:mr-3">
            <FiHeart className="text-black text-lg" />
          </div>
          <h1 className="hidden xl:block text-xl font-bold text-white">CampusWell</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 xl:px-4 scrollbar-hide py-2">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar { 
            display: none;
          }
        `}</style>
        
        <div className="space-y-1 sm:space-y-2">
          {allItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 lg:py-3.5 rounded-full transition-all duration-200 group ${
                  isActive 
                    ? 'bg-white text-black shadow-lg font-bold' 
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={`w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 ${
                  isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'
                }`} />
                <span className={`hidden xl:block font-medium text-base ${isActive ? 'text-black font-bold' : 'text-white'}`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Create Post Button - Twitter-like */}
        <div className="mt-6 sm:mt-8 mb-4">
          <motion.button
            onClick={onCreatePost}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 sm:py-3.5 xl:py-4 px-3 sm:px-4 xl:px-6 rounded-full transition-all duration-200 flex items-center justify-center text-sm sm:text-base xl:text-lg shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus className="text-lg sm:text-xl xl:mr-2" />
            <span className="hidden xl:block">Post</span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Profile Section - Only visible on mobile/tablet */}
      {user && (
        <div className="lg:hidden border-t border-gray-800 p-3">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={onProfileClick}
              className="w-full flex items-center space-x-3 p-3 rounded-full hover:bg-gray-900 transition-all duration-200 group"
            >
              <div className="w-10 h-10 bg-gray-900 border border-gray-700 rounded-full overflow-hidden flex-shrink-0">
                {user?.photoURL ? (
                  <img 
                    src={`${user.photoURL}?t=${forceRefresh}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {getUserInitials()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0 hidden sm:block">
                <div className="text-white font-bold text-sm truncate">
                  {getUserDisplayName()}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  @{user?.email?.split('@')[0]}
                </div>
              </div>
              <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden sm:block ${
                showProfileDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Mobile Profile Dropdown */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute bottom-full left-0 right-0 mb-3 bg-black border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[280px] w-full"
                >
                  {/* Profile Header in Dropdown */}
                  <div className="px-6 py-5 border-b border-gray-700 bg-gray-900">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gray-800 border border-gray-600 rounded-full overflow-hidden flex-shrink-0">
                        {user?.photoURL ? (
                          <img 
                            src={`${user.photoURL}?t=${forceRefresh}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {getUserInitials()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-lg truncate">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-gray-400 text-base truncate">
                          @{user?.email?.split('@')[0]}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Options */}
                  <div className="py-3">
                    <button 
                      onClick={onEditProfile}
                      className="w-full flex items-center px-6 py-5 text-left hover:bg-gray-900 active:bg-gray-800 transition-colors text-white text-lg font-medium"
                    >
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-5">
                        <FiEdit className="text-blue-400 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">Edit Profile</div>
                        <div className="text-gray-400 text-base mt-1">Update your information</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={onSignOut}
                      className="w-full flex items-center px-6 py-5 text-left hover:bg-gray-900 active:bg-gray-800 transition-colors text-white text-lg font-medium"
                    >
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mr-5">
                        <FiLogOut className="text-green-400 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">Sign Out</div>
                        <div className="text-gray-400 text-base mt-1">Log out of your account</div>
                      </div>
                    </button>
                    
                    <div className="border-t border-gray-700 my-3 mx-6"></div>
                    
                    <button
                      onClick={onDeleteAccount}
                      className="w-full flex items-center px-6 py-5 text-left hover:bg-red-900 hover:bg-opacity-20 active:bg-red-900 active:bg-opacity-30 transition-colors text-red-400 text-lg font-medium"
                    >
                      <div className="w-12 h-12 bg-red-900 bg-opacity-20 rounded-full flex items-center justify-center mr-5">
                        <FiTrash2 className="text-red-400 w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="text-red-400 font-semibold text-lg">Delete Account</div>
                        <div className="text-red-300 text-base opacity-70 mt-1">Permanently remove account</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
} 