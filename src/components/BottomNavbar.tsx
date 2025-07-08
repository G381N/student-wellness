'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiHeart, FiShield, FiBell, FiUser } from 'react-icons/fi';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: FiHome },
  { href: '/dashboard/mind-wall', label: 'Mind Wall', icon: FiHeart },
  { href: '/dashboard/wellness', label: 'Wellness', icon: FiShield },
  { href: '/dashboard/announcements', label: 'Announcements', icon: FiBell },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  const handleProfileClick = () => {
    // Dispatch a custom event to open the profile modal
    window.dispatchEvent(new CustomEvent('openProfileModal'));
  };

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-16 bg-gray-900 border-t border-gray-800 flex md:hidden items-center justify-around z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.label}>
            <div className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </div>
          </Link>
        );
      })}
      <button
        onClick={handleProfileClick}
        className={`flex flex-col items-center justify-center w-16 transition-colors duration-200 text-gray-400 hover:text-white`}
      >
        <FiUser className="w-6 h-6" />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </motion.div>
  );
} 