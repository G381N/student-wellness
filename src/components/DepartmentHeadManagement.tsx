'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiPlus, FiTrash2, FiMail, FiBriefcase, FiCheck, FiX, FiAlertTriangle, FiPhone } from 'react-icons/fi';
import { addDepartmentHead, getDepartmentHeads, removeDepartmentHead, getDepartments, DepartmentHead, Department } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentHeadManagement() {
  const { isAdmin } = useAuth();
  const [departmentHeads, setDepartmentHeads] = useState<DepartmentHead[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    departmentId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [heads, depts] = await Promise.all([
        getDepartmentHeads(),
        getDepartments()
      ]);
      setDepartmentHeads(heads);
      setDepartments(depts);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartmentHead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.name.trim() || !formData.departmentId) {
      setError('Please fill in all required fields');
      return;
    }

    // Check if department already has a head
    const existingHead = departmentHeads.find(head => 
      head.departmentId === formData.departmentId && head.isActive
    );
    
    if (existingHead) {
      const deptName = departments.find(d => d.id === formData.departmentId)?.name;
      setError(`${deptName} already has an active department head`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      const headData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        departmentId: formData.departmentId,
        isActive: true,
        createdAt: new Date()
      };
      
      await addDepartmentHead(headData);
      
      setSuccess('Department head added successfully');
      setFormData({ name: '', email: '', phoneNumber: '', departmentId: '' });
      setShowAddForm(false);
      
      // Refresh the list
      await fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to add department head');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveDepartmentHead = async (headId: string, name: string, departmentName: string) => {
    if (!confirm(`Are you sure you want to remove ${name} as department head for ${departmentName}?`)) {
      return;
    }

    try {
      await removeDepartmentHead(headId);
      setSuccess('Department head removed successfully');
      
      // Refresh the list
      await fetchData();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Failed to remove department head');
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

  const getDepartmentName = (departmentId: string) => {
    return departments.find(dept => dept.id === departmentId)?.name || 'Unknown Department';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading department heads...</p>
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FiBriefcase className="text-2xl text-blue-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Department Head Management</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm sm:text-base"
            >
              <FiPlus className="text-sm" />
              Add Department Head
            </button>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            Manage department heads who can review and respond to department-specific complaints.
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

        {/* Add Department Head Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Add New Department Head</h3>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', email: '', phoneNumber: '', departmentId: '' });
                    setError('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handleAddDepartmentHead} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiUser className="inline mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiMail className="inline mr-2" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiPhone className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiBriefcase className="inline mr-2" />
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.filter(dept => dept.isActive).map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <FiPlus className="text-sm" />
                        Add Department Head
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: '', email: '', phoneNumber: '', departmentId: '' });
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Department Heads List */}
        {departmentHeads.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FiBriefcase className="mx-auto text-4xl sm:text-6xl text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Department Heads</h3>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              No department heads have been assigned yet. Add some to get started.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
            >
              <FiPlus className="text-sm" />
              Add First Department Head
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {departmentHeads.map((head) => (
              <motion.div
                key={head.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <FiUser className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-white">{head.name}</h3>
                        <p className="text-sm text-blue-400">{getDepartmentName(head.departmentId)}</p>
                      </div>
                    </div>
                    
                    <div className="ml-15 space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-xs" />
                        <span>{head.email}</span>
                      </div>
                      {head.phoneNumber && (
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-xs" />
                          <span>{head.phoneNumber}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs">
                        <span>Added: {formatTimestamp(head.createdAt)}</span>
                        <span>Status: <span className={head.isActive ? 'text-green-400' : 'text-red-400'}>
                          {head.isActive ? 'Active' : 'Inactive'}
                        </span></span>
                      </div>
                    </div>
                  </div>
                  
                  {head.isActive && (
                    <button
                      onClick={() => handleRemoveDepartmentHead(head.id, head.name, getDepartmentName(head.departmentId))}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FiTrash2 className="text-sm" />
                      Remove
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 