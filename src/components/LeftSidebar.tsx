'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiMessageSquare, 
  FiUsers, 
  FiShield, 
  FiSettings, 
  FiMenu,
  FiChevronRight,
  FiUser,
  FiHeart,
  FiFlag,
  FiFileText,
  FiUserCheck,
  FiCalendar,
  FiActivity,
  FiBell,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function LeftSidebar({ isCollapsed, onToggle }: LeftSidebarProps) {
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

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { href: '/dashboard', icon: FiHome, label: 'Dashboard' },
      { href: '/discussion-hub', icon: FiMessageSquare, label: 'Discussion Hub' },
      { href: '/mind-wall', icon: FiHeart, label: 'Mind Wall' },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' },
        { href: '/complaints-hub', icon: FiFlag, label: 'Manage Complaints' },
        { href: '/dashboard/manage-counselors', icon: FiUsers, label: 'Manage Counselors' },
        { href: '/dashboard/manage-moderators', icon: FiShield, label: 'Manage Moderators' },
        { href: '/dashboard/manage-departments', icon: FiFileText, label: 'Manage Departments' },
        { href: '/settings', icon: FiSettings, label: 'Settings' },
      ];
    } else if (isDepartmentHead) {
      return [
        ...baseItems,
        { href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' },
        { href: '/dashboard/department-complaints', icon: FiFlag, label: 'Department Complaints' },
        { href: '/dashboard/manage-counselors', icon: FiUsers, label: 'Manage Counselors' },
        { href: '/settings', icon: FiSettings, label: 'Settings' },
      ];
    } else {
      return [
        ...baseItems,
        { href: '/dashboard/activities', icon: FiCalendar, label: 'Activities' },
        { href: '/dashboard/concerns', icon: FiAlertCircle, label: 'Concerns' },
        { href: '/dashboard/wellness', icon: FiActivity, label: 'Wellness' },
        { href: '/settings', icon: FiSettings, label: 'Settings' },
      ];
    }
  };

  const navItems = getNavItems();

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
      <div
        className={`fixed top-0 left-0 h-full z-40 ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-gray-900 border-r border-gray-800 transition-all duration-300 flex flex-col ${
          isMobile && isCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}
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
            {navItems.map((link) => {
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

        {/* Mobile-only Profile Section */}
        {isMobile && !isCollapsed && (
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FiUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {user?.displayName || user?.email || 'User'}
                </p>
                <p className="text-gray-400 text-xs">
                  {isAdmin ? 'Administrator' : isDepartmentHead ? 'Department Head' : 'Student'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 