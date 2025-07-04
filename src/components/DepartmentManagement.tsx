'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiPlus, FiEdit, FiTrash2, FiPhone, FiUser, FiCode, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import { 
  getDepartments, 
  addDepartment, 
  updateDepartment,
  Department
} from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { serverTimestamp } from 'firebase/firestore';

const DepartmentManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    headPhoneNumber: '',
    createdBy: user?.displayName || user?.email || 'Admin',
    isActive: true
  });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim() || !formData.headPhoneNumber.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if department code already exists (when adding new)
    if (!editingDepartment) {
      const existingDept = departments.find((dept: Department) => 
        dept.code.toLowerCase() === formData.code.toLowerCase()
      );
      
      if (existingDept) {
        setError('Department code already exists');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      if (editingDepartment) {
        const updateData = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          headPhoneNumber: formData.headPhoneNumber.trim(),
          createdBy: formData.createdBy,
          isActive: formData.isActive,
          updatedAt: serverTimestamp()
        };
        
        await updateDepartment(editingDepartment.id, updateData);
        setSuccess('Department updated successfully');
      } else {
      const departmentData = {
          code: formData.code.trim(),
          name: formData.name.trim(),
          headPhoneNumber: formData.headPhoneNumber.trim(),
          createdBy: formData.createdBy,
        isActive: formData.isActive,
          createdAt: serverTimestamp()
      };
        
        await addDepartment(departmentData);
        setSuccess('Department added successfully');
      }
      
      setFormData({
        code: '',
        name: '',
        headPhoneNumber: '',
        createdBy: user?.displayName || user?.email || 'Admin',
        isActive: true
      });
      setShowAddForm(false);
      setEditingDepartment(null);
      
      // Refresh the list
      await fetchDepartments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      headPhoneNumber: department.headPhoneNumber,
      createdBy: department.createdBy,
      isActive: department.isActive
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (departmentId: string, currentStatus: boolean) => {
    try {
      await updateDepartment(departmentId, { 
        isActive: !currentStatus,
        updatedAt: serverTimestamp()
      });
      setSuccess(`Department ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      await fetchDepartments();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to update department status');
    }
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
          <p className="text-gray-400">Only administrators can manage departments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiBriefcase className="text-2xl text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Department Management</h1>
            </div>
          <button
              onClick={() => {
                setShowAddForm(true);
                setEditingDepartment(null);
                setFormData({
                  code: '',
                  name: '',
                  headPhoneNumber: '',
                  createdBy: user?.displayName || user?.email || 'Admin',
                  isActive: true
                });
              }}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
          >
              <FiPlus className="text-sm" />
            Add Department
          </button>
        </div>
          <p className="text-sm sm:text-base text-gray-400">
            Manage departments and their information for the complaints system.
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

        {/* Add/Edit Department Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {editingDepartment ? 'Edit Department' : 'Add New Department'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDepartment(null);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FiCode className="inline mr-2" />
                      Department Code *
                </label>
                <input
                  type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="e.g., MSC_AIML"
                      required
                      disabled={!!editingDepartment}
                    />
                    {editingDepartment && (
                      <p className="text-xs text-gray-500 mt-1">Department code cannot be changed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <FiPhone className="inline mr-2" />
                      Head Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.headPhoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, headPhoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      placeholder="+91XXXXXXXXXX"
                  required
                />
                  </div>
              </div>

              <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiBriefcase className="inline mr-2" />
                    Department Name *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Full department name with program detail"
                  required
                />
              </div>

              <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiUser className="inline mr-2" />
                    Created By
                </label>
                <input
                    type="text"
                    value={formData.createdBy}
                    onChange={(e) => setFormData(prev => ({ ...prev, createdBy: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Admin or faculty name"
                    required
                />
              </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm text-white">Active Department</label>
              </div>

                <div className="flex gap-2">
                <button
                  type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : editingDepartment ? 'Update Department' : 'Add Department'}
                </button>
                <button
                  type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingDepartment(null);
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
            </motion.div>
      )}
        </AnimatePresence>

      {/* Departments List */}
        {departments.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FiBriefcase className="mx-auto text-4xl sm:text-6xl text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Departments</h3>
            <p className="text-sm sm:text-base text-gray-400">
              Start by adding your first department to the system.
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
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiPhone className="text-xs" />
                        <span>Head Phone: {department.headPhoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiUser className="text-xs" />
                        <span>Created by: {department.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Created: {formatTimestamp(department.createdAt)}</span>
                      </div>
        </div>
      </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FiEdit className="text-sm" />
                    </button>
                      <button
                      onClick={() => handleToggleActive(department.id, department.isActive)}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                        department.isActive 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                      >
                      {department.isActive ? 'Deactivate' : 'Activate'}
                      </button>
        </div>
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
            <div className="text-2xl font-bold text-red-400">
              {departments.filter((d: Department) => !d.isActive).length}
            </div>
            <div className="text-sm text-gray-400">Inactive Departments</div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManagement; 
 