'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { FiUser, FiEdit3, FiLogOut, FiTrash2, FiSun, FiMoon } from 'react-icons/fi';
import WhatsHappening from './WhatsHappening';

interface RightSidebarProps {
  className?: string;
}

export default function RightSidebar({ className = '' }: RightSidebarProps) {
  const { user, userData, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    console.log('Delete account clicked');
  };

  return (
    <aside className={`h-full bg-bg-secondary border-l border-border-primary ${className}`}>
      <div className="p-4">
        {/* Profile Section */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-bg-tertiary rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-text-primary">
                  {userData?.displayName || 'User'}
                </h3>
                <p className="text-sm text-text-tertiary">
                  {userData?.email || ''}
                </p>
              </div>
            </div>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-hover-bg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className="w-5 h-5 text-text-secondary" />
              ) : (
                <FiMoon className="w-5 h-5 text-text-secondary" />
              )}
            </button>
          </div>

          {/* Profile Actions */}
          <div className="space-y-2">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openProfileModal'))}
              className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-hover-bg transition-colors text-text-primary"
            >
              <FiEdit3 className="w-5 h-5 mr-3" />
              <span>Edit Profile</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-hover-bg transition-colors text-text-primary"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              <span>Sign Out</span>
            </button>
            
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center px-4 py-2 rounded-lg hover:bg-hover-bg transition-colors text-red-500"
            >
              <FiTrash2 className="w-5 h-5 mr-3" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* What's Happening Section */}
        <div className="mt-6">
          <WhatsHappening />
        </div>
      </div>
    </aside>
  );
} 