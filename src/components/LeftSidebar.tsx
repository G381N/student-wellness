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
import { useAuth } from '@/contexts/AuthContext';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ isCollapsed, onToggle }) => {
  const { user, isAdmin, isDepartmentHead } = useAuth();
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

  // Check if user is a department head (in a real app, this would check against department data)
  useEffect(() => {
    // This is a placeholder - in a real implementation, you would check if the user's
    // email or phone matches with any department head in your database
    const checkIfDepartmentHead = async () => {
      // Example implementation:
      // const departmentData = await getDepartmentByUserEmail(user?.email);
      // setIsDepartmentHead(departmentData?.headEmail === user?.email);
      // setIsDepartmentHead(false); // Default to false for now
    };
    
    if (user) {
      checkIfDepartmentHead();
    }
  }, [user]);

  // Define all navigation links here
  let finalLinks = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/activities', icon: FiCalendar, label: 'Activities' },
    { href: '/dashboard/concerns', icon: FiMessageSquare, label: 'Concerns' },
    { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
    { href: '/dashboard/wellness', icon: FiActivity, label: 'Wellness' },
    { href: '/dashboard/anonymous-complaints', icon: FiShield, label: 'Anonymous Complaints' },
    { href: '/dashboard/department-complaints', icon: FiBriefcase, label: 'Department Complaints' },
  ];

  if (isAdmin) {
    finalLinks.push(
      { href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' },
      { href: '/dashboard/manage-departments', icon: FiHardDrive, label: 'Manage Departments' },
      { href: '/dashboard/manage-moderators', icon: FiUserCheck, label: 'Manage Moderators' },
      // { href: '/dashboard/manage-counselors', icon: FiUsers, label: 'Manage Counselors' } // We will add this next
    );
  } else if (isDepartmentHead) {
    // Department heads only see their specific links if not admin
    finalLinks = finalLinks.filter(link => 
        link.href === '/dashboard/department-complaints' || 
        link.href === '/dashboard/announcements'
    );
  }


  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    
      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col`}
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
      >
        {/* Header with Logo and Toggle */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-800 relative">
          {!isCollapsed && (
            <Link href="/dashboard" className="flex items-center">
              <div className="text-blue-500 text-2xl mr-2">💙</div>
              <span className="text-white font-bold text-xl">CampusWell</span>
            </Link>
          )}
          
          {/* Collapse/Expand Toggle Button */}
          <button
            onClick={onToggle}
            className={`absolute ${isCollapsed ? 'right-1' : 'right-2'} top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors z-10`}
          >
            <FiChevronRight className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        </div>
        
        {/* Navigation Links with Scrolling */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1 px-2 py-4">
            {finalLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <link.icon className={`${isCollapsed ? 'mx-auto' : 'mr-3'} text-xl`} />
                    {!isCollapsed && <span>{link.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Mobile-only Profile Button */}
        {isMobile && (
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={() => {
                // This will be handled in the LayoutShell component
                window.dispatchEvent(new CustomEvent('openProfileModal'));
              }}
              className="flex items-center w-full px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 text-gray-300">Profile</span>
                )}
              </div>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default LeftSidebar; 