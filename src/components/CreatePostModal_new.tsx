'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiImage, FiMapPin, FiCalendar, FiClock, FiUsers, FiEyeOff, 
  FiSmile, FiAlertTriangle, FiLock, FiGlobe, FiShield, FiSend 
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { addPost, uploadImage, addAnonymousComplaint, addGeneralPost } from '@/lib/firebase-utils';
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
  const { theme } = useTheme();
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
          setTimeout(() => {
            if (mountedRef.current) {
              onClose();
            }
          }, 2000);
        }
        return;
      }

      // Handle general posts separately
      if (postType === 'general') {
        const generalPost = await addGeneralPost({
          content: formData.content.trim(),
          category: formData.category,
          author: '',  // Will be set by addGeneralPost
          authorId: '', // Will be set by addGeneralPost
          timestamp: null, // Will be set by addGeneralPost
          upvotes: 0,
          downvotes: 0,
          upvotedBy: [],
          downvotedBy: [],
          comments: []
        });
        
        if (mountedRef.current) {
          onPostCreated(generalPost);
          setTimeout(() => {
            if (mountedRef.current) {
              onClose();
            }
          }, 100);
        }
        return;
      }

      // For activity and concern posts
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

      const createdPost = await addPost(postData);
      
      if (mountedRef.current) {
        onPostCreated(createdPost);
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

  // Get visibility options based on user role
  const getVisibilityOptions = () => {
    return [
      {
        value: 'public',
        label: 'Public',
        desc: 'Everyone can see this post',
        icon: <FiGlobe className="text-app-secondary" />
      },
      {
        value: 'moderators',
        label: 'Moderators Only',
        desc: 'Only moderators and admins can see this post',
        icon: <FiLock className="text-app-secondary" />
      }
    ];
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-app-overlay backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div 
              className="bg-app-primary border border-app-primary rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-app-primary flex-shrink-0">
                <h2 className="text-app-primary text-lg font-semibold">
                  {submitted ? 'Success!' : 'Create New Post'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover-bg-app transition-colors"
                >
                  <FiX className="text-app-secondary" />
                </button>
              </div>

              {/* Success Message */}
              {submitted ? (
                <div className="p-6 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-500 bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FiSend className="text-green-500 text-2xl" />
                  </div>
                  <p className="text-app-primary text-lg font-medium mb-2">
                    Your post has been submitted!
                  </p>
                  <p className="text-app-secondary text-center">
                    {postType === 'anonymous-complaint' 
                      ? 'Your anonymous complaint has been received and will be reviewed by moderators.'
                      : 'Your post is now live on the platform.'}
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {/* Post Type Selector */}
                  <div className="p-4 border-b border-app-primary flex-shrink-0">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <button
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-sm border-2 transition-all duration-200 ${
                          postType === 'activity' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                        }`}
                        onClick={() => setPostType('activity')}
                      >
                        <FiCalendar className={`text-lg mb-1 ${postType === 'activity' ? 'text-blue-600' : ''}`} />
                        <span className={postType === 'activity' ? 'font-medium' : ''}>Activity</span>
                      </button>
                      <button
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-sm border-2 transition-all duration-200 ${
                          postType === 'concern' 
                            ? 'border-orange-500 bg-orange-50 text-orange-600' 
                            : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                        }`}
                        onClick={() => setPostType('concern')}
                      >
                        <FiAlertTriangle className={`text-lg mb-1 ${postType === 'concern' ? 'text-orange-600' : ''}`} />
                        <span className={postType === 'concern' ? 'font-medium' : ''}>Concern</span>
                      </button>
                      <button
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-sm border-2 transition-all duration-200 ${
                          postType === 'general' 
                            ? 'border-green-500 bg-green-50 text-green-600' 
                            : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                        }`}
                        onClick={() => setPostType('general')}
                      >
                        <FiGlobe className={`text-lg mb-1 ${postType === 'general' ? 'text-green-600' : ''}`} />
                        <span className={postType === 'general' ? 'font-medium' : ''}>General</span>
                      </button>
                      <button
                        className={`p-3 rounded-xl flex flex-col items-center justify-center text-sm border-2 transition-all duration-200 ${
                          postType === 'anonymous-complaint' 
                            ? 'border-purple-500 bg-purple-50 text-purple-600' 
                            : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                        }`}
                        onClick={() => setPostType('anonymous-complaint')}
                      >
                        <FiEyeOff className={`text-lg mb-1 ${postType === 'anonymous-complaint' ? 'text-purple-600' : ''}`} />
                        <span className={postType === 'anonymous-complaint' ? 'font-medium' : ''}>Anonymous</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-4">
                    <div className="space-y-4">
                      {/* Title field for activities and anonymous complaints */}
                      {(postType === 'activity' || postType === 'anonymous-complaint') && (
                        <div>
                          <label htmlFor="title" className="block text-app-secondary text-sm font-medium mb-2">
                            Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Enter ${postType === 'activity' ? 'activity' : 'complaint'} title`}
                            required
                          />
                        </div>
                      )}

                      {/* Content/Description */}
                      <div>
                        <label htmlFor="content" className="block text-app-secondary text-sm font-medium mb-2">
                          {postType === 'anonymous-complaint' ? 'Description' : 'Content'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            id="content"
                            value={formData.content}
                            onChange={handleContentChange}
                            className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] transition-colors"
                            placeholder={getPromptText()}
                            required
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-app-tertiary">
                            {characterCount}/{getCharacterLimit()}
                          </div>
                        </div>
                      </div>

                      {/* Category selection */}
                      <div>
                        <label htmlFor="category" className="block text-app-secondary text-sm font-medium mb-2">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          required
                        >
                          <option value="">Select a category</option>
                          {getCurrentCategories().map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Activity-specific fields */}
                      {postType === 'activity' && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="date" className="block text-app-secondary text-sm font-medium mb-2">
                                Date
                              </label>
                              <input
                                type="date"
                                id="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label htmlFor="time" className="block text-app-secondary text-sm font-medium mb-2">
                                Time
                              </label>
                              <input
                                type="time"
                                id="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="location" className="block text-app-secondary text-sm font-medium mb-2">
                                Location
                              </label>
                              <input
                                type="text"
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Enter location"
                              />
                            </div>
                            <div>
                              <label htmlFor="maxParticipants" className="block text-app-secondary text-sm font-medium mb-2">
                                Max Participants
                              </label>
                              <input
                                type="number"
                                id="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                className="w-full bg-app-secondary border border-app-primary rounded-lg p-3 text-app-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Unlimited"
                                min="1"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Anonymous complaint severity */}
                      {postType === 'anonymous-complaint' && (
                        <div>
                          <label htmlFor="severity" className="block text-app-secondary text-sm font-medium mb-2">
                            Severity
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {COMPLAINT_SEVERITIES.map((sev) => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setFormData({ ...formData, severity: sev })}
                                className={`p-3 rounded-lg text-sm font-medium border-2 transition-all duration-200 ${
                                  formData.severity === sev
                                    ? sev === 'Critical' 
                                      ? 'border-red-500 bg-red-50 text-red-600' 
                                      : sev === 'High'
                                        ? 'border-yellow-500 bg-yellow-50 text-yellow-600'
                                        : sev === 'Medium'
                                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                                          : 'border-green-500 bg-green-50 text-green-600'
                                    : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                                }`}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Concern-specific fields */}
                      {postType === 'concern' && (
                        <div className="flex items-center space-x-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isAnonymous"
                              checked={formData.isAnonymous}
                              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-app-primary rounded"
                            />
                            <label htmlFor="isAnonymous" className="text-app-secondary text-sm font-medium">
                              Post anonymously
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isUrgent"
                              checked={formData.isUrgent}
                              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                              className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-app-primary rounded"
                            />
                            <label htmlFor="isUrgent" className="text-app-secondary text-sm font-medium">
                              Mark as urgent
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Moderator visibility options */}
                      {(isModerator || isAdmin) && postType === 'general' && (
                        <div>
                          <label className="block text-app-secondary text-sm font-medium mb-2">
                            Visibility
                          </label>
                          <div className="grid grid-cols-2 gap-3">
                            {getVisibilityOptions().map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, visibility: option.value })}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  formData.visibility === option.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                    : `border-app-primary bg-app-secondary text-app-secondary hover-bg-app ${theme === 'dark' ? 'hover:border-gray-600' : 'hover:border-gray-300'}`
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  {option.icon}
                                  <span className="ml-2 text-sm font-medium">{option.label}</span>
                                </div>
                                <p className="text-xs mt-1 opacity-75">{option.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="px-4 pb-3 flex-shrink-0">
                    <div className="h-1 w-full bg-app-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${getProgress()}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer with actions */}
                  <div className="p-4 border-t border-app-primary flex justify-between items-center flex-shrink-0">
                    <div className="flex space-x-2">
                      {/* Image upload button (not for anonymous complaints) */}
                      {postType !== 'anonymous-complaint' && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="p-2 rounded-lg hover-bg-app transition-colors disabled:opacity-50"
                        >
                          <FiImage className="text-app-secondary" />
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={loading || !isFormValid()}
                      className={`px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors ${
                        loading || !isFormValid()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="text-sm" />
                          <span>Post</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Image preview */}
                  {imagePreview && (
                    <div className="p-4 pt-0">
                      <div className="relative rounded-lg overflow-hidden">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          width={500}
                          height={300}
                          className="w-full h-auto object-cover rounded-lg"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                        >
                          <FiX className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
