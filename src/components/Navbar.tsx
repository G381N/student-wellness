'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiHome, FiActivity, FiClock, FiUser, FiHeart, FiMessageSquare, FiShield } from 'react-icons/fi';
import ProfileMenu from './ProfileMenu';

interface User {
  email: string | null;
  displayName: string | null;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black border-r border-gray-800 p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mb-8">
          <FiHeart className="text-white text-2xl" />
          <span className="text-xl font-bold text-white">CampusWell</span>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-2">
          <Link href="/" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiHome className="text-xl" />
            <span>Home</span>
          </Link>
          <Link href="/activities" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiActivity className="text-xl" />
            <span>Activities</span>
          </Link>
          <Link href="/concerns" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiClock className="text-xl" />
            <span>Concerns</span>
          </Link>
          <Link href="/mind-wall" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiUser className="text-xl" />
            <span>Mind Wall</span>
          </Link>
          <Link href="/wellness" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiHeart className="text-xl" />
            <span>Wellness</span>
          </Link>
          <Link href="/breathing" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiActivity className="text-xl" />
            <span>Breathing</span>
          </Link>
          <Link href="/complaints" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiMessageSquare className="text-xl" />
            <span>Anonymous Complaints</span>
          </Link>
          <Link href="/announcements" className="flex items-center space-x-3 text-white hover:bg-gray-800 px-4 py-3 rounded-xl transition-colors">
            <FiShield className="text-xl" />
            <span>Announcements</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-black border-b border-gray-800 px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-full bg-white bg-opacity-10 text-white placeholder-gray-400 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Profile Menu */}
            {!loading && user && (
              <div className="ml-4">
                <ProfileMenu />
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4">
          {/* Content will be rendered here */}
        </div>
      </div>
    </div>
  );
} 