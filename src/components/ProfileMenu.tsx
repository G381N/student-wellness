'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FiUser, FiEdit2, FiLogOut, FiTrash2 } from 'react-icons/fi';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileMenu() {
  const { user, logout, isAdmin, isModerator } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-800 border border-gray-700">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt="Profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiUser className="text-gray-400 text-xl" />
            </div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-700">
              <p className="text-white font-medium truncate">
                {user?.displayName || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
              {(isAdmin || isModerator) && (
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500 text-white">
                  {isAdmin ? 'Admin' : 'Moderator'}
                </span>
              )}
            </div>
            
            <div className="p-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add edit profile functionality
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiEdit2 className="text-gray-400" />
                <span>Edit Profile</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Add delete profile functionality
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-gray-400" />
                <span>Delete Profile</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiLogOut className="text-gray-400" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 