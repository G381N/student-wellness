'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import LayoutShell from './LayoutShell';
import MobileSidebar from './MobileSidebar';
import TopBar from './TopBar';
import ProfileModal from './ProfileModal';

export default function ConditionalLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Pages that should use the simple layout (no sidebars)
  const simpleLayoutPages = ['/', '/login', '/signup', '/about'];
  
  // Check if current page should use simple layout
  const useSimpleLayout = simpleLayoutPages.includes(pathname);
  
  if (useSimpleLayout) {
    return (
      <main className="min-h-screen bg-black text-white">
        {children}
      </main>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex">
        <MobileSidebar />
        <div className="flex-1 flex flex-col" style={{ marginLeft: '56px' }}>
          <TopBar 
            leftSidebarCollapsed={true} 
            rightSidebarCollapsed={true} 
          />
          <main className="flex-grow overflow-y-auto p-4 pt-20">
            {children}
          </main>
        </div>
        <ProfileModal isOpen={false} onClose={() => {}} />
      </div>
    );
  }
  
  // Use the full layout with sidebars for dashboard pages
  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  );
} 