'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiUser, FiX, FiCheck, FiEye, FiBriefcase } from 'react-icons/fi';
import { getDepartmentComplaints, getDepartmentComplaintsByDepartment, updateDepartmentComplaintStatus, DepartmentComplaint, checkDepartmentHeadStatus, Department } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentComplaints() {
  const { user, isAdmin, isDepartmentHead } = useAuth();
  const [complaints, setComplaints] = useState<DepartmentComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<DepartmentComplaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState<Department | null>(null);
  const [error, setError] = useState<string | null>(null);

  // First, check department head status if needed
  useEffect(() => {
    console.log('--- Initial useEffect Triggered ---');
    console.log(`User: ${user?.email}, Admin: ${isAdmin}, DeptHead: ${isDepartmentHead}`);

    if (!user) {
      console.log('User not authenticated. Stopping.');
      setLoading(false);
      return;
    }

    // For department heads, we need to get their department first
    if (isDepartmentHead && user.email) {
      console.log('User is Department Head. Checking department status...');
      checkDepartmentHeadStatus(user.email)
        .then(({ department }) => {
          if (department && department.name) {
            console.log(`Department found: ${department.name}`);
            setDepartmentInfo(department);
          } else {
            console.log('Department Head status checked, but no department name found.');
            setError('You are a department head, but your department could not be identified.');
            setLoading(false);
          }
        })
        .catch(err => {
          console.error('Error in checkDepartmentHeadStatus:', err);
          setError('An error occurred while verifying your department.');
          setLoading(false);
        });
    }
  }, [user, isDepartmentHead]);

  // Then fetch complaints based on role and department info
  useEffect(() => {
    console.log('--- Fetch Complaints useEffect Triggered ---');
    
    if (!user) return;
    
    if (isAdmin) {
      console.log('User is Admin. Fetching all complaints.');
      fetchComplaints(null);
    } else if (isDepartmentHead && departmentInfo?.name) {
      console.log(`Department info available. Fetching complaints for: ${departmentInfo.name}`);
      fetchComplaints(departmentInfo.name);
    }
  }, [user, isAdmin, isDepartmentHead, departmentInfo]);

  const fetchComplaints = async (departmentName: string | null) => {
    console.log(`--- fetchComplaints called with departmentName: ${departmentName} ---`);
    setLoading(true);
    setError(null);
    try {
      let fetchedData: DepartmentComplaint[] = [];
      if (departmentName) {
        console.log(`Fetching complaints for department: ${departmentName}`);
        fetchedData = await getDepartmentComplaintsByDepartment(departmentName);
      } else if (isAdmin) {
        console.log('Fetching all department complaints as admin');
        fetchedData = await getDepartmentComplaints();
      }
      console.log(`Fetched ${fetchedData.length} complaints.`);
      setComplaints(fetchedData);
    } catch (err) {
      console.error('Error in fetchComplaints:', err);
      setError('Failed to fetch complaints.');
      setComplaints([]);
    } finally {
      setLoading(false);
      console.log('--- fetchComplaints finished ---');
    }
  };

  // ... rest of the component remains the same
  const handleUpdateStatus = async (status: 'submitted' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed') => {
    if (!selectedComplaint || !selectedComplaint.id) return;

    try {
      setUpdating(true);
      const resolvedBy = user?.displayName || user?.email || 'Unknown';
      await updateDepartmentComplaintStatus(selectedComplaint.id, status, adminNotes, resolvedBy);
      
      setComplaints(complaints.map(c => 
        c.id === selectedComplaint.id 
          ? { ...c, status, adminNotes, updatedAt: new Date() } 
          : c
      ));
      
      setSelectedComplaint(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating complaint status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Low': return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800';
      case 'Medium': return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800';
      case 'High': return 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/50 border border-orange-200 dark:border-orange-800';
      case 'Critical': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800';
      default: return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50 border border-purple-200 dark:border-purple-800';
      case 'Pending': return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800';
      case 'In Progress': return 'text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800';
      case 'Resolved': return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800';
      case 'Closed': return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800';
      default: return 'text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center bg-gray-900 p-8 rounded-lg">
          <FiAlertTriangle className="mx-auto text-6xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">An Error Occurred</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Top header section - ADAPTED FOR LIGHT MODE */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-2xl text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Department Complaints</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {isAdmin 
              ? 'Reviewing complaints from all departments.' 
              : `Reviewing complaints for the ${departmentInfo?.name || '...'} department.`
            }
          </p>
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 rounded-lg">
            <FiCheck className="mx-auto text-6xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">All Clear!</h3>
            <p className="text-gray-400">There are no complaints to review at this time.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {complaints.map((complaint) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors shadow-sm dark:shadow-none"
              >
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{complaint.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(complaint.urgency)}`}>{complaint.urgency}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>{complaint.status}</span>
                        </div>
                         <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Department:</span> {complaint.department}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <span className="font-semibold text-gray-700 dark:text-gray-300">Category:</span> {complaint.category}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{complaint.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                            <FiClock className="mr-1.5" />
                            Submitted: {formatTimestamp(complaint.createdAt)}
                    </div>
                    </div>
                  <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="self-start sm:self-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <FiEye />
                    Review
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-start justify-between mb-6">
                <div>
                        <h2 className="text-xl font-bold text-white">{selectedComplaint.title}</h2>
                        <p className="text-sm text-gray-400">{selectedComplaint.department} / {selectedComplaint.category}</p>
                </div>
                    <button onClick={() => setSelectedComplaint(null)} className="text-gray-400 hover:text-white transition-colors">
                        <FiX size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-white mb-2">Description</h3>
                        <p className="text-gray-300 bg-gray-800 p-3 rounded-md">{selectedComplaint.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                            <h3 className="font-semibold text-white mb-2">Student Name</h3>
                            <p className="text-gray-300">{selectedComplaint.studentName}</p>
                  </div>
                  <div>
                            <h3 className="font-semibold text-white mb-2">Student Email</h3>
                            <p className="text-gray-300">{selectedComplaint.studentEmail}</p>
                  </div>
              </div>
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Admin/HOD Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                          rows={4}
                          placeholder="Add notes here..."
                        />
                    </div>
              </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => handleUpdateStatus('In Progress')} disabled={updating} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">In Progress</button>
                        <button onClick={() => handleUpdateStatus('Resolved')} disabled={updating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Mark Resolved</button>
                        <button onClick={() => handleUpdateStatus('Closed')} disabled={updating} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">Close</button>
                    </div>
                     <p className="text-xs text-gray-500">
                        Complaint ID: {selectedComplaint.id}
                    </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}