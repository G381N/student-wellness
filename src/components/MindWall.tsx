'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiPlus, FiX, FiTrendingUp, FiMessageCircle, FiChevronUp, FiUser, FiTrash2, FiMoreHorizontal, FiShare, FiFlag, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { MindWallIssue, addMindWallIssue, getMindWallIssues, voteMindWallIssue, deleteMindWallIssue } from '@/lib/firebase-utils';

interface MindWallProps {
  searchQuery?: string;
}

export default function MindWall({ searchQuery = '' }: MindWallProps) {
  const { user, userData, isModerator, isAdmin } = useAuth();
  const [issues, setIssues] = useState<MindWallIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<{[key: string]: boolean}>({});
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({});
  const [showMoreOptions, setShowMoreOptions] = useState<{[key: string]: boolean}>({});
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'Academic',
    icon: '📝'
  });

  const categories = ['Academic', 'Infrastructure', 'Facilities', 'Wellness', 'Food', 'Social', 'Other'];
  const icons = ['📚', '📶', '📖', '🧠', '🍽️', '🏫', '💻', '⚽', '🎭', '📝', '🔧', '🏥'];

  // Load issues from Firebase
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const fetchedIssues = await getMindWallIssues();
        setIssues(fetchedIssues);
      } catch (error) {
        console.error('Error fetching Mind Wall issues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchIssues();
    }
  }, [user]);

  const handleVote = async (issueId: string) => {
    if (!user || votingStates[issueId]) return;
    
    try {
      setVotingStates(prev => ({ ...prev, [issueId]: true }));
      const voted = await voteMindWallIssue(issueId);
      
      // If voting was debounced, voted will be null
      if (voted === null) {
        return;
      }
      
      // Update local state only if vote was successful
      setIssues(issues.map(issue => {
        if (issue.id === issueId) {
          const updatedVotedBy = voted 
            ? [...issue.votedBy, user.uid]
            : issue.votedBy.filter(uid => uid !== user.uid);
          
          return {
            ...issue,
            count: voted ? issue.count + 1 : Math.max(0, issue.count - 1),
            votedBy: updatedVotedBy
          };
        }
        return issue;
      }));
    } catch (error: any) {
      console.error('Error voting on issue:', error);
      alert('Failed to vote. Please try again.');
    } finally {
      setVotingStates(prev => ({ ...prev, [issueId]: false }));
    }
  };

  const handleAddIssue = async () => {
    if (!user || !newIssue.title.trim() || !newIssue.description.trim()) return;

    try {
      setSubmitting(true);
      const createdIssue = await addMindWallIssue({
        title: newIssue.title,
        description: newIssue.description,
        category: newIssue.category,
        icon: newIssue.icon
      });

      // Add to local state with proper timestamp
      const issueWithTimestamp = {
        ...createdIssue,
        timestamp: createdIssue.timestamp || new Date()
      } as MindWallIssue;
      
      setIssues([issueWithTimestamp, ...issues]);
      setNewIssue({ title: '', description: '', category: 'Academic', icon: '📝' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding issue:', error);
      alert('Failed to add issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!user) return;
    
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    // Check permissions - user can delete their own posts, mods/admins can delete any
    const canDelete = issue.authorId === user.uid || isModerator || isAdmin;
    if (!canDelete) {
      alert('You can only delete your own posts.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(issueId);
      await deleteMindWallIssue(issueId);
      
      // Remove from local state
      setIssues(issues.filter(issue => issue.id !== issueId));
      
      // Close more options dropdown
      setShowMoreOptions(prev => ({ ...prev, [issueId]: false }));
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      alert(error.message || 'Failed to delete issue. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const toggleComments = (issueId: string) => {
    setShowComments(prev => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  const toggleMoreOptions = (issueId: string) => {
    setShowMoreOptions(prev => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  const handleShare = (issue: MindWallIssue) => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`${issue.title}\n\n${issue.description}\n\n${window.location.href}`);
      alert('Post copied to clipboard!');
    }
  };

  const handleReport = (issueId: string) => {
    // This would typically open a report modal or send to moderation queue
    alert('Post reported to moderators. Thank you for helping keep our community safe.');
    setShowMoreOptions(prev => ({ ...prev, [issueId]: false }));
  };

  const sortedIssues = [...issues].sort((a, b) => b.count - a.count);

  // Filter issues based on search query
  const filteredIssues = searchQuery.trim() 
    ? sortedIssues.filter(issue => 
        issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sortedIssues;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur-md border-b border-gray-800 p-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Mind Wall</h1>
              <p className="text-gray-400 text-sm">Share your thoughts anonymously</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-full font-bold transition-colors text-sm"
            >
              Post
            </button>
          </div>
        </div>

        {/* Create Issue Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-800 p-4 bg-gray-950"
            >
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <FiUser className="text-gray-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <input
                    type="text"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                    placeholder="What's happening?"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-lg placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                    maxLength={100}
                  />
                  <textarea
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                    placeholder="Share more details..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  
                  <div className="flex space-x-4">
                    {/* Category Dropdown */}
                    <div className="flex-1">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                      <div className="relative">
                        <select
                          value={newIssue.category}
                          onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none cursor-pointer"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-gray-900 text-white py-2">
                              {cat}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    {/* Icon Dropdown */}
                    <div className="flex-1">
                      <label className="block text-gray-300 text-sm font-medium mb-2">Icon</label>
                      <div className="relative">
                        <select
                          value={newIssue.icon}
                          onChange={(e) => setNewIssue({ ...newIssue, icon: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 appearance-none cursor-pointer"
                        >
                          {icons.map(icon => (
                            <option key={icon} value={icon} className="bg-gray-900 text-white py-2">
                              {icon} {icon === '📚' ? 'Books' : icon === '📶' ? 'Network' : icon === '📖' ? 'Study' : icon === '🧠' ? 'Mental Health' : icon === '🍽️' ? 'Food' : icon === '🏫' ? 'Campus' : icon === '💻' ? 'Tech' : icon === '⚽' ? 'Sports' : icon === '🎭' ? 'Arts' : icon === '📝' ? 'General' : icon === '🔧' ? 'Maintenance' : 'Health'}
                            </option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-500 text-sm">{newIssue.description.length}/500</span>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-6 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddIssue}
                        disabled={!newIssue.title.trim() || !newIssue.description.trim() || submitting}
                        className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                      >
                        {submitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Issues Feed */}
        <div className="divide-y divide-gray-800">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageCircle className="text-gray-400 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-gray-400 mb-6">Be the first to share your thoughts with the community.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-full font-bold transition-colors"
              >
                Create Post
              </button>
            </div>
          ) : (
            filteredIssues.map((issue, index) => (
              <div key={issue.id} className="p-4 hover:bg-gray-950 transition-colors">
                <div className="flex space-x-3">
                  {/* Anonymous Avatar */}
                  <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{issue.icon}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white">Anonymous</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-gray-500 text-sm">
                        {issue.timestamp && (
                          typeof issue.timestamp.toDate === 'function' 
                            ? new Date(issue.timestamp.toDate()).toLocaleDateString()
                            : new Date(issue.timestamp as any).toLocaleDateString()
                        )}
                      </span>
                      <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">
                        {issue.category}
                      </span>
                      {index < 3 && (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          index === 0 ? 'bg-yellow-600 text-yellow-100' :
                          index === 1 ? 'bg-gray-600 text-gray-100' :
                          'bg-orange-600 text-orange-100'
                        }`}>
                          #{index + 1}
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <h3 className="text-white font-medium mb-1">{issue.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{issue.description}</p>
                    </div>
                    
                    {/* Actions - Only Upvote and Delete */}
                    <div className="flex items-center space-x-4">
                      {/* Upvote Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(issue.id);
                        }}
                        disabled={votingStates[issue.id]}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-all group ${
                          issue.votedBy?.includes(user?.uid || '') 
                            ? 'text-green-400 bg-green-900 bg-opacity-20' 
                            : 'text-gray-500 hover:text-green-400 hover:bg-green-900 hover:bg-opacity-20'
                        }`}
                      >
                        {votingStates[issue.id] ? (
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FiChevronUp className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{issue.count}</span>
                      </button>
                      
                      {/* Delete Button - Only for post author, mods, and admins */}
                      {(issue.authorId === user?.uid || isModerator || isAdmin) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIssue(issue.id);
                          }}
                          disabled={deleting === issue.id}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-gray-500 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-all group"
                        >
                          {deleting === issue.id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <FiTrash2 className="w-4 h-4" />
                          )}
                          {deleting === issue.id && <span className="text-sm">Deleting...</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 