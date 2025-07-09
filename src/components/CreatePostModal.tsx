'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiX, FiImage, FiMapPin, FiCalendar, FiClock, FiUsers, FiEyeOff, 
  FiSmile, FiAlertTriangle, FiLock, FiGlobe, FiShield, FiSend,
  FiPaperclip, FiType, FiMessageSquare, FiClipboard, FiCheck
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { addPost, uploadImage, addAnonymousComplaint, addGeneralPost } from '@/lib/firebase-utils';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: any) => void;
}

type PostType = 'general' | 'activity' | 'concern' | 'anonymous-complaint';

const POST_TYPES: { id: PostType; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'general', label: 'General', icon: FiMessageSquare },
  { id: 'activity', label: 'Activity', icon: FiClipboard },
  { id: 'concern', label: 'Concern', icon: FiAlertTriangle },
  { id: 'anonymous-complaint', label: 'Complaint', icon: FiShield },
];

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
  const [postType, setPostType] = useState<PostType>('general');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [characterCount, setCharacterCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [formData, setFormData] = useState({
    content: '',
    title: '',
    category: '',
    location: '',
    date: '',
    time: '',
    maxParticipants: '',
    isAnonymous: true,
    visibility: 'public',
    imageURL: '',
    severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical'
  });

  const getCharacterLimit = () => {
    switch (postType) {
      case 'general': return 280;
      case 'activity': return 500;
      case 'concern':
      case 'anonymous-complaint': return 1000;
      default: return 500;
    }
  };

  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const limit = getCharacterLimit();
    if (value.length <= limit) {
      setFormData({ ...formData, content: value });
      setCharacterCount(value.length);
      autoResizeTextarea();
    }
  };

  const resetForm = useCallback(() => {
    const isComplaint = postType === 'concern' || postType === 'anonymous-complaint';
    setFormData({
      content: '',
      title: '',
      category: '',
      location: '',
      date: '',
      time: '',
      maxParticipants: '',
      isAnonymous: isComplaint,
      visibility: 'public',
      imageURL: '',
      severity: 'Medium'
    });
    setCharacterCount(0);
    setImagePreview(null);
    setSubmitted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [postType]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      const url = await uploadImage(file, `posts/${Date.now()}_${file.name}`);
      if (mountedRef.current) {
        setFormData(prev => ({ ...prev, imageURL: url }));
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      if (mountedRef.current) {
        setUploadingImage(false);
      }
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

  const isFormValid = () => {
    if (!formData.content.trim()) return false;
    if (postType !== 'general' && !formData.category) return false;
    if ((postType === 'activity' || postType === 'anonymous-complaint') && !formData.title.trim()) return false;
    return true;
  };

  const renderFormFields = () => {
    const commonInputClass = "w-full bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-colors";

    switch (postType) {
      case 'activity':
        return (
          <div className="space-y-4">
            <input type="text" placeholder="Activity Title*" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={commonInputClass} />
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={commonInputClass}>
              <option value="">Select Category*</option>
              {ACTIVITY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className={commonInputClass} />
              <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className={commonInputClass} />
              <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className={commonInputClass} />
              <input type="number" placeholder="Max Participants" value={formData.maxParticipants} onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})} className={commonInputClass} />
            </div>
          </div>
        );
      case 'concern':
        return (
          <div className="space-y-4">
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={commonInputClass}>
              <option value="">Select Category*</option>
              {CONCERN_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <label className="flex items-center gap-3 text-white cursor-pointer p-3 bg-gray-900 rounded-lg border-2 border-gray-700">
              <input type="checkbox" checked={formData.isAnonymous} onChange={(e) => setFormData({...formData, isAnonymous: e.target.checked})} className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-gray-400 focus:ring-gray-500" />
              <span>Post Anonymously</span>
            </label>
          </div>
        );
      case 'anonymous-complaint':
        return (
          <div className="space-y-4">
            <input type="text" placeholder="Subject/Title*" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className={commonInputClass} />
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={commonInputClass}>
              <option value="">Select Category*</option>
              {COMPLAINT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select value={formData.severity} onChange={(e) => setFormData({...formData, severity: e.target.value as any})} className={commonInputClass}>
              <option value="">Select Severity*</option>
              {COMPLAINT_SEVERITIES.map(sev => <option key={sev} value={sev}>{sev}</option>)}
            </select>
          </div>
        );
      case 'general':
         return (
            <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className={commonInputClass}>
              <option value="">Select Category*</option>
              {GENERAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
         );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (submitted) {
      return (
        <div className="text-center p-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck className="text-white text-5xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
          <p className="text-gray-400">Your post has been submitted.</p>
        </div>
      );
    }

    return (
      <>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Create New Post</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POST_TYPES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setPostType(id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  postType === id 
                    ? 'border-white bg-gray-700' 
                    : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <Icon className={`mb-1 ${postType === id ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-sm font-semibold ${postType === id ? 'text-white' : 'text-gray-400'}`}>{label}</span>
              </button>
            ))}
          </div>
          
          {/* Main Content Textarea */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={formData.content}
              onChange={handleContentChange}
              placeholder="What's on your mind?"
              className="w-full bg-gray-800 border-2 border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 resize-none"
              rows={4}
            />
            <div className="absolute bottom-2 right-2 text-xs text-gray-500">
              {characterCount} / {getCharacterLimit()}
            </div>
          </div>
          
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

          {/* Category */}
          <div>
            <label className="block text-white text-xs font-medium mb-1.5">Category *</label>
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

          {/* Visibility options for general posts (moderators only) */}
          {postType === 'general' && (isModerator || isAdmin) && (
            <div>
              <label className="block text-white text-xs font-medium mb-1.5">Visibility</label>
              <div className="space-y-1.5">
                {getVisibilityOptions().map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormData({ ...formData, visibility: option.value })}
                    className={`w-full flex items-center space-x-2 p-2.5 rounded-lg border transition-all ${
                      formData.visibility === option.value
                        ? 'border-white bg-gray-700'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    <option.icon className={`text-sm ${
                      formData.visibility === option.value ? 'text-white' : 'text-gray-400'
                    }`} />
                    <div className="flex-1 text-left">
                      <div className={`font-medium text-sm ${
                        formData.visibility === option.value ? 'text-white' : 'text-gray-300'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-gray-400 text-xs">{option.desc}</div>
                    </div>
                  </button>
                ))}
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
        
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
              <FiImage />
            </button>
            {/* Add other action buttons here if needed */}
          </div>
          <button
            onClick={handleCreatePost}
            disabled={!isFormValid() || loading || uploadingImage}
            className="bg-white text-black font-bold py-2 px-6 rounded-lg transition-colors hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Post'}
          </button>
        </div>
      </>
    );
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-700 shadow-2xl"
          >
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}