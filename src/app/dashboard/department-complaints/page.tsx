'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DepartmentComplaints from '@/components/DepartmentComplaints';
import { useTheme } from '@/contexts/ThemeContext';

export default function DepartmentComplaintsPage() {
  const { theme } = useTheme();
  const { user, loading: authLoading, isAdmin, isDepartmentHead } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirect if not authorized - now includes department heads
  useEffect(() => {
    if (!authLoading && user && !isAdmin && !isDepartmentHead) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isAdmin, isDepartmentHead, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-primary text-lg">Loading department complaints...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isDepartmentHead)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="text-center">
          <FiUsers className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-secondary mb-2">Access Denied</h3>
          <p className="text-text-tertiary">You need admin or department head privileges to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary ${theme}`}>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiUsers className="text-blue-500 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-text-primary">
              Department Complaints
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            Manage complaints related to specific departments
          </p>
        </motion.div>
      </div>

      {/* Department Complaints Component */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DepartmentComplaints />
      </motion.div>
    </div>
  );
} 