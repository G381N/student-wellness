'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiImage, FiMapPin, FiCalendar, FiClock, FiUsers, FiEyeOff, 
  FiAlertTriangle, FiSend, FiShield 
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { addPost, uploadImage, addAnonymousComplaint } from '@/lib/firebase-utils';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

type PostType = 'activity' | 'concern' | 'general' | 'anonymous-complaint';

// Categories for each post type
const ACTIVITY_CATEGORIES = [
  'Academic', 'Sports', 'Cultural', 'Social', 'Wellness', 
  'Professional', 'Volunteer', 'Entertainment', 'Other'
];

const CONCERN_CATEGORIES = [
  'Mental Health', 'Bullying', 'Loneliness', 'Academic Stress',
  'Discrimination', 'Safety', 'Wellness', 'Facilities', 'Other'
];

const GENERAL_CATEGORIES = [
  'Campus Life', 'Academic', 'Social', 'Entertainment', 
  'News', 'Opinion', 'Question', 'Achievement', 'Other'
];

const COMPLAINT_CATEGORIES = [
  'General', 'Academic', 'Infrastructure', 'Facilities', 'Wellness', 
  'Food', 'Social', 'Safety', 'Harassment'
];

const COMPLAINT_SEVERITIES: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const { user, isModerator, isAdmin } = useAuth();
  const [postType, setPostType] = useState<PostType>('activity');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    content: '',
    title: '',
    category: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: '',
    isAnonymous: true,
    isUrgent: false,
    visibility: 'public',
    imageURL: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });

  // Character limits
  const getCharacterLimit = () => {
    switch (postType) {
      case 'general': return 280;
      case 'activity': return 500;
      case 'concern': return 1000;
      case 'anonymous-complaint': return 1000;
      default: return 500;
    }
  };

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const limit = getCharacterLimit();
    
    if (value.length <= limit) {
      setFormData({ ...formData, content: value });
      setCharacterCount(value.length);
      autoResizeTextarea();
    }
  };

  // Reset form when modal opens/closes or post type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        content: '',
        title: '',
        category: '',
        location: '',
        date: '',
        time: '',
        maxParticipants: '',
        isAnonymous: postType === 'concern',
        isUrgent: false,
        visibility: 'public',
        imageURL: '',
        severity: 'Medium'
      });
      setCharacterCount(0);
      setImagePreview(null);
      setSubmitted(false);
    }
  }, [isOpen, postType]);

  // Auto-resize textarea on mount
  useEffect(() => {
    autoResizeTextarea();
  }, [formData.content]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Firebase
    try {
      setUploadingImage(true);
      const imageURL = await uploadImage(file, `posts/${Date.now()}_${file.name}`);
      setFormData({ ...formData, imageURL });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageURL: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!user || !formData.content.trim() || !formData.category) return;

    setLoading(true);
    try {
      // Handle anonymous complaint
      if (postType === 'anonymous-complaint') {
        await addAnonymousComplaint({
          title: formData.title || 'Anonymous Complaint',
          description: formData.content,
          category: formData.category,
          severity: formData.severity,
          status: 'Open',
          timestamp: null,
          updatedAt: null
        });
        
        if (mountedRef.current) {
          setSubmitted(true);
          // Close modal after a short delay
          setTimeout(() => {
            if (mountedRef.current) {
              onClose();
            }
          }, 2000);
        }
        return;
      }

      // For all other post types
      const postData: any = {
        type: postType,
        content: formData.content.trim(),
        category: formData.category,
        isAnonymous: postType === 'concern' ? formData.isAnonymous : false
      };

      // Activity-specific fields
      if (postType === 'activity') {
        if (formData.title) postData.title = formData.title.trim();
        if (formData.location) postData.location = formData.location.trim();
        if (formData.date) postData.date = formData.date;
        if (formData.time) postData.time = formData.time;
        if (formData.maxParticipants) {
          const max = parseInt(formData.maxParticipants);
          if (!isNaN(max) && max > 0) postData.maxParticipants = max;
        }
      } 
      // Concern-specific fields
      else if (postType === 'concern') {
        if (formData.isUrgent) postData.priority = 'urgent';
      }
      // General post fields - handle visibility
      else if (postType === 'general') {
        if ((isModerator || isAdmin) && formData.visibility === 'mods') {
          postData.type = 'moderator-announcement';
          postData.visibility = 'moderators';
        }
      }

      const createdPost = await addPost(postData);
      
      // Only update state if component is still mounted
      if (mountedRef.current) {
        onPostCreated(createdPost);
        // Add a small delay before closing to ensure state updates are processed
        setTimeout(() => {
          if (mountedRef.current) {
            onClose();
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      if (mountedRef.current) {
        alert('Failed to create post. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Get prompt text based on post type
  const getPromptText = () => {
    switch (postType) {
      case 'activity': return "What's happening? Share your campus activity.";
      case 'concern': return "Facing an issue? Share it confidentially.";
      case 'general': return "Want to share something?";
      case 'anonymous-complaint': return "Report issues confidentially to administrators.";
      default: return "What's on your mind?";
    }
  };

  // Get current categories
  const getCurrentCategories = () => {
    switch (postType) {
      case 'activity': return ACTIVITY_CATEGORIES;
      case 'concern': return CONCERN_CATEGORIES;
      case 'general': return GENERAL_CATEGORIES;
      case 'anonymous-complaint': return COMPLAINT_CATEGORIES;
      default: return [];
    }
  };

  // Validation
  const isFormValid = () => {
    if (!formData.content.trim() || !formData.category) return false;
    if (postType === 'activity' && !formData.title?.trim()) return false;
    if (postType === 'anonymous-complaint' && !formData.title?.trim()) return false;
    return true;
  };

  // Progress calculation
  const getProgress = () => {
    let filledFields = 0;
    let totalFields = 2;

    if (formData.content.trim()) filledFields++;
    if (formData.category) filledFields++;

    if (postType === 'activity' || postType === 'anonymous-complaint') {
      totalFields += 1;
      if (formData.title?.trim()) filledFields++;
    }

    return (filledFields / totalFields) * 100;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-black border border-gray-800 rounded-2xl w-full max-w-lg md:max-w-[520px] max-h-[85vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {postType === 'anonymous-complaint' ? 'Anonymous Complaint' : "What's happening?"}
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">{getPromptText()}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <FiX className="text-white text-base" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(85vh-160px)] scrollbar-hide">
            {/* Success Message for Anonymous Complaints */}
            <AnimatePresence>
              {submitted && postType === 'anonymous-complaint' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="m-4 p-4 bg-gray-900 border border-gray-700 rounded-lg"
                >
                  <div className="flex items-center">
                    <FiShield className="text-white mr-3" />
                    <div>
                      <h3 className="text-white font-semibold">Complaint Submitted Successfully</h3>
                      <p className="text-gray-400 text-sm">Your complaint has been sent to administrators.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Segmented Control */}
            <div className="px-4 py-3">
              <div className="flex bg-gray-800 rounded-xl p-0.5">
                {[
                  { key: 'activity', label: 'Activity' },
                  { key: 'concern', label: 'Concern' },
                  { key: 'general', label: 'General' },
                  { key: 'anonymous-complaint', label: 'Complaint' }
                ].map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setPostType(type.key as PostType)}
                    className={`flex-1 py-2 px-2 rounded-lg font-medium text-xs transition-all duration-200 ${
                      postType === type.key
                        ? 'bg-white text-black shadow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 space-y-4">
              {/* Title (for activities and complaints) */}
              {(postType === 'activity' || postType === 'anonymous-complaint') && (
                <div>
                  <label className="block text-white text-xs font-medium mb-1.5">
                    {postType === 'activity' ? 'Activity Title *' : 'Complaint Title *'}
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white transition-all"
                    placeholder={
                      postType === 'activity' 
                        ? "Give your activity a catchy title..." 
                        : "Brief description of the issue..."
                    }
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {postType === 'activity' ? 'Make it clear and engaging' : `${formData.title.length}/100 characters`}
                  </p>
                </div>
              )}

              {/* Main Content */}
              <div>
                <label className="block text-white text-xs font-medium mb-1.5">
                  {postType === 'activity' ? 'Description' : 
                   postType === 'concern' ? 'What\'s the issue?' : 
                   postType === 'anonymous-complaint' ? 'Detailed Description' :
                   'Your message'} *
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={formData.content}
                    onChange={handleContentChange}
                    rows={postType === 'anonymous-complaint' ? 6 : 3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white transition-all resize-none leading-relaxed"
                    placeholder={
                      postType === 'activity' ? "Tell everyone what's happening..." :
                      postType === 'concern' ? "Describe the issue you're facing..." :
                      postType === 'anonymous-complaint' ? "Provide detailed information about the issue, including when and where it occurred..." :
                      "What's on your mind?"
                    }
                  />
                  
                  {/* Character Counter */}
                  <div className="absolute bottom-2 right-2 text-xs">
                    <span className={`${
                      characterCount > getCharacterLimit() * 0.9 ? 'text-yellow-400' :
                      characterCount > getCharacterLimit() * 0.95 ? 'text-red-400' :
                      'text-gray-500'
                    }`}>
                      {characterCount}/{getCharacterLimit()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-white text-xs font-medium mb-1.5">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                >
                  <option value="" className="bg-gray-900 text-gray-500">Choose category...</option>
                  {getCurrentCategories().map(category => (
                    <option key={category} value={category} className="bg-gray-900 text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity (for complaints) */}
              {postType === 'anonymous-complaint' && (
                <div>
                  <label className="block text-white text-xs font-medium mb-1.5">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                  >
                    {COMPLAINT_SEVERITIES.map(severity => (
                      <option key={severity} value={severity} className="bg-gray-900 text-white">
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Activity-specific fields */}
              {postType === 'activity' && (
                <>
                  <div>
                    <label className="block text-white text-xs font-medium mb-1.5">Location</label>
                    <div className="relative">
                      <FiMapPin className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white transition-all"
                        placeholder="Where? (e.g., Library, Block A)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-white text-xs font-medium mb-1.5">Date</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white text-xs font-medium mb-1.5">Time</label>
                      <div className="relative">
                        <FiClock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-xs font-medium mb-1.5">Max Participants</label>
                    <div className="relative">
                      <FiUsers className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white transition-all"
                        placeholder="Unlimited"
                        min="1"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Concern-specific fields */}
              {postType === 'concern' && (
                <>
                  {/* Urgency Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <FiAlertTriangle className="text-orange-400 text-sm" />
                      <div>
                        <span className="text-white font-medium text-sm">Mark as Urgent</span>
                        <p className="text-gray-400 text-xs">Faster response</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isUrgent: !formData.isUrgent })}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        formData.isUrgent ? 'bg-orange-500' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        formData.isUrgent ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-2">
                      <FiEyeOff className="text-gray-400 text-sm" />
                      <div>
                        <span className="text-white font-medium text-sm">Post Anonymously</span>
                        <p className="text-gray-400 text-xs">Hide your identity</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
                      className={`w-10 h-5 rounded-full transition-colors ${
                        formData.isAnonymous ? 'bg-white' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full transition-transform ${
                        formData.isAnonymous ? 'translate-x-5 bg-black' : 'translate-x-0.5 bg-white'
                      }`} />
                    </button>
                  </div>
                </>
              )}

              {/* Visibility options for general posts (removed) */}
              {postType === 'general' && (
                <div className="px-4 space-y-4">
                  <div>
                    <textarea
                      ref={textareaRef}
                      value={formData.content}
                      onChange={handleContentChange}
                      rows={3}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white transition-all resize-none leading-relaxed"
                      placeholder="What's on your mind?"
                    />
                    <div className="mt-2">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-white transition-all"
                      >
                        <option value="" className="bg-gray-900 text-gray-500">Choose category...</option>
                        {GENERAL_CATEGORIES.map(category => (
                          <option key={category} value={category} className="bg-gray-900 text-white">
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Notice for Anonymous Complaints */}
              {postType === 'anonymous-complaint' && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-start">
                    <FiAlertTriangle className="text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-300 font-medium text-sm mb-1">Privacy & Confidentiality</h4>
                      <ul className="text-gray-400 text-xs space-y-1">
                        <li>• Your identity will remain completely anonymous</li>
                        <li>• Only university administrators can access these complaints</li>
                        <li>• Complaints are used to improve campus conditions</li>
                        <li>• False or malicious reports may be investigated</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {imagePreview && postType !== 'anonymous-complaint' && (
                <div className="relative">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    width={400}
                    height={200}
                    className="rounded-lg w-full h-40 object-cover border border-gray-700"
                  />
                  <button 
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 bg-black bg-opacity-80 text-white p-1.5 rounded-full hover:bg-opacity-100 transition-all"
                  >
                    <FiX className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 bg-black">
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-800 rounded-full h-0.5">
                <div 
                  className="bg-white h-0.5 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* Left: Media Upload (only show for activity posts) */}
              <div className="flex items-center space-x-2">
                {postType === 'activity' && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors border border-gray-600"
                      disabled={uploadingImage}
                      title="Add image"
                    >
                      {uploadingImage ? (
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiImage className="text-gray-400 text-sm" />
                      )}
                    </button>
                    
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </>
                )}
              </div>

              {/* Right: Submit Button */}
              <button
                onClick={handleCreatePost}
                disabled={!isFormValid() || loading || submitted}
                className={`font-semibold py-2 px-6 rounded-full transition-all text-sm flex items-center ${
                  !isFormValid() || loading || submitted
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1.5" />
                    {postType === 'anonymous-complaint' ? 'Submitting...' : 'Sharing...'}
                  </>
                ) : postType === 'anonymous-complaint' ? (
                  <>
                    <FiSend className="mr-2" />
                    Submit Complaint
                  </>
                ) : (
                  'Share'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}