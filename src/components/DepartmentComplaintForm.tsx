'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiCheck, FiBriefcase, FiUser, FiPhone, FiMail, FiFileText, FiAlertTriangle } from 'react-icons/fi';
import { addDepartmentComplaint, getDepartments, Department } from '@/lib/firebase-utils';

const CATEGORIES = [
  'Academic Issues',
  'Faculty Concerns',
  'Infrastructure Problems',
  'Administrative Issues',
  'Harassment/Discrimination',
  'Safety Concerns',
  'Fee/Financial Issues',
  'Examination Problems',
  'Hostel Issues',
  'Transport Issues',
  'Library Issues',
  'Canteen/Food Issues',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'Low', label: 'Low Priority', color: 'text-green-400' },
  { value: 'Medium', label: 'Medium Priority', color: 'text-yellow-400' },
  { value: 'High', label: 'High Priority', color: 'text-orange-400' },
  { value: 'Critical', label: 'Urgent/Critical', color: 'text-red-400' }
];

export default function DepartmentComplaintForm() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    category: '',
    severity: 'Medium',
    studentName: '',
    studentPhone: '',
    studentEmail: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const departmentData = await getDepartments();
      // Filter only active departments
      const activeDepartments = departmentData.filter(dept => dept.isActive);
      setDepartments(activeDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to load departments. Please refresh the page.');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.departmentId || !formData.category) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.studentName.trim() || !formData.studentPhone.trim()) {
      setError('Student name and phone number are required for department complaints');
      return;
    }

    const selectedDepartment = departments.find(dept => dept.id === formData.departmentId);
    if (!selectedDepartment) {
      setError('Please select a valid department');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      await addDepartmentComplaint({
        title: formData.title.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId,
        department: selectedDepartment.name,
        category: formData.category,
        severity: formData.severity as 'Low' | 'Medium' | 'High' | 'Critical',
        studentName: formData.studentName.trim(),
        studentPhone: formData.studentPhone.trim(),
        studentEmail: formData.studentEmail.trim() || undefined,
        studentId: '', // Will be populated by the backend
        status: 'Pending',
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setIsSubmitted(true);
      setFormData({
        title: '',
        description: '',
        departmentId: '',
        category: '',
        severity: 'Medium',
        studentName: '',
        studentPhone: '',
        studentEmail: ''
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-black text-white flex items-center justify-center p-4"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FiCheck className="text-white text-2xl" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Complaint Submitted</h2>
          <p className="text-gray-400 mb-6">
            Your department complaint has been successfully submitted. The relevant department head will be notified and will review your complaint shortly.
          </p>
          
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Submit Another Complaint
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiBriefcase className="text-3xl text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Department Complaint</h1>
          </div>
          <p className="text-gray-400">
            Submit a complaint directly to a specific department. Your information will be shared with the department head for proper resolution.
          </p>
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <p className="text-blue-300 text-sm">
              <FiUser className="inline mr-2" />
              <strong>Note:</strong> This form requires your contact information as complaints will be forwarded to the respective department head for direct resolution.
            </p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2"
            >
              <FiAlertTriangle className="text-red-400" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FiUser className="inline mr-2" />
                Student Name *
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <FiPhone className="inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                name="studentPhone"
                value={formData.studentPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FiMail className="inline mr-2" />
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="studentEmail"
              value={formData.studentEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FiBriefcase className="inline mr-2" />
              Department *
            </label>
            {loadingDepartments ? (
              <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-gray-400 flex items-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Loading departments...
              </div>
            ) : (
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FiFileText className="inline mr-2" />
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FiAlertTriangle className="inline mr-2" />
              Priority Level
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {SEVERITY_LEVELS.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.severity === level.value
                      ? 'border-white bg-gray-800'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className={`text-sm font-medium ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Complaint Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white"
              placeholder="Brief title for your complaint"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white resize-none"
              placeholder="Provide detailed information about your complaint..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loadingDepartments}
            className="w-full px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend className="text-sm" />
                Submit Complaint
              </>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
} 