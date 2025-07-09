'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiClipboard, FiZap, FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { addDepartmentComplaint, getDepartments, Department } from '@/lib/firebase-utils';

export default function DepartmentComplaintForm() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    category: '',
    urgency: 'Medium',
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
        departmentCode: selectedDepartment.code,
        category: formData.category,
        urgency: formData.urgency as 'Low' | 'Medium' | 'High' | 'Critical',
        studentName: formData.studentName.trim(),
        studentPhone: formData.studentPhone.trim(),
        studentEmail: formData.studentEmail.trim() || '',
        studentId: '',
        status: 'submitted',
        isResolved: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const commonInputClass = "w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-center"
          >
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-white text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Complaint Submitted!</h2>
            <p className="text-gray-400 mb-6">Thank you for your feedback. We will review your complaint shortly.</p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  title: '',
                  description: '',
                  departmentId: '',
                  category: '',
                  urgency: 'Medium',
                  studentName: '',
                  studentPhone: '',
                  studentEmail: ''
                });
              }}
              className="bg-white hover:bg-gray-300 text-black font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Submit Another Complaint
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Department Complaint</h1>
              <p className="text-gray-400">Your feedback helps us improve our services.</p>
            </div>
            
            {error && (
              <div className="bg-gray-800 border border-gray-600 text-gray-300 p-4 rounded-lg flex items-center gap-3">
                <FiXCircle className="text-gray-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Complaint Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select id="departmentId" name="departmentId" value={formData.departmentId} onChange={handleInputChange} className={commonInputClass} required >
                  <option value="">Select Department*</option>
                  {departments.map(dept => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                </select>
                <select id="category" name="category" value={formData.category} onChange={handleInputChange} className={commonInputClass} required >
                    <option value="">Select Category*</option>
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select name="urgency" value={formData.urgency} onChange={handleInputChange} className={commonInputClass} required >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                </select>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Title*" className={commonInputClass} required />
              </div>
              <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe your complaint in detail...*" className={commonInputClass} required ></textarea>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mb-4">Your Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" id="studentName" name="studentName" value={formData.studentName} onChange={handleInputChange} placeholder="Full Name*" className={commonInputClass} required />
                <input type="email" id="studentEmail" name="studentEmail" value={formData.studentEmail} onChange={handleInputChange} placeholder="Email Address" className={commonInputClass} />
                <input type="tel" id="studentPhone" name="studentPhone" value={formData.studentPhone} onChange={handleInputChange} placeholder="Phone Number*" className={commonInputClass} required />
              </div>
            </div>

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full max-w-xs bg-white text-black font-bold py-3 px-6 rounded-lg transition-colors hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : 'Submit Complaint'}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
} 