'use client';

import React, { useState, useEffect } from 'react';
import LeftSidebar from './LeftSidebar';
import ProfileModal from './ProfileModal';
import { FiMenu } from 'react-icons/fi';

const LayoutShell = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarCollapsed(false); // Default to open on desktop
      } else {
        setIsSidebarCollapsed(true); // Default to closed on mobile
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    const openProfileModalListener = () => setIsProfileModalOpen(true);
    window.addEventListener('openProfileModal', openProfileModalListener);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('openProfileModal', openProfileModalListener);
    };
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <LeftSidebar 
        isCollapsed={isMobile ? isSidebarCollapsed : false} 
        onToggle={toggleSidebar} 
      />

      <main className={`flex-1 transition-all duration-300 ${isMobile ? '' : 'ml-64'}`}>
        <div className="md:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
            <h1 className="text-xl font-bold text-white">CampusWell</h1>
            <button onClick={toggleSidebar} className="text-white p-2">
                <FiMenu size={24} />
            </button>
        </div>
        <div className="p-2 md:p-6 overflow-y-auto h-full">
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