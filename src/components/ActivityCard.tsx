'use client';

import { useState, useRef } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiArrowRight } from 'react-icons/fi';
import { Post } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import ActivityDetailsModal from './ActivityDetailsModal';

import { useTheme } from '@/contexts/ThemeContext';

interface ActivityCardProps {
  activity: Post;
  onUpdate: (updatedActivity: Post) => void;
  onDelete?: (postId: string) => void;
}

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
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState({
    join: false,
    delete: false,
    comment: false
  });

  // Determine image source (custom or default based on category)
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
    <div className={`card rounded-xl overflow-hidden transition-all duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
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
          {/* Category Tag - Small subtle style */}
          <div className="flex items-center mb-3">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-normal ${categoryStyle.bg} ${categoryStyle.text} border border-opacity-50 border-current`}>
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
        <p className="text-text-primary mb-4 line-clamp-3">
          {activity.content}
        </p>
        
        {/* Location & Participants */}
        <div className="flex flex-wrap items-center justify-between mb-4 text-sm">
          {activity.location && (
            <div className="flex items-center text-text-secondary mb-2 sm:mb-0">
              <FiMapPin className="mr-1" />
              <span>{activity.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-text-secondary">
            <FiUsers className="mr-1" />
            <span>
              {activity.participants?.length || 0}/{activity.maxParticipants || '∞'}
            </span>
          </div>
        </div>
        
        {/* Action Button */}
        <button
          onClick={handleOpenDetails}
          className="w-full py-2 px-4 rounded-lg bg-bg-tertiary hover:bg-hover-bg text-text-primary transition-colors flex items-center justify-center space-x-2"
        >
          <span>View Details</span>
          <FiArrowRight />
        </button>
      </div>
      
      {/* Modal */}
      <ActivityDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        activity={activity}
        onJoin={handleJoinActivity}
        onLeave={handleLeaveActivity}
        isParticipating={!!isParticipating}
      />
    </div>
  );
} 