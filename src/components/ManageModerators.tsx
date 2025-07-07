'use client';

import { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { getModerators, addModerator, removeModerator, formatTimestamp } from '@/lib/firebase-utils';
import type { Moderator } from '@/lib/firebase-utils';

export default function ManageModerators() {
  const { user, isAdmin } = useAuth();
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [newModeratorEmail, setNewModeratorEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setError("You don't have permission to manage moderators.");
      setLoading(false);
      return;
    }

    const fetchModerators = async () => {
      try {
        setLoading(true);
        const fetchedModerators = await getModerators();
        setModerators(fetchedModerators);
        setError(null);
      } catch (err) {
        console.error('Error fetching moderators:', err);
        setError('Failed to load moderators. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModerators();
  }, [isAdmin]);

  const handleAddModerator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModeratorEmail.trim() || !user) return;

    setAdding(true);
    setError(null);
    try {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newModeratorEmail)) {
        throw new Error('Invalid email format.');
      }

      // The backend function should handle finding the user by email to get name/uid.
      // For now, we pass placeholder values.
      await addModerator({ 
        email: newModeratorEmail.trim(), 
        name: 'Name updated on user login', // Placeholder name
        userId: 'UID updated on user login' // Placeholder UID
      });
      
      setNewModeratorEmail('');
      const fetchedModerators = await getModerators();
      setModerators(fetchedModerators);

    } catch (err: any) {
      console.error('Error adding moderator:', err);
      setError(err.message || 'Failed to add moderator. The user may not exist.');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveModerator = async (moderatorId: string) => {
    if (!window.confirm('Are you sure you want to remove this moderator?')) {
      return;
    }
    setRemoving(moderatorId);
    setError(null);
    try {
      await removeModerator(moderatorId);
      setModerators(prev => prev.filter(mod => mod.id !== moderatorId));
    } catch (err) {
      console.error('Error removing moderator:', err);
      setError('Failed to remove moderator.');
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!isAdmin || error) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-lg max-w-md mx-auto mt-10 border border-red-800">
        <FiAlertTriangle className="text-red-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{error ? 'An Error Occurred' : 'Access Denied'}</h2>
        <p className="text-gray-400">{error || 'Only administrators can manage moderators.'}</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <FiUsers /> Manage Moderators
          </h1>
          <p className="text-gray-400 mt-1">Add or remove platform moderators by email.</p>
        </div>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Add New Moderator</h3>
        <form onSubmit={handleAddModerator} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={newModeratorEmail}
            onChange={(e) => setNewModeratorEmail(e.target.value)}
            className="w-full flex-grow bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter user's email to promote"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center"
          >
            <FiUserPlus className="mr-2" />
            {adding ? 'Adding...' : 'Add Moderator'}
          </button>
        </form>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 sm:p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Current Moderators ({moderators.length})</h3>
        <div className="space-y-3">
          {moderators.map((moderator) => (
            <div key={moderator.id} className="bg-gray-800 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-10 rounded-full ${moderator.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h4 className="font-bold text-white">{moderator.name}</h4>
                  <p className="text-sm text-gray-400">{moderator.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <span className="text-sm text-gray-500 flex-grow sm:flex-grow-0">
                  Added {formatTimestamp(moderator.addedAt)}
                </span>
                <button
                  onClick={() => handleRemoveModerator(moderator.id)}
                  disabled={removing === moderator.id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                  title="Remove Moderator"
                >
                  {removing === moderator.id ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FiTrash2 />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 