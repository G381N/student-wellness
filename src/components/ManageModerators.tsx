'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiPlus, FiTrash2, FiMail, FiCalendar, FiUser, FiAlertTriangle } from 'react-icons/fi';
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FiShield className="text-white text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-white">Manage Moderators</h1>
        </div>
        <p className="text-gray-400 text-lg">Add and manage platform moderators</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-white">{activeModerators.length}</div>
          <div className="text-sm text-gray-400">Active Moderators</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-gray-400">{inactiveModerators.length}</div>
          <div className="text-sm text-gray-400">Inactive</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-blue-400">{moderators.length}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
      </div>

      {/* Add Moderator Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          Add Moderator
        </button>
      </div>

      {/* Add Moderator Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">Add New Moderator</h3>
          <form onSubmit={handleAddModerator} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Email Address</label>
              <input
                type="email"
                value={newModeratorEmail}
                onChange={(e) => setNewModeratorEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white"
                placeholder="Enter moderator's email address"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={adding || !newModeratorEmail.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center"
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus className="mr-2" />
                    Add Moderator
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewModeratorEmail('');
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Active Moderators */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Active Moderators</h2>
        {activeModerators.length === 0 ? (
          <div className="text-center py-12">
            <FiShield className="text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No active moderators</p>
          </div>
        ) : (
          activeModerators.map((moderator, index) => (
            <motion.div
              key={moderator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiShield className="text-blue-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">{moderator.email}</h3>
                    <span className="ml-3 bg-green-900 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-gray-400 text-sm">
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      <span>Added by: {moderator.addedBy}</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      <span>Added: {formatTimestamp(moderator.addedAt)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveModerator(moderator.id)}
                  disabled={removing === moderator.id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center"
                >
                  {removing === moderator.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Removing...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="mr-2" />
                      Remove
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Inactive Moderators */}
      {inactiveModerators.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-400">Inactive Moderators</h2>
          {inactiveModerators.map((moderator, index) => (
            <motion.div
              key={moderator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 opacity-60"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <FiShield className="text-gray-500 mr-3" />
                    <h3 className="text-xl font-bold text-gray-400">{moderator.email}</h3>
                    <span className="ml-3 bg-red-900 text-red-300 px-3 py-1 rounded-full text-sm font-medium">
                      Inactive
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-gray-500 text-sm">
                    <div className="flex items-center">
                      <FiUser className="mr-2" />
                      <span>Added by: {moderator.addedBy}</span>
                    </div>
                    <div className="flex items-center">
                      <FiCalendar className="mr-2" />
                      <span>Added: {formatTimestamp(moderator.addedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 