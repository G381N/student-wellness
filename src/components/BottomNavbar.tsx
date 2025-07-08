'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMessageSquare, FiPlus, FiSettings, FiUser, FiHeart } from 'react-icons/fi';

export default function BottomNavbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FiHome, label: 'Home' },
    { href: '/dashboard/mind-wall', icon: FiHeart, label: 'Mind Wall' },
    { href: '/create-post', icon: FiPlus, label: 'Create' },
    { href: '/dashboard/wellness', icon: FiSettings, label: 'Wellness' },
    { href: '/profile', icon: FiUser, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.label} className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors w-full h-full">
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
} 