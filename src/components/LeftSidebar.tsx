'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiActivity, FiAlertCircle, FiHeart, FiWind, FiMessageSquare, FiBell, FiUser, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Navigation links configuration
const navLinks = [
  { href: '/dashboard', icon: FiHome, label: 'Home' },
  { href: '/dashboard/activities', icon: FiActivity, label: 'Activities' },
  { href: '/dashboard/concerns', icon: FiAlertCircle, label: 'Concerns' },
  { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
  { href: '/dashboard/wellness', icon: FiWind, label: 'Wellness' },
  { href: '/dashboard/breathing', icon: FiWind, label: 'Breathing' },
  { href: '/dashboard/complaints', icon: FiMessageSquare, label: 'Complaints' },
  { href: '/dashboard/announcements', icon: FiBell, label: 'Announcements' },
];

export default function LeftSidebar({ isCollapsed, onToggle }: LeftSidebarProps) {
  const { user } = useAuth();
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
        } bg-gray-900 border-r border-gray-800 transition-all duration-300`}
        initial={false}
        animate={{ width: isCollapsed ? 64 : 256 }}
      >
        {/* Logo */}
        <div className="flex items-center px-4 h-16 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center">
            <div className="text-blue-500 text-2xl mr-2">💙</div>
            {!isCollapsed && <span className="text-white font-bold text-xl">CampusWell</span>}
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="mt-6">
          <ul className="space-y-2 px-2">
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
        
        {/* Profile Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          {user && (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <FiUser className="text-white" />
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Collapse/Expand Handle */}
        <div 
          className="absolute top-1/2 -right-3 w-6 h-24 flex items-center justify-center cursor-pointer bg-gray-800 rounded-r-md border-r border-t border-b border-gray-700 opacity-60 hover:opacity-100 transition-opacity"
          onClick={onToggle}
        >
          <FiChevronRight 
            className={`text-gray-400 transition-transform ${isCollapsed ? '' : 'transform rotate-180'}`} 
          />
        </div>
      </motion.div>
    </>
  );
} 