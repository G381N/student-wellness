'use client';

import { useState, useRef } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiArrowRight, FiThumbsUp, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { Post, upvotePost, addComment, deletePost } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import ActivityDetailsModal from './ActivityDetailsModal';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

interface ActivityCardProps {
  activity: Post;
  onUpdate: (updatedActivity: Post) => void;
  onDelete?: (postId: string) => void;
}

// Default activity images by category
const DEFAULT_IMAGES = {
  'Academic': '/images/academic1.jpeg',
  'Sports': '/images/sports1.jpeg',
  'Cultural': '/images/cultural.jpg',
  'Social': '/images/social.jpg',
  'Wellness': '/images/wellness.jpg',
  'Professional': '/images/professional.jpeg',
  'Volunteer': '/images/volunteer.jpg',
  'Entertainment': '/images/entertainment.jpg',
  'Other': '/images/other.jpg'
};

// Fallback image if category doesn't match
const FALLBACK_IMAGE = '/images/activity-default.jpg';

// Category styling
const CATEGORIES = {
  'Academic': { bg: 'bg-category-academic bg-opacity-20', text: 'text-category-academic' },
  'Sports': { bg: 'bg-category-sports bg-opacity-20', text: 'text-category-sports' },
  'Cultural': { bg: 'bg-category-cultural bg-opacity-20', text: 'text-category-cultural' },
  'Social': { bg: 'bg-category-social bg-opacity-20', text: 'text-category-social' },
  'Wellness': { bg: 'bg-category-wellness bg-opacity-20', text: 'text-category-wellness' },
  'Professional': { bg: 'bg-category-professional bg-opacity-20', text: 'text-category-professional' },
  'Volunteer': { bg: 'bg-category-volunteer bg-opacity-20', text: 'text-category-volunteer' },
  'Entertainment': { bg: 'bg-category-entertainment bg-opacity-20', text: 'text-category-entertainment' },
  'Other': { bg: 'bg-category-other bg-opacity-20', text: 'text-category-other' }
};

export default function ActivityCard({ activity, onUpdate, onDelete }: ActivityCardProps) {
  const { user, isModerator } = useAuth();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasUpvoted = activity.upvotedBy?.includes(user?.uid || '');

  const handleUpvote = async () => {
    if (!user || isVoting) return;
    setIsVoting(true);
    try {
      const upvoted = await upvotePost(activity.id);
      const updatedPost = {
        ...activity,
        upvotes: upvoted ? (activity.upvotes || 0) + 1 : Math.max(0, (activity.upvotes || 0) - 1),
        upvotedBy: upvoted ? [...(activity.upvotedBy || []), user.uid] : (activity.upvotedBy || []).filter(id => id !== user.uid),
      };
      onUpdate(updatedPost);
    } catch (error) {
      console.error('Error upvoting post:', error);
      toast.error('Failed to upvote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const comment = await addComment(activity.id, newComment.trim());
      const updatedPost = {
        ...activity,
        comments: [...(activity.comments || []), comment],
      };
      onUpdate(updatedPost);
      setNewComment('');
      setShowComments(true);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this activity? This action cannot be undone.');
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deletePost(activity.id);
      onDelete(activity.id);
      toast.success('Activity deleted successfully.');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete activity. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryImage = (category: string) => {
    return DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || FALLBACK_IMAGE;
  };

  const handleOpenDetails = () => {
    setIsModalOpen(true);
  };

  // Check if user is already participating
  const isParticipating = activity.participants?.some(p => p.uid === user?.uid);
  
  // Handle join activity
  const handleJoinActivity = async () => {
    // Implementation will be handled in the modal
    console.log('Join activity handled in modal');
  };
  
  // Handle leave activity
  const handleLeaveActivity = async () => {
    // Implementation will be handled in the modal
    console.log('Leave activity handled in modal');
  };

  const categoryStyle = CATEGORIES[activity.category as keyof typeof CATEGORIES] || 
    { bg: 'bg-bg-tertiary', text: 'text-text-secondary' };

  return (
    <div className={`card rounded-xl overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-800'}`}>
      {/* Header with Image */}
      <div className="relative">
        {/* Activity Image */}
        <div className="h-48 w-full relative overflow-hidden">
          <Image
            src={activity.imageURL || getCategoryImage(activity.category)}
            alt={activity.title || activity.category}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category Tag - Now with solid background */}
          <div className="flex items-center mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-gray-900 ${categoryStyle.bg.replace('bg-opacity-20', '')}`}>
              {activity.category}
            </span>
          </div>
          
          {/* Title */}
          <h3 className="text-white font-bold text-xl mb-1 line-clamp-2">
            {activity.title || activity.content.substring(0, 50)}
          </h3>
          
          {/* Date & Time */}
          <div className="flex items-center space-x-4 text-white/80 text-sm">
            {activity.date && (
              <div className="flex items-center">
                <FiCalendar className="mr-1" />
                <span>{activity.date}</span>
              </div>
            )}
            {activity.time && (
              <div className="flex items-center">
                <FiClock className="mr-1" />
                <span>{activity.time}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Body Content */}
      <div className="p-4">
        {/* Description */}
        <p className={`text-text-primary mb-4 line-clamp-3 ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'}`}>
          {activity.content}
        </p>
        
        {/* Location & Participants */}
        <div className="flex flex-wrap items-center justify-between mb-4 text-sm">
          {activity.location && (
            <div className={`flex items-center mb-2 sm:mb-0 ${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
              <FiMapPin className="mr-1" />
              <span>{activity.location}</span>
            </div>
          )}
          
          <div className={`flex items-center ${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>
            <FiUsers className="mr-1" />
            <span>
              {activity.participants?.length || 0}/{activity.maxParticipants || '∞'}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleUpvote}
            disabled={isVoting}
            className={`flex items-center space-x-2 transition-all duration-200 group custom-cursor ${
              hasUpvoted ? 'text-vote-up' : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            <div className={`p-2 rounded-full transition-all duration-200 transform group-hover:scale-110 ${
              hasUpvoted 
                ? 'bg-vote-up/10' 
                : 'group-hover:bg-hover-bg'
            }`}>
              {isVoting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FiThumbsUp className="text-lg" />
              )}
            </div>
            <span className="text-sm font-medium">{activity.upvotes || 0}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-text-tertiary hover:text-text-secondary transition-all duration-200 group custom-cursor"
          >
            <div className="p-2 rounded-full group-hover:bg-hover-bg transition-all duration-200 transform group-hover:scale-110">
              <FiMessageCircle className="text-lg" />
            </div>
            <span className="text-sm font-medium">{activity.comments?.length || 0}</span>
          </button>
          <button
            onClick={handleOpenDetails}
            className={`w-full py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 ${theme === 'light' ? 'bg-gray-100 hover:bg-gray-200 text-gray-800' : 'bg-bg-tertiary hover:bg-hover-bg text-text-primary'}`}
          >
            <span>View Details</span>
            <FiArrowRight />
          </button>
          {isModerator && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-all duration-200 group custom-cursor"
            >
              <div className="p-2 rounded-full group-hover:bg-red-500/10 transition-all duration-200 transform group-hover:scale-110">
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiTrash2 className="text-lg" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border-primary">
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
            <div className="space-y-3 mt-4">
              {activity.comments?.map((comment, index) => (
                <div key={index} className="flex items-start space-x-3 bg-bg-tertiary bg-opacity-50 p-4 rounded-xl">
                  <div className="p-2 bg-bg-tertiary rounded-full">
                    <FiUsers className="text-text-tertiary text-lg" />
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
      
      {/* Modal */}
      <ActivityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={activity}
        onUpdate={onUpdate}
        isParticipating={!!isParticipating}
      />
    </div>
  );
}