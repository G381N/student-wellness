'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';

interface TopBarProps {
  onLeftSidebarToggle?: () => void;
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
}

export default function TopBar({ 
  onLeftSidebarToggle,
  leftSidebarCollapsed,
  rightSidebarCollapsed
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getTopBarStyles = () => {
    if (isMobile) {
      return {
        left: '0px',
        right: '0px',
      };
    }
    
    return {
      left: leftSidebarCollapsed ? '64px' : '256px',
      right: rightSidebarCollapsed ? '0px' : '320px',
    };
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <motion.div
      className="fixed top-0 h-16 z-30 backdrop-blur-custom border-b border-gray-800 flex items-center transition-all duration-300"
      style={getTopBarStyles()}
      layout
    >
      <div className="w-full px-4">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search CampusWell..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
            />
            <FiSearch className="absolute left-3 top-2.5 text-gray-500" />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 