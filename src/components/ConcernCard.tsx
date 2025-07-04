'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiThumbsUp, FiMessageCircle, FiSend, FiAlertCircle, FiUser, FiX, FiTrash2, FiHeart, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Post, upvotePost, downvotePost, addComment, processTimestamp, deletePost, deletePostAsModeratorOrAdmin } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserInfo } from '@/hooks/useUserInfo';

// Categories with corresponding colors for dark theme
const CATEGORIES = {
  'Mental Health': { bg: 'bg-purple-900', text: 'text-purple-300' },
  'Bullying': { bg: 'bg-red-900', text: 'text-red-300' },
  'Loneliness': { bg: 'bg-blue-900', text: 'text-blue-300' },
  'Academic Stress': { bg: 'bg-orange-900', text: 'text-orange-300' },
  'Discrimination': { bg: 'bg-pink-900', text: 'text-pink-300' },
  'Safety': { bg: 'bg-yellow-900', text: 'text-yellow-300' },
  'Wellness': { bg: 'bg-green-900', text: 'text-green-300' },
  'Facilities': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Other': { bg: 'bg-gray-800', text: 'text-gray-300' }
};

// Status badges for dark theme
const STATUS_BADGES = {
  'new': { bg: 'bg-blue-900', text: 'text-blue-300' },
  'reviewing': { bg: 'bg-yellow-900', text: 'text-yellow-300' },
  'resolved': { bg: 'bg-green-900', text: 'text-green-300' }
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
    <div className="px-4 py-3 hover:bg-gray-950 hover:bg-opacity-40 transition-all duration-300 cursor-pointer border-b border-gray-800">
      <div className="flex space-x-3">
        {/* Profile Picture */}
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FiUser className="text-white text-base" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              {authorLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-600 rounded animate-pulse"></div>
                  <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <span className="font-bold text-white text-base">
                    {concern.isAnonymous ? 'Anonymous' : concern.author || 'Unknown User'}
                  </span>
                  {!concern.isAnonymous && authorInfo?.realName && (
                    <span className="text-gray-500 text-sm">
                      @{authorInfo.realName}
                    </span>
                  )}
                  {concern.isAnonymous && (
                    <span className="text-gray-500 text-sm">
                      @anonymous
                    </span>
                  )}
                </>
              )}
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm bg-gray-800 bg-opacity-40 px-2 py-1 rounded border border-gray-700 border-opacity-30">
                {concern.timestamp && (
                  typeof concern.timestamp.toDate === 'function' 
                    ? new Date(concern.timestamp.toDate()).toLocaleDateString()
                    : new Date(concern.timestamp as any).toLocaleDateString()
                )}
              </span>
            </div>
            
            {/* Delete Button */}
            {canDelete && (
              <button
                onClick={handleDeletePost}
                disabled={loading.delete}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-full transition-all duration-200 custom-cursor transform hover:scale-110"
                title={isAuthor ? "Delete your concern" : "Delete as moderator"}
              >
                {loading.delete ? (
                  <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiTrash2 className="text-sm" />
                )}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="mb-3">
            <p className="text-white text-[15px] leading-normal">{concern.content}</p>
          </div>

          {/* Category and Status Tags - Subtle style */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-gray-800 bg-opacity-50 text-gray-400 border border-gray-700 border-opacity-50">
              {concern.category}
            </span>
            {concern.status && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-gray-800 bg-opacity-40 text-gray-500 border border-gray-600 border-opacity-40">
                {concern.status}
              </span>
            )}
          </div>

          {/* Action Buttons - Twitter style */}
          <div className="flex items-center space-x-6 text-gray-500">
            <button
              onClick={handleToggleComment}
              className="flex items-center space-x-2 hover:text-blue-400 transition-colors group"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-900 group-hover:bg-opacity-20 transition-colors">
                <FiMessageCircle className="w-[18px] h-[18px]" />
              </div>
              <span className="text-sm">{concern.comments?.length || 0}</span>
            </button>

            <button
              onClick={handleEscalate}
              disabled={loading.upvote}
              className={`flex items-center space-x-2 transition-colors group ${
                hasUpvoted ? 'text-orange-400' : 'hover:text-orange-400'
              }`}
            >
              <div className={`p-2 rounded-full transition-colors ${
                hasUpvoted 
                  ? 'bg-orange-900 bg-opacity-20' 
                  : 'group-hover:bg-orange-900 group-hover:bg-opacity-20'
              }`}>
                {loading.upvote ? (
                  <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiAlertCircle className="w-[18px] h-[18px]" />
                )}
              </div>
              <span className="text-sm">{concern.upvotes || 0}</span>
            </button>
          </div>
          
          {/* Comments section */}
          <AnimatePresence>
            {isCommenting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-800"
              >
                {/* Comments list */}
                {concern.comments && concern.comments.length > 0 && (
                  <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
                    {concern.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiUser className="text-gray-400 text-xs" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-white">{comment.authorName}</span>
                            <span className="text-xs text-gray-500">
                              {comment.timestamp && (
                                typeof comment.timestamp.toDate === 'function'
                                  ? new Date(comment.timestamp.toDate()).toLocaleDateString()
                                  : new Date(comment.timestamp as any).toLocaleDateString()
                              )}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 leading-normal">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add comment form */}
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiUser className="text-white text-xs" />
                  </div>
                  <div className="flex-grow relative">
                    <input
                      ref={commentInputRef}
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border border-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim() || loading.comment}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 text-sm font-medium"
                    >
                      {loading.comment ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 