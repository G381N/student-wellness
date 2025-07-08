'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchComponent from './SearchComponent';
import useWindowSize from '@/hooks/useWindowSize';
import { FiMenu } from 'react-icons/fi';

interface TopBarProps {
  onToggleLeftSidebar: () => void;
  leftSidebarCollapsed: boolean;
}

const TopBar = ({ onToggleLeftSidebar, leftSidebarCollapsed }: TopBarProps) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { isMobile } = useWindowSize();

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
  };

  const getTopBarStyles = () => {
    let left = '0px';
    let width = '100%';

    if (isMobile) {
      left = '80px';
      width = 'calc(100% - 80px)';
    } else {
      left = leftSidebarCollapsed ? '80px' : '256px';
      width = `calc(100% - ${left})`;
    }

    return {
      left,
      width,
      transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
    };
  };

  return (
    <motion.div
      className="fixed top-0 h-16 z-30 backdrop-blur-custom border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 md:px-8"
      style={getTopBarStyles()}
      layout
    >
      <div className="flex items-center gap-4">
        {/* Hamburger Menu (desktop only) */}
        {!isMobile && (
           <button 
             onClick={onToggleLeftSidebar} 
             className="text-gray-400 hover:text-white"
           >
             <FiMenu className="w-6 h-6" />
           </button>
        )}
        
        {/* Search Component */}
        <div className="w-full max-w-lg">
          <SearchComponent 
            placeholder="Search CampusWell..."
            onSearch={handleSearchResults}
          />
        </div>
      </div>
      
      {/* Other controls can go here, e.g., Profile button for mobile top bar */}
    </motion.div>
  );
};

export default TopBar; 