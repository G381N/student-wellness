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
  FiSettings,
  FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ProfileMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
    setIsOpen(false);
  };

  const handleDeleteProfile = () => {
    router.push('/profile/delete');
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Desktop Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 bg-gray-800 hover:bg-gray-700 rounded-xl px-3 py-2 transition-colors duration-200"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <FiUser className="text-gray-300 text-lg" />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-white">
            @{user.displayName || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-gray-400 truncate max-w-[120px]">
            {user.email}
          </p>
        </div>
        <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-700">
              <p className="text-sm font-medium text-white">
                {user.displayName || user.email?.split('@')[0]}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={handleEditProfile}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                <FiEdit2 className="text-lg" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
              >
                <FiSettings className="text-lg" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleDeleteProfile}
                className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-900 hover:bg-opacity-30 transition-colors duration-200"
              >
                <FiTrash2 className="text-lg" />
                <span>Delete Profile</span>
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-200"
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
} 