'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiMessageCircle, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import ConcernCard from '@/components/ConcernCard';
import CreatePostModal from '@/components/CreatePostModal';

export default function ConcernsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch concern posts
  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getPosts();
        const concernPosts = fetchedPosts.filter(post => post.type === 'concern');
        setPosts(concernPosts);
      } catch (error) {
        console.error('Error fetching concerns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);

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

  const handlePostCreated = () => {
    // Refresh the concerns
    const fetchConcerns = async () => {
      try {
        const fetchedPosts = await getPosts();
        const concernPosts = fetchedPosts.filter(post => post.type === 'concern');
        setPosts(concernPosts);
      } catch (error) {
        console.error('Error fetching concerns:', error);
      }
    };
    fetchConcerns();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading concerns...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="mb-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiAlertCircle className="text-gray-400 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Campus Concerns
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Share your concerns and help improve campus life
          </p>
        </motion.div>
      </div>

      {/* Concerns Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <ConcernCard
              key={post.id}
              concern={post}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <FiAlertCircle className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No concerns yet</h3>
            <p className="text-gray-500 mb-6">Share your concerns to help improve campus life</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Share First Concern
            </button>
          </div>
        )}
      </motion.div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
} 