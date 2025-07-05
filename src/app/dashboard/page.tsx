'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiHeart, FiMessageCircle, FiUser, FiCalendar, FiMapPin, FiClock, FiAlertCircle, FiRefreshCw, FiImage, FiX, FiTrendingUp, FiUsers, FiEdit, FiSettings, FiLogOut, FiChevronDown, FiBell, FiSearch, FiCamera, FiSave, FiActivity, FiTrash2, FiHome, FiFileText } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts, processTimestamp, MindWallIssue, getMindWallIssues } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import ActivityCard from '@/components/ActivityCard';
import ConcernCard from '@/components/ConcernCard';
import TweetCard from '@/components/TweetCard';
import SideNav from '@/components/SideNav';
import MindWall from '@/components/MindWall';
import CreatePostModal from '@/components/CreatePostModal';
import AnonymousComplaints from '@/components/AnonymousComplaints';
import DepartmentComplaints from '@/components/DepartmentComplaints';
import DepartmentManagement from '@/components/DepartmentManagement';
import DepartmentHeadManagement from '@/components/DepartmentHeadManagement';
import ManageModerators from '@/components/ManageModerators';
import ModeratorAnnouncements from '@/components/ModeratorAnnouncements';
import GuidedBreathing from '@/components/GuidedBreathing';
import { signOut, updateProfile, deleteUser } from 'firebase/auth';
import { auth, storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import BreathingGlow from '@/components/BreathingGlow';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorId: string;
  timestamp: any;
  isAnonymous: boolean;
}

export default function DashboardPage() {
  const { user, userData, loading: authLoading, refreshUserData, isModerator, isAdmin } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [mindWallIssues, setMindWallIssues] = useState<MindWallIssue[]>([]);
  const [whatsHappening, setWhatsHappening] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(user?.displayName || '');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update display name when user changes
  useEffect(() => {
    if (user?.displayName) {
      setNewDisplayName(user.displayName);
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/'; // Force page refresh
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setShowProfileDropdown(false);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setDeletingAccount(true);
      
      // Delete user document from Firestore
      if (userData) {
        await deleteDoc(doc(db, 'users', user.uid));
      }
      
      // Delete user authentication account
      await deleteUser(user);
      
      // Redirect to home page
      router.push('/');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(`Failed to delete account: ${error.message}`);
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get what's happening data - modified to show only top Mind Wall issues
  const getWhatsHappening = async (posts: Post[], mindWallIssues: MindWallIssue[]) => {
    try {
      const whatsHappening = [];
      
      // Get top Mind Wall issues only (top 4 most voted)
      const topMindWallIssues = mindWallIssues
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
      
      // Add top Mind Wall issues with enhanced details
      topMindWallIssues.forEach(issue => {
        const timeAgo = Math.floor((Date.now() - new Date(issue.timestamp.toDate()).getTime()) / (1000 * 60 * 60 * 24));
        whatsHappening.push({
          type: 'mindwall',
          title: issue.title,
          subtitle: issue.description.length > 80 ? `${issue.description.substring(0, 80)}...` : issue.description,
          details: `🗣️ ${issue.count} voices • 📂 ${issue.category} • ${timeAgo}d ago`,
          author: 'Community',
          category: issue.category,
          icon: issue.icon,
          engagement: `${issue.votedBy?.length || 0} supporters`,
          count: issue.count
        });
      });
      
      // Add default items if no Mind Wall content
      if (whatsHappening.length === 0) {
        whatsHappening.push(
          {
            type: 'default',
            title: 'Mind Wall is Waiting 🧠',
            subtitle: 'Be the first to voice your concerns',
            details: 'Help improve campus life by sharing your thoughts',
            author: 'Community',
            category: 'Feedback',
            icon: '💭',
            engagement: 'Start the conversation',
            count: 0
          }
        );
      }
      
      return whatsHappening;
    } catch (error) {
      console.error('Error getting what\'s happening:', error);
      return [
        {
          type: 'default',
          title: 'Mind Wall Updates',
          subtitle: 'Loading community voices...',
          details: 'Fetching the latest campus concerns',
          author: 'System',
          category: 'Loading',
          icon: '🔄',
          engagement: 'Please wait',
          count: 0
        }
      ];
    }
  };

  // Fetch posts and mind wall issues with refresh functionality
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [fetchedPosts, fetchedIssues] = await Promise.all([
          getPosts(),
          getMindWallIssues()
        ]);

        // Process posts to ensure they have the correct type
        const processedPosts = fetchedPosts.map(post => ({
          ...post,
          type: post.type || 'post' // Default to 'post' if type is not set
        }));

        setPosts(processedPosts);
        setMindWallIssues(fetchedIssues);
        
        // Get what's happening data
        const whatsHappeningData = await getWhatsHappening(processedPosts, fetchedIssues);
        setWhatsHappening(whatsHappeningData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, forceRefresh]); // Added forceRefresh to dependencies

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const [fetchedPosts, fetchedIssues] = await Promise.all([
        getPosts(),
        getMindWallIssues()
      ]);
      setPosts(fetchedPosts);
      setMindWallIssues(fetchedIssues);
      
      // Get what's happening data
      const whatsHappeningData = await getWhatsHappening(fetchedPosts, fetchedIssues);
      setWhatsHappening(whatsHappeningData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(posts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  const handlePostCreated = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  const handleProfileImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      console.log('📁 Selected file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        alert('Error reading the selected file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setEditingProfile(true);
      let photoURL = user.photoURL;

      // Store image in Firestore instead of Firebase Auth to avoid URL length limits
      if (selectedFile) {
        console.log('📤 Processing image for Firestore storage...');
        console.log('📁 File details:', {
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type
        });
        
        try {
          // Convert file to base64 with aggressive compression
          const base64 = await new Promise<string>((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
              // Very aggressive resize to max 80x80 to keep base64 extremely small
              const maxSize = 80;
              let { width, height } = img;
              
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);
              
              // Very low quality to minimize size
              const resizedBase64 = canvas.toDataURL('image/jpeg', 0.3);
              
              // Final check - if still too long, make it even smaller
              if (resizedBase64.length > 500) {
                canvas.width = 40;
                canvas.height = 40;
                ctx?.drawImage(img, 0, 0, 40, 40);
                const finalBase64 = canvas.toDataURL('image/jpeg', 0.2);
                resolve(finalBase64);
              } else {
                resolve(resizedBase64);
              }
            };
            
            img.onerror = reject;
            
            const reader = new FileReader();
            reader.onload = () => {
              img.src = reader.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          
          photoURL = base64;
          console.log('✅ Image processed, final size:', base64.length, 'characters');
        } catch (conversionError: any) {
          console.error('❌ Image processing error:', conversionError);
          throw new Error(`Failed to process image: ${conversionError.message}`);
        }
      }

      // Update Firebase Auth profile with size-limited photoURL
      console.log('🔄 Updating Firebase Auth profile...');
      try {
        await updateProfile(user, {
          displayName: newDisplayName.trim(),
          photoURL: photoURL
        });
        console.log('✅ Firebase Auth profile updated');
      } catch (authError: any) {
        console.error('❌ Auth update error:', authError);
        throw new Error(`Failed to update auth profile: ${authError.message}`);
      }

      // Update Firestore user document
      if (userData) {
        console.log('🔄 Updating Firestore user document...');
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            displayName: newDisplayName.trim(),
            photoURL: photoURL,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Firestore document updated');
        } catch (firestoreError) {
          console.error('❌ Firestore update error:', firestoreError);
          // Don't throw here as auth is already updated
          console.warn('Auth profile updated but Firestore sync failed');
        }
      }

      // Refresh user data from AuthContext
      console.log('🔄 Refreshing user data...');
      await refreshUserData();
      
      // Force UI refresh
      setForceRefresh(prev => prev + 1);
      
      // Reset states after successful update
      setSelectedFile(null);
      setProfileImagePreview(null);
      setShowProfileEditor(false);
      setShowProfileDropdown(false);
      
      console.log('✅ Profile updated successfully!');
      
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setEditingProfile(false);
    }
  };

  const getSearchResults = () => {
    const results: any[] = [];
    
    if (!searchQuery.trim()) return results;
    
    const query = searchQuery.toLowerCase();
    
    // Search in posts
    if (activeSection === 'home' || activeSection === 'feed') {
      posts.forEach(post => {
        if (post.content.toLowerCase().includes(query) || 
            (post as any).authorName?.toLowerCase().includes(query)) {
          results.push({
            type: 'post',
            id: post.id,
            title: post.content.substring(0, 50) + '...',
            description: `By ${(post as any).authorName || 'Anonymous'}`,
            action: () => setActiveSection('home')
          });
        }
      });
    }
    
    // Search in Mind Wall issues
    if (activeSection === 'mindwall' || activeSection === 'home') {
      mindWallIssues.forEach(issue => {
        if (issue.title.toLowerCase().includes(query) || 
            issue.description.toLowerCase().includes(query)) {
          results.push({
            type: 'mindwall',
            id: issue.id,
            title: issue.title,
            description: issue.description.substring(0, 80) + '...',
            action: () => setActiveSection('mindwall')
          });
        }
      });
    }
    
    // Search in wellness topics
    if (activeSection === 'wellness' || activeSection === 'home') {
      const wellnessTopics = ['anxiety', 'depression', 'stress', 'academic pressure', 'social isolation'];
      
      wellnessTopics.forEach(topic => {
        if (topic.includes(query)) {
          results.push({
            type: 'wellness',
            id: topic,
            title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Resources`,
            description: `Mental health information and support for ${topic}`,
            action: () => setActiveSection('wellness')
          });
        }
      });
    }
    
    return results.slice(0, 10); // Limit to 10 results
  };

  const searchResults = getSearchResults();

  // Enhanced filtered posts function
  const getFilteredPosts = () => {
    let filteredPosts = posts;
    
    // Filter out moderators-only posts for regular users
    if (!userData?.role || (userData.role !== 'moderator' && userData.role !== 'admin')) {
      filteredPosts = filteredPosts.filter(post => (post as any).visibility !== 'moderators');
    }
    
    if (activeSection === 'feed') {
      // Show all posts except moderator announcements
      filteredPosts = filteredPosts.filter(post => 
        (post as any).type !== 'moderator-announcement'
      );
    } else if (activeSection === 'activities') {
      filteredPosts = filteredPosts.filter(post => (post as any).type === 'activity');
    } else if (activeSection === 'concerns') {
      filteredPosts = filteredPosts.filter(post => (post as any).type === 'concern');
    } else {
      filteredPosts = [];
    }
    
    if (searchQuery.trim()) {
      filteredPosts = filteredPosts.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ((post as any).category && (post as any).category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ((post as any).location && (post as any).location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ((post as any).author && (post as any).author.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filteredPosts;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Global CSS for hiding scrollbars and responsive layout */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile-first responsive layout */
        .three-column-layout {
          display: grid;
          grid-template-columns: auto 1fr;
          min-height: 100vh;
          width: 100vw;
        }
        
        .left-sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          width: 4rem;
          z-index: 40;
          background: black;
          border-right: 1px solid rgb(55, 65, 81);
        }
        
        .center-content {
          margin-left: 4rem;
          min-height: 100vh;
          background: black;
          width: calc(100vw - 4rem);
          border-right: 1px solid rgb(55, 65, 81);
        }
        
        .right-sidebar {
          display: none;
        }
        
        .sticky-search {
          position: sticky;
          top: 0;
          z-index: 30;
          backdrop-filter: blur(12px);
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 1px solid rgb(55, 65, 81);
        }
        
        /* Mobile search improvements */
        .mobile-search-container {
          padding: 0.75rem 1rem;
        }
        
        .mobile-search-input {
          width: 100%;
          background: rgb(17, 24, 39);
          border: 1px solid rgb(75, 85, 99);
          border-radius: 9999px;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          color: white;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        
        .mobile-search-input:focus {
          outline: none;
          border-color: rgb(59, 130, 246);
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
        }
        
        /* Twitter-like hover effects */
        .tweet-hover:hover {
          background-color: rgba(255, 255, 255, 0.03);
          transition: background-color 0.2s ease;
        }
        
        .card-hover:hover {
          background-color: rgba(255, 255, 255, 0.02);
          transition: background-color 0.2s ease;
        }
        
        .btn-hover-scale:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
        
        /* Desktop responsive adjustments */
        @media (min-width: 768px) {
          .mobile-search-container {
            padding: 1rem 1.5rem;
          }
          
          .mobile-search-input {
            padding: 0.875rem 1rem 0.875rem 3rem;
            font-size: 1rem;
          }
          
          .left-sidebar {
            width: 5rem;
          }
          
          .center-content {
            margin-left: 5rem;
            width: calc(100vw - 5rem);
          }
        }
        
        @media (min-width: 1024px) {
          .left-sidebar {
            width: 16rem;
          }
          .center-content {
            margin-left: 16rem;
            width: calc(100vw - 16rem);
          }
        }
        
        @media (min-width: 1280px) {
          .three-column-layout {
            grid-template-columns: auto 1fr auto;
          }
          
          .left-sidebar {
            width: 16rem;
          }
          
          .center-content {
            margin-left: 16rem;
            margin-right: 20rem;
            width: calc(100vw - 36rem);
            border-right: none;
          }
          
          .right-sidebar {
            display: block;
            position: fixed;
            right: 0;
            top: 0;
            height: 100vh;
            width: 20rem;
            z-index: 30;
            background: black;
            border-left: 1px solid rgb(55, 65, 81);
          }
        }
        
        @media (min-width: 1536px) {
          .left-sidebar {
            width: 18rem;
          }
          
          .right-sidebar {
            width: 24rem;
          }
          
          .center-content {
            margin-left: 18rem;
            margin-right: 24rem;
            width: calc(100vw - 42rem);
          }
        }
        
        /* Mobile profile button improvements */
        .mobile-profile-in-sidebar {
          display: block;
        }
        
        .mobile-profile-fab {
          display: none;
        }
        
        @media (min-width: 1280px) {
          .mobile-profile-in-sidebar {
            display: none;
          }
          
          .mobile-profile-fab {
            display: block;
          }
        }
        
        /* Desktop profile icon - only visible on desktop */
        .desktop-profile-icon {
          display: none;
        }
        
        @media (min-width: 1280px) {
          .desktop-profile-icon {
            display: block;
          }
        }
      `}</style>

      {/* Left Navigation - Fixed positioned with mobile profile */}
      <div className="left-sidebar">
        <SideNav 
          onSelectSection={(section) => {
            setActiveSection(section);
            // Force refresh data when switching sections
            if (section !== activeSection) {
              setForceRefresh(prev => prev + 1);
            }
          }} 
          activeSection={activeSection}
          onCreatePost={() => setShowCreateModal(true)}
          user={user}
          userData={userData}
          onProfileClick={() => setShowProfileDropdown(!showProfileDropdown)}
          showProfileDropdown={showProfileDropdown}
          onSignOut={handleSignOut}
          onEditProfile={() => {
            setShowProfileEditor(true);
            setShowProfileDropdown(false);
          }}
          onDeleteAccount={() => {
            setShowDeleteConfirm(true);
            setShowProfileDropdown(false);
          }}
          forceRefresh={forceRefresh}
        />
      </div>
      
      {/* Center Content - Main Feed */}
      <div className="center-content">
        {/* Mobile-optimized Sticky Header with Search */}
        <div className="sticky-search h-16 flex items-center">
          <div className="mobile-search-container w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mobile-search-input"
                placeholder="Search everything..."
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Mobile-optimized Search Results Dropdown */}
            <AnimatePresence>
              {searchResults && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-2 mx-3 bg-black border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto scrollbar-hide"
                >
                  <div className="py-2">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result.type}-${result.id}-${index}`}
                        onClick={() => {
                          result.action();
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm">
                            {result.type === 'section' && <FiHome className="text-blue-400" />}
                            {result.type === 'post' && <FiFileText className="text-green-400" />}
                            {result.type === 'mindwall' && <FiUsers className="text-purple-400" />}
                            {result.type === 'wellness' && <FiHeart className="text-pink-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-white font-medium text-sm truncate">{result.title}</h3>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                result.type === 'section' ? 'bg-blue-600 text-blue-100' :
                                result.type === 'post' ? 'bg-green-600 text-green-100' :
                                result.type === 'mindwall' ? 'bg-purple-600 text-purple-100' :
                                'bg-pink-600 text-pink-100'
                              }`}>
                                {result.type === 'section' ? 'Section' :
                                 result.type === 'post' ? 'Post' :
                                 result.type === 'mindwall' ? 'Mind Wall' : 'Wellness'}
                              </span>
                            </div>
                            <p className="text-gray-400 text-xs line-clamp-2">{result.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Content Area - Mobile optimized */}
        <div className="overflow-y-auto scrollbar-hide" style={{ height: 'calc(100vh - 64px)' }}>
          <div className="max-w-full px-0">
            {/* Feed Content */}
            {(activeSection === 'feed' || activeSection === 'activities' || activeSection === 'concerns') && (
              <div>
                {loading && posts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading posts...</p>
                  </div>
                ) : getFilteredPosts().length === 0 ? (
                  <div className="text-center py-20 px-8">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        {activeSection === 'activities' ? <FiActivity className="text-gray-400 text-2xl" /> :
                         activeSection === 'concerns' ? <FiAlertCircle className="text-gray-400 text-2xl" /> :
                         <FiHeart className="text-gray-400 text-2xl" />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {activeSection === 'activities' ? 'No activities yet' : 
                         activeSection === 'concerns' ? 'No concerns yet' : 'Welcome to your feed'}
                      </h3>
                      <p className="text-gray-400 mb-6">
                        {activeSection === 'activities' ? 'Be the first to share an activity with your campus community.' : 
                         activeSection === 'concerns' ? 'Share your concerns to help improve campus life.' : 
                         'Start by creating your first post or following some activities.'}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-white hover:bg-gray-200 text-black px-8 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl"
                    >
                      <FiPlus className="inline mr-2" />
                      {activeSection === 'activities' ? 'Create Activity' : 
                       activeSection === 'concerns' ? 'Share Concern' : 'Create Post'}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {getFilteredPosts().map((post) => (
                      <div key={post.id} className="tweet-hover transition-colors">
                        {(post as any).type === 'activity' ? (
                          <ActivityCard 
                            activity={post as any} 
                            onUpdate={handleUpdatePost as any} 
                            onDelete={handleDeletePost}
                          />
                        ) : (post as any).type === 'concern' ? (
                          <ConcernCard 
                            concern={post as any} 
                            onUpdate={handleUpdatePost as any} 
                            onDelete={handleDeletePost}
                          />
                        ) : (
                          <TweetCard 
                            tweet={post as any} 
                            onUpdate={handleUpdatePost as any} 
                            onDelete={handleDeletePost}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Other sections remain the same */}
            {activeSection === 'mindwall' && (
              <MindWall searchQuery={searchQuery} />
            )}

            {activeSection === 'moderator-announcements' && (
              <ModeratorAnnouncements />
            )}

            {activeSection === 'manage-moderators' && (
              <ManageModerators />
            )}

            {activeSection === 'wellness' && (
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Wellness Center</h2>
                
                {/* Mental Health Learning Content */}
                <div className="grid gap-6">
                  {/* Introduction */}
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Mental Health Resources & Learning</h3>
                    <p className="text-gray-300 mb-4">
                      College life can be challenging, and it's completely normal to face mental health struggles. 
                      Here you'll find information about common issues students face and practical strategies to help you feel better.
                    </p>
                    <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
                      <p className="text-blue-300 text-sm">
                        💡 Remember: Seeking help is a sign of strength, not weakness. You're not alone in this journey.
                      </p>
                    </div>
                  </div>

                  {/* Common Mental Health Issues */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Anxiety */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">😰</span>
                        <h4 className="text-lg font-semibold text-white">Anxiety & Stress</h4>
                      </div>
                      <div className="space-y-3 text-gray-300 text-sm">
                        <div>
                          <h5 className="font-medium text-white mb-2">Common Signs:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Excessive worry about grades or future</li>
                            <li>Physical symptoms (racing heart, sweating)</li>
                            <li>Difficulty concentrating</li>
                            <li>Avoiding social situations or classes</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-white mb-2">What You Can Do:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Practice deep breathing exercises</li>
                            <li>Break large tasks into smaller steps</li>
                            <li>Maintain a regular sleep schedule</li>
                            <li>Try the 5-4-3-2-1 grounding technique</li>
                            <li>Talk to a counselor or trusted friend</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Depression */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">😔</span>
                        <h4 className="text-lg font-semibold text-white">Depression & Low Mood</h4>
                      </div>
                      <div className="space-y-3 text-gray-300 text-sm">
                        <div>
                          <h5 className="font-medium text-white mb-2">Common Signs:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Persistent sadness or emptiness</li>
                            <li>Loss of interest in activities</li>
                            <li>Changes in appetite or sleep</li>
                            <li>Feeling hopeless or worthless</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-white mb-2">What You Can Do:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Maintain daily routines</li>
                            <li>Get sunlight and fresh air daily</li>
                            <li>Exercise regularly, even light walking</li>
                            <li>Connect with supportive friends/family</li>
                            <li>Consider professional counseling</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Academic Pressure */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">📚</span>
                        <h4 className="text-lg font-semibold text-white">Academic Pressure</h4>
                      </div>
                      <div className="space-y-3 text-gray-300 text-sm">
                        <div>
                          <h5 className="font-medium text-white mb-2">Common Signs:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Perfectionism and fear of failure</li>
                            <li>Procrastination or overworking</li>
                            <li>Comparing yourself to others</li>
                            <li>Feeling overwhelmed by coursework</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-white mb-2">What You Can Do:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Set realistic, achievable goals</li>
                            <li>Use time management techniques</li>
                            <li>Take regular study breaks</li>
                            <li>Seek help from professors/tutors</li>
                            <li>Remember: grades don't define your worth</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Social Isolation */}
                    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                      <div className="flex items-center mb-4">
                        <span className="text-2xl mr-3">😞</span>
                        <h4 className="text-lg font-semibold text-white">Loneliness & Social Issues</h4>
                      </div>
                      <div className="space-y-3 text-gray-300 text-sm">
                        <div>
                          <h5 className="font-medium text-white mb-2">Common Signs:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Feeling disconnected from others</li>
                            <li>Difficulty making friends</li>
                            <li>Social anxiety in group settings</li>
                            <li>Homesickness or missing family</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-white mb-2">What You Can Do:</h5>
                          <ul className="list-disc list-inside space-y-1 text-gray-400">
                            <li>Join clubs or student organizations</li>
                            <li>Attend campus events and activities</li>
                            <li>Volunteer for causes you care about</li>
                            <li>Be open to new friendships</li>
                            <li>Stay connected with family/old friends</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Self-Care Strategies */}
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Self-Care Strategies</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="mr-2">🧘</span>
                          Mindfulness
                        </h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li>• 5-minute daily meditation</li>
                          <li>• Mindful breathing exercises</li>
                          <li>• Body scan relaxation</li>
                          <li>• Gratitude journaling</li>
                        </ul>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="mr-2">💪</span>
                          Physical Health
                        </h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li>• Regular exercise (even 15 mins)</li>
                          <li>• 7-9 hours of sleep</li>
                          <li>• Balanced nutrition</li>
                          <li>• Stay hydrated</li>
                        </ul>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-2 flex items-center">
                          <span className="mr-2">🤝</span>
                          Social Connection
                        </h4>
                        <ul className="text-gray-400 text-sm space-y-1">
                          <li>• Regular check-ins with friends</li>
                          <li>• Join study groups</li>
                          <li>• Participate in campus activities</li>
                          <li>• Seek support when needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Resources */}
                  <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-300 mb-4">🚨 Crisis Resources</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-white mb-2">If you're in immediate danger:</h4>
                        <ul className="text-red-200 space-y-1">
                          <li>• Call 911 (Emergency Services)</li>
                          <li>• Go to nearest emergency room</li>
                          <li>• Call campus security</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-white mb-2">Crisis Support Lines:</h4>
                        <ul className="text-red-200 space-y-1">
                          <li>• National Suicide Prevention: 988</li>
                          <li>• Crisis Text Line: Text HOME to 741741</li>
                          <li>• SAMHSA Helpline: 1-800-662-4357</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Campus Resources */}
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Campus Mental Health Resources</h3>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 mt-1">🏥</span>
                        <div>
                          <h4 className="font-medium text-white">Student Counseling Services</h4>
                          <p className="text-gray-400 text-sm">Block II, Room 204 • Free individual and group counseling</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-green-400 mt-1">📞</span>
                        <div>
                          <h4 className="font-medium text-white">24/7 Crisis Helpline</h4>
                          <p className="text-gray-400 text-sm">1800-599-0019 • Available anytime for immediate support</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-purple-400 mt-1">👥</span>
                        <div>
                          <h4 className="font-medium text-white">Peer Support Groups</h4>
                          <p className="text-gray-400 text-sm">Wednesdays 4-5 PM • Connect with other students</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-yellow-400 mt-1">🧘</span>
                        <div>
                          <h4 className="font-medium text-white">Mindfulness Sessions</h4>
                          <p className="text-gray-400 text-sm">Daily 7-8 AM, Wellness Center • Guided meditation and relaxation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tips for Seeking Help */}
                  <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-white mb-4">Tips for Seeking Help</h3>
                    <div className="space-y-3 text-gray-300 text-sm">
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 font-bold">1.</span>
                        <p><strong className="text-white">Start small:</strong> You don't need to share everything at once. Begin with what feels comfortable.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 font-bold">2.</span>
                        <p><strong className="text-white">Be honest:</strong> The more honest you are, the better help you can receive.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 font-bold">3.</span>
                        <p><strong className="text-white">It's okay to shop around:</strong> If one counselor doesn't feel right, try another.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 font-bold">4.</span>
                        <p><strong className="text-white">Bring a friend:</strong> If you're nervous, ask a trusted friend to accompany you.</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="text-blue-400 font-bold">5.</span>
                        <p><strong className="text-white">Be patient:</strong> Healing takes time. Be kind to yourself throughout the process.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'breathing' && (
              <div className="p-6">
                <GuidedBreathing />
              </div>
            )}

            {activeSection === 'anonymous-complaints' && (
              <AnonymousComplaints />
            )}

            {activeSection === 'department-complaints' && (
              <DepartmentComplaints />
            )}

            {activeSection === 'department-management' && (
              <DepartmentManagement />
            )}

            {activeSection === 'department-heads' && (
              <DepartmentHeadManagement />
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - What's Happening */}
      <div className="right-sidebar hidden xl:block">
        <div className="h-full flex flex-col">
          {/* Profile Section */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 rounded-full overflow-hidden border border-gray-700">
                  {user?.photoURL ? (
                    <img 
                      src={`${user.photoURL}?t=${forceRefresh}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-gray-400 text-lg" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">{user?.displayName || 'User'}</h3>
                  <p className="text-gray-400 text-xs">@{user?.email?.split('@')[0]}</p>
                </div>
              </div>
            </div>
          </div>

          {/* What's Happening - Now shows only top Mind Wall issues */}
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-4 space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h2 className="text-lg font-bold text-white">What's happening</h2>
                  <p className="text-xs text-gray-400 mt-1">Top community concerns</p>
                </div>
                <div className="divide-y divide-gray-800">
                  {whatsHappening.length > 0 ? (
                    whatsHappening.slice(0, 3).map((item, index) => (
                      <div 
                        key={`${item.type}-${index}`} 
                        className="p-4 hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => setActiveSection('mindwall')}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{item.title}</h3>
                            <p className="text-gray-400 text-xs line-clamp-3">{item.subtitle}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-gray-400 text-sm">No community voices yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
                <h3 className="text-white font-bold text-sm mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-white hover:bg-gray-200 text-black font-medium py-2 px-4 rounded-full transition-all text-sm"
                  >
                    Create Post
                  </button>
                  <button
                    onClick={() => setActiveSection('mindwall')}
                    className="w-full border border-gray-600 hover:border-gray-400 text-white font-medium py-2 px-4 rounded-full transition-all text-sm"
                  >
                    Report Issue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      <AnimatePresence>
        {showProfileEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={() => setShowProfileEditor(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-4">
                    <div className="w-24 h-24 bg-gray-900 border border-gray-700 rounded-full overflow-hidden">
                      {profileImagePreview ? (
                        <img 
                          src={profileImagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : user?.photoURL ? (
                        <img 
                          src={`${user.photoURL}?t=${forceRefresh}`} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiUser className="text-gray-400 text-2xl" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-white text-black rounded-full p-2 hover:bg-gray-200 transition-colors"
                    >
                      <FiCamera className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageSelect}
                    className="hidden"
                  />
                  <p className="text-gray-400 text-sm text-center">Click the camera icon to change your profile picture</p>
                </div>

                {/* Display Name Input */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-white transition-all"
                    placeholder="Enter your display name"
                  />
                  {user?.email && (
                    <p className="text-gray-500 text-xs mt-1">
                      Real email: {user.email}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowProfileEditor(false)}
                    className="flex-1 border border-gray-600 text-white font-medium py-3 px-4 rounded-lg hover:border-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={editingProfile}
                    className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {editingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border border-red-700 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-400">Delete Account</h2>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-900 bg-opacity-20 border border-red-700 rounded-lg p-4">
                  <p className="text-red-300 text-sm">
                    ⚠️ This action is permanent and cannot be undone. All your posts, comments, and data will be deleted.
                  </p>
                </div>
                
                <p className="text-gray-300">
                  Are you sure you want to delete your account? This will:
                </p>
                
                <ul className="text-gray-400 text-sm space-y-1 ml-4">
                  <li>• Delete all your posts and comments</li>
                  <li>• Remove your profile information</li>
                  <li>• Cancel your participation in activities</li>
                  <li>• Permanently close your account</li>
                </ul>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 border border-gray-600 text-white font-medium py-3 px-4 rounded-lg hover:border-gray-400 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                    className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {deletingAccount ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 