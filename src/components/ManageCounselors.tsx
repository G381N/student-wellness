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

const initialCounselorState: Omit<Counselor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: '',
  email: '',
  phone: '',
  specializations: [],
  availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  workingHours: '9:00 AM - 5:00 PM',
  maxSessionsPerDay: 8,
  notes: '',
};

const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
        specializations: Array.isArray(counselor.specializations) ? counselor.specializations : [],
        availableDays: Array.isArray(counselor.availableDays) ? counselor.availableDays : [],
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
    const finalValue = type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const currentDays = prev.availableDays || [];
      const availableDays = currentDays.includes(day)
        ? currentDays.filter((d: string) => d !== day)
        : [...currentDays, day];
      return { ...prev, availableDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        specializations: Array.isArray(formData.specializations) 
          ? formData.specializations 
          : (formData.specializations as string).split(',').map(s => s.trim()).filter(Boolean)
      };
      
      if (editingCounselor) {
        await updateCounselor(editingCounselor.id, dataToSave);
      } else {
        await addCounselor(dataToSave);
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
    return <div className="p-6 text-center text-gray-400">Loading counselors...</div>;
  }
  
  return (
    <div className="p-4 sm:p-6 min-h-screen text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-3"><FiUsers /> Manage Counselors</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FiPlus /> Add Counselor
        </button>
      </div>

      {counselors.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-lg">
          <FiUsers className="mx-auto text-5xl text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold">No Counselors Found</h3>
          <p className="text-gray-400 mt-2">Add your first counselor to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {counselors.map((counselor) => (
            <motion.div
              key={counselor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-800 hover:border-gray-700 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white mb-1 break-words">{counselor.name}</h3>
                      <p className="text-blue-400 text-sm break-all">{counselor.email}</p>
                      <p className="text-gray-400 text-sm mt-1">{counselor.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Specializations and Available Days in 2 columns on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Specializations */}
                      <div>
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {counselor.specializations.map((spec: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium border border-blue-800/50"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Available Days */}
                      <div>
                        <h4 className="text-gray-300 text-sm font-medium mb-2">Available Days</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {counselor.availableDays.map((day, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-medium border border-green-800/50"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Working Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-800">
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Working Hours</h4>
                        <p className="text-white text-sm font-medium">{counselor.workingHours}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Max Sessions/Day</h4>
                        <p className="text-white text-sm font-medium">{counselor.maxSessionsPerDay}</p>
                      </div>
                    </div>

                    {counselor.notes && (
                      <div className="pt-4 border-t border-gray-800">
                        <h4 className="text-gray-400 text-xs uppercase tracking-wide mb-1">Notes</h4>
                        <p className="text-gray-300 text-sm break-words">{counselor.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => setEditingCounselor(counselor)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span className="sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCounselor(counselor.id)}
                    disabled={deleting === counselor.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    {deleting === counselor.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span className="sm:inline">{deleting === counselor.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${counselor.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className={`text-sm font-medium ${counselor.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                    {counselor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingCounselor ? 'Edit' : 'Add New'} Counselor</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" required />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" required />
                  <input name="workingHours" value={formData.workingHours} onChange={handleChange} placeholder="Working Hours (e.g., 9 AM - 5 PM)" className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Specializations (comma-separated)</label>
                    <input name="specializations" value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : formData.specializations} onChange={handleChange} placeholder="e.g., Anxiety, Stress, Relationships" className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${Array.isArray(formData.availableDays) && formData.availableDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Max Sessions Per Day</label>
                    <input name="maxSessionsPerDay" type="number" value={formData.maxSessionsPerDay} onChange={handleChange} className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Internal notes about the counselor..." className="w-full p-3 bg-gray-800 rounded border border-gray-700 text-white" rows={3} />
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white px-6 py-2 rounded-lg">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"><FiCheckCircle/> {editingCounselor ? 'Update Counselor' : 'Add Counselor'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
 
 
 
 