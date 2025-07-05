'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiMessageCircle, FiUser, FiCalendar, FiMapPin, FiClock, FiUsers, FiCheck, FiX, FiTrash2, FiChevronUp, FiChevronDown, FiUserPlus, FiUserMinus } from 'react-icons/fi';
import { Post, joinActivity, leaveActivity, addComment, processTimestamp, deletePost, deletePostAsModeratorOrAdmin } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserInfo } from '@/hooks/useUserInfo';
import Image from 'next/image';
import ActivityDetailsModal from './ActivityDetailsModal';
import { Timestamp } from 'firebase/firestore';

// Default activity images by category
const DEFAULT_IMAGES = {
  'Academic': '/images/academic.jpg',
  'Sports': '/images/sports.jpg',
  'Cultural': '/images/cultural.jpg',
  'Social': '/images/social.jpg',
  'Wellness': '/images/wellness.jpg',
  'Professional': '/images/professional.jpg',
  'Volunteer': '/images/volunteer.jpg',
  'Entertainment': '/images/entertainment.jpg',
  'Other': '/images/other.jpg'
};

// Fallback image if category doesn't match
const FALLBACK_IMAGE = '/images/activity-default.jpg';

// Categories with corresponding colors for dark theme
const CATEGORIES = {
  'Academic': { bg: 'bg-blue-900', text: 'text-blue-300' },
  'Sports': { bg: 'bg-green-900', text: 'text-green-300' },
  'Cultural': { bg: 'bg-purple-900', text: 'text-purple-300' },
  'Social': { bg: 'bg-pink-900', text: 'text-pink-300' },
  'Wellness': { bg: 'bg-teal-900', text: 'text-teal-300' },
  'Professional': { bg: 'bg-indigo-900', text: 'text-indigo-300' },
  'Volunteer': { bg: 'bg-orange-900', text: 'text-orange-300' },
  'Entertainment': { bg: 'bg-red-900', text: 'text-red-300' },
  'Other': { bg: 'bg-gray-800', text: 'text-gray-300' }
};

interface ActivityCardProps {
  activity: Post;
  onUpdate: (updatedActivity: Post) => void;
  onDelete?: (postId: string) => void;
}

export default function ActivityCard({ activity, onUpdate, onDelete }: ActivityCardProps) {
  const { user, isModerator, isAdmin } = useAuth();
  const { userInfo: authorInfo, loading: authorLoading } = useUserInfo(activity.authorId);
  const [isCommenting, setIsCommenting] = useState(false);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState({
    join: false,
    like: false,
    comment: false,
    delete: false
  });

  const isParticipating = activity.participants?.some(p => p.uid === user?.uid) || false;
  const hasLiked = activity.upvotedBy?.includes(user?.uid || '') || false;
  const isAuthor = activity.authorId === user?.uid;
  const canDelete = isAuthor || isModerator || isAdmin;
  
  // Determine image source (custom or default based on category)
  const getImageSource = () => {
    if (!imageError && activity.imageURL) {
      return activity.imageURL;
    }
    
    // Use category-specific default image or fallback
    return DEFAULT_IMAGES[activity.category as keyof typeof DEFAULT_IMAGES] || FALLBACK_IMAGE;
  };

  const handleJoinActivity = async () => {
    if (!user || loading.join) return;
    setLoading({ ...loading, join: true });
    
    try {
      await joinActivity(activity.id);
      
      // Update the local state
      const updatedActivity = {
        ...activity,
        participants: [...(activity.participants || []), {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Unknown User',
          email: user.email || undefined,
          joinedAt: Timestamp.now()
        }]
      };
      
      onUpdate(updatedActivity);
    } catch (error) {
      console.error('Error joining activity:', error);
    } finally {
      setLoading({ ...loading, join: false });
    }
  };
  
  const handleLeaveActivity = async () => {
    if (!user || loading.join) return;
    setLoading({ ...loading, join: true });
    
    try {
      await leaveActivity(activity.id);
      
      // Update the local state
      const updatedActivity = {
        ...activity,
        participants: activity.participants?.filter(p => p.uid !== user.uid) || []
      };
      
      onUpdate(updatedActivity);
    } catch (error) {
      console.error('Error leaving activity:', error);
    } finally {
      setLoading({ ...loading, join: false });
    }
  };

  const handleAddComment = async () => {
    if (!user || !comment.trim() || loading.comment) return;
    setLoading({ ...loading, comment: true });

    try {
      const newComment = await addComment(activity.id, comment.trim());

      const updatedActivity = {
        ...activity,
        comments: [...(activity.comments || []), newComment]
      };

      onUpdate(updatedActivity);
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
      ? 'Are you sure you want to delete this activity? This action cannot be undone.'
      : 'Are you sure you want to delete this activity as a moderator? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading({ ...loading, delete: true });
    
    try {
      if (isAuthor) {
        await deletePost(activity.id);
      } else if (isModerator || isAdmin) {
        await deletePostAsModeratorOrAdmin(activity.id);
      }
      onDelete?.(activity.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setLoading({ ...loading, delete: false });
    }
  };

  const categoryStyle = CATEGORIES[activity.category as keyof typeof CATEGORIES] || 
    { bg: 'bg-gray-800', text: 'text-gray-300' };

  return (
    <>
      <style jsx>{`
        .custom-cursor { cursor: pointer; }
        .custom-cursor:hover { cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="%23ffffff" opacity="0.8"/></svg>'), auto; }
      `}</style>
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
                      {activity.isAnonymous ? 'Anonymous' : (authorInfo?.displayName || 'Unknown User')}
                    </span>
                    {!activity.isAnonymous && authorInfo?.realName && authorInfo.realName !== authorInfo.displayName && (
                      <span className="text-gray-500 text-sm">
                        @{authorInfo.realName}
                      </span>
                    )}
                  </>
                )}
                <span className="text-gray-500">·</span>
                <span className="text-gray-500 text-sm bg-gray-800 bg-opacity-40 px-2 py-1 rounded border border-gray-700 border-opacity-30">
                  {activity.timestamp && (
                    typeof activity.timestamp.toDate === 'function' 
                      ? new Date(activity.timestamp.toDate()).toLocaleDateString()
                      : new Date(activity.timestamp as any).toLocaleDateString()
                  )}
                </span>
              </div>
              
              {/* Delete Button */}
              {canDelete && (
                <button
                  onClick={handleDeletePost}
                  disabled={loading.delete}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-full transition-all duration-200 custom-cursor transform hover:scale-110"
                  title={isAuthor ? "Delete your activity" : "Delete as moderator"}
                >
                  {loading.delete ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiTrash2 className="text-sm" />
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="mb-3">
              <p className="text-white text-[15px] leading-normal">{activity.content}</p>
            </div>

            {/* Category Tag - Small subtle style */}
            <div className="flex items-center mb-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal bg-gray-800 bg-opacity-50 text-gray-400 border border-gray-700 border-opacity-50">
                {activity.category}
              </span>
            </div>

            {/* Activity Details - Compact Twitter style */}
            {(activity.location || activity.date || activity.time) && (
              <div className="flex flex-wrap gap-2 mb-3 text-sm text-gray-400">
                {activity.location && (
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>
                )}
                {activity.date && (
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-4 h-4" />
                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                  </div>
                )}
                {activity.time && (
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{activity.time}</span>
                  </div>
                )}
              </div>
            )}

            {/* Image */}
            {(activity.imageURL || activity.category) && (
              <div className="rounded-2xl overflow-hidden border border-gray-800 mb-3">
                <Image
                  src={getImageSource()}
                  alt={activity.content}
                  width={500}
                  height={280}
                  className="w-full h-64 object-cover cursor-pointer"
                  onError={() => setImageError(true)}
                  onClick={() => setShowModal(true)}
                />
              </div>
            )}

            {/* Action Buttons - Twitter style */}
            <div className="flex items-center justify-between text-gray-500">
              <button
                onClick={() => setIsCommenting(!isCommenting)}
                className="flex items-center space-x-2 hover:text-blue-400 transition-colors group"
              >
                <div className="p-2 rounded-full group-hover:bg-blue-900 group-hover:bg-opacity-20 transition-colors">
                  <FiMessageCircle className="w-[18px] h-[18px]" />
                </div>
                <span className="text-sm">{activity.comments?.length || 0}</span>
              </button>

              <button
                onClick={isParticipating ? handleLeaveActivity : handleJoinActivity}
                disabled={loading.join}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  isParticipating 
                    ? 'border-red-600 text-red-400 hover:bg-red-600 hover:bg-opacity-10' 
                    : 'border-blue-600 text-blue-400 hover:bg-blue-600 hover:bg-opacity-10'
                } disabled:opacity-50`}
              >
                {loading.join ? (
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                    isParticipating ? 'border-red-500' : 'border-blue-500'
                  }`}></div>
                ) : isParticipating ? (
                  'Leave'
                ) : (
                  'Join'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        activity={activity}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onJoin={handleJoinActivity}
        onLeave={handleLeaveActivity}
        isParticipating={isParticipating}
      />
    </>
  );
} 