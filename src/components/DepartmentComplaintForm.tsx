'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiClipboard, FiZap, FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { addDepartmentComplaint, getDepartments, Department } from '@/lib/firebase-utils';

export default function DepartmentComplaintForm() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    category: '',
    urgency: 'Medium', // Changed to urgency
    studentName: '',
    studentPhone: '',
    studentEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const fetchedDepartments = await getDepartments();
        setDepartments(fetchedDepartments);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments.');
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (formData.departmentId) {
      const dept = departments.find(d => d.id === formData.departmentId);
      setSelectedDepartment(dept || null);
    } else {
      setSelectedDepartment(null);
    }
  }, [formData.departmentId, departments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) {
      setError('Please select a department.');
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
        departmentCode: selectedDepartment.code, // Ensure departmentCode is sent
        category: formData.category,
        urgency: formData.urgency as 'Low' | 'Medium' | 'High' | 'Critical', // Changed to urgency
        studentName: formData.studentName.trim(),
        studentPhone: formData.studentPhone.trim(),
        studentEmail: formData.studentEmail.trim() || '',
        studentId: '', // Will be populated by the backend if needed, or by auth.currentUser.uid
        status: 'submitted', // Changed default status to 'submitted'
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
        urgency: 'Medium', // Changed to urgency
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

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Submit a Department Complaint</h1>
          <p className="text-gray-400">Your feedback helps us improve.</p>
        </div>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-900/20 border border-green-700 rounded-lg p-6 text-center shadow-lg"
            >
              <FiCheckCircle className="text-green-400 text-5xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Complaint Submitted!</h2>
              <p className="text-green-200 mb-4">Thank you for your feedback. We will review your complaint shortly.</p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
              >
                Submit Another Complaint
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700"
            >
              {error && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-medium text-white mb-2">
                    <FiBriefcase className="inline mr-2" />
                    Department *
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
                    required
                  >
                    <option value="">Select a Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                    <FiClipboard className="inline mr-2" />
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
                    required
                  >
                    <option value="">Select a Category</option>
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    <FiZap className="inline mr-2" /> {/* Assuming FiZap for urgency, adjust as needed */}
                    Urgency * {/* Changed label to Urgency */}
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-white"
                    required
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Short summary of the complaint"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Provide a detailed description of your complaint..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                  required
                ></textarea>
              </div>

              <fieldset className="mb-4 p-4 border border-gray-700 rounded-lg">
                <legend className="text-lg font-semibold text-white px-2">Your Details</legend>
                <p className="text-sm text-gray-400 mb-4">Providing your details helps us follow up with you regarding your complaint.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="studentName" className="block text-sm font-medium text-white mb-2">
                      <FiUser className="inline mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="studentName"
                      name="studentName"
                      value={formData.studentName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="studentEmail" className="block text-sm font-medium text-white mb-2">
                      <FiMail className="inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="studentEmail"
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="studentPhone" className="block text-sm font-medium text-white mb-2">
                      <FiPhone className="inline mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="studentPhone"
                      name="studentPhone"
                      value={formData.studentPhone}
                      onChange={handleInputChange}
                      placeholder="+91 12345 67890"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Complaint
                    <FiCheckCircle />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 