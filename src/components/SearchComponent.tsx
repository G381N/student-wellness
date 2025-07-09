'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getPosts, getMindWallIssues } from '@/lib/firebase-utils';
import type { Post, MindWallIssue } from '@/lib/firebase-utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'Post' | 'Mind Wall Issue' | 'Page';
  access: 'public' | 'moderator' | 'admin' | 'department_head';
  link: string;
  description?: string;
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
  const { user, isAdmin, isModerator, isDepartmentHead } = useAuth();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // 1. Fetch all data
      const [posts, mindWallIssues] = await Promise.all([
        getPosts(),
        getMindWallIssues()
      ]);

      // 2. Define static searchable pages
      const staticPages: SearchResult[] = [
        { id: 'p1', title: 'Dashboard Home', type: 'Page', access: 'public', link: '/dashboard' },
        { id: 'p2', title: 'Mind Wall', type: 'Page', access: 'public', link: '/dashboard/mind-wall' },
        { id: 'p3', title: 'Wellness Resources', type: 'Page', access: 'public', link: '/dashboard/wellness' },
        { id: 'p4', title: 'Announcements', type: 'Page', access: 'moderator', link: '/dashboard/announcements' },
        { id: 'p5', title: 'Anonymous Complaints', type: 'Page', access: 'admin', link: '/dashboard/anonymous-complaints' },
        { id: 'p6', title: 'Department Complaints', type: 'Page', access: 'department_head', link: '/dashboard/department-complaints' },
        { id: 'p7', title: 'Manage Departments', type: 'Page', access: 'admin', link: '/dashboard/manage-departments' },
        { id: 'p8', title: 'Manage Moderators', type: 'Page', access: 'admin', link: '/dashboard/manage-moderators' },
        { id: 'p9', title: 'Manage Counselors', type: 'Page', access: 'admin', link: '/dashboard/manage-counselors' },
      ];

      // 3. Combine and format all searchable items
      const postResults: SearchResult[] = posts.map(p => ({
        id: p.id,
        title: p.title || p.content.substring(0, 50),
        description: p.content,
        type: 'Post',
        access: p.visibility === 'moderators' ? 'moderator' : 'public',
        link: `/dashboard` // Link to the main feed
      }));

      const mindWallResults: SearchResult[] = mindWallIssues.map(i => ({
        id: i.id,
        title: i.title,
        description: i.description,
        type: 'Mind Wall Issue',
        access: 'public',
        link: `/dashboard/mind-wall`
      }));

      const allSearchableItems: SearchResult[] = [
        ...postResults,
        ...mindWallResults,
        ...staticPages,
      ];

      // 4. Filter by search query
      const query = searchQuery.toLowerCase();
      const searchResults = allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );

      // 5. Filter by user permissions
      const permittedResults = searchResults.filter(result => {
        if (result.access === 'public') return true;
        if (isAdmin) return true; // Admins can see everything
        if (isModerator && result.access === 'moderator') return true;
        if (isDepartmentHead && result.access === 'department_head') return true;
        return false;
      });

      setResults(permittedResults);
      
      if (onSearch) {
        onSearch(permittedResults);
      }
      
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
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
            <FiSearch />
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
      
      {/* Search results dropdown - can be shown conditionally */}
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <ul className="py-2">
            {results.map(result => (
              <li key={result.id} 
                  onClick={() => handleResultClick(result.link)}
                  className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
                <div className="font-medium text-white">{result.title}</div>
                <div className="text-xs text-gray-400">{result.type} - <span className="font-semibold">{result.access}</span></div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 
 