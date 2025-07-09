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

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarCollapsed(true);
        setRightSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    const handleOpenProfileModal = () => setShowProfileModal(true);
    window.addEventListener('openProfileModal', handleOpenProfileModal);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
    };
  }, []);

  const handlePostCreated = (post: any) => {
    console.log('Post created:', post);
  };

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Left Sidebar */}
      {!isMobile && (
        <LeftSidebar
          isCollapsed={leftSidebarCollapsed}
          onToggle={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow min-w-0">
        {/* Top Bar */}
        <TopBar
          leftSidebarCollapsed={leftSidebarCollapsed}
          rightSidebarCollapsed={rightSidebarCollapsed}
        />
        {/* Main Scrollable Content */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Right Sidebar */}
      {!isMobile && (
        <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
          onCreatePost={() => setShowCreateModal(true)}
        />
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