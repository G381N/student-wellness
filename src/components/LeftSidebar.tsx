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
  FiUserCheck
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, loading, logout, departmentInfo, userRole } = useAuth();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    // Handle logout logic here
  };

  const openProfileModal = () => {
    // Handle opening profile modal logic here
  };

  const NavLink = ({ href, icon, text }: { href: string; icon: React.ReactNode; text: string }) => (
    <li key={href}>
      <Link
        href={href}
        className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
          pathname === href
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }`}
      >
        {React.createElement(icon, { className: `${isCollapsed ? 'mx-auto' : 'mr-3'} text-xl` })}
        {!isCollapsed && <span>{text}</span>}
      </Link>
    </li>
  );

  const getSidebarContent = () => {
    const baseLinks = [
      { href: '/dashboard', icon: FiHome, label: 'Home' },
      { href: '/dashboard/activities', icon: FiCalendar, label: 'Activities' },
      { href: '/dashboard/concerns', icon: FiMessageSquare, label: 'Concerns' },
      { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
      { href: '/dashboard/wellness', icon: FiActivity, label: 'Wellness' },
    ];

    let finalLinks = [...baseLinks];

    // Add links for Department Heads
    if (departmentInfo?.headEmail === user?.email) {
      finalLinks.push({ href: '/dashboard/department-complaints', icon: FiBriefcase, label: 'Department Complaints' });
    }

    // Add links for Admins (they get everything)
    if (userRole === 'admin') {
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

    return uniqueLinks.map((link) => (
      <NavLink key={link.href} href={link.href} icon={link.icon} text={link.label} />
    ));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={onToggle}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white flex flex-col transition-all duration-300 z-40 ${
          isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'w-64'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          {!isCollapsed && <h1 className="text-xl font-bold">CampusWell</h1>}
          <button onClick={onToggle} className="text-white p-2 hidden md:block">
            {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">{getSidebarContent()}</nav>

        <div className="px-4 py-4 border-t border-gray-800">
          {user && (
            <div
              onClick={openProfileModal}
              className="flex items-center p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              {!isCollapsed && (
                <div className="ml-3">
                  <p className="font-semibold text-sm">{user.displayName}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar; 