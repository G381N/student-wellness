'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUser, 
  FiEdit2, 
  FiTrash2, 
  FiLogOut, 
  FiBell, 
  FiSettings,
  FiChevronDown,
  FiPlus
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfileMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifications] = useState([]); // TODO: Implement notifications

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
      setIsOpen(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
    setIsOpen(false);
    setShowMobileMenu(false);
  };

  const handleDeleteProfile = () => {
    router.push('/profile/delete');
    setIsOpen(false);
    setShowMobileMenu(false);
  };

  if (!user) return null;

  // Desktop Profile Menu
  const DesktopMenu = () => (
    <div className="hidden md:flex items-center space-x-4" ref={menuRef}>
      {/* Notifications */}
      <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
        <FiBell className="text-xl" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 rounded-xl px-4 py-2 transition-colors duration-200"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
              <FiUser className="text-white text-lg" />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.displayName || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <FiChevronDown className={`text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-4 top-16 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <div className="py-2">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FiEdit2 className="text-lg" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FiSettings className="text-lg" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleDeleteProfile}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <FiTrash2 className="text-lg" />
                <span>Delete Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <FiLogOut className="text-lg" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Mobile Profile Menu (Floating Action Button)
  const MobileMenu = () => (
    <div className="md:hidden fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setShowMobileMenu(true)}
        className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
      >
        <FiPlus className="text-white text-xl" />
      </button>

      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowMobileMenu(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed bottom-20 left-4 w-64 bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <FiUser className="text-white text-xl" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user.displayName || user.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="py-2">
                <button
                  onClick={handleEditProfile}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FiEdit2 className="text-lg" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => {
                    router.push('/settings');
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FiSettings className="text-lg" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleDeleteProfile}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <FiTrash2 className="text-lg" />
                  <span>Delete Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <FiLogOut className="text-lg" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      <DesktopMenu />
      <MobileMenu />
    </>
  );
} 