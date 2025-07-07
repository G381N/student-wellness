'use client';

import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import TopBar from './TopBar';
import ProfileModal from './ProfileModal';

interface LayoutShellProps {
  children: React.ReactNode;
}

const LayoutShell: React.FC<LayoutShellProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setLeftSidebarCollapsed(true);
      }
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Listen for profile modal open event from LeftSidebar
    const openProfileModal = () => setIsProfileModalOpen(true);
    window.addEventListener('openProfileModal', openProfileModal);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('openProfilemodal', openProfileModal);
    };
  }, []);

  const handleToggleSidebar = () => {
    setLeftSidebarCollapsed(!leftSidebarCollapsed);
  };
  
  return (
    <div className="flex min-h-screen bg-black text-white">
      <LeftSidebar
        isCollapsed={leftSidebarCollapsed}
        onToggle={handleToggleSidebar}
      />
      
      <main 
        className="flex-1 transition-all duration-300"
        style={{
          paddingLeft: isMobile ? '0' : (leftSidebarCollapsed ? '64px' : '256px'),
        }}
      >
        <TopBar 
          onToggleSidebar={handleToggleSidebar} 
          onOpenProfile={() => setIsProfileModalOpen(true)}
          leftSidebarCollapsed={leftSidebarCollapsed}
        />
        
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default LayoutShell; 