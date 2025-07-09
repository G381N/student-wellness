'use client';

import { useState } from 'react';
import { FiMessageSquare, FiCalendar, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface ActivityCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  organizer: string;
  maxParticipants?: number;
  currentParticipants?: number;
}

const getCategoryColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'academic': 'border-yellow-500',
    'cultural': 'border-purple-500',
    'sports': 'border-green-500',
    'professional': 'border-blue-500',
    'social': 'border-pink-500',
    'volunteer': 'border-orange-500',
    'entertainment': 'border-red-500',
    'wellness': 'border-teal-500',
    'other': 'border-gray-500'
  };
  return colors[category.toLowerCase()] || colors['other'];
};

const getCategoryTextColor = (category: string): string => {
  const colors: { [key: string]: string } = {
    'academic': 'text-yellow-500',
    'cultural': 'text-purple-500',
    'sports': 'text-green-500',
    'professional': 'text-blue-500',
    'social': 'text-pink-500',
    'volunteer': 'text-orange-500',
    'entertainment': 'text-red-500',
    'wellness': 'text-teal-500',
    'other': 'text-gray-500'
  };
  return colors[category.toLowerCase()] || colors['other'];
};

export default function ActivityCard({
  id,
  title,
  description,
  category,
  date,
  time,
  location,
  imageUrl,
  organizer,
  maxParticipants = 0,
  currentParticipants = 0
}: ActivityCardProps) {
  const [isJoined, setIsJoined] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const { user } = useAuth();

  const handleJoin = () => {
    // TODO: Implement join functionality
    setIsJoined(!isJoined);
  };

  const handleComment = () => {
    setShowCommentModal(true);
  };

  const categoryColorClass = getCategoryColor(category);
  const categoryTextClass = getCategoryTextColor(category);

  return (
    <div className="bg-bg-secondary rounded-xl border border-border-primary p-4 shadow-app hover:shadow-app-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
        <Image
          src={imageUrl || '/images/activity-default.jpg'}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Category Tag */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-sm border ${categoryColorClass} ${categoryTextClass}`}>
            {category}
          </span>
          {maxParticipants > 0 && (
            <span className="text-sm text-text-tertiary">
              {currentParticipants}/{maxParticipants} participants
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>

        {/* Description */}
        <p className="text-text-secondary text-sm line-clamp-2">{description}</p>

        {/* Details */}
        <div className="space-y-2">
          <div className="flex items-center text-text-tertiary text-sm">
            <FiCalendar className="mr-2" />
            <span>{date}</span>
          </div>
          <div className="flex items-center text-text-tertiary text-sm">
            <FiClock className="mr-2" />
            <span>{time}</span>
          </div>
          <div className="flex items-center text-text-tertiary text-sm">
            <FiMapPin className="mr-2" />
            <span>{location}</span>
          </div>
          <div className="flex items-center text-text-tertiary text-sm">
            <FiUsers className="mr-2" />
            <span>{organizer}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border-primary">
          <button
            onClick={handleComment}
            className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiMessageSquare className="mr-2" />
            <span>Comment</span>
          </button>
          
          <button
            onClick={handleJoin}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isJoined
                ? 'bg-bg-tertiary text-text-secondary'
                : 'bg-accent-blue text-white hover:bg-accent-blue-hover'
            }`}
          >
            {isJoined ? 'Joined' : 'Join Activity'}
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-xl p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold mb-4">Ask a Question</h3>
            <textarea
              className="w-full h-32 bg-bg-tertiary border border-border-primary rounded-lg p-3 text-text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Type your question here..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:bg-hover-bg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // TODO: Implement comment submission
                  setShowCommentModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-accent-blue text-white hover:bg-accent-blue-hover transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 