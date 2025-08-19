'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUsers, 
  FiPlus, 
  FiTrash2, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiClock, 
  FiUser, 
  FiEdit, 
  FiEdit2,
  FiStar, 
  FiCheck, 
  FiX, 
  FiAlertTriangle,
  FiSave,
  FiCheckCircle
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Counselor, getCounselors, addCounselor, updateCounselor, deleteCounselor } from '@/lib/firebase-utils';
import { formatDistanceToNow } from 'date-fns';

const initialCounselorState: Omit<Counselor, 'id' | 'createdAt' | 'isActive'> = {
  name: '',
  email: '',
  phone: '',
  specializations: [],
  workingHours: '9:00 AM - 5:00 PM',
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  maxSessionsPerDay: 8,
  qualifications: '',
  yearsExperience: 0,
  languages: [],
  notes: '',
  imageUrl: '',
  addedBy: '',
};

export default function ManageCounselors() {
  const { isAdmin } = useAuth();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [formData, setFormData] = useState(initialCounselorState);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchCounselors();
  }, [isAdmin]);

  const fetchCounselors = async () => {
    setLoading(true);
    try {
      const fetchedCounselors = await getCounselors();
      setCounselors(fetchedCounselors);
    } catch (error) {
      console.error('Error fetching counselors:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleOpenModal = (counselor: Counselor | null = null) => {
    if (counselor) {
      setEditingCounselor(counselor);
      setFormData({
        ...initialCounselorState,
        ...counselor,
      });
    } else {
      setEditingCounselor(null);
      setFormData(initialCounselorState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    if (name === 'yearsExperience' || name === 'maxSessionsPerDay') {
      // Handle empty strings for number fields
      const numValue = value === '' ? 0 : parseInt(value, 10);
      // Ensure we have a valid number
      const validatedValue = isNaN(numValue) ? 0 : numValue;
      setFormData(prev => ({ ...prev, [name]: validatedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCounselor) {
        await updateCounselor(editingCounselor.id, formData);
      } else {
        const counselorData = {
          ...formData,
          isActive: true,
          addedBy: 'admin', // You might want to get this from auth context
          createdAt: new Date(),
        };
        await addCounselor(counselorData);
      }
      fetchCounselors();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save counselor:', error);
    }
  };

  const handleDeleteCounselor = async (counselorId: string) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      setDeleting(counselorId);
      try {
        await deleteCounselor(counselorId);
        fetchCounselors();
      } catch (error) {
        console.error('Failed to delete counselor:', error);
      } finally {
        setDeleting(null);
      }
    }
  };

  if (loading && isAdmin) {
    return (
      <div className="p-6 text-center min-h-[50vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading counselors...</p>
      </div>
    );
  }
  
  return (
    <div className="p-3 sm:p-6 min-h-screen text-gray-900 dark:text-white overflow-x-hidden">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
          <FiUsers className="text-blue-600 dark:text-blue-400" /> 
          Manage Counselors
        </h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 transition-colors text-sm whitespace-nowrap shadow-sm">
          <FiPlus /> Add Counselor
        </button>
      </div>

      {counselors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <FiUsers className="mx-auto text-5xl text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Counselors Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">Add your first counselor to get started with the wellness counseling program.</p>
          <button onClick={() => handleOpenModal()} className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm mx-auto">
            <FiPlus /> Add Your First Counselor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {counselors.map((counselor) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg sm:rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate mb-1">{counselor.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2 overflow-hidden">
                  {counselor.specializations && counselor.specializations.length > 0 ? (
                    counselor.specializations.map((spec, index) => (
                      <span key={index} className="px-3 py-1 bg-white/25 text-white rounded-full text-xs font-medium">
                        {spec.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1 bg-white/25 text-white rounded-full text-xs font-medium">
                      No specializations
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 sm:p-6 space-y-5">
                {/* Contact Information */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FiMail className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{counselor.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <FiPhone className="text-green-600 dark:text-green-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{counselor.phone || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Available Days */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FiCalendar className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Available Days</span>
                    </h4>
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day}</div>
                      ))}
                      
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                        const isAvailable = counselor.availableDays?.includes(day);
                        return (
                          <div 
                            key={i} 
                            className={`w-full aspect-square rounded-full flex items-center justify-center text-xs
                              ${isAvailable 
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/60' 
                                : 'bg-gray-100 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}
                          >
                            {isAvailable ? <FiCheck size={12} /> : <FiX size={12} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800/60"></div>
                        Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700"></div>
                        Unavailable
                      </span>
                    </div>
                    {!counselor.availableDays || counselor.availableDays.length === 0 ? (
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">No available days specified</p>
                    ) : null}
                  </div>

                  {/* Working Hours */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <FiClock className="text-green-600 dark:text-green-400" />
                      </div>
                      <span>Working Hours</span>
                    </h4>
                    <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">{counselor.workingHours || "Not specified"}</span>
                      {counselor.workingHours && (
                        <>
                          <div className="mt-3 flex justify-center gap-2">
                            {['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'].map((time, i) => {
                              try {
                                const timeRange = counselor.workingHours || '';
                                const parts = timeRange.split('-');
                                if (parts.length !== 2) return (
                                  <div key={i} className="h-4 w-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                                );
                                
                                const startTime = parts[0].trim();
                                const endTime = parts[1].trim();
                                
                                // Convert to 24-hour format for comparison
                                const convertTo24Hour = (time12h) => {
                                  try {
                                    const [time, modifier] = time12h.split(' ');
                                    let [hours, minutes] = time.split(':');
                                    hours = parseInt(hours);
                                    
                                    if (hours === 12) {
                                      hours = modifier === 'PM' ? 12 : 0;
                                    } else {
                                      hours = modifier === 'PM' ? hours + 12 : hours;
                                    }
                                    
                                    return hours;
                                  } catch (error) {
                                    return 0;
                                  }
                                };
                                
                                const timeToHour = (timeStr) => {
                                  try {
                                    if (timeStr.includes('AM') || timeStr.includes('PM')) {
                                      return convertTo24Hour(timeStr);
                                    }
                                    return parseInt(timeStr);
                                  } catch (error) {
                                    return 0;
                                  }
                                };
                                
                                const currentHour = timeToHour(time);
                                const startHour = timeToHour(startTime);
                                const endHour = timeToHour(endTime);
                                
                                const isInRange = currentHour >= startHour && currentHour <= endHour;
                                
                                return (
                                  <div 
                                    key={i} 
                                    className={`h-6 w-3 rounded-full ${isInRange ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`}
                                  />
                                );
                              } catch (error) {
                                return <div key={i} className="h-6 w-3 rounded-full bg-gray-300 dark:bg-gray-600" />;
                              }
                            })}
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>8AM</span>
                            <span>6PM</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                {(counselor.qualifications || counselor.yearsExperience || counselor.maxSessionsPerDay) && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <FiStar className="text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span>Professional Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {counselor.qualifications && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Qualifications</h5>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{counselor.qualifications}</p>
                        </div>
                      )}
                      {counselor.yearsExperience > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Experience</h5>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{counselor.yearsExperience} {counselor.yearsExperience === 1 ? 'year' : 'years'}</p>
                        </div>
                      )}
                      {counselor.maxSessionsPerDay > 0 && (
                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Sessions</h5>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{counselor.maxSessionsPerDay} per day</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Languages */}
                {counselor.languages && counselor.languages.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <FiUser className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span>Languages</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {counselor.languages.map((language, index) => (
                        <span key={index} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800/50">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FiUser className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>Notes</span>
                  </h4>
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {counselor.notes ? counselor.notes : "No additional notes available"}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={() => handleOpenModal(counselor)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-lg hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/40 dark:border-blue-800 dark:hover:bg-blue-900/60 transition-colors duration-200"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCounselor(counselor.id)}
                    disabled={deleting === counselor.id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 dark:text-red-300 dark:bg-red-900/40 dark:border-red-800 dark:hover:bg-red-900/60 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {deleting === counselor.id ? (
                      <div className="w-4 h-4 border-2 border-red-700 dark:border-red-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span>{deleting === counselor.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between rounded-b-lg">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5
                    ${counselor.isActive 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800/50' 
                      : 'bg-gray-100 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${counselor.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    {counselor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Added {formatDistanceToNow(
                    counselor.createdAt?.toDate ? counselor.createdAt.toDate() : new Date(counselor.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 dark:bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{editingCounselor ? 'Edit' : 'Add New'} Counselor</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                  <FiX size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Full Name" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                    <input 
                      name="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Email Address" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                    <input 
                      name="phone" 
                      value={formData.phone || ''} 
                      onChange={handleChange}
                      type="tel"
                      pattern="^[+]?[0-9]{10,15}$"
                      placeholder="Phone Number (e.g., +918306877972)" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                      required 
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Include country code (e.g., +91)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours</label>
                    <input 
                      name="workingHours" 
                      value={formData.workingHours} 
                      onChange={handleChange} 
                      placeholder="Working Hours (e.g., 9:00 AM - 5:00 PM)" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specializations</label>
                  <input 
                    name="specializations" 
                    placeholder="Add specializations separated by commas (e.g., Anxiety, Stress, Depression)" 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.specializations ? formData.specializations.join(', ') : ''}
                    onChange={(e) => {
                      const specializationsArray = e.target.value.split(',').map(spec => spec.trim()).filter(spec => spec !== '');
                      setFormData(prev => ({
                        ...prev,
                        specializations: specializationsArray
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Days</label>
                  <div className="flex flex-wrap gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.availableDays?.includes(day) || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                availableDays: [...(prev.availableDays || []), day]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                availableDays: (prev.availableDays || []).filter(d => d !== day)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                        />
                        <span className="text-sm text-gray-900 dark:text-gray-100">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Sessions Per Day</label>
                    <input 
                      name="maxSessionsPerDay" 
                      type="number" 
                      value={formData.maxSessionsPerDay || 8} 
                      onChange={handleChange} 
                      min="1" 
                      max="20" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                    <input 
                      name="yearsExperience" 
                      type="number" 
                      value={formData.yearsExperience || 0} 
                      onChange={handleChange} 
                      placeholder="e.g., 5" 
                      className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Languages</label>
                  <input 
                    name="languages" 
                    placeholder="Add languages separated by commas (e.g., English, Hindi, Tamil)" 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    value={formData.languages ? formData.languages.join(', ') : ''}
                    onChange={(e) => {
                      const languagesArray = e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang !== '');
                      setFormData(prev => ({
                        ...prev,
                        languages: languagesArray
                      }));
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={handleChange} 
                    placeholder="Notes or additional information about the counselor..." 
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm" 
                    rows={3} 
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button 
                    type="button" 
                    onClick={handleCloseModal} 
                    className="px-6 py-2.5 rounded-lg text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <FiCheckCircle />
                    {editingCounselor ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
 
 
 
 