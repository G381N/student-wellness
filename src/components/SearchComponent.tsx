'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';
import { debounce } from 'lodash';

interface SearchResult {
  id: string;
  title: string;
  type: 'Post';
  link: string;
}

interface SearchComponentProps {
  className?: string;
  placeholder?: string;
  onSearch?: (results: SearchResult[]) => void;
}

export default function SearchComponent({ 
  className = '', 
  placeholder = 'Search CampusWell...',
  onSearch
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const { user, isAdmin, isModerator, isDepartmentHead, userData } = useAuth();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
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
          // Keyword match
          const titleMatch = post.title?.toLowerCase().includes(queryLower) || false;
          const contentMatch = post.content.toLowerCase().includes(queryLower);
          if (!titleMatch && !contentMatch) {
            return false;
          }
          
          // Permission check
          if (post.visibility === 'moderators' && !(isAdmin || isModerator)) {
            return false;
          }
          // Check if post is for a specific department by matching post category with user's department
          if (post.type === 'activity' && post.category) {
            if(isDepartmentHead && userData?.department !== post.category && !isAdmin) {
              return false;
            }
          }
          
          return true;
        });

        const searchResults: SearchResult[] = filteredResults.map(post => ({
          id: post.id,
          title: post.title || post.content.substring(0, 70) + '...',
          type: 'Post',
          link: `/dashboard` // All posts are on the main feed
        }));
        
        setResults(searchResults);
        
        if (onSearch) {
          onSearch(searchResults);
        }
        
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  // Effect to trigger search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    handleClearSearch();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full h-9 sm:h-10 bg-bg-tertiary text-text-primary rounded-full py-1 sm:py-2 pl-8 pr-8 sm:pl-10 sm:pr-10 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-accent-blue placeholder-text-tertiary"
        />
        <div className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
          {isSearching ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiSearch />
          )}
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
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-secondary border border-border-primary rounded-lg shadow-app-lg z-50 max-h-80 overflow-y-auto">
          <ul className="py-2">
            <li className="px-4 py-2 text-xs text-text-tertiary border-b border-border-primary">Posts</li>
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
    </div>
  );
} 
 