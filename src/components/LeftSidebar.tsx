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
        className="fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors shadow-lg"
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
          className="fixed inset-0 bg-black bg-opacity-70 z-30"
          onClick={onToggle}
        />
      )}
    
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full z-40 flex flex-col ${
          isCollapsed && !isMobile ? 'w-16' : 'w-64'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300`}
        initial={false}
        animate={{ 
          width: isCollapsed && !isMobile ? 64 : 256,
          x: isMobile && isCollapsed ? -300 : 0
        }}
      >
        {/* Header with Logo - Fixed */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-gray-800 relative sticky top-0 bg-gray-900 z-10`}>
          {(!isCollapsed || isMobile) && (
          <Link href="/dashboard" className="flex items-center">
              <div className="text-white text-2xl mr-2">🤍</div>
              <span className="text-white font-bold text-xl">CampusWell</span>
            </Link>
            )}
          
          {/* Collapse/Expand Toggle Button (desktop only) - Positioned better */}
          {!isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors z-10"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <FiChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
            </button>
          )}
          
          {/* Close button (mobile only) */}
          {isMobile && (
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Bar (mobile only) */}
        {isMobile && (
          <div className="px-3 py-3 border-b border-gray-800">
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
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <link.icon className={`${isCollapsed && !isMobile ? 'mx-auto' : 'mr-3'} text-xl`} />
                    {(!isCollapsed || isMobile) && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Profile Button - Fixed at bottom (mobile only) */}
        {isMobile && (
          <div className="p-4 border-t border-gray-800 sticky bottom-0 bg-gray-900">
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openProfileModal'));
              }}
              className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 text-left">
                <span className="text-white font-medium block truncate">
                  {user?.displayName || 'Profile'}
                </span>
                <span className="text-gray-400 text-xs truncate block">
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