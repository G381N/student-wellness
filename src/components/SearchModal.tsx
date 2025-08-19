'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: string;
  title: string;
  type: 'Post';
  link: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      
      try {
        const allPosts = await getPosts();
        const queryLower = query.toLowerCase();
        
        const filteredResults = allPosts.filter(post => {
          const titleMatch = post.title?.toLowerCase().includes(queryLower) || false;
          const contentMatch = post.content.toLowerCase().includes(queryLower);
          return titleMatch || contentMatch;
        });

        const searchResults: SearchResult[] = filteredResults.map(post => ({
          id: post.id,
          title: post.title || post.content.substring(0, 70) + '...',
          type: 'Post',
          link: `/dashboard`
        }));
        
        setResults(searchResults);
        
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    searchInputRef.current?.focus();
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    onClose();
    handleClearSearch();
  };

  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    onClose();
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-20"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="relative bg-bg-primary rounded-lg shadow-xl w-11/12 max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search CampusWell..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-tertiary text-text-primary rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
                  {isSearching ? <FiLoader className="animate-spin" /> : <FiSearch />}
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
            
            {results.length > 0 && (
              <div className="border-t border-border-primary max-h-80 overflow-y-auto">
                <ul className="py-2">
                  <li className="px-4 py-2 text-xs text-text-tertiary">Posts</li>
                  {results.map(result => (
                    <li key={result.id} 
                        onClick={() => handleResultClick(result.link)}
                        className="px-4 py-2 hover:bg-hover-bg cursor-pointer">
                      <div className="font-medium text-text-primary">{result.title}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
