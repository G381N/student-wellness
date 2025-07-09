'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts } from '@/lib/firebase-utils';
import type { Post } from '@/lib/firebase-utils';

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

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const allPosts = await getPosts();
      const query = searchQuery.toLowerCase();
      
      const filteredResults = allPosts.filter(post => {
        // Keyword match
        const titleMatch = post.title?.toLowerCase().includes(query) || false;
        const contentMatch = post.content.toLowerCase().includes(query);
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
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  const handleResultClick = (link: string) => {
    router.push(link);
    handleClearSearch();
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-500"
        />
        <div className="absolute left-3 top-2.5 text-gray-500">
          {isSearching ? (
            <FiLoader className="animate-spin" />
          ) : (
            <button type="submit" aria-label="Search">
              <FiSearch />
            </button>
          )}
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-300"
          >
            <FiX />
          </button>
        )}
      </form>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <ul className="py-2">
            <li className="px-4 py-2 text-xs text-gray-500 border-b border-gray-700">Posts</li>
            {results.map(result => (
              <li key={result.id} 
                  onClick={() => handleResultClick(result.link)}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
                <div className="font-medium text-white">{result.title}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
 