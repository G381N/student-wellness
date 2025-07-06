'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiX, FiChevronUp, FiTrash2, FiShare, FiBarChart, FiTrendingUp, FiUsers, FiMessageSquare } from 'react-icons/fi';
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
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [votingStates, setVotingStates] = useState<{[key: string]: boolean}>({});
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'Academic'
  });

  const categories = ['Academic', 'Infrastructure', 'Facilities', 'Wellness', 'Food', 'Social', 'Other'];

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

  // Calculate analytics
  const analytics = {
    totalPosts: issues.length,
    totalVotes: issues.reduce((sum, issue) => sum + issue.count, 0),
    totalUsers: new Set(issues.map(issue => issue.authorId)).size,
    categoryStats: categories.map(category => ({
      category,
      count: issues.filter(issue => issue.category === category).length,
      votes: issues.filter(issue => issue.category === category).reduce((sum, issue) => sum + issue.count, 0)
    })).filter(stat => stat.count > 0).sort((a, b) => b.votes - a.votes),
    topIssues: [...issues].sort((a, b) => b.count - a.count).slice(0, 5),
    recentActivity: issues.filter(issue => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(issue.timestamp) > dayAgo;
    }).length
  };

  const handleVote = async (issueId: string) => {
    if (!user || votingStates[issueId]) return;
    
    try {
      setVotingStates(prev => ({ ...prev, [issueId]: true }));
      const voted = await voteMindWallIssue(issueId);
      
      if (voted === null) return;
      
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
        count: 0,
        votedBy: [],
        timestamp: new Date(),
        authorId: user.uid,
        severity: 'Low'
      });

      setIssues([createdIssue, ...issues]);
      setNewIssue({ title: '', description: '', category: 'Academic' });
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
      setIssues(issues.filter(issue => issue.id !== issueId));
    } catch (error: any) {
      console.error('Error deleting issue:', error);
      alert(error.message || 'Failed to delete issue. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = (issue: MindWallIssue) => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${issue.title}\n\n${issue.description}\n\n${window.location.href}`);
      alert('Post copied to clipboard!');
    }
  };

  const sortedIssues = [...issues].sort((a, b) => b.count - a.count);
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAnalytics(true)}
                className="px-3 py-2 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <FiBarChart className="text-lg" />
                <span className="hidden sm:inline">Analytics</span>
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <FiPlus className="text-lg" />
                <span>Share Thought</span>
              </button>
            </div>
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
                          ? 'text-green-400' 
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <div className={`p-2 rounded-full transition-colors ${
                        issue.votedBy.includes(user?.uid || '')
                          ? 'bg-green-900 bg-opacity-20'
                          : 'hover:bg-gray-800'
                      }`}>
                        {votingStates[issue.id] ? (
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiChevronUp className="w-5 h-5" />
                        )}
                      </div>
                      <span>{issue.count}</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShare(issue)}
                        className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-full transition-colors"
                      >
                        <FiShare className="w-5 h-5" />
                      </button>
                      
                      {(user?.uid === issue.authorId || isModerator || isAdmin) && (
                        <button
                          onClick={() => handleDeleteIssue(issue.id)}
                          disabled={deleting === issue.id}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-full transition-colors"
                        >
                          {deleting === issue.id ? (
                            <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FiTrash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Modal */}
        <AnimatePresence>
          {showAnalytics && (
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
                className="bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold flex items-center space-x-2">
                    <FiBarChart className="text-blue-400" />
                    <span>Mind Wall Analytics</span>
                  </h2>
                  <button
                    onClick={() => setShowAnalytics(false)}
                    className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <FiX />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Overview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <FiMessageSquare className="text-blue-400 text-2xl mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{analytics.totalPosts}</div>
                      <div className="text-sm text-gray-400">Total Posts</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <FiTrendingUp className="text-green-400 text-2xl mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{analytics.totalVotes}</div>
                      <div className="text-sm text-gray-400">Total Votes</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <FiUsers className="text-purple-400 text-2xl mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{analytics.totalUsers}</div>
                      <div className="text-sm text-gray-400">Contributors</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-center">
                      <FiChevronUp className="text-yellow-400 text-2xl mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">{analytics.recentActivity}</div>
                      <div className="text-sm text-gray-400">Recent (24h)</div>
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {analytics.categoryStats.map((stat, index) => (
                        <div key={stat.category} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <span className="text-white font-medium">{stat.category}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{stat.votes} votes</div>
                            <div className="text-sm text-gray-400">{stat.count} posts</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Issues */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Issues</h3>
                    <div className="space-y-3">
                      {analytics.topIssues.map((issue, index) => (
                        <div key={issue.id} className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                  {index + 1}
                                </div>
                                <h4 className="font-medium text-white">{issue.title}</h4>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span className="px-2 py-1 bg-gray-700 rounded-full">{issue.category}</span>
                                <span>•</span>
                                <span>{issue.count} votes</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white"
                      placeholder="What's on your mind?"
                    />
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newIssue.description}
                      onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white h-32 resize-none"
                      placeholder="Share more details..."
                    />
                  </div>

                  {/* Category Select */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={newIssue.category}
                      onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleAddIssue}
                    disabled={submitting || !newIssue.title.trim() || !newIssue.description.trim()}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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