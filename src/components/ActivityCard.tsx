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
import { formatDistanceToNow } from 'date-fns';

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

// Categories mapping (colors removed)
const CATEGORIES = {
  'Academic': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Sports': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Cultural': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Social': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Wellness': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Professional': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Volunteer': { bg: 'bg-gray-800', text: 'text-gray-300' },
  'Entertainment': { bg: 'bg-gray-800', text: 'text-gray-300' },
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  const isFull = activity.maxParticipants !== undefined && activity.participants && activity.participants.length >= activity.maxParticipants;
  
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
      setShowDeleteConfirm(false);
    }
  };


  return (
    <>
      <div 
        className="bg-gray-900 rounded-2xl p-4 sm:p-6 border border-gray-800 relative group transition-colors hover:bg-gray-800/50"
        onClick={() => setShowModal(true)}
      >
        {/* Image Header */}
        <div className="relative h-48 w-full overflow-hidden rounded-xl mb-4">
          <Image
            src={getImageSource()}
            alt={activity.title || 'Activity Image'}
            layout="fill"
            objectFit="cover"
            onError={() => setImageError(true)}
            className="transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-800 bg-opacity-70 text-white border border-gray-700">
              {activity.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-white mb-2 truncate">{activity.title || activity.content}</h2>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{activity.content}</p>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4 text-xs">
          {activity.date && (
            <div className="flex items-center gap-1.5 bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
              <FiCalendar />
              <span>{activity.date}</span>
            </div>
          )}
          {activity.time && (
            <div className="flex items-center gap-1.5 bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
              <FiClock />
              <span>{activity.time}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
            <FiUsers />
            <span>{activity.participants?.length || 0} / {activity.maxParticipants || '∞'}</span>
          </div>
        </div>
        
        {/* Author Info */}
        <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-800">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
            <FiUser className="text-white text-base" />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-white">{activity.isAnonymous ? 'Anonymous' : authorInfo?.displayName || 'Unknown'}</p>
            <p className="text-gray-500">
              {activity.timestamp && typeof activity.timestamp.toDate === 'function' 
                ? formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })
                : 'some time ago'
              }
            </p>
          </div>
        </div>

        {/* Delete button for mods/admins - subtle */}
        {canDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
            className="absolute top-4 right-4 z-10 p-2 text-white bg-black/50 hover:bg-black/80 rounded-full transition-all duration-200"
            title={isAuthor ? "Delete your activity" : "Delete as moderator"}
          >
            <FiTrash2 className="text-base" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <ActivityDetailsModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            activity={activity}
            onJoin={handleJoinActivity}
            onLeave={handleLeaveActivity}
            isParticipating={isParticipating}
          />
        )}
      </AnimatePresence>
      
      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg text-center max-w-sm w-full">
              <h3 className="font-semibold text-white text-lg mb-2">Are you sure?</h3>
              <p className="text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                  className="flex-1 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeletePost(); }}
                  className="flex-1 bg-white text-black font-semibold py-2 px-4 rounded-lg transition-colors hover:bg-gray-300"
                >
                  {loading.delete ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 