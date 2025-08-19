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
    return <div className="p-6 text-center text-text-tertiary">Loading counselors...</div>;
  }
  
  return (
    <div className="p-2 sm:p-6 min-h-screen text-text-primary overflow-x-hidden">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 sm:gap-0 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3"><FiUsers /> Manage Counselors</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-blue-700 transition-colors text-sm whitespace-nowrap">
          <FiPlus /> Add Counselor
        </button>
      </div>

      {counselors.length === 0 ? (
        <div className="text-center py-16 bg-bg-secondary rounded-lg">
          <FiUsers className="mx-auto text-5xl text-text-tertiary mb-4" />
          <h3 className="text-xl font-semibold">No Counselors Found</h3>
          <p className="text-text-tertiary mt-2">Add your first counselor to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {counselors.map((counselor) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary rounded-xl overflow-hidden border border-border-primary hover:border-border-secondary transition-all group"
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-r from-blue-700 to-purple-700 p-3 sm:p-4">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">{counselor.name}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1 overflow-hidden">
                  {counselor.specializations && counselor.specializations.length > 0 ? (
                    counselor.specializations.map((spec, index) => (
                      <span key={index} className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                        {spec.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs">
                      No specializations
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3 sm:p-5 space-y-4">
                {/* Contact Information */}
                <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 text-sm overflow-hidden">
                      <FiMail className="text-blue-400 flex-shrink-0" />
                      <span className="text-text-primary truncate">{counselor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm overflow-hidden">
                      <FiPhone className="text-green-400 flex-shrink-0" />
                      <span className="text-text-primary truncate">{counselor.phone || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Available Days */}
                  <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                    <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                      <FiCalendar className="text-blue-400" />
                      <span>Available Days</span>
                    </h4>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-xs text-text-tertiary">{day}</div>
                      ))}
                      
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => {
                        const isAvailable = counselor.availableDays?.includes(day);
                        return (
                          <div 
                            key={i} 
                            className={`w-full aspect-square rounded-full flex items-center justify-center text-xs
                              ${isAvailable 
                                ? 'bg-green-900/30 text-green-300 border border-green-800/50' 
                                : 'bg-gray-800/30 text-gray-500 border border-gray-700/30'}`}
                          >
                            {isAvailable ? <FiCheck size={10} /> : <FiX size={10} />}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-xs text-text-tertiary flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-green-900/30 border border-green-800/50"></div>
                        Available
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-800/30 border border-gray-700/30"></div>
                        Unavailable
                      </span>
                    </div>
                    {!counselor.availableDays || counselor.availableDays.length === 0 ? (
                      <p className="text-center text-xs text-text-tertiary mt-2">No available days specified</p>
                    ) : null}
                  </div>

                  {/* Working Hours */}
                  <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                    <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                      <FiClock className="text-green-400" />
                      <span>Working Hours</span>
                    </h4>
                    <div className="text-center p-2 bg-bg-secondary rounded-lg border border-border-primary">
                      <span className="text-green-400 text-sm font-medium">{counselor.workingHours || "Not specified"}</span>
                      {counselor.workingHours && (
                        <>
                          <div className="mt-2 flex justify-center gap-1.5">
                            {['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'].map((time, i) => {
                              try {
                                const timeRange = counselor.workingHours || '';
                                const parts = timeRange.split('-');
                                if (parts.length !== 2) return (
                                  <div key={i} className="h-4 w-2 rounded-full bg-gray-700" />
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
                                    className={`h-4 w-2 rounded-full ${isInRange ? 'bg-green-500' : 'bg-gray-700'}`}
                                  />
                                );
                              } catch (error) {
                                return <div key={i} className="h-4 w-2 rounded-full bg-gray-700" />;
                              }
                            })}
                          </div>
                          <div className="mt-1 flex justify-between text-xs text-text-tertiary">
                            <span>8AM</span>
                            <span>6PM</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Qualifications & Experience */}
                {(counselor.qualifications || counselor.yearsExperience || counselor.maxSessionsPerDay) && (
                  <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                    <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                      <FiStar className="text-yellow-400" />
                      <span>Professional Details</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {counselor.qualifications && (
                        <div>
                          <h5 className="text-xs text-text-tertiary">Qualifications:</h5>
                          <p className="text-sm text-text-primary">{counselor.qualifications}</p>
                        </div>
                      )}
                      {counselor.yearsExperience > 0 && (
                        <div>
                          <h5 className="text-xs text-text-tertiary">Experience:</h5>
                          <p className="text-sm text-text-primary">{counselor.yearsExperience} {counselor.yearsExperience === 1 ? 'year' : 'years'}</p>
                        </div>
                      )}
                      {counselor.maxSessionsPerDay > 0 && (
                        <div>
                          <h5 className="text-xs text-text-tertiary">Max Sessions:</h5>
                          <p className="text-sm text-text-primary">{counselor.maxSessionsPerDay} per day</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Languages */}
                {counselor.languages && counselor.languages.length > 0 && (
                  <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                    <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                      <FiUser className="text-purple-400" />
                      <span>Languages</span>
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {counselor.languages.map((language, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full text-xs font-medium border border-purple-800/50">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="bg-bg-tertiary rounded-lg p-3 border border-border-primary">
                  <h4 className="text-sm font-medium text-text-secondary flex items-center gap-2 mb-2">
                    <FiUser className="text-blue-400" />
                    <span>Notes</span>
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {counselor.notes ? counselor.notes : "No additional notes available"}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleOpenModal(counselor)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCounselor(counselor.id)}
                    disabled={deleting === counselor.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                  >
                    {deleting === counselor.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-3.5 h-3.5" />
                    )}
                    <span>{deleting === counselor.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-bg-tertiary px-3 py-2 border-t border-border-primary flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1
                    ${counselor.isActive 
                      ? 'bg-green-900/30 text-green-400 border border-green-800/50' 
                      : 'bg-gray-800/30 text-gray-400 border border-gray-700/50'}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${counselor.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    {counselor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-xs text-text-tertiary">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-bg-secondary border border-border-primary rounded-lg p-3 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">{editingCounselor ? 'Edit' : 'Add New'} Counselor</h2>
                <button onClick={handleCloseModal} className="text-text-tertiary hover:text-text-primary"><FiX size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary focus:ring-2 focus:ring-blue-500 text-sm" required />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Phone Number</label>
                    <input 
                      name="phone" 
                      value={formData.phone || ''} 
                      onChange={handleChange}
                      type="tel"
                      pattern="^[+]?[0-9]{10,15}$"
                      placeholder="Phone Number (e.g., +918306877972)" 
                      className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" 
                      required 
                    />
                    <p className="mt-1 text-xs text-text-tertiary">Include country code (e.g., +91)</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Working Hours</label>
                    <input 
                      name="workingHours" 
                      value={formData.workingHours} 
                      onChange={handleChange} 
                      placeholder="Working Hours (e.g., 9:00 AM - 5:00 PM)" 
                      className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Specializations</label>
                  <input 
                    name="specializations" 
                    placeholder="Add specializations separated by commas (e.g., Anxiety, Stress, Depression)" 
                    className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm"
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
                  <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2 bg-bg-tertiary p-3 rounded border border-border-primary">
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
                          className="rounded border-border-primary text-blue-600 focus:ring-blue-500 bg-bg-secondary"
                        />
                        <span className="text-sm text-text-primary">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Max Sessions Per Day</label>
                    <input name="maxSessionsPerDay" type="number" value={formData.maxSessionsPerDay || 8} onChange={handleChange} min="1" max="20" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Years of Experience</label>
                    <input name="yearsExperience" type="number" value={formData.yearsExperience || 0} onChange={handleChange} placeholder="e.g., 5" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Languages</label>
                  <input 
                    name="languages" 
                    placeholder="Add languages separated by commas (e.g., English, Hindi, Tamil)" 
                    className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm"
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

                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Notes or additional information about the counselor..." className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" rows={3} />
                <div className="flex justify-end gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <button type="button" onClick={handleCloseModal} className="text-text-tertiary hover:text-text-primary px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-sm">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 hover:bg-green-700 text-sm"><FiCheckCircle/> {editingCounselor ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
 
 
 
 