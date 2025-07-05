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
        icon: newIssue.icon,
        count: 0,
        votedBy: [],
        timestamp: new Date(),
        authorId: user.uid,
        severity: 'Low'
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
        <div className="sticky top-0 z-10 bg-black bg-opacity-90 backdrop-blur-sm border-b border-gray-800">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">Mind Wall</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FiPlus className="text-lg" />
              <span>Share Thought</span>
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="divide-y divide-gray-800">
          {filteredIssues.map((issue) => (
            <div key={issue.id} className="p-4 hover:bg-gray-900 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Title and Category */}
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{issue.icon}</span>
                    <h2 className="text-lg font-bold">{issue.title}</h2>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400 mb-3">
                    <span className="px-2 py-1 bg-gray-800 rounded-full">{issue.category}</span>
                    <span>•</span>
                    <span>{new Date(issue.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 mb-4">{issue.description}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleVote(issue.id)}
                      disabled={votingStates[issue.id]}
                      className={`flex items-center space-x-2 transition-colors ${
                        issue.votedBy.includes(user?.uid || '') 
                          ? 'text-blue-400' 
                          : 'text-gray-400 hover:text-blue-400'
                      }`}
                    >
                      <div className={`p-2 rounded-full transition-colors ${
                        issue.votedBy.includes(user?.uid || '')
                          ? 'bg-blue-900 bg-opacity-20'
                          : 'hover:bg-blue-900 hover:bg-opacity-20'
                      }`}>
                        {votingStates[issue.id] ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiChevronUp className="w-5 h-5" />
                        )}
                      </div>
                      <span>{issue.count}</span>
                    </button>

                    {/* More Options */}
                    <div className="relative">
                      <button
                        onClick={() => toggleMoreOptions(issue.id)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <FiMoreHorizontal />
                      </button>
                      
                      {showMoreOptions[issue.id] && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-1 z-10">
                          <button
                            onClick={() => handleShare(issue)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center space-x-2"
                          >
                            <FiShare className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          
                          {(user?.uid === issue.authorId || isModerator || isAdmin) && (
                            <button
                              onClick={() => handleDeleteIssue(issue.id)}
                              disabled={deleting === issue.id}
                              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 flex items-center space-x-2"
                            >
                              {deleting === issue.id ? (
                                <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                              <span>Delete</span>
                            </button>
                          )}
                          
                          {user?.uid !== issue.authorId && (
                            <button
                              onClick={() => handleReport(issue.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center space-x-2"
                            >
                              <FiFlag className="w-4 h-4" />
                              <span>Report</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Issue Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 rounded-xl p-6 w-full max-w-lg"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Share your thoughts</h2>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <input
                      type="text"
                      value={newIssue.title}
                      onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                      placeholder="What's on your mind?"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 h-32 resize-none"
                      placeholder="Share more details..."
                    />
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newIssue.category}
                      onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Icon Select */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Icon</label>
                    <div className="grid grid-cols-6 gap-2">
                      {icons.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setNewIssue({ ...newIssue, icon })}
                          className={`text-2xl p-2 rounded-lg transition-colors ${
                            newIssue.icon === icon
                              ? 'bg-blue-600'
                              : 'hover:bg-gray-800'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleAddIssue}
                    disabled={submitting || !newIssue.title.trim() || !newIssue.description.trim()}
                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Posting...</span>
                      </div>
                    ) : (
                      'Post'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
} 