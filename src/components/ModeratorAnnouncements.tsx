'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSpeaker, FiPlus, FiEdit, FiTrash2, FiCalendar, FiAlertTriangle, FiMessageSquare, FiUsers } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Post, getPosts } from '@/lib/firebase-utils';

interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  timestamp: any;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  type: 'announcement' | 'post';
  postData?: Post;
}

export default function ModeratorAnnouncements() {
  const { isModerator, isAdmin, user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (isModerator || isAdmin) {
      fetchAnnouncementsAndPosts();
    }
  }, [isModerator, isAdmin]);

  const fetchAnnouncementsAndPosts = async () => {
    try {
      setLoading(true);
      
      // Get posts with moderators-only visibility
      const allPosts = await getPosts();
      const moderatorPosts = allPosts.filter(post => post.visibility === 'moderators');
      
      // Convert moderator posts to announcement format
      const postAnnouncements: Announcement[] = moderatorPosts.map(post => ({
        id: `post-${post.id}`,
        title: post.content.length > 60 ? `${post.content.substring(0, 60)}...` : post.content,
        content: post.content,
        authorId: post.authorId,
        authorName: post.authorName,
        timestamp: post.timestamp,
        priority: 'medium' as 'low' | 'medium' | 'high',
        isActive: true,
        type: 'post' as const,
        postData: post
      }));

      // Mock regular announcements (you can replace this with actual data from Firebase)
      const regularAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Platform Guidelines Update',
          content: 'Please review the updated community guidelines. All posts must follow the new content policy.',
          authorId: 'admin1',
          authorName: 'Admin User',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          priority: 'high',
          isActive: true,
          type: 'announcement'
        },
        {
          id: '2',
          title: 'Weekly Moderation Report',
          content: 'This week we processed 45 reports and took action on 12 posts. Great work team!',
          authorId: 'mod1',
          authorName: 'Moderator One',
          timestamp: new Date(Date.now() - 172800000), // 2 days ago
          priority: 'medium',
          isActive: true,
          type: 'announcement'
        }
      ];

      // Combine and sort by timestamp
      const allAnnouncements = [...regularAnnouncements, ...postAnnouncements]
        .sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : new Date(a.timestamp).getTime();
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : new Date(b.timestamp).getTime();
          return bTime - aTime;
        });

      setAnnouncements(allAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements and posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      authorId: user?.uid || '',
      authorName: user?.displayName || user?.email || 'Unknown',
      timestamp: new Date(),
      priority: formData.priority,
      isActive: true,
      type: 'announcement'
    };

    if (editingAnnouncement) {
      // Update existing announcement
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...newAnnouncement, id: editingAnnouncement.id }
          : ann
      ));
      setEditingAnnouncement(null);
    } else {
      // Add new announcement
      setAnnouncements([newAnnouncement, ...announcements]);
    }

    setFormData({ title: '', content: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    // Only allow editing of regular announcements, not posts
    if (announcement.type === 'post') return;
    
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
    setEditingAnnouncement(announcement);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    // Only allow deletion of regular announcements, not posts
    const announcement = announcements.find(ann => ann.id === id);
    if (announcement?.type === 'post') return;
    
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(ann => ann.id !== id));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-900 text-red-300';
      case 'medium': return 'bg-yellow-900 text-yellow-300';
      case 'low': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-900 text-gray-300';
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

  if (!isModerator && !isAdmin) {
    return (
      <div className="p-8 text-center">
        <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">Only moderators and administrators can view announcements.</p>
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

  const regularAnnouncements = announcements.filter(a => a.type === 'announcement');
  const postAnnouncements = announcements.filter(a => a.type === 'post');

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FiSpeaker className="text-white text-3xl mr-3" />
          <h1 className="text-3xl font-bold text-white">Moderator Communications</h1>
        </div>
        <p className="text-gray-400 text-lg">Announcements and moderator-only posts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-white">{announcements.length}</div>
          <div className="text-sm text-gray-400">Total</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-blue-400">{regularAnnouncements.length}</div>
          <div className="text-sm text-gray-400">Announcements</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-green-400">{postAnnouncements.length}</div>
          <div className="text-sm text-gray-400">Mod Posts</div>
        </div>
        <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 text-center">
          <div className="text-2xl font-bold text-red-400">{announcements.filter(a => a.priority === 'high').length}</div>
          <div className="text-sm text-gray-400">High Priority</div>
        </div>
      </div>

      {/* Add Announcement Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', priority: 'medium' });
          }}
          className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center"
        >
          <FiPlus className="mr-2" />
          New Announcement
        </button>
      </div>

      {/* Add/Edit Announcement Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">
            {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm block mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white"
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:border-white resize-none"
                rows={4}
                placeholder="Enter announcement content"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm block mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-white"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center"
              >
                <FiPlus className="mr-2" />
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAnnouncement(null);
                  setFormData({ title: '', content: '', priority: 'medium' });
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <FiSpeaker className="text-gray-600 text-6xl mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-3">
                      {announcement.type === 'post' ? (
                        <FiMessageSquare className="text-green-400 mr-2" />
                      ) : (
                        <FiSpeaker className="text-blue-400 mr-2" />
                      )}
                      <h3 className="text-xl font-bold text-white">{announcement.title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      announcement.type === 'post' 
                        ? 'bg-green-900 text-green-300' 
                        : getPriorityColor(announcement.priority)
                    }`}>
                      {announcement.type === 'post' ? 'Moderator Post' : `${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority`}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-3">
                    <FiCalendar className="mr-2" />
                    <span>By {announcement.authorName} • {formatTimestamp(announcement.timestamp)}</span>
                    {announcement.postData && (
                      <>
                        <span className="mx-2">•</span>
                        <FiUsers className="mr-1" />
                        <span>{announcement.postData.category}</span>
                      </>
                    )}
                  </div>
                </div>

                {announcement.type === 'announcement' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold transition-colors flex items-center"
                    >
                      <FiEdit className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-bold transition-colors flex items-center"
                    >
                      <FiTrash2 className="mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-300 leading-relaxed">{announcement.content}</p>
              
              {announcement.postData && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>👍 {announcement.postData.upvotes}</span>
                      <span>👎 {announcement.postData.downvotes}</span>
                      <span>💬 {announcement.postData.comments?.length || 0}</span>
                    </div>
                    <span className="text-xs">Post ID: {announcement.postData.id}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 