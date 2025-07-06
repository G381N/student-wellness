'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiCode, FiUser, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDepartments, addDepartment, updateDepartment, Department } from '@/lib/firebase-utils';

export default function ManageDepartmentsPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    headPhoneNumber: '',
    email: '',
    createdBy: '',
    isActive: true
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, authLoading, isAdmin, router]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchDepartments();
    }
  }, [user, isAdmin]);

  const handleAddDepartment = async () => {
    if (!user || !formData.code.trim() || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      const departmentData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        headPhoneNumber: formData.headPhoneNumber.trim(),
        email: formData.email.trim(),
        createdBy: user.displayName || user.email || 'Admin',
        isActive: formData.isActive,
        createdAt: new Date()
      };

      const newDepartmentId = await addDepartment(departmentData);
      
      // Add to local state
      const newDepartment: Department = {
        id: newDepartmentId,
        ...departmentData,
        createdAt: new Date()
      };
      
      setDepartments([newDepartment, ...departments]);
      setFormData({
        code: '',
        name: '',
        headPhoneNumber: '',
        email: '',
        createdBy: '',
        isActive: true
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding department:', error);
      alert('Failed to add department. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditDepartment = async () => {
    if (!editingDepartment || !formData.code.trim() || !formData.name.trim()) return;

    try {
      setSubmitting(true);
      const updateData = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        headPhoneNumber: formData.headPhoneNumber.trim(),
        email: formData.email.trim(),
        createdBy: formData.createdBy.trim(),
        isActive: formData.isActive
      };

      await updateDepartment(editingDepartment.id, updateData);
      
      // Update local state
      setDepartments(departments.map(dept => 
        dept.id === editingDepartment.id 
          ? { ...dept, ...updateData, updatedAt: new Date() }
          : dept
      ));
      
      setEditingDepartment(null);
      setFormData({
        code: '',
        name: '',
        headPhoneNumber: '',
        email: '',
        createdBy: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      code: department.code,
      name: department.name,
      headPhoneNumber: department.headPhoneNumber,
      email: department.email || '',
      createdBy: department.createdBy,
      isActive: department.isActive
    });
  };

  const cancelEdit = () => {
    setEditingDepartment(null);
    setFormData({
      code: '',
      name: '',
      headPhoneNumber: '',
      email: '',
      createdBy: '',
      isActive: true
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading departments...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <FiUsers className="text-gray-600 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">Access Denied</h3>
          <p className="text-gray-500">You need admin privileges to access this page</p>
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
          className="flex items-center justify-between"
        >
          <div className="flex items-center">
            <FiUsers className="text-blue-500 text-4xl mr-3" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Manage Departments
              </h1>
              <p className="text-gray-400 text-lg">
                Create and manage academic departments
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <FiPlus className="text-lg" />
            <span>Add Department</span>
          </button>
        </motion.div>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Add New Department</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <FiX className="text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department Code *
              </label>
              <div className="relative">
                <FiCode className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., MSC_AIML"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g., MSc Artificial Intelligence & Machine Learning"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Head Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  value={formData.headPhoneNumber}
                  onChange={(e) => setFormData({ ...formData, headPhoneNumber: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department Head Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="head@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Created By
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.createdBy}
                  onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Admin name"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                Active Department
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDepartment}
              disabled={submitting || !formData.code.trim() || !formData.name.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Add Department</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Departments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-4"
      >
        {departments.length > 0 ? (
          departments.map((department) => (
            <div
              key={department.id}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-700"
            >
              {editingDepartment?.id === department.id ? (
                // Edit Form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Department Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Department Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Head Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.headPhoneNumber}
                        onChange={(e) => setFormData({ ...formData, headPhoneNumber: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Department Head Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Created By
                      </label>
                      <input
                        type="text"
                        value={formData.createdBy}
                        onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id={`isActive-${department.id}`}
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={`isActive-${department.id}`} className="text-sm font-medium text-gray-300">
                        Active Department
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEditDepartment}
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave />
                          <span>Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full font-medium">
                          {department.code}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          department.isActive 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }`}>
                          {department.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {department.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <FiPhone className="text-blue-400" />
                        <span>{department.headPhoneNumber || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiMail className="text-blue-400" />
                        <span>{department.email || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiUser className="text-blue-400" />
                        <span>Created by: {department.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>Created: {new Date(department.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(department)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiEdit2 />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <FiUsers className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No departments yet</h3>
            <p className="text-gray-500 mb-6">Create your first department to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Add First Department
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
} 