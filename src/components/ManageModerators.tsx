'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiPlus, FiTrash2, FiMail, FiCalendar, FiUser, FiAlertTriangle, FiUsers, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Moderator, getModerators, addModerator, removeModerator } from '@/lib/firebase-utils';
import { formatDistanceToNow } from 'date-fns';

export default function ManageModerators() {
  const { isAdmin, user } = useAuth();
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchModerators();
    }
  }, [isAdmin]);

  const fetchModerators = async () => {
    try {
      setLoading(true);
      const fetchedModerators = await getModerators();
      setModerators(fetchedModerators);
    } catch (error) {
      console.error('Error fetching moderators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeratorEmail.trim()) return;

    try {
      setAdding(true);
      await addModerator(newModeratorEmail.trim());
      
      // Refresh the list
      await fetchModerators();
      
      setNewModeratorEmail('');
      setShowAddForm(false);
      alert('Moderator added successfully!');
    } catch (error: any) {
      console.error('Error adding moderator:', error);
      alert(error.message || 'Failed to add moderator');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveModerator = async (moderatorId: string) => {
    if (!confirm('Are you sure you want to remove this moderator? This action cannot be undone.')) {
      return;
    }

    try {
      setRemoving(moderatorId);
      await removeModerator(moderatorId);
      
      // Update local state
      setModerators(moderators.map(mod => 
        mod.id === moderatorId 
          ? { ...mod, isActive: false }
          : mod
      ));
      
      alert('Moderator removed successfully!');
    } catch (error: any) {
      console.error('Error removing moderator:', error);
      alert(error.message || 'Failed to remove moderator');
    } finally {
      setRemoving(null);
    }
  };

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return 'Date unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Failed to format timestamp:", error);
      return 'Invalid date';
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center">
        <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">Only administrators can manage moderators.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeModerators = moderators.filter(mod => mod.isActive);
  const inactiveModerators = moderators.filter(mod => !mod.isActive);

  return (
    <div className="p-2 sm:p-6 space-y-3 sm:space-y-6 max-w-full overflow-hidden min-h-screen">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <FiUsers className="text-white text-xl sm:text-3xl mr-2 sm:mr-3 flex-shrink-0" />
          <h1 className="text-xl sm:text-3xl font-bold text-white break-words leading-tight">Manage Moderators</h1>
        </div>
        <p className="text-gray-400 text-sm sm:text-lg px-2 break-words">Add and manage moderators for the platform</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-gray-800 text-center min-w-0">
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{activeModerators.length}</div>
          <div className="text-xs sm:text-sm text-gray-400 break-words">Total Moderators</div>
        </div>
        <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-gray-800 text-center min-w-0">
          <div className="text-lg sm:text-2xl font-bold text-green-400">{activeModerators.length}</div>
          <div className="text-xs sm:text-sm text-gray-400 break-words">Active Moderators</div>
        </div>
      </div>

      {/* Add Moderator Form */}
      <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-gray-800 mb-3 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4 break-words">Add New Moderator</h3>
        <form onSubmit={handleAddModerator} className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-gray-400 text-xs sm:text-sm block mb-2">Email Address</label>
            <input
              type="email"
              value={newModeratorEmail}
              onChange={(e) => setNewModeratorEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 sm:p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm sm:text-base break-words"
              placeholder="Enter moderator's email"
              required
            />
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <button
              type="submit"
              disabled={adding}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors flex items-center justify-center text-sm sm:text-base w-full sm:w-auto"
            >
              <FiUserPlus className="mr-2 flex-shrink-0" />
              <span className="whitespace-nowrap">{adding ? 'Adding...' : 'Add Moderator'}</span>
            </button>
            <button
              type="button"
              onClick={() => setNewModeratorEmail('')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors text-sm sm:text-base w-full sm:w-auto"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Current Moderators */}
      <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-gray-800">
        <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4 break-words">Current Moderators</h3>
        
        {moderators.length === 0 ? (
          <div className="text-center py-6 sm:py-12 px-4">
            <FiUsers className="text-gray-600 text-3xl sm:text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-sm sm:text-lg break-words">No moderators found</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-2 break-words">Add your first moderator to get started</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-4">
            {moderators.map((moderator, index) => (
              <div
                key={moderator.id}
                className="bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-gray-600 transition-all"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center mb-2">
                          <FiShield className="text-blue-400 text-lg sm:text-xl mr-2 sm:mr-3 flex-shrink-0" />
                          <p className="text-sm sm:text-base font-bold text-white truncate">{moderator.email}</p>
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded-full ${moderator.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {moderator.isActive ? 'Active' : 'Removed'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
                        <div className="flex items-center text-gray-400 text-xs sm:text-sm mb-2 sm:mb-0">
                            <FiCalendar className="mr-2 flex-shrink-0" />
                            <span>Added: {formatTimestamp(moderator.addedAt)}</span>
                        </div>
                        
                        {moderator.isActive && (
                            <button
                                onClick={() => handleRemoveModerator(moderator.id)}
                                disabled={removing === moderator.id}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1 rounded-lg font-bold transition-colors flex items-center justify-center text-xs sm:text-sm w-full sm:w-auto"
                            >
                                <FiUserMinus className="mr-2 flex-shrink-0" />
                                <span>{removing === moderator.id ? 'Removing...' : 'Remove'}</span>
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 