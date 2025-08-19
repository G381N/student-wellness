'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SearchComponent from './SearchComponent';
import { FiUser } from 'react-icons/fi';
import RightSidebarModal from './RightSidebarModal';

interface TopBarProps {
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  onRightSidebarToggle?: () => void;
  hideProfileButton?: boolean;
  onCreatePost?: () => void;
}

export default function TopBar({ 
  leftSidebarCollapsed,
  rightSidebarCollapsed,
  onRightSidebarToggle,
  hideProfileButton = false,
  onCreatePost
}: TopBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    // On mobile, the topbar should start after the collapsed sidebar
    if (isMobile) {
      return {
        left: '56px', // Match exactly with the mobile sidebar width (from LayoutShell)
        right: '0px',
        marginLeft: '-1px', // Only apply negative margin on mobile to fix the gap
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

  const handleProfileClick = () => {
    if (isMobile) {
      setIsModalOpen(true);
    } else if (onRightSidebarToggle) {
      onRightSidebarToggle();
    }
  };

  return (
    <>
      <motion.div
        className="fixed top-0 h-16 z-30 bg-bg-secondary bg-opacity-80 backdrop-blur-md border-b border-border-primary flex items-center transition-all duration-300"
        style={{...getTopBarStyles()}}
        layout
      >
        <div className="w-full px-2 sm:px-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            {/* Search Component */}
            <div className="flex-1 min-w-0 max-w-[calc(100%-48px)]">
              <SearchComponent 
                placeholder="Search..."
                onSearch={handleSearchResults}
                className="w-full"
              />
            </div>

            {/* Profile Icon Button */}
            {(isMobile || !hideProfileButton) && (
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 bg-bg-tertiary rounded-full flex items-center justify-center shadow-app hover:bg-hover-bg transition-colors flex-shrink-0"
              >
                <FiUser className="text-text-primary" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
      <RightSidebarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreatePost={onCreatePost}
      />
    </>
  );
}