'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiCheck, FiX, FiMoreHorizontal } from 'react-icons/fi';
import { Post } from '@/lib/firebase-utils';
import Image from 'next/image';

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

// Participant modal component
const ParticipantsModal = ({ 
  participants, 
  isOpen, 
  onClose 
}: { 
  participants: any[], 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">All Participants</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-800 border border-gray-700">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiUser className="text-white text-lg" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{participant.displayName}</p>
                  <p className="text-sm text-gray-400">Joined {new Date(participant.joinedAt.toDate()).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

interface ActivityDetailsModalProps {
  activity: Post;
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
  isParticipating: boolean;
}

export default function ActivityDetailsModal({ 
  activity, 
  isOpen, 
  onClose, 
  onJoin, 
  onLeave, 
  isParticipating 
}: ActivityDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  
  if (!isOpen) return null;
  
  // Determine image source (custom or default based on category)
  const getImageSource = () => {
    if (!imageError && activity.imageURL) {
      return activity.imageURL;
    }
    
    // Use category-specific default image or fallback
    return DEFAULT_IMAGES[activity.category as keyof typeof DEFAULT_IMAGES] || FALLBACK_IMAGE;
  };
  
  const handleAction = async () => {
    setLoading(true);
    try {
      if (isParticipating) {
        await onLeave();
      } else {
        await onJoin();
      }
    } catch (error) {
      console.error('Error with activity participation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get visible participants (limit to 3) and remaining count
  const visibleParticipants = activity.participants?.slice(0, 3) || [];
  const remainingCount = activity.participants ? Math.max(0, activity.participants.length - 3) : 0;
  
  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl border border-gray-700"
          >
            {/* Header Image - Stretches to borders */}
            <div className="relative h-64 md:h-80 overflow-hidden">
              <Image
                src={getImageSource()}
                alt={activity.content}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
              
              {/* Close button overlay */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-60 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all"
              >
                <FiX className="text-xl" />
              </button>
              
              {/* Category badge overlay */}
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-black bg-opacity-60 backdrop-blur-sm text-white rounded-full text-sm font-semibold border border-white/20">
                  {activity.category}
                </span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Activity Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
                {activity.content}
              </h1>
              
              {/* Activity Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {activity.location && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <FiMapPin className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Location</p>
                      <p className="font-semibold text-white">{activity.location}</p>
                    </div>
                  </div>
                )}
                
                {activity.date && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <FiCalendar className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Date</p>
                      <p className="font-semibold text-white">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {activity.time && (
                  <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-2xl border border-gray-700">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <FiClock className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time</p>
                      <p className="font-semibold text-white">{activity.time}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer - Participants and Action */}
            <div className="border-t border-gray-700 p-6 bg-gray-900/50">
              <div className="flex items-center justify-between">
                {/* Participants Display */}
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-3">
                    {visibleParticipants.map((participant, index) => (
                      <div key={index} className="relative">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800">
                          <FiUser className="text-white text-sm" />
                        </div>
                      </div>
                    ))}
                    
                    {remainingCount > 0 && (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border-2 border-gray-900">
                        <span className="text-xs font-semibold text-gray-400">+{remainingCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowAllParticipants(true)}
                    className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    {activity.participants?.length || 0} {activity.participants?.length === 1 ? 'participant' : 'participants'}
                  </button>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className={`py-3 px-6 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
                    isParticipating
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-white text-black hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : isParticipating ? (
                    <>
                      <FiX className="text-lg" />
                      <span>Leave</span>
                    </>
                  ) : (
                    <>
                      <FiCheck className="text-lg" />
                      <span>Join</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
      
      {/* Participants Modal */}
      <ParticipantsModal 
        participants={activity.participants || []} 
        isOpen={showAllParticipants} 
        onClose={() => setShowAllParticipants(false)} 
      />
    </>
  );
} 