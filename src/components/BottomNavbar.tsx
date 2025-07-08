'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMessageSquare, FiPlus, FiSettings, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNavbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/concerns', icon: FiMessageSquare, label: 'Concerns' },
    { href: '/create-post', icon: FiPlus, label: 'Create' },
    { href: '/settings', icon: FiSettings, label: 'Settings' },
    { href: '/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors">
              <item.icon className={`w-6 h-6 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 