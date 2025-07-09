'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiThumbsUp, FiMessageCircle, FiSend, FiAlertCircle, FiUser, FiX, FiTrash2, FiHeart, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Post, upvotePost, downvotePost, addComment, processTimestamp, deletePost, deletePostAsModeratorOrAdmin } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserInfo } from '@/hooks/useUserInfo';
import { formatDistanceToNow } from 'date-fns';

// Fallback image if category doesn't match
const FALLBACK_IMAGE = '/images/activity-default.jpg';

// Categories mapping (colors removed)
const CATEGORIES = {
  'Mental Health': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Bullying': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Loneliness': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Academic Stress': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Discrimination': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Safety': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Wellness': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Facilities': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Other': { bg: 'bg-gray-800', text: 'text-gray-300' }
};

// Status badges for dark theme (colors removed)
const STATUS_BADGES = {
  'new': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'reviewing': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'resolved': { bg: 'bg-gray-800', text: 'text-gray-300' }
};

interface ConcernCardProps {
  concern: Post;
  onUpdate: (updatedConcern: Post) => void;
  onDelete?: (postId: string) => void;
}

export default function ConcernCard({ concern, onUpdate, onDelete }: ConcernCardProps) {
  const { user, isModerator, isAdmin } = useAuth();
  const { userInfo: authorInfo, loading: authorLoading } = useUserInfo(concern.authorId);
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState({
    upvote: false,
    comment: false,
    delete: false
  });
  const [showComments, setShowComments] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const commentInputRef = useRef<HTMLInputElement>(null);
  
  const handleToggleComment = () => {
    setIsCommenting(!isCommenting);
    // Focus the comment input when it becomes visible
    if (!isCommenting) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  };
  
  const hasUpvoted = concern.upvotedBy?.includes(user?.uid || '') || false;
  const isAuthor = concern.authorId === user?.uid;
  const canDelete = isAuthor || isModerator || isAdmin;
  
  const handleEscalate = async () => {
    if (!user || loading.upvote) return;
    setLoading({ ...loading, upvote: true });
    
    try {
      const result = await upvotePost(concern.id);
      
      // Update the local state
      const updatedConcern = { 
        ...concern,
        upvotes: result ? concern.upvotes + 1 : concern.upvotes - 1,
        upvotedBy: result 
          ? [...(concern.upvotedBy || []), user.uid]
          : concern.upvotedBy?.filter(id => id !== user.uid) || []
      };
      
      onUpdate(updatedConcern);
    } catch (error) {
      console.error('Error escalating concern:', error);
    } finally {
      setLoading({ ...loading, upvote: false });
    }
  };
  
  const handleAddComment = async () => {
    if (!user || !comment.trim() || loading.comment) return;
    setLoading({ ...loading, comment: true });

    try {
      const newComment = await addComment(concern.id, comment.trim(), concern.isAnonymous);

      const updatedConcern = {
        ...concern,
        comments: [...(concern.comments || []), newComment]
      };

      onUpdate(updatedConcern);
      setComment('');
      setIsCommenting(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading({ ...loading, comment: false });
    }
  };
  
  const handleDeletePost = async () => {
    if (!user || !canDelete || loading.delete) return;
    
    const confirmMessage = isAuthor 
      ? 'Are you sure you want to delete this concern? This action cannot be undone.'
      : 'Are you sure you want to delete this concern as a moderator? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading({ ...loading, delete: true });
    
    try {
      if (isAuthor) {
        await deletePost(concern.id);
      } else if (isModerator || isAdmin) {
        await deletePostAsModeratorOrAdmin(concern.id);
      }
      onDelete?.(concern.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setLoading({ ...loading, delete: false });
    }
  };
  
  // Get category styles
  const categoryStyle = CATEGORIES[concern.category as keyof typeof CATEGORIES] || 
    { bg: 'bg-gray-800', text: 'text-gray-300' };
  
  // Get status badge style
  const statusStyle = concern.status ? STATUS_BADGES[concern.status as keyof typeof STATUS_BADGES] : 
    { bg: 'bg-gray-800', text: 'text-gray-300' };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 relative group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-gray-800 rounded-full mt-1">
          <FiAlertCircle className="text-gray-400 text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">
                {concern.isAnonymous ? 'Anonymous Concern' : (authorInfo?.displayName || 'Unknown User')}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(concern.timestamp), { addSuffix: true })}
              </p>
            </div>
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-500 hover:text-white transition-colors duration-200 p-2 rounded-full opacity-0 group-hover:opacity-100 -mr-2"
              >
                <FiTrash2 className="text-lg" />
              </button>
            )}
          </div>
          <p className="text-gray-300 mt-2">{concern.content}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700">
              {concern.category}
            </span>
            {concern.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 capitalize">
                {concern.status}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6 mt-4 text-gray-400">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 hover:text-white transition-colors duration-200"
            >
              <FiMessageCircle className="text-lg" />
              <span className="text-sm font-medium">{concern.comments?.length || 0}</span>
            </button>
            <button
              onClick={handleEscalate}
              disabled={loading.upvote}
              className={`flex items-center space-x-2 transition-colors duration-200 ${
                hasUpvoted ? 'text-white' : 'hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-full ${hasUpvoted ? 'bg-gray-700' : 'group-hover:bg-gray-800'}`}>
                {loading.upvote ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiThumbsUp className="text-lg" />
                )}
              </div>
              <span className="text-sm font-semibold">{concern.upvotes || 0}</span>
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pl-12">
          <div className="space-y-4">
            {concern.comments && concern.comments.map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <div className="p-2 bg-gray-800 rounded-full mt-1">
                  <FiUser className="text-gray-500 text-base" />
                </div>
                <div className="flex-1 bg-gray-800 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-sm">
                      {comment.isAnonymous ? 'Anonymous' : comment.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex space-x-3">
            <input
              ref={commentInputRef}
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
              onClick={handleAddComment}
              disabled={loading.comment || !comment.trim()}
              className="bg-white text-black font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {loading.comment ? '...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-2xl">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg text-center">
            <h3 className="font-semibold text-white text-lg mb-2">Are you sure?</h3>
            <p className="text-gray-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="flex-1 bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-white"
              >
                {loading.delete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 