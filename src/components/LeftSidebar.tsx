'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiActivity, 
  FiAlertCircle, 
  FiHeart, 
  FiWind, 
  FiMessageSquare, 
  FiBell, 
  FiUser, 
  FiChevronRight,
  FiUsers,
  FiShield,
  FiPhone
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Navigation links configuration based on role
const getNavLinks = (isAdmin: boolean, isModerator: boolean, isDepartmentHead: boolean) => {
  // Base links for all users
  const baseLinks = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/activities', icon: FiActivity, label: 'Activities' },
    { href: '/dashboard/concerns', icon: FiAlertCircle, label: 'Concerns' },
    { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
    { href: '/dashboard/wellness', icon: FiWind, label: 'Wellness' },
    { href: '/dashboard/breathing', icon: FiWind, label: 'Breathing' },
  ];

  // Additional links for moderators and admins
  if (isAdmin || isModerator) {
    baseLinks.push({ href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' });
  }

  // Additional links for department heads
  if (isDepartmentHead) {
    baseLinks.push({ href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' });
    baseLinks.push({ href: '/dashboard/department-complaints', icon: FiMessageSquare, label: 'Department Complaints' });
  }

  // Additional links for admins only
  if (isAdmin) {
    baseLinks.push({ href: '/dashboard/anonymous-complaints', icon: FiMessageSquare, label: 'Anonymous Complaints' });
    baseLinks.push({ href: '/dashboard/department-complaints', icon: FiMessageSquare, label: 'Department Complaints' });
    baseLinks.push({ href: '/dashboard/manage-departments', icon: FiUsers, label: 'Manage Departments' });
    baseLinks.push({ href: '/dashboard/manage-moderators', icon: FiShield, label: 'Manage Mods' });
    baseLinks.push({ href: '/dashboard/manage-counselors', icon: FiPhone, label: 'Manage Counselors' });
  }

  return baseLinks;
};

export default function LeftSidebar({ isCollapsed, onToggle }: LeftSidebarProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [isDepartmentHead, setIsDepartmentHead] = useState(false);
  
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
      setIsDepartmentHead(false); // Default to false for now
    };
    
    if (user) {
      checkIfDepartmentHead();
    }
  }, [user]);

  // Get navigation links based on user role
  const navLinks = getNavLinks(isAdmin, isModerator, isDepartmentHead);

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
            className={`absolute ${isCollapsed ? 'right-1' : 'right-2'} top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-800 transition-colors ${isMobile ? 'bg-gray-800' : ''}`}
          >
            <FiChevronRight 
              className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'transform rotate-180'}`} 
            />
          </button>
        </div>
        
        {/* Navigation Links with Scrolling */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1 px-2 py-4">
            {navLinks.map((link) => {
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white" />
              </div>
              {!isCollapsed && (
                <span className="ml-3 text-gray-300">Profile</span>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
} 