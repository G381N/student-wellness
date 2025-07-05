'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiHome, FiActivity, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi';
import ProfileMenu from './ProfileMenu';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-white font-bold text-xl">
            Student Wellness
          </Link>

          {/* Navigation Links */}
          {user && (
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiHome className="text-lg" />
                <span className="hidden sm:inline">Home</span>
              </Link>

              <Link
                href="/activities"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiActivity className="text-lg" />
                <span className="hidden sm:inline">Activities</span>
              </Link>

              <Link
                href="/concerns"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiMessageCircle className="text-lg" />
                <span className="hidden sm:inline">Concerns</span>
              </Link>

              <Link
                href="/complaints"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FiAlertTriangle className="text-lg" />
                <span className="hidden sm:inline">Complaints</span>
              </Link>
            </div>
          )}

          {/* Profile Menu */}
          <div className="flex items-center">
            {user ? (
              <ProfileMenu />
            ) : (
              <Link
                href="/login"
                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 