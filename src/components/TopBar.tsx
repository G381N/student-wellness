'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiMenu, FiBell } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface TopBarProps {
  onLeftSidebarToggle: () => void;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

export default function TopBar({ 
  onLeftSidebarToggle, 
  leftSidebarCollapsed, 
  rightSidebarCollapsed 
}: TopBarProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getMarginLeft = () => {
    if (isMobile) return '0px';
    return leftSidebarCollapsed ? '0px' : '256px';
  };

  const getMarginRight = () => {
    if (isMobile) return '0px';
    return rightSidebarCollapsed ? '0px' : '320px';
  };

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-md bg-black/80' : 'backdrop-blur-sm bg-black/60'
      }`}
      style={{
        marginLeft: getMarginLeft(),
        marginRight: getMarginRight(),
      }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={onLeftSidebarToggle}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <FiMenu className="text-white text-xl" />
            </button>
          )}

          {/* Search Bar */}
          <div className="flex-1 relative max-w-2xl">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search CampusWell..."
                className="w-full bg-gray-900/80 backdrop-blur-sm text-white placeholder-gray-400 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-gray-900 border border-gray-700 transition-all duration-200"
              />
            </div>
          </div>

          {/* Mobile Profile & Notifications */}
          {isMobile && user && (
            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative">
                <FiBell className="text-white text-xl" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.displayName?.[0] || user.email?.[0] || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Desktop Notifications */}
          {!isMobile && user && (
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors relative">
              <FiBell className="text-white text-xl" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 