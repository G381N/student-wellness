'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiImage, FiMapPin, FiCalendar, FiClock, FiUsers, FiEyeOff, 
  FiSmile, FiAlertTriangle, FiLock, FiGlobe, FiShield, FiSend 
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
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
        icon: <FiGlobe className="text-text-secondary" />
      },
      {
        value: 'moderators',
        label: 'Moderators Only',
        desc: 'Only moderators and admins can see this post',
        icon: <FiLock className="text-text-secondary" />
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
            className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50"
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
              className="bg-bg-primary border border-border-primary rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-app-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-primary">
                <h2 className="text-text-primary text-lg font-semibold">
                  {submitted ? 'Success!' : 'Create New Post'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-hover-bg transition-colors"
                >
                  <FiX className="text-text-secondary" />
                </button>
              </div>
              
              {/* Success Message */}
              {submitted ? (
                <div className="p-6 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-success bg-opacity-10 rounded-full flex items-center justify-center mb-4">
                    <FiSend className="text-success text-2xl" />
                  </div>
                  <p className="text-text-primary text-lg font-medium mb-2">
                    Your post has been submitted!
                  </p>
                  <p className="text-text-secondary text-center">
                    {postType === 'anonymous-complaint' 
                      ? 'Your anonymous complaint has been received and will be reviewed by moderators.'
                      : 'Your post is now live on the platform.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Post Type Selector */}
                  <div className="p-4 border-b border-border-primary">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        className={`p-2 rounded-lg flex flex-col items-center justify-center text-sm ${
                          postType === 'activity' 
                            ? 'bg-accent-blue bg-opacity-10 text-accent-blue' 
                            : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                        } transition-colors`}
                        onClick={() => setPostType('activity')}
                      >
                        <FiCalendar className="text-lg mb-1" />
                        Activity
                      </button>
                      <button
                        className={`p-2 rounded-lg flex flex-col items-center justify-center text-sm ${
                          postType === 'concern' 
                            ? 'bg-accent-blue bg-opacity-10 text-accent-blue' 
                            : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                        } transition-colors`}
                        onClick={() => setPostType('concern')}
                      >
                        <FiAlertTriangle className="text-lg mb-1" />
                        Concern
                      </button>
                      <button
                        className={`p-2 rounded-lg flex flex-col items-center justify-center text-sm ${
                          postType === 'general' 
                            ? 'bg-accent-blue bg-opacity-10 text-accent-blue' 
                            : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                        } transition-colors`}
                        onClick={() => setPostType('general')}
                      >
                        <FiGlobe className="text-lg mb-1" />
                        General
                      </button>
                      <button
                        className={`p-2 rounded-lg flex flex-col items-center justify-center text-sm ${
                          postType === 'anonymous-complaint' 
                            ? 'bg-accent-blue bg-opacity-10 text-accent-blue' 
                            : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                        } transition-colors`}
                        onClick={() => setPostType('anonymous-complaint')}
                      >
                        <FiEyeOff className="text-lg mb-1" />
                        Anonymous
                      </button>
                    </div>
                  </div>
                  
                  {/* Form Content */}
                  <div className="p-4">
                    <div className="space-y-4">
                      {/* Title field for activities and anonymous complaints */}
                      {(postType === 'activity' || postType === 'anonymous-complaint') && (
                        <div>
                          <label htmlFor="title" className="block text-text-secondary text-sm mb-1">
                            Title {(postType === 'activity' || postType === 'anonymous-complaint') && <span className="text-error">*</span>}
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                            placeholder={`Enter ${postType === 'activity' ? 'activity' : 'complaint'} title`}
                            required
                          />
                        </div>
                      )}
                      
                      {/* Content/Description */}
                      <div>
                        <label htmlFor="content" className="block text-text-secondary text-sm mb-1">
                          {postType === 'anonymous-complaint' ? 'Description' : 'Content'} <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <textarea
                            ref={textareaRef}
                            id="content"
                            value={formData.content}
                            onChange={handleContentChange}
                            className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue min-h-[100px]"
                            placeholder={getPromptText()}
                            required
                          />
                          <div className="absolute bottom-2 right-2 text-xs text-text-tertiary">
                            {characterCount}/{getCharacterLimit()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Category selection */}
                      <div>
                        <label htmlFor="category" className="block text-text-secondary text-sm mb-1">
                          Category <span className="text-error">*</span>
                        </label>
                        <select
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
                              <label htmlFor="date" className="block text-text-secondary text-sm mb-1">
                                Date
                              </label>
                              <input
                                type="date"
                                id="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                              />
                            </div>
                            <div>
                              <label htmlFor="time" className="block text-text-secondary text-sm mb-1">
                                Time
                              </label>
                              <input
                                type="time"
                                id="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="location" className="block text-text-secondary text-sm mb-1">
                                Location
                              </label>
                              <input
                                type="text"
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
                                placeholder="Enter location"
                              />
                            </div>
                            <div>
                              <label htmlFor="maxParticipants" className="block text-text-secondary text-sm mb-1">
                                Max Participants
                              </label>
                              <input
                                type="number"
                                id="maxParticipants"
                                value={formData.maxParticipants}
                                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                className="w-full bg-bg-tertiary border border-border-primary rounded-lg p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
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
                          <label htmlFor="severity" className="block text-text-secondary text-sm mb-1">
                            Severity
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {COMPLAINT_SEVERITIES.map((sev) => (
                              <button
                                key={sev}
                                type="button"
                                onClick={() => setFormData({ ...formData, severity: sev })}
                                className={`p-2 rounded-lg text-sm ${
                                  formData.severity === sev
                                    ? sev === 'Critical' 
                                      ? 'bg-error bg-opacity-10 text-error' 
                                      : sev === 'High'
                                        ? 'bg-warning bg-opacity-10 text-warning'
                                        : sev === 'Medium'
                                          ? 'bg-accent-blue bg-opacity-10 text-accent-blue'
                                          : 'bg-success bg-opacity-10 text-success'
                                    : 'bg-bg-tertiary text-text-secondary hover:bg-hover-bg'
                                } transition-colors`}
                              >
                                {sev}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Concern-specific fields */}
                      {postType === 'concern' && (
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isAnonymous"
                              checked={formData.isAnonymous}
                              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                              className="mr-2 h-4 w-4 accent-accent-blue"
                            />
                            <label htmlFor="isAnonymous" className="text-text-secondary text-sm">
                              Post anonymously
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="isUrgent"
                              checked={formData.isUrgent}
                              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                              className="mr-2 h-4 w-4 accent-error"
                            />
                            <label htmlFor="isUrgent" className="text-text-secondary text-sm">
                              Mark as urgent
                            </label>
                          </div>
                        </div>
                      )}
                      
                      {/* Moderator visibility options */}
                      {(isModerator || isAdmin) && postType === 'general' && (
                        <div>
                          <label className="block text-text-secondary text-sm mb-1">
                            Visibility
                          </label>
                          <div className="flex space-x-4">
                            {getVisibilityOptions().map((option) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  type="radio"
                                  id={option.value}
                                  name="visibility"
                                  value={option.value}
                                  checked={formData.visibility === option.value}
                                  onChange={() => setFormData({ ...formData, visibility: option.value })}
                                  className="mr-2 h-4 w-4 accent-accent-blue"
                                />
                                <label htmlFor={option.value} className="text-text-secondary text-sm flex items-center">
                                  {option.icon}
                                  <span className="ml-1">{option.label}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress indicator */}
                  <div className="px-4 pb-2">
                    <div className="h-1 w-full bg-bg-tertiary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-blue transition-all duration-300"
                        style={{ width: `${getProgress()}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Footer with actions */}
                  <div className="p-4 border-t border-border-primary flex justify-between items-center">
                    <div className="flex space-x-2">
                      {/* Image upload button (not for anonymous complaints) */}
                      {postType !== 'anonymous-complaint' && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="p-2 rounded-full hover:bg-hover-bg transition-colors text-text-secondary disabled:opacity-50"
                          title="Upload image"
                        >
                          <FiImage />
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={handleCreatePost}
                      disabled={loading || !isFormValid()}
                      className={`px-4 py-2 rounded-lg font-medium flex items-center ${
                        loading || !isFormValid()
                          ? 'bg-accent-blue-disabled text-text-secondary cursor-not-allowed'
                          : 'bg-accent-blue text-text-primary hover:bg-accent-blue-hover'
                      } transition-colors`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
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
                          className="absolute top-2 right-2 p-1 rounded-full bg-bg-overlay hover:bg-error text-text-primary"
                        >
                          <FiX />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}