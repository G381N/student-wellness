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
  const [newModeratorName, setNewModeratorName] = useState('');
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
    if (!newModeratorEmail.trim() || !newModeratorName.trim() || !user) return;

    try {
      setAdding(true);
      
      // Create the moderator object with all required fields
      const moderatorData: Omit<Moderator, 'id'> = {
        userId: '', // Will be set when user signs up or is found
        email: newModeratorEmail.trim(),
        name: newModeratorName.trim(),
        assignedAt: new Date(), // Will be overridden by serverTimestamp in the function
        isActive: true
      };
      
      await addModerator(moderatorData);
      
      // Refresh the list
      await fetchModerators();
      
      setNewModeratorEmail('');
      setNewModeratorName('');
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
      setModerators(moderators.filter(mod => mod.id !== moderatorId));
      
      alert('Moderator removed successfully!');
    } catch (error: any) {
      console.error('Error removing moderator:', error);
      alert(error.message || 'Failed to remove moderator');
    } finally {
      setRemoving(null);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      let date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Unknown';
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
          <div className="text-xs sm:text-sm text-gray-400 break-words">Active Moderators</div>
        </div>
        <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-gray-800 text-center min-w-0">
          <div className="text-lg sm:text-2xl font-bold text-gray-400">{inactiveModerators.length}</div>
          <div className="text-xs sm:text-sm text-gray-400 break-words">Inactive Moderators</div>
        </div>
      </div>

      {/* Add Moderator Form */}
      <div className="bg-gray-900 rounded-lg sm:rounded-2xl p-3 sm:p-6 border border-gray-800 mb-3 sm:mb-6">
        <h3 className="text-base sm:text-xl font-bold text-white mb-3 sm:mb-4 break-words">Add New Moderator</h3>
        <form onSubmit={handleAddModerator} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-gray-400 text-xs sm:text-sm block mb-2">Name</label>
              <input
                type="text"
                value={newModeratorName}
                onChange={(e) => setNewModeratorName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 sm:p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white text-sm sm:text-base break-words"
                placeholder="Enter moderator's full name"
                required
              />
            </div>
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
              onClick={() => {
                setNewModeratorEmail('');
                setNewModeratorName('');
              }}
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${moderator.isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-semibold text-sm sm:text-base break-words">{moderator.name}</h4>
                          <p className="text-gray-400 text-xs sm:text-sm break-all">{moderator.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">Added {formatTimestamp(moderator.assignedAt)}</p>
                          <p className={`text-xs font-medium ${moderator.isActive ? 'text-green-400' : 'text-gray-500'}`}>
                            {moderator.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        
                        {moderator.isActive && (
                          <button
                            onClick={() => handleRemoveModerator(moderator.id)}
                            disabled={removing === moderator.id}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                          >
                            <FiUserMinus className="flex-shrink-0" />
                            <span className="hidden sm:inline">{removing === moderator.id ? 'Removing...' : 'Remove'}</span>
                          </button>
                        )}
                      </div>
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