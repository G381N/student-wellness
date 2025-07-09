'use client';

import { FiMessageCircle, FiChevronUp, FiChevronDown, FiTrash2, FiUser, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Post, addComment, upvotePost, downvotePost, deletePost, deletePostAsModeratorOrAdmin, joinActivity, leaveActivity } from '@/lib/firebase-utils';
import { formatDistanceToNow } from 'date-fns';

interface TweetCardProps {
  tweet: Post;
  onUpdate: (updatedPost: Post) => void;
  onDelete?: () => void;
}

export default function TweetCard({ tweet, onUpdate, onDelete }: TweetCardProps) {
  const { user, isAdmin, isModerator } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const hasUpvoted = tweet.upvotedBy?.includes(user?.uid || '');
  const hasDownvoted = tweet.downvotedBy?.includes(user?.uid || '');
  const canDelete = user?.uid === tweet.authorId || isAdmin || isModerator;
  const isParticipating = tweet.participants?.some(p => p.uid === user?.uid);
  const isFull = tweet.maxParticipants !== undefined && tweet.participants && tweet.participants.length >= tweet.maxParticipants;

  const handleUpvote = async () => {
    if (!user || isVoting) return;
    setIsVoting(true);
    try {
      const hasUpvoted = await upvotePost(tweet.id);
      if (mountedRef.current) {
        const updatedPost = {
          ...tweet,
          upvotes: hasUpvoted ? (tweet.upvotes || 0) + 1 : Math.max(0, (tweet.upvotes || 0) - 1),
          upvotedBy: hasUpvoted ? [...(tweet.upvotedBy || []), user.uid] : (tweet.upvotedBy || []).filter(id => id !== user.uid),
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
      if (mountedRef.current) {
        toast.error('Failed to upvote. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setIsVoting(false);
      }
    }
  };

  const handleDownvote = async () => {
    if (!user || isVoting) return;
    setIsVoting(true);
    try {
      const hasDownvoted = await downvotePost(tweet.id);
      if (mountedRef.current) {
        const updatedPost = {
          ...tweet,
          downvotes: hasDownvoted ? (tweet.downvotes || 0) + 1 : Math.max(0, (tweet.downvotes || 0) - 1),
          downvotedBy: hasDownvoted ? [...(tweet.downvotedBy || []), user.uid] : (tweet.downvotedBy || []).filter(id => id !== user.uid),
        };
        onUpdate(updatedPost);
      }
    } catch (error) {
      console.error('Error downvoting post:', error);
      if (mountedRef.current) {
        toast.error('Failed to downvote. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setIsVoting(false);
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const comment = await addComment(tweet.id, newComment.trim());
      
      if (mountedRef.current) {
        // Update local state
        const updatedPost = {
          ...tweet,
          comments: [...(tweet.comments || []), comment],
        };
        
        onUpdate(updatedPost);
        setNewComment('');
        setShowComments(true);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      if (mountedRef.current) {
        toast.error('Failed to add comment. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setIsCommenting(false);
      }
    }
  };

  const handleJoinActivity = async () => {
    if (!user) {
      toast.error('Please sign in to join activities');
      return;
    }

    if (isJoining) return;

    try {
      setIsJoining(true);
      if (isParticipating) {
        await leaveActivity(tweet.id);
        if (mountedRef.current) {
          const updatedParticipants = tweet.participants?.filter(p => p.uid !== user.uid) || [];
          onUpdate({ ...tweet, participants: updatedParticipants });
          toast.success('Left the activity successfully');
        }
      } else {
        if (isFull) {
          toast.error('This activity is full');
          return;
        }
        await joinActivity(tweet.id);
        if (mountedRef.current) {
          const newParticipant = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
            email: user.email || undefined,
            joinedAt: new Date()
          };
          const updatedParticipants = [...(tweet.participants || []), newParticipant];
          onUpdate({ ...tweet, participants: updatedParticipants });
          toast.success('Joined the activity successfully');
        }
      }
    } catch (error: any) {
      console.error('Error joining/leaving activity:', error);
      if (mountedRef.current) {
        toast.error(error.message || 'Failed to join/leave activity');
      }
    } finally {
      if (mountedRef.current) {
        setIsJoining(false);
      }
    }
  };

  const handleDeleteTweet = async () => {
    try {
      if (tweet.authorId === user?.uid) {
        // Author deleting their own post
        await deletePost(tweet.id);
      } else if (isModerator || isAdmin) {
        // Moderator/Admin deleting any post
        await deletePostAsModeratorOrAdmin(tweet.id);
      }
      
      if (mountedRef.current) {
        onDelete?.();
        setShowDeleteConfirm(false);
        toast.success('Post deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      if (mountedRef.current) {
        toast.error('Failed to delete post. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 relative group"
    >
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-gray-800 rounded-full mt-1">
          <FiUser className="text-gray-400 text-xl" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">{tweet.author || 'Anonymous'}</p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: true })}
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
          <p className="text-gray-300 mt-2">{tweet.content}</p>

          {/* Activity Details */}
          {tweet.type === 'activity' && (
            <div className="mt-4 bg-gray-800 rounded-xl p-4 border border-gray-700">
              <h3 className="font-semibold text-white mb-2">{tweet.title || tweet.content}</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {tweet.date && <p>📅 Date: {tweet.date}</p>}
                {tweet.time && <p>⏰ Time: {tweet.time}</p>}
                {tweet.location && <p>📍 Location: {tweet.location}</p>}
                <p>👥 Participants: {tweet.participants?.length || 0}/{tweet.maxParticipants || '∞'}</p>
              </div>
              <button
                onClick={handleJoinActivity}
                disabled={isJoining || (isFull && !isParticipating)}
                className={`mt-4 w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 text-sm font-semibold ${
                  isParticipating
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : isFull
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {isJoining ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isParticipating ? (
                      <FiUserMinus className="w-5 h-5" />
                    ) : (
                      <FiUserPlus className="w-5 h-5" />
                    )}
                    <span>
                      {isParticipating ? 'Leave Activity' : isFull ? 'Activity Full' : 'Join Activity'}
                    </span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center space-x-6 mt-4 text-gray-400">
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 hover:text-white transition-colors duration-200"
            >
              <FiMessageCircle className="text-lg" />
              <span className="text-sm font-medium">{tweet.comments?.length || 0}</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                disabled={isVoting}
                className={`p-1.5 rounded-full transition-colors duration-200 ${hasUpvoted ? 'text-white bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <FiChevronUp className="text-lg" />
              </button>
              <span className="text-sm font-semibold w-6 text-center text-white">{ (tweet.upvotes || 0) - (tweet.downvotes || 0) }</span>
              <button
                onClick={handleDownvote}
                disabled={isVoting}
                className={`p-1.5 rounded-full transition-colors duration-200 ${hasDownvoted ? 'text-white bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <FiChevronDown className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-4 pl-12">
          <div className="space-y-4">
            {tweet.comments && tweet.comments.map((comment) => (
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
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
            <button
              onClick={handleAddComment}
              disabled={isCommenting}
              className="bg-white text-black font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-gray-200 disabled:opacity-50"
            >
              {isCommenting ? '...' : 'Post'}
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
                onClick={handleDeleteTweet}
                className="flex-1 bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-white"
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