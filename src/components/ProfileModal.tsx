'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUser, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const handleEditProfile = () => {
    router.push('/profile');
    onClose();
  };
  
  const handleLogout = async () => {
    await signOut();
    onClose();
  };
  
  const handleDeleteAccount = async () => {
    // In a real app, this would call an API to delete the user's account
    console.log('Delete account functionality would go here');
    // After successful deletion:
    await signOut();
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          className="bg-gray-900 w-full max-w-sm rounded-2xl border border-gray-800 overflow-hidden z-10"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-semibold text-white">Profile Options</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FiX className="text-gray-400" />
            </button>
          </div>
          
          {/* User Info */}
          {user && (
            <div className="p-4 flex items-center border-b border-gray-800">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <FiUser className="text-white text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-white font-medium">{user.displayName || user.email?.split('@')[0]}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
          )}
          
          {/* Options */}
          {!showDeleteConfirm ? (
            <div className="p-4">
              <button
                onClick={handleEditProfile}
                className="flex items-center w-full p-3 mb-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <FiUser className="text-blue-400 mr-3" />
                <span className="text-white">Edit Profile</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 mb-2 rounded-xl hover:bg-gray-800 transition-colors"
              >
                <FiLogOut className="text-blue-400 mr-3" />
                <span className="text-white">Logout</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center w-full p-3 rounded-xl hover:bg-red-900 hover:bg-opacity-30 transition-colors"
              >
                <FiTrash2 className="text-red-400 mr-3" />
                <span className="text-red-400">Delete Account</span>
              </button>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-white mb-4">Are you sure you want to delete your account? This action cannot be undone.</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
} 