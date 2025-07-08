'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiCalendar, FiMapPin, FiUsers, FiClock } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import ActivityCard from '@/components/ActivityCard';
import CreatePostModal from '@/components/CreatePostModal';

export default function ActivitiesPage() {
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

  // Fetch activity posts
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const fetchedPosts = await getPosts();
        const activityPosts = fetchedPosts.filter(post => post.type === 'activity');
        setPosts(activityPosts);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
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
    // Refresh the activities
    const fetchActivities = async () => {
      try {
        const fetchedPosts = await getPosts();
        const activityPosts = fetchedPosts.filter(post => post.type === 'activity');
        setPosts(activityPosts);
      } catch (error) {
        console.error('Error fetching activities:', error);
      }
    };
    fetchActivities();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading activities...</p>
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
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <FiActivity className="text-blue-500 text-4xl mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Campus Activities
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Discover and join activities happening around campus
          </p>
        </motion.div>
      </div>

      {/* Activities Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        {posts.length > 0 ? (
          posts.map((post) => (
            <ActivityCard
              key={post.id}
              activity={post}
              onUpdate={handleUpdatePost}
              onDelete={handleDeletePost}
            />
          ))
        ) : (
          <div className="text-center py-16">
            <FiActivity className="text-gray-600 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No activities yet</h3>
            <p className="text-gray-500 mb-6">Be the first to organize an activity for the community!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Activity
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