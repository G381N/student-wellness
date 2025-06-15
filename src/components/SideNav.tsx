'use client';

import { useState } from 'react';
import { 
  FiActivity, 
  FiAlertCircle, 
  FiPlus, 
  FiHeart, 
  FiHome,
  FiUsers,
  FiSun,
  FiUser,
  FiShield,
  FiSettings,
  FiFileText,
  FiWind,
  FiAlertTriangle,
  FiMessageCircle,
  FiLogOut,
  FiMoon
} from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface SideNavProps {
  onSelectSection: (section: string) => void;
  activeSection: string;
  onCreatePost: () => void;
}

export default function SideNav({ onSelectSection, activeSection, onCreatePost }: SideNavProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: FiHome },
    { id: 'wellness', label: 'Wellness Center', icon: FiHeart },
    { id: 'mindwall', label: 'Mind Wall', icon: FiMessageCircle },
    { id: 'complaints', label: 'Anonymous Complaints', icon: FiShield },
  ];

  const moderatorItems = [
    { id: 'announcements', label: 'Announcements', icon: FiSettings },
  ];

  const adminItems = [
    { id: 'manage-moderators', label: 'Manage Moderators', icon: FiSettings },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-16 xl:w-64 bg-black border-r border-gray-800 z-50 flex flex-col">
      {/* Logo Section */}
      <div className="flex-shrink-0 p-3 xl:p-4">
        <div className="flex items-center justify-center xl:justify-start xl:px-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center xl:mr-3">
            <FiHeart className="text-black text-lg" />
          </div>
          <h1 className="hidden xl:block text-xl font-bold text-white">CampusWell</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 xl:px-4 scrollbar-hide">
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar { 
            display: none;
          }
        `}</style>
        
        <div className="space-y-2">
          {/* Home */}
          <button
            onClick={() => onSelectSection('feed')}
            className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
              activeSection === 'feed'
                ? 'bg-gray-900 text-white font-bold'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <FiHome className="text-xl xl:mr-4" />
            <span className="hidden xl:block text-xl font-normal">Home</span>
          </button>

          {/* Activities */}
          <button
            onClick={() => onSelectSection('activities')}
            className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
              activeSection === 'activities'
                ? 'bg-gray-900 text-white font-bold'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <FiActivity className="text-xl xl:mr-4" />
            <span className="hidden xl:block text-xl font-normal">Activities</span>
          </button>

          {/* Concerns */}
          <button
            onClick={() => onSelectSection('concerns')}
            className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
              activeSection === 'concerns'
                ? 'bg-gray-900 text-white font-bold'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <FiAlertCircle className="text-xl xl:mr-4" />
            <span className="hidden xl:block text-xl font-normal">Concerns</span>
          </button>

          {/* Mind Wall */}
          <button
            onClick={() => onSelectSection('mindwall')}
            className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
              activeSection === 'mindwall'
                ? 'bg-gray-900 text-white font-bold'
                : 'text-gray-300 hover:bg-gray-900 hover:text-white'
            }`}
          >
            <FiUsers className="text-xl xl:mr-4" />
            <span className="hidden xl:block text-xl font-normal">Mind Wall</span>
          </button>

          {/* Regular users see Wellness and Breathing */}
          {!isAdmin && !isModerator && (
            <>
              <button
                onClick={() => onSelectSection('wellness')}
                className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
                  activeSection === 'wellness'
                    ? 'bg-gray-900 text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <FiHeart className="text-xl xl:mr-4" />
                <span className="hidden xl:block text-xl font-normal">Wellness</span>
              </button>

              <button
                onClick={() => onSelectSection('breathing')}
                className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
                  activeSection === 'breathing'
                    ? 'bg-gray-900 text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <FiWind className="text-xl xl:mr-4" />
                <span className="hidden xl:block text-xl font-normal">Breathing</span>
              </button>
            </>
          )}

          {/* Moderator/Admin sections */}
          {(isModerator || isAdmin) && (
            <button
              onClick={() => onSelectSection('moderator-announcements')}
              className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
                activeSection === 'moderator-announcements'
                  ? 'bg-gray-900 text-white font-bold'
                  : 'text-gray-300 hover:bg-gray-900 hover:text-white'
              }`}
            >
              <FiShield className="text-xl xl:mr-4" />
              <span className="hidden xl:block text-xl font-normal">Announcements</span>
            </button>
          )}

          {/* Admin-only sections */}
          {isAdmin && (
            <>
              <button
                onClick={() => onSelectSection('anonymous-complaints')}
                className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
                  activeSection === 'anonymous-complaints'
                    ? 'bg-gray-900 text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <FiAlertTriangle className="text-xl xl:mr-4" />
                <span className="hidden xl:block text-xl font-normal">Complaints</span>
              </button>
              
              <button
                onClick={() => onSelectSection('manage-moderators')}
                className={`w-full flex items-center justify-center xl:justify-start p-3 xl:px-4 xl:py-3 rounded-full transition-all duration-200 group ${
                  activeSection === 'manage-moderators'
                    ? 'bg-gray-900 text-white font-bold'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }`}
              >
                <FiSettings className="text-xl xl:mr-4" />
                <span className="hidden xl:block text-xl font-normal">Manage Mods</span>
              </button>
            </>
          )}
        </div>

        {/* Create Post Button - Twitter-like */}
        <div className="mt-8 mb-4">
          <button
            onClick={onCreatePost}
            className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 xl:py-4 px-3 xl:px-6 rounded-full transition-all duration-200 flex items-center justify-center text-base xl:text-lg shadow-lg hover:shadow-xl"
          >
            <FiPlus className="xl:mr-2 text-lg" />
            <span className="hidden xl:block">Post</span>
          </button>
        </div>
      </div>
    </div>
  );
} 