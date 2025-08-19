'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import RightSidebarContent from './RightSidebarContent';

interface RightSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePost?: () => void;
}

export default function RightSidebarModal({ isOpen, onClose, onCreatePost }: RightSidebarModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end md:hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-sm h-full bg-bg-secondary shadow-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border-primary flex items-center justify-between sticky top-0 bg-bg-secondary z-10">
              <h2 className="text-lg font-semibold text-text-primary">Profile & Updates</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-hover-bg">
                <FiX className="text-text-secondary" />
              </button>
            </div>
            <RightSidebarContent onCreatePost={onCreatePost} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
