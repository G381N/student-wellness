'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchComponent from './SearchComponent';
import { FiUser } from 'react-icons/fi';

interface TopBarProps {
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  onRightSidebarToggle?: () => void;
}

export default function TopBar({ 
  leftSidebarCollapsed,
  rightSidebarCollapsed,
  onRightSidebarToggle
}: TopBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
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

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    console.log('Search results:', results);
  };

  return (
    <motion.div
      className="fixed top-0 h-16 z-30 bg-gray-900 bg-opacity-80 backdrop-blur-md border-b border-gray-800 flex items-center transition-all duration-300"
      style={getTopBarStyles()}
      layout
    >
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          {/* Search Component taking available space */}
          <div className="flex-1 min-w-0">
            {!isMobile && (
              <SearchComponent 
                placeholder="Search CampusWell..."
                onSearch={handleSearchResults}
              />
            )}
          </div>

          {/* Profile Icon Button */}
          {!isMobile && (
            <button
              onClick={onRightSidebarToggle}
              className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors flex-shrink-0"
            >
              <FiUser className="text-white" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
} 