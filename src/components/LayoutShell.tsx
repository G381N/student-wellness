'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';

const LeftSidebar = dynamic(() => import('./LeftSidebar'), { ssr: false });
const RightSidebar = dynamic(() => import('./RightSidebar'), { ssr: false });
const TopBar = dynamic(() => import('./TopBar'), { ssr: false });

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [leftCollapsed, setLeftCollapsed] = useState(true); // true = hidden on mobile
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen bg-black flex">
      {/* Left Sidebar */}
      <LeftSidebar collapsed={leftCollapsed} setCollapsed={setLeftCollapsed} />
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 mr-0 lg:mr-80 transition-all duration-300">
        <TopBar />
        <div className="pt-24 pb-4 px-2 md:px-8 max-w-2xl mx-auto w-full flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
      {/* Right Sidebar (desktop only) */}
      <RightSidebar collapsed={rightCollapsed} setCollapsed={setRightCollapsed} />
    </div>
  );
} 