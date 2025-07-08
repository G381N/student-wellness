'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import useWindowSize from '@/hooks/useWindowSize';
import {
  FiHome, FiClipboard, FiMessageSquare, FiHeart, FiShield, FiBell, FiBriefcase, FiTool,
  FiUser, FiUsers, FiSettings, FiChevronLeft, FiChevronRight, FiMenu, FiLogOut, FiX, FiPlus
} from 'react-icons/fi';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftSidebar = ({ isCollapsed, onToggle }: LeftSidebarProps) => {
  const pathname = usePathname();
  const { user, isAdmin, isModerator, isDepartmentHead } = useAuth();
  const { isMobile } = useWindowSize();

  const handleCreatePost = () => {
    window.dispatchEvent(new CustomEvent('openCreatePostModal'));
  };

  const handleProfileClick = () => {
    window.dispatchEvent(new CustomEvent('openProfileModal'));
  };

  const baseLinks = [
    { href: '/dashboard', label: 'Home', icon: FiHome },
    { href: '/dashboard/activities', label: 'Activities', icon: FiClipboard },
    { href: '/dashboard/concerns', label: 'Concerns', icon: FiMessageSquare },
    { href: '/dashboard/mind-wall', label: 'Mind Wall', icon: FiHeart },
    { href: '/dashboard/wellness', label: 'Wellness', icon: FiShield },
  ];

  const moderatorLinks = isModerator || isAdmin ? [
    { href: '/dashboard/announcements', label: 'Announcements', icon: FiBell },
  ] : [];

  const adminLinks = isAdmin ? [
    { href: '/dashboard/anonymous-complaints', label: 'Anonymous Complaints', icon: FiShield },
    { href: '/dashboard/department-complaints', label: 'Department Complaints', icon: FiBriefcase },
    { href: '/dashboard/manage-moderators', label: 'Manage Moderators', icon: FiTool },
    { href: '/dashboard/manage-counselors', label: 'Manage Counselors', icon: FiUsers },
    { href: '/dashboard/manage-departments', label: 'Manage Departments', icon: FiSettings },
  ] : [];

  const departmentHeadLinks = isDepartmentHead ? [
    { href: '/dashboard/department-complaints', label: 'Department Complaints', icon: FiBriefcase },
  ] : [];

  const uniqueLinks = useMemo(() => {
    const allLinks = [...baseLinks, ...moderatorLinks, ...adminLinks, ...departmentHeadLinks];
    const unique = new Map();
    allLinks.forEach(link => {
      if (!unique.has(link.href)) {
        unique.set(link.href, link);
      }
    });
    return Array.from(unique.values());
  }, [isAdmin, isModerator, isDepartmentHead]);

  // On mobile, the sidebar is always "collapsed" (icon-only) and visible.
  const trulyCollapsed = !isMobile && isCollapsed;
  const sidebarWidth = isMobile ? '80px' : (trulyCollapsed ? '80px' : '256px');

  return (
      <motion.div
      className="fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col z-40 border-r border-gray-800"
      animate={{ width: sidebarWidth }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Header with Logo */}
      <div className={`flex items-center h-16 border-b border-gray-800 px-4 ${trulyCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link href="/dashboard" className="flex items-center gap-2">
            <div className="text-white text-2xl">🤍</div>
            {!trulyCollapsed && !isMobile && <span className="text-white font-bold text-xl">CampusWell</span>}
          </Link>
          {!isMobile && (
            <button
              onClick={onToggle}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          )}
        </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className={`space-y-1 ${isMobile || trulyCollapsed ? 'px-2' : 'px-4'}`}>
            {uniqueLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                  title={link.label}
                  className={`flex items-center py-3 rounded-xl transition-colors ${isMobile || trulyCollapsed ? 'justify-center px-3' : 'px-4'} ${
                      isActive
                      ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                  <link.icon className={`text-xl ${!trulyCollapsed && !isMobile ? 'mr-3' : ''}`} />
                  {!trulyCollapsed && !isMobile && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
      {/* Bottom Buttons */}
      <div className={`p-4 border-t border-gray-800 ${isMobile || trulyCollapsed ? 'px-2' : 'px-4'}`}>
        <div className="space-y-4">
          <button
            onClick={handleCreatePost}
            title="Create Post"
            className={`flex items-center w-full h-12 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors ${isMobile || trulyCollapsed ? 'justify-center' : ''}`}
          >
            <FiPlus className="w-6 h-6 text-white" />
            {!trulyCollapsed && !isMobile && <span className="ml-2 text-white">New Post</span>}
          </button>
            <button
            onClick={handleProfileClick}
            title="Profile"
            className={`flex items-center w-full h-12 rounded-xl hover:bg-gray-800 transition-colors ${isMobile || trulyCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="w-5 h-5 text-white" />
              </div>
             {!trulyCollapsed && !isMobile && <span className="ml-2 text-white font-medium">Profile</span>}
            </button>
          </div>
          </div>
      </motion.div>
  );
};

export default LeftSidebar; 