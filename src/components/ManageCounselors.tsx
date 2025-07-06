'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiX, FiMail, FiPhone, FiClock, FiCalendar, FiStar, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Counselor, getCounselors, addCounselor, updateCounselor, deleteCounselor } from '@/lib/firebase-utils';
import { format } from 'date-fns';

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

const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      setFormData(counselor);
    } else {
      setEditingCounselor(null);
      setFormData(initialCounselorState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'number' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };
  
  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const availableDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d: string) => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        specializations: Array.isArray(formData.specializations) ? formData.specializations : (formData.specializations as string).split(',').map(s => s.trim()).filter(Boolean)
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselors.map(c => (
            <motion.div key={c.id} layout className="bg-gray-800/50 p-5 rounded-lg border border-gray-700 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-white mb-2">{c.name}</h2>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-400 flex items-center gap-2 mb-1"><FiMail size={14} /> {c.email}</p>
                <p className="text-gray-400 flex items-center gap-2"><FiPhone size={14} /> {c.phone}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-300 flex items-center gap-2 mb-2"><FiStar size={14}/> <strong>Specializations:</strong> {Array.isArray(c.specializations) ? c.specializations.join(', ') : 'N/A'}</p>
                  <p className="text-sm text-gray-300 flex items-center gap-2"><FiClock size={14}/> <strong>Hours:</strong> {c.workingHours}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                  <button onClick={() => handleOpenModal(c)} className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700 flex-grow flex items-center justify-center gap-2"><FiEdit />Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white p-2 rounded-md text-sm hover:bg-red-700"><FiTrash2 /></button>
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
                      <button type="button" key={day} onClick={() => handleDayToggle(day)} className={`px-3 py-1.5 text-sm rounded-full transition-colors ${formData.availableDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
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