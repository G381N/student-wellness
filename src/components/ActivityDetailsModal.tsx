'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiUser, FiCheck, FiX, FiMoreHorizontal } from 'react-icons/fi';
import { joinActivity, leaveActivity } from '@/lib/activity-actions';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
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
  const { theme } = useTheme();
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`card rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto ${theme === 'light' ? 'bg-white' : 'bg-bg-secondary'}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-2xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>All Participants</h3>
            <button 
              onClick={onClose}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${theme === 'light' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-gray-500 hover:text-gray-300 hover:bg-bg-tertiary'}`}
            >
              <FiX className="text-xl" />
            </button>
          </div>
          
          <div className="space-y-3">
            {participants.map((participant, index) => (
              <div key={index} className={`flex items-center space-x-4 p-4 rounded-2xl border ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-bg-tertiary border-border-primary'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${theme === 'light' ? 'bg-gray-200' : 'bg-bg-tertiary'}`}>
                  <FiUser className={`${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'} text-lg`} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>{participant.displayName}</p>
                  <p className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-text-secondary'}`}>Joined {new Date(participant.joinedAt.toDate()).toLocaleDateString()}</p>
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
  onUpdate: (updatedActivity: Post) => void;
  isParticipating: boolean;
}

export default function ActivityDetailsModal({ 
  activity, 
  isOpen, 
  onClose, 
  onUpdate,
  isParticipating 
}: ActivityDetailsModalProps) {
  const { theme } = useTheme();
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
    const actionPromise = isParticipating ? leaveActivity(activity.id) : joinActivity(activity.id);
    
    toast.promise(actionPromise, {
      loading: isParticipating ? 'Leaving activity...' : 'Joining activity...',
      success: (updatedActivity) => {
        onUpdate(updatedActivity);
        return isParticipating ? 'Successfully left the activity!' : 'Successfully joined the activity!';
      },
      error: (err) => {
        console.error(err);
        return err.message || 'An unexpected error occurred.';
      },
    }).finally(() => {
      setLoading(false);
    });
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
            className={`card rounded-3xl overflow-hidden max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-bg-secondary'}`}
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
                className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all"
              >
                <FiX className="text-xl" />
              </button>
              
              {/* Category badge overlay */}
              <div className="absolute top-4 left-4">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${theme === 'light' ? 'bg-white bg-opacity-90 text-gray-800' : 'bg-black bg-opacity-50 text-white'}`}>
                  {activity.category}
                </span>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Activity Title */}
              <h1 className={`text-2xl md:text-3xl font-bold mb-6 leading-tight ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>
                {activity.content}
              </h1>
              
              {/* Activity Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {activity.location && (
                  <div className={`flex items-center space-x-3 p-4 rounded-2xl ${theme === 'light' ? 'bg-gray-50' : 'bg-bg-tertiary'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-bg-secondary'}`}>
                      <FiMapPin className={`${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'} text-lg`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-text-secondary'}`}>Location</p>
                      <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>{activity.location}</p>
                    </div>
                  </div>
                )}
                
                {activity.date && (
                  <div className={`flex items-center space-x-3 p-4 rounded-2xl ${theme === 'light' ? 'bg-gray-50' : 'bg-bg-tertiary'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-bg-secondary'}`}>
                      <FiCalendar className={`${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'} text-lg`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-text-secondary'}`}>Date</p>
                      <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {activity.time && (
                  <div className={`flex items-center space-x-3 p-4 rounded-2xl ${theme === 'light' ? 'bg-gray-50' : 'bg-bg-tertiary'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-200' : 'bg-bg-secondary'}`}>
                      <FiClock className={`${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'} text-lg`} />
                    </div>
                    <div>
                      <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'light' ? 'text-gray-500' : 'text-text-secondary'}`}>Time</p>
                      <p className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-text-primary'}`}>{activity.time}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Footer - Participants and Action */}
            <div className={`border-t p-6 ${theme === 'light' ? 'border-gray-100 bg-gray-50' : 'border-border-primary bg-bg-secondary'}`}>
              <div className="flex items-center justify-between">
                {/* Participants Display */}
                <div className="flex items-center space-x-3">
                  <div className="flex -space-x-2">
                    {visibleParticipants.map((participant, index) => (
                      <div key={index} className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${theme === 'light' ? 'bg-gray-200 border-white' : 'bg-bg-tertiary border-bg-secondary'}`}>
                          <FiUser className={`${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'} text-sm`} />
                        </div>
                      </div>
                    ))}
                    
                    {remainingCount > 0 && (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${theme === 'light' ? 'bg-gray-100 border-white' : 'bg-bg-tertiary border-bg-secondary'}`}>
                        <span className={`text-xs font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-text-secondary'}`}>+{remainingCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => setShowAllParticipants(true)}
                    className={`text-sm font-medium transition-colors ${theme === 'light' ? 'text-gray-700 hover:text-gray-900' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {activity.participants?.length || 0} {activity.participants?.length === 1 ? 'participant' : 'participants'}
                  </button>
                </div>
                
                {/* Action Button */}
                <button
                  onClick={handleAction}
                  disabled={loading}
                  className={`py-3 px-6 rounded-2xl font-semibold flex items-center space-x-2 transition-all ${
                    isParticipating
                      ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25'
                      : `${theme === 'light' ? 'bg-gray-800 text-white hover:bg-black' : 'bg-bg-tertiary text-text-primary hover:bg-hover-bg'}`
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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