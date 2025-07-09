'use client';

import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import CreatePostModal from './CreatePostModal';

interface FloatingActionButtonProps {
  className?: string;
}

export default function FloatingActionButton({ className = '' }: FloatingActionButtonProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handlePostCreated = (post: any) => {
    // Close the modal after post creation
    setShowCreateModal(false);
    console.log('Post created:', post);
  };

  return (
    <>
      <motion.button
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-blue text-text-primary flex items-center justify-center shadow-app-lg hover:bg-accent-blue-hover transition-colors z-40 ${className}`}
        onClick={() => setShowCreateModal(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label="Create Post"
        title="Create Post"
      >
        <FiPlus className="w-6 h-6" />
      </motion.button>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
} 