'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSpeaker, FiPlus, FiEdit, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Post, getPosts } from '@/lib/firebase-utils';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { isModerator, isAdmin, user, isDepartmentHead } = useAuth();
  const { theme } = useTheme();
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
    if (isModerator || isAdmin || isDepartmentHead) {
      fetchAnnouncementsAndPosts();
    }
  }, [isModerator, isAdmin, isDepartmentHead]);

  const fetchAnnouncementsAndPosts = async () => {
    try {
      setLoading(true);
      
      const allPosts = await getPosts();
      const moderatorPosts = allPosts.filter(post => post.visibility === 'moderators');
      
      const postAnnouncements: Announcement[] = moderatorPosts.map(post => ({
        id: `post-${post.id}`,
        title: post.content.length > 60 ? `${post.content.substring(0, 60)}...` : post.content,
        content: post.content,
        authorId: post.authorId,
        authorName: ((post as any).authorName as string) || 'Unknown Moderator',
        timestamp: post.timestamp,
        priority: 'medium' as const,
        isActive: true,
        type: 'post' as const,
        postData: post
      }));

      const regularAnnouncements: Announcement[] = [
        {
          id: '1',
          title: 'Platform Guidelines Update',
          content: 'Please review the updated community guidelines. All posts must follow the new content policy.',
          authorId: 'admin1',
          authorName: 'Admin User',
          timestamp: new Date(Date.now() - 86400000),
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
          timestamp: new Date(Date.now() - 172800000),
          priority: 'medium',
          isActive: true,
          type: 'announcement'
        }
      ];

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
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { ...newAnnouncement, id: editingAnnouncement.id }
          : ann
      ));
      setEditingAnnouncement(null);
    } else {
      setAnnouncements([newAnnouncement, ...announcements]);
    }

    setFormData({ title: '', content: '', priority: 'medium' });
    setShowAddForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
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
    const announcement = announcements.find(ann => ann.id === id);
    if (announcement?.type === 'post') return;
    
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(announcements.filter(ann => ann.id !== id));
    }
  };

  const getPriorityColor = (priority: string) => {
    if (theme === 'light') {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
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

  if (!isModerator && !isAdmin && !isDepartmentHead) {
    return (
      <div className="p-8 text-center">
        <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
        <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} mb-2`}>Access Denied</h2>
        <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>Only moderators, administrators, or department heads can view announcements.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className={`w-8 h-8 border-4 ${theme === 'light' ? 'border-black' : 'border-white'} border-t-transparent rounded-full animate-spin`}></div>
      </div>
    );
  }

  const regularAnnouncements = announcements.filter(a => a.type === 'announcement');
  const postAnnouncements = announcements.filter(a => a.type === 'post');

  return (
    <div className={`p-2 sm:p-4 space-y-3 sm:space-y-6 max-w-full overflow-hidden min-h-screen ${theme === 'light' ? 'bg-gray-100' : ''}`}>
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <FiSpeaker className={`${theme === 'light' ? 'text-black' : 'text-white'} text-xl sm:text-3xl mr-2 sm:mr-3 flex-shrink-0`} />
          <h1 className={`text-xl sm:text-3xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} break-words leading-tight`}>Moderator Communications</h1>
        </div>
        <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm sm:text-lg px-2 break-words`}>Announcements and moderator-only posts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-6">
        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} rounded-lg sm:rounded-2xl p-2 sm:p-4 border text-center min-w-0`}>
          <div className={`text-lg sm:text-2xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'}`}>{announcements.length}</div>
          <div className={`text-xs sm:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} break-words`}>Total</div>
        </div>
        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} rounded-lg sm:rounded-2xl p-2 sm:p-4 border text-center min-w-0`}>
          <div className="text-lg sm:text-2xl font-bold text-blue-400">{regularAnnouncements.length}</div>
          <div className={`text-xs sm:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} break-words`}>Announcements</div>
        </div>
        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} rounded-lg sm:rounded-2xl p-2 sm:p-4 border text-center min-w-0`}>
          <div className="text-lg sm:text-2xl font-bold text-green-400">{postAnnouncements.length}</div>
          <div className={`text-xs sm:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} break-words`}>Mod Posts</div>
        </div>
        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} rounded-lg sm:rounded-2xl p-2 sm:p-4 border text-center min-w-0`}>
          <div className="text-lg sm:text-2xl font-bold text-red-400">{announcements.filter(a => a.priority === 'high').length}</div>
          <div className={`text-xs sm:text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} break-words`}>High Priority</div>
        </div>
      </div>

      {/* Add Announcement Button */}
      <div className="flex justify-center sm:justify-end mb-3 sm:mb-6 px-1">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingAnnouncement(null);
            setFormData({ title: '', content: '', priority: 'medium' });
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors flex items-center text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FiPlus className="mr-2 flex-shrink-0" />
          <span className="whitespace-nowrap">New Announcement</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={`${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'} rounded-lg sm:rounded-2xl p-3 sm:p-6 border mb-3 sm:mb-6`}>
          <h3 className={`text-base sm:text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} mb-3 sm:mb-4 break-words`}>
            {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} text-xs sm:text-sm block mb-2`}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full ${theme === 'light' ? 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-black' : 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-white'} border rounded-lg p-2 sm:p-3 text-sm sm:text-base break-words`}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div>
              <label className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} text-xs sm:text-sm block mb-2`}>Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className={`w-full ${theme === 'light' ? 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:border-black' : 'bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-white'} border rounded-lg p-2 sm:p-3 text-sm sm:text-base resize-none`}
                placeholder="Enter announcement content"
                rows={3}
                required
              />
            </div>
            <div>
              <label className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-400'} text-xs sm:text-sm block mb-2`}>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className={`w-full ${theme === 'light' ? 'bg-gray-100 border-gray-300 text-black' : 'bg-gray-800 border-gray-600 text-white'} border rounded-lg p-2 sm:p-3 focus:outline-none focus:border-white text-sm sm:text-base`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                {editingAnnouncement ? 'Update' : 'Create'} Announcement
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAnnouncement(null);
                  setFormData({ title: '', content: '', priority: 'medium' });
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-2 sm:space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-6 sm:py-12 px-4">
            <FiSpeaker className={`${theme === 'light' ? 'text-gray-400' : 'text-gray-600'} text-3xl sm:text-6xl mx-auto mb-4`} />
            <p className={`${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} text-sm sm:text-lg break-words`}>No announcements yet</p>
            <p className={`${theme === 'light' ? 'text-gray-500' : 'text-gray-500'} text-xs sm:text-sm mt-2 break-words`}>Create your first announcement to get started</p>
          </div>
        ) : (
          announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className={`${theme === 'light' ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-gray-900 border-gray-800 hover:border-gray-700'} rounded-lg sm:rounded-2xl p-3 sm:p-6 border transition-all`}
            >
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className={`text-base sm:text-xl font-bold ${theme === 'light' ? 'text-black' : 'text-white'} break-words flex-1 min-w-0`}>{announcement.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-blue-900 text-blue-300'}`}>
                        {announcement.type === 'post' ? 'MOD POST' : 'ANNOUNCEMENT'}
                      </span>
                    </div>
                  </div>
                  <p className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'} text-sm sm:text-base mb-2 sm:mb-3 break-words whitespace-pre-wrap leading-relaxed`}>{announcement.content}</p>
                  <div className={`flex flex-col sm:flex-row sm:items-center ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'} text-xs sm:text-sm gap-1 sm:gap-4`}>
                    <span className="break-words">By {announcement.authorName}</span>
                    <span className="whitespace-nowrap">{formatTimestamp(announcement.timestamp)}</span>
                  </div>
                </div>
                {announcement.type === 'announcement' && (
                  <div className="flex flex-row gap-2 justify-end flex-shrink-0">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 