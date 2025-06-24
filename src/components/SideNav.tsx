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
  FiChevronDown,
  FiBell
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
  
  // Add missing state variables
  const [showMobileProfile, setShowMobileProfile] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Determine user role based on existing userData structure
  const userRole = userData?.role || (userData?.isAdmin ? 'admin' : userData?.isModerator ? 'moderator' : 'student');

  // Reset image error when user photo changes
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL, forceRefresh]);

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
          <h1 className="hidden lg:block text-xl font-bold text-white">CampusWell</h1>
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
                <span className={`hidden lg:block font-medium text-base ${isActive ? 'text-black font-bold' : 'text-white'}`}>
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
            <span className="hidden lg:block">Post</span>
          </motion.button>
        </div>

        {/* Complaints - separate for different types */}
        <div className="space-y-1 sm:space-y-2">
          {(userRole === 'moderator' || userRole === 'admin') && (
            <motion.button
              onClick={() => onSelectSection('anonymous-complaints')}
              className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 lg:py-3.5 rounded-full transition-all duration-200 group ${
                activeSection === 'anonymous-complaints'
                  ? 'bg-white text-black shadow-lg font-bold' 
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMessageCircle className={`w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 ${
                activeSection === 'anonymous-complaints' ? 'text-black' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className={`hidden lg:block font-medium text-base ${
                activeSection === 'anonymous-complaints' ? 'text-black font-bold' : 'text-white'
              }`}>
                Anonymous Complaints
              </span>
            </motion.button>
          )}
          
          {(userRole === 'admin' || userRole === 'department_head') && (
            <motion.button
              onClick={() => onSelectSection('department-complaints')}
              className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 lg:py-3.5 rounded-full transition-all duration-200 group ${
                activeSection === 'department-complaints'
                  ? 'bg-white text-black shadow-lg font-bold' 
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiSettings className={`w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 ${
                activeSection === 'department-complaints' ? 'text-black' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className={`hidden lg:block font-medium text-base ${
                activeSection === 'department-complaints' ? 'text-black font-bold' : 'text-white'
              }`}>
                Department Complaints
              </span>
            </motion.button>
          )}

          {/* Department Head Management - Admin only */}
          {userRole === 'admin' && (
            <motion.button
              onClick={() => onSelectSection('department-heads')}
              className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-3 lg:py-3.5 rounded-full transition-all duration-200 group ${
                activeSection === 'department-heads'
                  ? 'bg-white text-black shadow-lg font-bold' 
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiUsers className={`w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 ${
                activeSection === 'department-heads' ? 'text-black' : 'text-gray-400 group-hover:text-white'
              }`} />
              <span className={`hidden lg:block font-medium text-base ${
                activeSection === 'department-heads' ? 'text-black font-bold' : 'text-white'
              }`}>
                Department Heads
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Mobile Profile Section - Compact profile button only */}
      <div className="sm:hidden mx-2 mb-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          {/* Compact Profile Button */}
          <button
            onClick={() => setShowMobileProfile(!showMobileProfile)}
            className="w-full p-3 flex items-center justify-center hover:bg-gray-800 transition-all duration-200"
          >
            {/* Profile Picture Only */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
                {user?.photoURL && !imageError ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-opacity duration-200"
                    onError={() => setImageError(true)}
                    onLoad={() => setImageError(false)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    {user?.displayName || user?.email ? (
                      <div className="text-white text-sm font-bold bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center rounded-full">
                        {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <FiUser size={20} className="text-gray-400" />
                    )}
                  </div>
                )}
                
                {/* Online Status Indicator */}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Profile Modal */}
      <AnimatePresence>
        {showMobileProfile && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] sm:hidden"
              onClick={() => setShowMobileProfile(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.4, 0.0, 0.2, 1],
                type: "spring",
                damping: 25,
                stiffness: 300
              }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] bg-gray-900 rounded-3xl border border-gray-700 shadow-2xl z-[70] sm:hidden overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
                {/* Close Button */}
                <button
                  onClick={() => setShowMobileProfile(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-800/50 hover:bg-gray-700 rounded-full flex items-center justify-center transition-all duration-200"
                >
                  <FiChevronDown className="w-4 h-4 text-gray-400 rotate-180" />
                </button>

                {/* Large Profile Picture */}
                <div className="relative mx-auto mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-600 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-xl mx-auto">
                    {user?.photoURL && !imageError ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-full h-full object-cover transition-opacity duration-200"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        {user?.displayName || user?.email ? (
                          <div className="text-white text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center rounded-full">
                            {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <FiUser size={28} className="text-gray-400" />
                        )}
                      </div>
                    )}
                    
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-gray-900 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <h3 className="text-white font-bold text-xl leading-tight">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </h3>
                  <p className="text-gray-400 text-sm break-all">
                    {user?.email}
                  </p>
                  
                  {/* Role Badge */}
                  <div className="flex justify-center mt-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                      userRole === 'admin' 
                        ? 'bg-red-900/50 text-red-300 border-red-700' 
                        : userRole === 'moderator'
                        ? 'bg-blue-900/50 text-blue-300 border-blue-700'
                        : 'bg-gray-800/50 text-gray-300 border-gray-600'
                    }`}>
                      {userRole === 'admin' ? '👑 Admin' : userRole === 'moderator' ? '🛡️ Moderator' : '🎓 Student'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Quick Stats - Only show if we have real data */}
                {(userData?.postsCount || userData?.helpCount) && (
                  <div className="grid grid-cols-2 gap-3">
                    {userData?.postsCount !== undefined && (
                      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 text-center border border-gray-600">
                        <div className="text-white font-bold text-lg">{userData.postsCount}</div>
                        <div className="text-gray-400 text-sm">Posts</div>
                      </div>
                    )}
                    {userData?.helpCount !== undefined && (
                      <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 text-center border border-gray-600">
                        <div className="text-white font-bold text-lg">{userData.helpCount}</div>
                        <div className="text-gray-400 text-sm">Helped</div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Details */}
                <div className="space-y-3">
                  <div className="bg-gradient-to-br from-gray-800 to-gray-700 rounded-xl p-4 border border-gray-600">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Member since:</span>
                        <span className="text-white">
                          {user?.metadata?.creationTime 
                            ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short' 
                              })
                            : 'Recently'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Last active:</span>
                        <span className="text-white">
                          {user?.metadata?.lastSignInTime 
                            ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })
                            : 'Today'
                          }
                        </span>
                      </div>
                      {userData?.department && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Department:</span>
                          <span className="text-white">{userData.department}</span>
                        </div>
                      )}
                      {userData?.year && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Year:</span>
                          <span className="text-white">{userData.year}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (onEditProfile) {
                        onEditProfile();
                      } else {
                        onSelectSection('profile');
                      }
                      setShowMobileProfile(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 rounded-xl transition-all duration-200 flex items-center border border-transparent hover:border-gray-600"
                  >
                    <FiUser className="mr-3 text-blue-400" size={18} />
                    <span className="font-medium">Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onDeleteAccount) {
                        onDeleteAccount();
                      }
                      setShowMobileProfile(false);
                    }}
                    className="w-full text-left px-4 py-3 text-orange-400 hover:text-orange-300 hover:bg-gradient-to-r hover:from-orange-900/20 hover:to-orange-800/20 rounded-xl transition-all duration-200 flex items-center border border-transparent hover:border-orange-700/50"
                  >
                    <FiTrash2 className="mr-3" size={18} />
                    <span className="font-medium">Delete Profile</span>
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-900/20 hover:to-red-800/20 rounded-xl transition-all duration-200 flex items-center font-medium border border-transparent hover:border-red-700/50"
                  >
                    <FiLogOut className="mr-3" size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
} 