'use client';

import { FiMessageCircle, FiChevronUp, FiChevronDown, FiTrash2, FiUser, FiUserPlus, FiUserMinus } from 'react-icons/fi';
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
    <>
      <div 
        className={`card rounded-xl overflow-hidden transition-all duration-300 ${
          tweet.priority === 'urgent' ? 'border-error border-2' : ''
        }`}
      >
        {/* Card Header */}
        <div className="p-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-bg-tertiary rounded-full flex items-center justify-center">
              <FiUser className="text-text-secondary" />
            </div>
            
            {/* User Info & Tweet Time */}
            <div>
              <div className="flex items-center">
                <span className="font-semibold text-text-primary">
                  {tweet.isAnonymous ? 'Anonymous User' : tweet.author}
                </span>
                {tweet.priority === 'urgent' && (
                  <span className="ml-2 px-2 py-0.5 bg-error bg-opacity-10 text-error text-xs rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <span className="text-text-tertiary text-sm">
                {formatDistanceToNow(new Date(tweet.timestamp), { addSuffix: true })}
              </span>
            </div>
          </div>
          {canDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-text-tertiary hover:text-text-primary transition-colors duration-200 p-2 rounded-full hover:bg-hover-bg"
            >
              <FiTrash2 className="text-lg" />
            </button>
          )}
        </div>

        {/* Tweet Content */}
        <div className="p-4">
          <p className="text-text-primary">{tweet.content}</p>

          {/* Activity Details */}
          {tweet.type === 'activity' && (
            <div className="mt-4 bg-bg-tertiary bg-opacity-50 rounded-xl p-4">
              <h3 className="font-semibold text-text-primary mb-2">{tweet.title || tweet.content}</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                {tweet.date && <p>📅 Date: {tweet.date}</p>}
                {tweet.time && <p>⏰ Time: {tweet.time}</p>}
                {tweet.location && <p>📍 Location: {tweet.location}</p>}
                <p>👥 Participants: {tweet.participants?.length || 0}/{tweet.maxParticipants || '∞'}</p>
              </div>
              <button
                onClick={handleJoinActivity}
                disabled={isJoining || (isFull && !isParticipating)}
                className={`mt-4 w-full py-2 px-4 rounded-full flex items-center justify-center space-x-2 transition-all duration-200 ${
                  isParticipating
                    ? 'bg-bg-tertiary hover:bg-hover-bg text-text-primary'
                    : isFull
                    ? 'bg-bg-tertiary text-text-tertiary cursor-not-allowed'
                    : 'bg-accent-blue hover:bg-accent-blue-hover text-text-primary'
                }`}
              >
                {isJoining ? (
                  <div className="w-5 h-5 border-2 border-text-secondary border-t-transparent rounded-full animate-spin"></div>
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

          {/* Voting buttons */}
          <div className="flex items-center space-x-4 mt-4">
            {/* Comment button - always visible */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-text-tertiary hover:text-text-secondary transition-all duration-200 group custom-cursor"
            >
              <div className="p-2 rounded-full group-hover:bg-hover-bg transition-all duration-200 transform group-hover:scale-110">
                <FiMessageCircle className="text-lg" />
              </div>
              <span className="text-sm font-medium">{tweet.comments?.length || 0}</span>
            </button>

            {/* Voting buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                disabled={isVoting}
                className={`flex items-center space-x-2 transition-all duration-200 group custom-cursor ${
                  hasUpvoted ? 'text-vote-up' : 'text-text-tertiary hover:text-text-secondary'
                }`}
                data-upvote={tweet.id}
              >
                <div className={`p-2 rounded-full transition-all duration-200 transform group-hover:scale-110 ${
                  hasUpvoted 
                    ? 'bg-vote-up bg-opacity-10' 
                    : 'group-hover:bg-hover-bg'
                }`}>
                  {isVoting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
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
                  hasDownvoted ? 'text-vote-down' : 'text-text-tertiary hover:text-text-secondary'
                }`}
                data-downvote={tweet.id}
              >
                <div className={`p-2 rounded-full transition-all duration-200 transform group-hover:scale-110 ${
                  hasDownvoted 
                    ? 'bg-vote-down bg-opacity-10' 
                    : 'group-hover:bg-hover-bg'
                }`}>
                  {isVoting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiChevronDown className="text-lg" />
                  )}
                </div>
                <span className="text-sm font-medium">{tweet.downvotes || 0}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        {showComments && (
          <div className="p-4 border-t border-border-primary">
            {/* Comment input */}
            {user ? (
              <div className="relative">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full bg-bg-tertiary border border-border-primary rounded-full py-3 px-5 text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent-blue focus:bg-bg-tertiary transition-all duration-200"
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary hover:text-text-primary disabled:text-text-tertiary transition-colors duration-200 px-2 py-1 rounded"
                >
                  {isCommenting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="font-semibold">Post</span>
                  )}
                </button>
              </div>
            ) : (
              <p className="text-text-tertiary text-sm">Please sign in to comment.</p>
            )}

            {/* Comments list */}
            <div className="space-y-3 mt-4">
              {tweet.comments?.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3 bg-bg-tertiary bg-opacity-50 p-4 rounded-xl">
                  <div className="p-2 bg-bg-tertiary rounded-full">
                    <FiUser className="text-text-tertiary text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-text-primary">{comment.author || 'Anonymous'}</p>
                    <p className="text-text-secondary mt-1">{comment.content}</p>
                    <p className="text-sm text-text-tertiary mt-1">
                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-bg-overlay flex items-center justify-center z-50">
          <div className="bg-bg-secondary p-8 rounded-2xl border border-border-primary max-w-md mx-4">
            <h3 className="text-xl font-bold text-text-primary mb-4">Delete Post</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-6 py-3 bg-bg-tertiary text-text-primary rounded-full hover:bg-hover-bg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTweet}
                className="flex-1 px-6 py-3 bg-accent-blue text-text-primary rounded-full hover:bg-accent-blue-hover transition-all duration-200 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 