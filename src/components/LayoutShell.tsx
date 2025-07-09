'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import TopBar from './TopBar';
import ProfileModal from './ProfileModal';
import CreatePostModal from './CreatePostModal';
import BottomNavbar from './BottomNavbar';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true); // Start collapsed
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // On mobile, start with sidebars collapsed
      if (mobile) {
        setLeftSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Listen for profile modal open event from LeftSidebar
    const handleOpenProfileModal = () => setShowProfileModal(true);
    window.addEventListener('openProfileModal', handleOpenProfileModal);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);

  const getMainContentStyles = () => {
    if (isMobile) {
      return {
        paddingLeft: '0px',
        paddingRight: '0px',
        paddingTop: '64px', // Space for top bar
      };
    }
    
    return {
      paddingLeft: leftSidebarCollapsed ? '80px' : '272px', // 64px/256px for sidebar + 16px padding
      paddingRight: rightSidebarCollapsed ? '16px' : '336px', // 320px for sidebar + 16px padding
      paddingTop: '80px', // Space for top bar + padding
    };
  };

  const handlePostCreated = (post: any) => {
    // Handle post creation - you can add refresh logic here
    console.log('Post created:', post);
  };

  const handleSearchResults = (results: any[]) => {
    setSearchResults(results);
    console.log('Search results in LayoutShell:', results);
    // Here you can implement global state management for search results
    // or pass them to relevant components
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left Sidebar - Desktop Only */}
      {!isMobile && (
        <LeftSidebar
          isCollapsed={leftSidebarCollapsed}
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div 
        className="flex flex-col flex-grow relative transition-all duration-300"
        style={{
          marginLeft: isMobile ? '0px' : (leftSidebarCollapsed ? '64px' : '256px'),
          marginRight: isMobile ? '0px' : (rightSidebarCollapsed ? '0px' : '320px'),
        }}
      >
        {/* Top Bar */}
        <TopBar
          leftSidebarCollapsed={leftSidebarCollapsed}
          rightSidebarCollapsed={rightSidebarCollapsed}
          onRightSidebarToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        />

        {/* Main Scrollable Content */}
        <motion.main
          className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8 pt-16 pb-20 md:pb-8"
        >
          {children}
        </motion.main>
      </div>


      {/* Right Sidebar */}
      <RightSidebar
        isCollapsed={rightSidebarCollapsed}
        onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        onCreatePost={() => setShowCreateModal(true)}
      />

      {/* Desktop Profile FAB (only shown when right sidebar is collapsed) */}
      {!isMobile && rightSidebarCollapsed && (
        <button
          onClick={() => setRightSidebarCollapsed(false)}
          className="fixed top-4 right-4 z-40 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors"
        >
          <FiUser className="text-white" />
        </button>
      )}

      {/* Mobile Bottom Navbar */}
      {isMobile && <BottomNavbar />}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Mobile Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
} 