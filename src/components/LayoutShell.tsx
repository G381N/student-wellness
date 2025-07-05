'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import TopBar from './TopBar';
import CreatePostModal from './CreatePostModal';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getMainContentMargins = () => {
    if (isMobile) {
      return {
        marginLeft: '0px',
        marginRight: '0px',
      };
    }
    
    return {
      marginLeft: leftSidebarCollapsed ? '0px' : '256px',
      marginRight: rightSidebarCollapsed ? '0px' : '320px',
    };
  };

  const handlePostCreated = (post: any) => {
    // Handle post creation - you can add refresh logic here
    console.log('Post created:', post);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Left Sidebar */}
      <LeftSidebar 
        isCollapsed={leftSidebarCollapsed}
        onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
      />

      {/* Right Sidebar */}
      <RightSidebar 
        isCollapsed={rightSidebarCollapsed}
        onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
        onCreatePost={() => setShowCreateModal(true)}
      />

      {/* Top Bar */}
      <TopBar 
        onLeftSidebarToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        leftSidebarCollapsed={leftSidebarCollapsed}
        rightSidebarCollapsed={rightSidebarCollapsed}
      />

      {/* Main Content */}
      <motion.main
        className="transition-all duration-300 pt-20 min-h-screen"
        style={getMainContentMargins()}
        layout
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </motion.main>

      {/* Mobile Create Post Button */}
      {isMobile && (
        <button
          onClick={() => setShowCreateModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg z-40 transition-all duration-200"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
} 