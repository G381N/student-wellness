'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiHeart, FiMessageCircle, FiUser, FiCalendar, FiMapPin, FiClock, FiAlertCircle, FiRefreshCw, FiTrendingUp, FiUsers, FiActivity, FiHome, FiFileText } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts, processTimestamp, MindWallIssue, getMindWallIssues } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import ActivityCard from '@/components/ActivityCard';
import ConcernCard from '@/components/ConcernCard';
import TweetCard from '@/components/TweetCard';
import MindWall from '@/components/MindWall';
import CreatePostModal from '@/components/CreatePostModal';
import AnonymousComplaints from '@/components/AnonymousComplaints';
import DepartmentComplaints from '@/components/DepartmentComplaints';
import DepartmentManagement from '@/components/DepartmentManagement';
import DepartmentHeadManagement from '@/components/DepartmentHeadManagement';
import ManageModerators from '@/components/ManageModerators';
import ModeratorAnnouncements from '@/components/ModeratorAnnouncements';
import GuidedBreathing from '@/components/GuidedBreathing';

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
  const [posts, setPosts] = useState<Post[]>([]);
  const [mindWallIssues, setMindWallIssues] = useState<MindWallIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

      fetchData();
  }, [forceRefresh]);

  const handleRefresh = async () => {
    setForceRefresh(prev => prev + 1);
  };

  const handleUpdatePost = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
      post.id === updatedPost.id ? updatedPost : post
      )
    );
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handlePostCreated = (newPost: any) => {
    setForceRefresh(prev => prev + 1);
  };

  const getSearchResults = () => {
    if (!searchQuery.trim()) {
      return {
        posts: [],
        issues: [],
        totalResults: 0
      };
    }
    
    const query = searchQuery.toLowerCase();
    const filteredPosts = posts.filter(post => 
      post.content.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      (post.category && post.category.toLowerCase().includes(query))
    );
    
    const filteredIssues = mindWallIssues.filter(issue =>
      issue.title.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      issue.category.toLowerCase().includes(query)
    );

    return {
      posts: filteredPosts,
      issues: filteredIssues,
      totalResults: filteredPosts.length + filteredIssues.length
    };
  };

  const getFilteredPosts = () => {
    return posts.filter(post => 
      post.type === 'activity' || 
      post.type === 'concern' || 
      post.type === 'general' ||
      post.type === 'post'
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-8">
      {/* Search Results */}
      {searchQuery && (
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Search Results for "{searchQuery}"
            </h2>
            {(() => {
              const results = getSearchResults();
              return results.totalResults > 0 ? (
                <div className="space-y-4">
                  {results.posts.map((post) => (
                    <div key={post.id}>
                      {post.type === 'activity' && (
                          <ActivityCard 
                          activity={post}
                          onUpdate={handleUpdatePost}
                            onDelete={handleDeletePost}
                          />
                      )}
                      {post.type === 'concern' && (
                          <ConcernCard 
                          concern={post}
                          onUpdate={handleUpdatePost}
                            onDelete={handleDeletePost}
                          />
                      )}
                      {(post.type === 'general' || post.type === 'post') && (
                          <TweetCard 
                          tweet={post}
                          onUpdate={handleUpdatePost}
                          onDelete={() => handleDeletePost(post.id)}
                          />
                        )}
                      </div>
                    ))}
                  {results.issues.map((issue) => (
                    <div key={issue.id} className="bg-gray-800 rounded-xl p-4 border border-gray-600">
                      <h3 className="font-semibold text-white mb-2">{issue.title}</h3>
                      <p className="text-gray-300 text-sm mb-2">{issue.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{issue.category}</span>
                        <span>{issue.count} voices</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No results found for your search.</p>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Main Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="space-y-6"
      >
        {getFilteredPosts().length > 0 ? (
          getFilteredPosts().map((post) => (
            <div key={post.id}>
              {post.type === 'activity' && (
                <ActivityCard
                  activity={post}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              )}
              {post.type === 'concern' && (
                <ConcernCard
                  concern={post}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              )}
              {(post.type === 'general' || post.type === 'post') && (
                <TweetCard
                  tweet={post}
                  onUpdate={handleUpdatePost}
                  onDelete={() => handleDeletePost(post.id)}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <FiHome className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">It's quiet in here...</h3>
            <p className="text-gray-500">Be the first to share something with the community!</p>
          </div>
        )}
      </motion.div>

      {/* Refresh Button */}
      <div className="text-center pt-8">
        <button
          onClick={handleRefresh}
          className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
        >
          <FiRefreshCw className="text-lg" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
} 