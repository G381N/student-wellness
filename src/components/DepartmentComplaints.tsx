'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiClock, FiUser, FiX, FiCheck, FiEye, FiBriefcase } from 'react-icons/fi';
import { getDepartmentComplaints, getDepartmentComplaintsByDepartment, updateDepartmentComplaintStatus, DepartmentComplaint, checkDepartmentHeadStatus, Department } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentComplaints() {
  const { user, isAdmin, isDepartmentHead, userDepartment } = useAuth();
  const [complaints, setComplaints] = useState<DepartmentComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<DepartmentComplaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [departmentInfo, setDepartmentInfo] = useState<Department | null>(null);

  useEffect(() => {
    console.log('🔍 DepartmentComplaints useEffect triggered:', {
      user: user?.email,
      isAdmin,
      isDepartmentHead,
      userDepartment
    });
    
    if (user) {
      fetchComplaints();
      if (isDepartmentHead && user.email) {
        // Get department info for department head
        checkDepartmentHeadStatus(user.email).then(({ department }) => {
          console.log('🏢 Department info loaded:', department);
          setDepartmentInfo(department || null);
        });
      }
    }
  }, [user, isAdmin, isDepartmentHead, userDepartment]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      let fetchedComplaints: DepartmentComplaint[] = [];
      
      console.log('🔍 Fetching complaints...', {
        isAdmin,
        isDepartmentHead,
        userEmail: user?.email,
        userDepartment
      });
      
      if (isAdmin) {
        // Admin can see all complaints
        console.log('👑 Admin - fetching all complaints');
        fetchedComplaints = await getDepartmentComplaints();
        console.log('📋 All complaints fetched:', fetchedComplaints.length, fetchedComplaints);
      } else if (isDepartmentHead && user?.email) {
        // Department head can only see their department's complaints
        console.log('🏢 Department head - checking department status');
        const deptHeadCheck = await checkDepartmentHeadStatus(user.email);
        console.log('🔍 Department head check result:', deptHeadCheck);
        
        if (deptHeadCheck.isDepartmentHead && deptHeadCheck.department) {
          console.log('✅ Valid department head, fetching department complaints for:', deptHeadCheck.department.code);
          fetchedComplaints = await getDepartmentComplaintsByDepartment(deptHeadCheck.department.code);
          console.log('📋 Department complaints fetched:', fetchedComplaints.length, fetchedComplaints);
        } else {
          console.log('❌ Not a valid department head');
        }
      } else {
        console.log('❌ No access - not admin or department head');
      }
      
      console.log('📊 Final complaints to display:', fetchedComplaints);
      setComplaints(fetchedComplaints);
    } catch (error) {
      console.error('❌ Error fetching department complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'Pending' | 'In Progress' | 'Resolved' | 'Closed') => {
    if (!selectedComplaint) return;

    try {
      setUpdating(true);
      const resolvedBy = user?.displayName || user?.email || 'Unknown';
      await updateDepartmentComplaintStatus(selectedComplaint.id, status, adminNotes, resolvedBy);
      
      // Update local state
      setComplaints(complaints.map(complaint => 
        complaint.id === selectedComplaint.id 
          ? { 
              ...complaint, 
              status, 
              adminNotes, 
              isResolved: status === 'Resolved',
              resolvedBy: status === 'Resolved' ? resolvedBy : complaint.resolvedBy,
              resolvedAt: status === 'Resolved' ? new Date() : complaint.resolvedAt,
              updatedAt: new Date(),
            }
          : complaint
      ));
      
      setSelectedComplaint(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating complaint status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = typeof timestamp.toDate === 'function' 
        ? timestamp.toDate() 
        : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Low': return 'text-green-400 bg-green-900';
      case 'Medium': return 'text-yellow-400 bg-yellow-900';
      case 'High': return 'text-orange-400 bg-orange-900';
      case 'Critical': return 'text-red-400 bg-red-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-blue-400 bg-blue-900';
      case 'In Progress': return 'text-yellow-400 bg-yellow-900';
      case 'Resolved': return 'text-green-400 bg-green-900';
      case 'Closed': return 'text-gray-400 bg-gray-900';
      default: return 'text-gray-400 bg-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading department complaints...</p>
        </div>
      </div>
    );
  }

  // Redirect non-authorized users
  if (!isAdmin && !isDepartmentHead) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <FiAlertTriangle className="mx-auto text-6xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400">Only administrators and department heads can access department complaints.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FiBriefcase className="text-2xl text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Department Complaints</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-400">
            {isAdmin 
              ? 'Manage and review complaints from all departments' 
              : `Manage complaints for ${departmentInfo?.name || 'your'} department`
            }
          </p>
          {isDepartmentHead && departmentInfo && (
            <div className="mt-3 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                <FiBriefcase className="inline mr-2" />
                You can only view and manage complaints for your assigned department: <strong>{departmentInfo.name}</strong>
              </p>
            </div>
          )}
        </div>

        {complaints.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <FiBriefcase className="mx-auto text-4xl sm:text-6xl text-gray-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Department Complaints</h3>
            <p className="text-sm sm:text-base text-gray-400">
              {isDepartmentHead 
                ? `There are currently no complaints for the ${departmentInfo?.name || 'your'} department.`
                : 'There are currently no department complaints to review.'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {complaints.map((complaint) => (
              <motion.div
                key={complaint.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 border border-gray-700 rounded-lg p-4 sm:p-6 hover:border-gray-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-white">{complaint.title}</h3>
                      {complaint.department && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300">
                          {complaint.department}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-300 mb-4">{complaint.description}</p>
                    
                    {complaint.studentName && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1">
                            <FiUser className="text-xs" />
                            <span><strong>Student:</strong> {complaint.studentName}</span>
                          </div>
                          {complaint.studentEmail && (
                            <div>
                              <strong>Email:</strong> {complaint.studentEmail}
                            </div>
                          )}
                          {complaint.studentPhone && (
                            <div>
                              <strong>Phone:</strong> {complaint.studentPhone}
                            </div>
                          )}
                        </div>
                        {complaint.source && (
                          <div className="mt-2 text-xs text-gray-500">
                            <strong>Source:</strong> {complaint.source}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(complaint.severity)}`}>
                        {complaint.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-gray-400 bg-gray-800">
                        {complaint.category}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <FiClock className="mr-1" />
                      {formatTimestamp(complaint.createdAt || complaint.timestamp)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setAdminNotes(complaint.adminNotes || '');
                    }}
                    className="w-full sm:w-auto sm:ml-4 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <FiEye className="text-sm" />
                    Review
                  </button>
                </div>
                
                {complaint.adminNotes && (
                  <div className="mt-4 p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                    <p className="text-xs sm:text-sm text-gray-300">
                      <strong className="text-blue-400">{isDepartmentHead ? 'Department Head Notes:' : 'Admin Notes:'}</strong> {complaint.adminNotes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-3 sm:p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-gray-700 rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">Review Department Complaint</h2>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="text-gray-400 hover:text-white transition-colors p-1"
                >
                  <FiX className="text-lg sm:text-xl" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div>
                  <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Title</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.title}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Description</h3>
                  <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.description}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Department</h3>
                    <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.department || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Category</h3>
                    <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.category}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Severity</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(selectedComplaint.severity)}`}>
                      {selectedComplaint.severity}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Current Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>

                {selectedComplaint.studentName && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Student Name</h3>
                      <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.studentName}</p>
                    </div>
                    {selectedComplaint.studentEmail && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Student Email</h3>
                        <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.studentEmail}</p>
                      </div>
                    )}
                    {selectedComplaint.studentPhone && (
                      <div>
                        <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Student Phone</h3>
                        <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.studentPhone}</p>
                      </div>
                    )}
                  </div>
                )}

                {selectedComplaint.source && (
                  <div>
                    <h3 className="font-semibold text-white mb-2 text-sm sm:text-base">Source</h3>
                    <p className="text-gray-300 text-sm sm:text-base">{selectedComplaint.source}</p>
                  </div>
                )}
              </div>

              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  {isDepartmentHead ? 'Department Head Notes' : 'Admin Notes'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm sm:text-base"
                  rows={3}
                  placeholder="Add notes about this complaint..."
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <button
                  onClick={() => handleUpdateStatus('In Progress')}
                  disabled={updating}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleUpdateStatus('Resolved')}
                  disabled={updating}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => handleUpdateStatus('Closed')}
                  disabled={updating}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 