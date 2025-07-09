'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiHome,
  FiMessageSquare,
  FiHeart,
  FiActivity,
  FiAlertCircle,
  FiWind,
  FiBell,
  FiUsers,
  FiShield,
  FiPhone,
  FiCalendar,
  FiSpeaker,
  FiBriefcase,
  FiChevronRight,
  FiUser,
  FiHardDrive,
  FiUserCheck,
  FiMenu,
  FiLogOut,
  FiX,
  FiSearch
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SearchComponent from './SearchComponent';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, isAdmin, isDepartmentHead } = useAuth();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- REVISED LINK LOGIC ---
  const baseLinks = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
    { href: '/dashboard/wellness', icon: FiActivity, label: 'Wellness' },
  ];

  let finalLinks = [...baseLinks];

  // Add links for Department Heads
  if (isDepartmentHead) {
    finalLinks.push({ href: '/dashboard/department-complaints', icon: FiBriefcase, label: 'Department Complaints' });
  }

  // Add links for Admins (they get everything)
  if (isAdmin) {
    finalLinks.push(
      { href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' },
      { href: '/dashboard/anonymous-complaints', icon: FiShield, label: 'Anonymous Complaints' },
      { href: '/dashboard/department-complaints', icon: FiBriefcase, label: 'Department Complaints' },
      { href: '/dashboard/manage-departments', icon: FiHardDrive, label: 'Manage Departments' },
      { href: '/dashboard/manage-moderators', icon: FiUserCheck, label: 'Manage Moderators' },
      { href: '/dashboard/manage-counselors', icon: FiUsers, label: 'Manage Counselors' }
    );
  }

  // Ensure all links are unique
  const uniqueLinks = Array.from(new Map(finalLinks.map(link => [link.href, link])).values());
  // --- END REVISED LOGIC ---

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter search results based on user permissions
    console.log('Searching for:', searchQuery);
    // Implement search functionality here
  };

  // On mobile, when collapsed, show only a burger button
  if (isMobile && isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-3 bg-bg-secondary text-text-primary rounded-lg border border-border-primary hover:bg-hover-bg transition-colors shadow-app"
        aria-label="Open menu"
      >
        <FiMenu className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-bg-overlay z-30"
          onClick={onToggle}
        />
      )}
    
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full z-40 flex flex-col ${
          isCollapsed && !isMobile ? 'w-16' : 'w-64'
        } bg-bg-secondary border-r border-border-primary transition-all duration-300`}
        initial={false}
        animate={{ 
          width: isCollapsed && !isMobile ? 64 : 256,
          x: isMobile && isCollapsed ? -300 : 0
        }}
      >
        {/* Header with Logo - Fixed */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-border-primary relative sticky top-0 bg-bg-secondary z-10`}>
          {(!isCollapsed || isMobile) && (
          <Link href="/dashboard" className="flex items-center">
              <div className="text-accent-blue text-2xl mr-2">🤍</div>
              <span className="text-text-primary font-bold text-xl">CampusWell</span>
            </Link>
            )}
          
          {/* Collapse/Expand Toggle Button (desktop only) - Positioned better */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-full bg-bg-tertiary text-text-primary hover:bg-hover-bg transition-colors z-10"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          )}
          
          {/* Close button (mobile only) */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 text-text-secondary hover:text-text-primary"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar (mobile only) */}
        {isMobile && (
          <div className="px-3 py-3 border-b border-border-primary">
            <SearchComponent 
              placeholder="Search..."
              onSearch={(results) => console.log('Mobile search results:', results)}
              className="text-sm"
            />
          </div>
        )}
        
        {/* Navigation Links with Scrolling - Scrollable */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-4">
          <ul className="space-y-1 px-2">
            {uniqueLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-hover-bg text-accent-blue font-medium'
                        : 'text-text-secondary hover:bg-hover-bg hover:text-text-primary'
                    }`}
                  >
                    <link.icon className={`${isCollapsed && !isMobile ? 'mx-auto' : 'mr-3'} text-xl ${isActive ? 'text-accent-blue' : ''}`} />
                    {(!isCollapsed || isMobile) && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
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

export default LeftSidebar; 