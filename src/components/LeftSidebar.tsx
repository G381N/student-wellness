'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHome, FiHeart, FiActivity, FiAlertCircle, FiBriefcase, FiUsers, FiUser, FiBell, FiChevronLeft, FiChevronRight, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SearchComponent from './SearchComponent';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function LeftSidebar({ isCollapsed, onToggle }: LeftSidebarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, isAdmin, isModerator, isDepartmentHead } = useAuth();
  const pathname = usePathname();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navigationItems = [
    { icon: <FiHome />, label: 'Home', path: '/dashboard', visible: true },
    { icon: <FiHeart />, label: 'Mind Wall', path: '/dashboard/mind-wall', visible: true },
    { icon: <FiActivity />, label: 'Wellness', path: '/dashboard/wellness', visible: true },
    { icon: <FiBell />, label: 'Announcements', path: '/dashboard/announcements', visible: true },
    { icon: <FiAlertCircle />, label: 'Anonymous Complaints', path: '/dashboard/anonymous-complaints', visible: true },
    { icon: <FiBriefcase />, label: 'Department Complaints', path: '/dashboard/department-complaints', visible: true },
    { icon: <FiBriefcase />, label: 'Manage Departments', path: '/dashboard/manage-departments', visible: isAdmin },
    { icon: <FiUsers />, label: 'Manage Moderators', path: '/dashboard/manage-moderators', visible: isAdmin },
    { icon: <FiUsers />, label: 'Manage Counselors', path: '/dashboard/manage-counselors', visible: isAdmin || isModerator },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      {isMobile && (
        <button
          className="fixed top-4 left-4 z-40 p-2 bg-bg-tertiary rounded-full shadow-app"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <FiX /> : <FiMenu />}
        </button>
      )}
      
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-bg-secondary border-r border-border-primary z-30 transition-all duration-300 ${
          isMobile ? 'w-64' : isCollapsed ? 'w-16' : 'w-64'
        } ${isMobile && !showMobileMenu ? '-translate-x-full' : 'translate-x-0'}`}
        animate={{ width: isMobile ? 256 : (isCollapsed ? 64 : 256) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo and Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border-primary">
          <Link href="/dashboard" className="flex items-center">
            <span className="text-text-primary font-bold text-xl">
              {!isCollapsed && 'CampusWell'}
            </span>
          </Link>
          
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-1 rounded-full hover:bg-hover-bg transition-colors"
            >
              {isCollapsed ? (
                <FiChevronRight className="text-text-secondary" />
              ) : (
                <FiChevronLeft className="text-text-secondary" />
              )}
            </button>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {navigationItems.filter(item => item.visible).map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-xl transition-colors ${
                    isActive(item.path) 
                      ? 'border border-accent-blue bg-accent-blue/5 shadow-sm' 
                      : 'hover:bg-hover-bg'
                  }`}
                >
                  <span className={`text-xl ${isActive(item.path) ? 'text-accent-blue' : 'text-text-secondary'}`}>
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className={`ml-3 ${isActive(item.path) ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Mobile Search */}
        {isMobile && (
          <div className="px-4 mt-4">
            <SearchComponent placeholder="Search..." />
          </div>
        )}
        
        {/* Profile Button - Fixed at bottom (mobile only) */}
        {isMobile && (
          <div className="p-4 border-t border-border-primary sticky bottom-0 bg-bg-secondary">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openProfileModal'));
              }}
              className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-hover-bg transition-colors"
            >
              <div className="w-10 h-10 bg-bg-tertiary rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-5 h-5 text-text-primary" />
              </div>
              <div className="ml-3 text-left">
                <span className="text-text-primary font-medium block truncate">
                  {user?.displayName || 'Profile'}
                </span>
                <span className="text-text-tertiary text-xs truncate block">
                  {user?.email || 'View profile'}
                </span>
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}; 