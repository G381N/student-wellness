'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiX, FiMail, FiPhone, FiClock, FiStar, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Counselor, getCounselors, addCounselor, updateCounselor, deleteCounselor } from '@/lib/firebase-utils';

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

  const handleDelete = async (counselorId: string) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await deleteCounselor(counselorId);
        fetchCounselors();
      } catch (error) {
        console.error('Failed to delete counselor:', error);
      }
    }
  };

  if (loading && isAdmin) {
    return <div className="p-6 text-center text-gray-400">Loading counselors...</div>;
  }
  
  return (
    <div className="p-2 sm:p-4 md:p-6 min-h-screen text-white">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3"><FiUsers /> Manage Counselors</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center">
          <FiPlus /> Add Counselor
        </button>
      </div>

      {counselors.length === 0 ? (
        <div className="text-center py-10 sm:py-16 bg-gray-900 rounded-lg">
          <FiUsers className="mx-auto text-4xl sm:text-5xl text-gray-500 mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold">No Counselors Found</h3>
          <p className="text-gray-400 mt-2">Add your first counselor to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {counselors.map(c => (
            <motion.div key={c.id} layout className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col transition-all hover:border-blue-500 hover:shadow-lg min-w-0">
              <div className="p-4 sm:p-5 bg-gray-800/50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-blue-600 p-2 sm:p-3 rounded-full"><FiUsers className="text-white h-5 w-5 sm:h-6 sm:w-6" /></div>
                    <div className="min-w-0">
                      <h2 className="text-base sm:text-lg font-bold text-white truncate">{c.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-400 truncate">{c.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex-grow min-w-0">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(c.specializations) && c.specializations.length > 0 ? c.specializations.map(spec => (
                      <span key={spec} className="bg-gray-700 text-gray-300 px-2.5 py-1 text-xs rounded-full truncate">{spec}</span>
                    )) : <span className="text-gray-500 text-xs sm:text-sm">N/A</span>}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 sm:mb-2">Availability</h3>
                  <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-2"><FiClock size={14} /> {c.workingHours}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dayOptions.map(day => (
                      <span key={day} className={`px-2 py-0.5 text-xs rounded-full ${Array.isArray(c.availableDays) && c.availableDays.includes(day) ? 'bg-blue-900/70 text-blue-300' : 'bg-gray-700/50 text-gray-500'}`}>{day}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-gray-800/50 border-t border-gray-700 flex flex-col sm:flex-row gap-2">
                <button onClick={() => handleOpenModal(c)} className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 flex-grow flex items-center justify-center gap-2"><FiEdit />Edit</button>
                <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white p-2 rounded-md text-sm hover:bg-red-700"><FiTrash2 /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-gray-900 border border-gray-700 rounded-lg p-3 sm:p-6 w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold">{editingCounselor ? 'Edit' : 'Add New'} Counselor</h2>
                <button onClick={handleCloseModal} className="text-gray-400 hover:text-white"><FiX size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white focus:ring-2 focus:ring-blue-500" required />
                  <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email Address" className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" required />
                  <input name="workingHours" value={formData.workingHours} onChange={handleChange} placeholder="Working Hours (e.g., 9 AM - 5 PM)" className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Specializations (comma-separated)</label>
                    <input name="specializations" value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : formData.specializations} onChange={handleChange} placeholder="e.g., Anxiety, Stress, Relationships" className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1.5 text-xs sm:text-sm rounded-full transition-colors ${Array.isArray(formData.availableDays) && formData.availableDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-400 mb-1 sm:mb-2">Max Sessions Per Day</label>
                    <input name="maxSessionsPerDay" type="number" value={formData.maxSessionsPerDay} onChange={handleChange} className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" />
                </div>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Internal notes about the counselor..." className="w-full p-2 sm:p-3 bg-gray-800 rounded border border-gray-700 text-white" rows={3} />
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 pt-2 sm:pt-4">
                  <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-white px-6 py-2 rounded-lg w-full sm:w-auto">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 w-full sm:w-auto"><FiCheckCircle/> {editingCounselor ? 'Update Counselor' : 'Add Counselor'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
 