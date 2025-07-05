'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiActivity, 
  FiClock, 
  FiUser, 
  FiHeart, 
  FiMessageSquare, 
  FiShield,
  FiMenu,
  FiX,
  FiWind
} from 'react-icons/fi';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navLinks = [
  { name: 'Home', href: '/dashboard', icon: FiHome },
  { name: 'Activities', href: '/dashboard/activities', icon: FiActivity },
  { name: 'Concerns', href: '/dashboard/concerns', icon: FiClock },
  { name: 'Mind Wall', href: '/dashboard/mind-wall', icon: FiUser },
  { name: 'Wellness', href: '/dashboard/wellness', icon: FiHeart },
  { name: 'Breathing', href: '/dashboard/breathing', icon: FiWind },
  { name: 'Complaints', href: '/dashboard/complaints', icon: FiMessageSquare },
  { name: 'Announcements', href: '/dashboard/announcements', icon: FiShield },
];

export default function LeftSidebar({ isCollapsed, onToggle }: LeftSidebarProps) {
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

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    closed: {
      x: isMobile ? -280 : -200,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? "closed" : "open"}
        className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 z-50 flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <FiHeart className="text-blue-500 text-2xl" />
              <span className="text-xl font-bold text-white">CampusWell</span>
            </Link>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors md:hidden"
            >
              <FiX className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => isMobile && onToggle()}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className={`text-xl ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="font-medium">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2024 CampusWell</p>
            <p>Mental Health & Community</p>
          </div>
        </div>
      </motion.div>

      {/* Toggle Button for Desktop */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className={`fixed top-4 z-50 p-2 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all duration-200 ${
            isCollapsed ? 'left-4' : 'left-72'
          }`}
        >
          <FiMenu className="text-white text-xl" />
        </button>
      )}
    </>
  );
} 