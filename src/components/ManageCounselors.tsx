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

const initialCounselorState: Omit<Counselor, 'id' | 'createdAt' | 'isActive' | 'addedBy'> = {
  name: '',
  email: '',
  phoneNumber: '',
  specialization: '',
  availableHours: '9:00 AM - 5:00 PM',
  bio: '',
  imageUrl: '',
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
    const finalValue = type === 'number' ? (value === '' ? '' : parseInt(value, 10)) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
              className="bg-bg-secondary rounded-xl p-3 sm:p-6 border border-border-primary hover:border-border-secondary transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiUser className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-text-primary mb-0.5 sm:mb-1 truncate">{counselor.name}</h3>
                      <p className="text-blue-400 text-xs sm:text-sm truncate">{counselor.email}</p>
                      <p className="text-text-tertiary text-xs sm:text-sm mt-0.5 sm:mt-1">{counselor.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Specializations and Available Days in 2 columns on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                      {/* Specializations */}
                      <div>
                        <h4 className="text-text-secondary text-xs sm:text-sm font-medium mb-1 sm:mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          <span className="px-2 py-0.5 sm:py-1 bg-blue-900/30 text-blue-300 rounded-full text-xs font-medium border border-blue-800/50">
                            {counselor.specialization}
                          </span>
                        </div>
                      </div>

                      {/* Available Hours */}
                      <div>
                        <h4 className="text-text-secondary text-xs sm:text-sm font-medium mb-1 sm:mb-2">Available Hours</h4>
                        <span className="px-2 py-0.5 sm:py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-medium border border-green-800/50">
                          {counselor.availableHours}
                        </span>
                      </div>
                    </div>

                    {/* Bio/Notes */}
                    <div className="pt-2 sm:pt-4 border-t border-border-primary">
                      <h4 className="text-text-tertiary text-xs uppercase tracking-wide mb-1">Bio</h4>
                      <p className="text-text-secondary text-xs sm:text-sm line-clamp-2 sm:line-clamp-none">{counselor.bio}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleOpenModal(counselor)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                  >
                    <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCounselor(counselor.id)}
                    disabled={deleting === counselor.id}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium"
                  >
                    {deleting === counselor.id ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>{deleting === counselor.id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-border-primary">
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`w-2 h-2 rounded-full ${counselor.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                  <span className={`text-xs sm:text-sm font-medium ${counselor.isActive ? 'text-green-400' : 'text-text-tertiary'}`}>
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
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" required />
                  <input name="availableHours" value={formData.availableHours} onChange={handleChange} placeholder="Available Hours (e.g., 9 AM - 5 PM)" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-text-tertiary mb-1 sm:mb-2">Specialization</label>
                    <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Anxiety, Stress, Relationships" className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" />
                </div>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} placeholder="Bio/description about the counselor..." className="w-full p-2 sm:p-3 bg-bg-tertiary rounded border border-border-primary text-text-primary text-sm" rows={3} />
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
 
 
 
 