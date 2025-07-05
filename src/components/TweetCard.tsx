'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiUser, FiTrash2, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { Post, upvotePost, downvotePost, addComment, deletePost, deletePostAsModeratorOrAdmin } from '@/lib/firebase-utils';
import { formatDistanceToNow } from 'date-fns';
import { useUserInfo } from '@/hooks/useUserInfo';

interface TweetCardProps {
  tweet: Post & { type?: 'post' | 'tweet' };  // Added type to handle both 'post' and 'tweet'
  onUpdate: (updatedTweet: Post) => void;
  onDelete: (tweetId: string) => void;
}

export default function TweetCard({ tweet, onUpdate, onDelete }: TweetCardProps) {
  const { user, isModerator, isAdmin } = useAuth();
  const { userInfo: authorInfo, loading: authorLoading } = useUserInfo(tweet.authorId);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = user?.uid === tweet.authorId;
  const canDelete = isAuthor || isModerator || isAdmin;
  const hasUpvoted = user ? tweet.upvotedBy.includes(user.uid) : false;
  const hasDownvoted = user ? tweet.downvotedBy.includes(user.uid) : false;

  const handleUpvote = async () => {
    if (!user || isVoting) return;
    setIsVoting(true);
    
    try {
      const result = await upvotePost(tweet.id);
      
      // Update local state
      const updatedTweet = {
        ...tweet,
        upvotes: result ? tweet.upvotes + 1 : Math.max(0, tweet.upvotes - 1),
        upvotedBy: result 
          ? [...tweet.upvotedBy, user.uid]
          : tweet.upvotedBy.filter(uid => uid !== user.uid),
        // Remove from downvotes if switching
        downvotes: hasDownvoted && result ? Math.max(0, tweet.downvotes - 1) : tweet.downvotes,
        downvotedBy: hasDownvoted && result 
          ? tweet.downvotedBy.filter(uid => uid !== user.uid)
          : tweet.downvotedBy
      };
      
      onUpdate(updatedTweet);
    } catch (error: any) {
      console.error('Error upvoting tweet:', error);
      if (error.message === 'Please wait before voting again') {
        // Show brief feedback to user
        const button = document.querySelector(`[data-upvote-${tweet.id}]`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        }
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async () => {
    if (!user || isVoting) return;
    setIsVoting(true);
    
    try {
      const result = await downvotePost(tweet.id);
      
      // Update local state
      const updatedTweet = {
        ...tweet,
        downvotes: result ? tweet.downvotes + 1 : Math.max(0, tweet.downvotes - 1),
        downvotedBy: result 
          ? [...tweet.downvotedBy, user.uid]
          : tweet.downvotedBy.filter(uid => uid !== user.uid),
        // Remove from upvotes if switching
        upvotes: hasUpvoted && result ? Math.max(0, tweet.upvotes - 1) : tweet.upvotes,
        upvotedBy: hasUpvoted && result 
          ? tweet.upvotedBy.filter(uid => uid !== user.uid)
          : tweet.upvotedBy
      };
      
      onUpdate(updatedTweet);
    } catch (error: any) {
      console.error('Error downvoting tweet:', error);
      if (error.message === 'Please wait before voting again') {
        // Show brief feedback to user
        const button = document.querySelector(`[data-downvote-${tweet.id}]`);
        if (button) {
          button.classList.add('animate-pulse');
          setTimeout(() => button.classList.remove('animate-pulse'), 1000);
        }
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || isCommenting) return;
    setIsCommenting(true);
    
    try {
      const comment = await addComment(tweet.id, newComment.trim(), tweet.isAnonymous);
      
      // Update local state
      const updatedTweet = {
        ...tweet,
        comments: [...(tweet.comments || []), comment]
      };
      
      onUpdate(updatedTweet);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteTweet = async () => {
    if (!user || !canDelete) return;

    try {
      if (isAuthor) {
        // Author deleting their own post
        await deletePost(tweet.id);
      } else if (isModerator || isAdmin) {
        // Moderator/Admin deleting any post
        await deletePostAsModeratorOrAdmin(tweet.id);
      }
      
      onDelete(tweet.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting tweet:', error);
      alert('Failed to delete tweet. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    
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
      return 'Just now';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 hover:bg-gray-950 hover:bg-opacity-40 transition-all duration-300 cursor-pointer border-b border-gray-800"
    >
      <div className="flex space-x-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105">
          <FiUser className="text-white text-lg" />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
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
                  <span className="font-bold text-white text-lg">
                    {tweet.isAnonymous ? 'Anonymous' : (authorInfo?.displayName || 'Unknown User')}
                  </span>
                  {!tweet.isAnonymous && authorInfo?.realName && authorInfo.realName !== authorInfo.displayName && (
                    <span className="text-gray-400 text-base">
                      @{authorInfo.realName}
                    </span>
                  )}
                </>
              )}
              <span className="text-gray-500">·</span>
              <span className="text-gray-500 text-sm bg-gray-800 bg-opacity-40 px-2 py-1 rounded border border-gray-700 border-opacity-30">
                {tweet.timestamp && (
                  typeof tweet.timestamp.toDate === 'function' 
                    ? new Date(tweet.timestamp.toDate()).toLocaleDateString()
                    : new Date(tweet.timestamp as any).toLocaleDateString()
                )}
              </span>
            </div>
            
            {/* Delete Button */}
            {canDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-full transition-all duration-200 custom-cursor transform hover:scale-110"
                title={isAuthor ? "Delete your tweet" : "Delete as moderator"}
              >
                <FiTrash2 className="text-sm" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="py-2">
            <p className="text-white text-base leading-relaxed">{tweet.content}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsCommenting(!isCommenting)}
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-all duration-200 group custom-cursor"
            >
              <div className="p-2 rounded-full group-hover:bg-blue-900 group-hover:bg-opacity-30 transition-all duration-200 transform group-hover:scale-110">
                <FiMessageCircle className="text-lg" />
              </div>
              <span className="text-sm font-medium">{tweet.comments?.length || 0}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                disabled={isVoting}
                className={`flex items-center space-x-2 transition-all duration-200 group custom-cursor ${
                  hasUpvoted ? 'text-green-400' : 'text-gray-400 hover:text-green-400'
                }`}
                data-upvote={tweet.id}
              >
                <div className={`p-2 rounded-full transition-all duration-200 transform group-hover:scale-110 ${
                  hasUpvoted 
                    ? 'bg-green-900 bg-opacity-30' 
                    : 'group-hover:bg-green-900 group-hover:bg-opacity-30'
                }`}>
                  {isVoting ? (
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiChevronUp className="text-lg" />
                  )}
                </div>
                <span className="text-sm font-medium">{tweet.upvotes || 0}</span>
              </button>

              <button
                onClick={handleDownvote}
                disabled={isVoting}
                className={`flex items-center space-x-2 transition-all duration-200 group custom-cursor ${
                  hasDownvoted ? 'text-red-400' : 'text-gray-400 hover:text-red-400'
                }`}
                data-downvote={tweet.id}
              >
                <div className={`p-2 rounded-full transition-all duration-200 transform group-hover:scale-110 ${
                  hasDownvoted 
                    ? 'bg-red-900 bg-opacity-30' 
                    : 'group-hover:bg-red-900 group-hover:bg-opacity-30'
                }`}>
                  {isVoting ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiChevronDown className="text-lg" />
                  )}
                </div>
                <span className="text-sm font-medium">{tweet.downvotes || 0}</span>
              </button>
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 pt-4 border-t border-gray-800"
            >
              {/* Comments List */}
              {tweet.comments && tweet.comments.length > 0 && (
                <div className="space-y-4 mb-6 max-h-48 overflow-y-auto">
                  {tweet.comments.map((comment, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-gray-300 text-sm" />
                      </div>
                      <div className="bg-gray-900 rounded-2xl p-4 flex-grow hover:bg-gray-800 transition-colors duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-200">{comment.author}</span>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {formatTimestamp(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-white leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-white text-sm" />
                </div>
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 px-5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all duration-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || isCommenting}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-400 disabled:text-gray-600 transition-colors duration-200 px-2 py-1 rounded"
                  >
                    {isCommenting ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="font-semibold">Post</span>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-2xl border border-gray-700 max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Delete Tweet</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this tweet? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTweet}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 