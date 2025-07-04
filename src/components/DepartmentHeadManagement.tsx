'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPhone, FiEdit, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { 
  getDepartments, 
  updateDepartment,
  Department
} from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { serverTimestamp } from 'firebase/firestore';

const DepartmentHeadManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchDepartments();
    }
  }, [isAdmin]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const departmentData = await getDepartments();
      setDepartments(departmentData);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = (department: Department) => {
    setEditingDepartment(department);
    setPhoneNumber(department.headPhoneNumber);
  };

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!editingDepartment) {
      setError('No department selected');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await updateDepartment(editingDepartment.id, {
        headPhoneNumber: phoneNumber.trim(),
        updatedAt: serverTimestamp()
      });
      
      setSuccess('Department head phone number updated successfully');
      setEditingDepartment(null);
      setPhoneNumber('');
      
      // Refresh the list
      await fetchDepartments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update phone number');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditingDepartment(null);
    setPhoneNumber('');
    setError('');
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = typeof timestamp.toDate === 'function' 
        ? timestamp.toDate() 
        : new Date(timestamp);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto text-6xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only administrators can manage department heads.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FiUser className="text-2xl text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Department Head Management</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            Manage department head contact information for the complaints system.
          </p>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-900/20 border border-green-700 rounded-lg flex items-center gap-2"
            >
              <FiCheck className="text-green-400" />
              <span className="text-green-300">{success}</span>
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2"
            >
              <FiAlertTriangle className="text-red-400" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Departments List */}
        {departments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FiUser className="mx-auto text-4xl sm:text-6xl text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Departments</h3>
            <p className="text-sm sm:text-base text-gray-400">
              No departments found. Please add departments first.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {departments.map((department) => (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white">{department.name}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                        {department.code}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        department.isActive 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {editingDepartment?.id === department.id ? (
                        <form onSubmit={handleUpdatePhone} className="space-y-3">
                      <div className="flex items-center gap-2">
                            <FiPhone className="text-blue-400" />
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                              placeholder="+91XXXXXXXXXX"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                            >
                              {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Cancel
                            </button>
                      </div>
                        </form>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FiPhone className="text-xs" />
                          <span>Head Phone: {department.headPhoneNumber}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiUser className="text-xs" />
                        <span>Created by: {department.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Created: {formatTimestamp(department.createdAt)}</span>
                      </div>
                      {department.updatedAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>Updated: {formatTimestamp(department.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {editingDepartment?.id !== department.id && (
                    <div className="flex gap-2">
                    <button
                        onClick={() => handleEditPhone(department)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                        <FiEdit className="text-sm" />
                    </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{departments.length}</div>
            <div className="text-sm text-gray-400">Total Departments</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {departments.filter((d: Department) => d.isActive).length}
            </div>
            <div className="text-sm text-gray-400">Active Departments</div>
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {departments.filter((d: Department) => d.headPhoneNumber.trim() !== '').length}
            </div>
            <div className="text-sm text-gray-400">With Phone Numbers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadManagement; 