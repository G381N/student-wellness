'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FiHome, 
  FiMessageSquare, 
  FiUsers, 
  FiShield, 
  FiSettings, 
  FiLogOut, 
  FiMenu,
  FiX,
  FiUser,
  FiHeart,
  FiFlag,
  FiFileText,
  FiUserCheck
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LeftSidebarProps {
  children: React.ReactNode;
}

export default function LeftSidebar({ children }: LeftSidebarProps) {
  const { user, isAdmin, signOut, isDepartmentHead } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
      { icon: FiMessageSquare, label: 'Discussion Hub', href: '/discussion-hub' },
      { icon: FiHeart, label: 'Mind Wall', href: '/mind-wall' },
    ];

    if (isAdmin) {
      return [
        ...baseItems,
        { icon: FiFlag, label: 'Manage Complaints', href: '/complaints-hub' },
        { icon: FiUsers, label: 'Manage Counselors', href: '/dashboard/manage-counselors' },
        { icon: FiShield, label: 'Manage Moderators', href: '/dashboard/manage-moderators' },
        { icon: FiFileText, label: 'Manage Departments', href: '/dashboard/manage-departments' },
        { icon: FiSettings, label: 'Settings', href: '/settings' },
      ];
    } else if (isDepartmentHead) {
      return [
        ...baseItems,
        { icon: FiFlag, label: 'Department Complaints', href: '/department-complaints' },
        { icon: FiUsers, label: 'Manage Counselors', href: '/dashboard/manage-counselors' },
        { icon: FiSettings, label: 'Settings', href: '/settings' },
      ];
    } else {
      return [
        ...baseItems,
        { icon: FiSettings, label: 'Settings', href: '/settings' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">CampusWell</h2>
            <p className="text-sm text-gray-400 mt-1">Student Wellness Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white" size={20} />
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
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <main className="flex-1 p-4 md:p-6 pt-16 md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
} 