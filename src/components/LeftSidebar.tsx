import { useState } from 'react';
import Link from 'next/link';
import { FiHome, FiActivity, FiClock, FiUser, FiHeart, FiMessageSquare, FiShield, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

const navLinks = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Activities', href: '/activities', icon: FiActivity },
  { name: 'Concerns', href: '/concerns', icon: FiClock },
  { name: 'Mind Wall', href: '/mind-wall', icon: FiUser },
  { name: 'Wellness', href: '/wellness', icon: FiHeart },
  { name: 'Breathing', href: '/breathing', icon: FiActivity },
  { name: 'Anonymous Complaints', href: '/complaints', icon: FiMessageSquare },
  { name: 'Announcements', href: '/announcements', icon: FiShield },
];

export default function LeftSidebar({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (v: boolean) => void }) {
  const { user } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-40 transition-opacity md:hidden ${collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
        onClick={() => setCollapsed(true)}
      />
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'} md:static md:translate-x-0`}
      >
        <div>
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">CampusWell</span>
            </Link>
            <button className="md:hidden p-2 rounded-full hover:bg-gray-800" onClick={() => setCollapsed(true)}>
              <FiX className="text-white text-xl" />
            </button>
          </div>
          {/* Nav links */}
          <nav className="flex flex-col gap-1 mt-2 px-2">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white hover:bg-gray-800 transition-colors font-medium">
                <link.icon className="text-xl" />
                <span>{link.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        {/* Profile section */}
        <div className="p-4 border-t border-gray-800">
          <button
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-gray-800 transition-colors"
            onClick={() => setShowProfileModal(true)}
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-700">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                  <FiUser className="text-gray-300 text-xl" />
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-white truncate max-w-[100px]">
                @{user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-[100px]">{user?.email}</p>
            </div>
          </button>
          {/* Profile modal placeholder (reuse your existing modal logic) */}
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              {/* Insert your ProfileMenu modal here */}
              <div className="bg-gray-900 rounded-2xl p-6 w-80 shadow-2xl">
                <button className="absolute top-4 right-4 text-gray-400 hover:text-white" onClick={() => setShowProfileModal(false)}><FiX /></button>
                {/* Profile actions go here */}
                <p className="text-white text-lg font-bold mb-4">Profile Actions</p>
                {/* ... */}
              </div>
            </div>
          )}
        </div>
      </aside>
      {/* Floating open button for mobile */}
      {collapsed && (
        <button
          className="fixed left-4 top-4 z-50 p-2 bg-black/80 rounded-full shadow-lg md:hidden"
          onClick={() => setCollapsed(false)}
        >
          <FiMenu className="text-white text-2xl" />
        </button>
      )}
    </>
  );
} 