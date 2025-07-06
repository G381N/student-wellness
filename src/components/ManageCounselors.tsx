'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiEdit, FiTrash2, FiX, FiCheck, FiMail, FiPhone, FiClock, FiCalendar, FiSun, FiStar } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Counselor, getCounselors, addCounselor, updateCounselor, deleteCounselor } from '@/lib/firebase-utils';

const initialCounselorState: Omit<Counselor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> = {
  name: '',
  email: '',
  phone: '',
  specializations: [],
  availableDays: [],
  workingHours: '',
  maxSessionsPerDay: 8,
  notes: '',
};

export default function ManageCounselors() {
  const { isAdmin } = useAuth();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCounselor, setEditingCounselor] = useState<Counselor | null>(null);
  const [formData, setFormData] = useState(initialCounselorState);

  useEffect(() => {
    if (isAdmin) {
      fetchCounselors();
    }
  }, [isAdmin]);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
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
    setEditingCounselor(null);
    setFormData(initialCounselorState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleArrayChange = (name: 'specializations' | 'availableDays', value: string) => {
    const values = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCounselor) {
        await updateCounselor(editingCounselor.id, formData);
      } else {
        await addCounselor(formData);
      }
      fetchCounselors();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save counselor:', error);
      alert('Failed to save counselor.');
    }
  };

  const handleDelete = async (counselorId: string) => {
    if (window.confirm('Are you sure you want to delete this counselor?')) {
      try {
        await deleteCounselor(counselorId);
        fetchCounselors();
      } catch (error) {
        console.error('Failed to delete counselor:', error);
        alert('Failed to delete counselor.');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FiUsers /> Manage Counselors</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <FiPlus /> Add Counselor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {counselors.map(counselor => (
          <div key={counselor.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white">{counselor.name}</h2>
            <p className="text-gray-400"><FiMail className="inline mr-2" />{counselor.email}</p>
            <p className="text-gray-400"><FiPhone className="inline mr-2" />{counselor.phone}</p>
            <div className="mt-4 flex gap-2">
                <button onClick={() => handleOpenModal(counselor)} className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"><FiEdit /></button>
                <button onClick={() => handleDelete(counselor.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">{editingCounselor ? 'Edit' : 'Add'} Counselor</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" required />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" required />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" required />
                <input name="specializations" value={Array.isArray(formData.specializations) ? formData.specializations.join(', ') : ''} onChange={(e) => handleArrayChange('specializations', e.target.value)} placeholder="Specializations (comma-separated)" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" />
                <input name="availableDays" value={Array.isArray(formData.availableDays) ? formData.availableDays.join(', ') : ''} onChange={(e) => handleArrayChange('availableDays', e.target.value)} placeholder="Available Days (comma-separated)" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" />
                <input name="workingHours" value={formData.workingHours} onChange={handleChange} placeholder="Working Hours (e.g., 9 AM - 5 PM)" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" />
                <input name="maxSessionsPerDay" type="number" value={formData.maxSessionsPerDay} onChange={handleChange} placeholder="Max Sessions Per Day" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" />
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Notes" className="w-full p-2 bg-gray-800 rounded border border-gray-700 text-white" />
                <div className="flex justify-end gap-4">
                  <button type="button" onClick={handleCloseModal} className="text-gray-400">Cancel</button>
                  <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg">{editingCounselor ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 