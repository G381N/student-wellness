'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiSettings, FiLogOut, FiChevronLeft, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import RightSidebarContent from './RightSidebarContent';

interface RightSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onCreatePost?: () => void;
}

export default function RightSidebar({ isCollapsed, onToggle, onCreatePost }: RightSidebarProps) {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't render on mobile or when collapsed
  if (isMobile || isCollapsed) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 right-0 h-full w-80 bg-bg-secondary border-l border-border-primary z-40 overflow-y-auto scrollbar-hide"
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Header with Toggle Button */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-border-primary relative">
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={onToggle}
          className="p-2 rounded-full hover:bg-hover-bg transition-colors bg-bg-tertiary"
        >
          <FiChevronLeft className="text-text-secondary" />
        </button>
        
        <h2 className="text-text-primary font-semibold">Profile & Updates</h2>
      </div>
      
      <RightSidebarContent onCreatePost={onCreatePost} />
    </motion.div>
  );
} 