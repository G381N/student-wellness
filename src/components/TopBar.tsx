'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchComponent from './SearchComponent';

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
      className="fixed top-0 h-16 z-30 backdrop-blur-custom border-b border-gray-800 flex items-center transition-all duration-300"
      style={getTopBarStyles()}
      layout
    >
      <div className="w-full px-4">
        <div className="max-w-3xl mx-auto relative">
          {/* Only show search on desktop - mobile search is in sidebar */}
          {!isMobile && (
            <SearchComponent 
              placeholder="Search CampusWell..."
              onSearch={handleSearchResults}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
} 