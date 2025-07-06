'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiCalendar, FiUser } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ModeratorAnnouncements from '@/components/ModeratorAnnouncements';

export default function AnnouncementsPage() {
  const { user, loading: authLoading, isModerator, isAdmin, isDepartmentHead } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && user && !isModerator && !isAdmin && !isDepartmentHead) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isModerator, isAdmin, isDepartmentHead, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading announcements...</p>
        </div>
      </div>
    );
  }

  // Check for access based on roles
  if (!user || (!isModerator && !isAdmin && !isDepartmentHead)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <FiBell className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Access Denied</h3>
          <p className="text-gray-500">You need moderator, admin, or department head privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiBell className="text-blue-500 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Announcements
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Manage and create announcements for the campus community
          </p>
        </motion.div>
      </div>

      {/* Announcements Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ModeratorAnnouncements />
      </motion.div>
    </div>
  );
} 