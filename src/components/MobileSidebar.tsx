'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiHeart, FiActivity, FiBell, FiShield, FiFileText, FiGrid, FiUsers, FiUserCheck, FiUser, FiFeather } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileSidebar() {
  const { user, isAdmin, isModerator } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    if (path !== '/dashboard' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };

  const navigationItems = [
    { icon: <FiHome />, label: 'Home', path: '/dashboard', visible: true },
    { icon: <FiHeart />, label: 'Mind Wall', path: '/dashboard/mind-wall', visible: true },
    { icon: <FiActivity />, label: 'Wellness', path: '/dashboard/wellness', visible: true },
    { icon: <FiBell />, label: 'Announcements', path: '/dashboard/announcements', visible: true },
    { icon: <FiShield />, label: 'Anonymous Complaints', path: '/dashboard/anonymous-complaints', visible: true },
    { icon: <FiFileText />, label: 'Department Complaints', path: '/dashboard/department-complaints', visible: true },
    { icon: <FiGrid />, label: 'Manage Departments', path: '/dashboard/manage-departments', visible: isAdmin },
    { icon: <FiUsers />, label: 'Manage Moderators', path: '/dashboard/manage-moderators', visible: isAdmin },
    { icon: <FiUserCheck />, label: 'Manage Counselors', path: '/dashboard/manage-counselors', visible: isAdmin || isModerator },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-14 bg-bg-secondary border-r border-border-primary z-40 flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center justify-center px-2 border-b border-border-primary flex-shrink-0">
        <Link href="/dashboard" className="flex items-center justify-center">
          <FiFeather className="text-text-primary text-2xl" />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4 px-2 flex-grow">
        <ul className="space-y-1">
          {navigationItems.filter(item => item.visible).map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                title={item.label}
                className={`flex items-center justify-center py-2.5 rounded-xl transition-colors relative ${
                  isActive(item.path) 
                    ? 'text-accent-blue border-2 border-accent-blue'
                    : 'hover:bg-hover-bg text-text-secondary'
                }`}
              >
                <span className="text-xl">
                  {item.icon}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
