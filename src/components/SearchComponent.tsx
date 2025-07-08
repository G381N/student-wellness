'use client';

import { useState, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface SearchComponentProps {
  className?: string;
  placeholder?: string;
  onSearch?: (results: any[]) => void;
}

export default function SearchComponent({ 
  className = '', 
  placeholder = 'Search CampusWell...',
  onSearch
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { user, isAdmin, isModerator, isDepartmentHead } = useAuth();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // Simulate search with permission filtering
      console.log(`Searching for: "${searchQuery}" with permissions:`, { 
        isAdmin, 
        isModerator, 
        isDepartmentHead 
      });
      
      // Here you would implement actual search logic
      // For example, calling a backend API with the user's permissions
      
      // Simulate search results based on permissions
      const mockResults = getMockSearchResults(searchQuery, { isAdmin, isModerator, isDepartmentHead });
      
      setResults(mockResults);
      
      if (onSearch) {
        onSearch(mockResults);
      }
      
      // Optional: Navigate to search results page
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
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

  // Mock function to simulate permission-based search results
  const getMockSearchResults = (query: string, permissions: { isAdmin: boolean, isModerator: boolean, isDepartmentHead: boolean }) => {
    const allResults = [
      { id: '1', title: 'Student Wellness Program', type: 'page', access: 'public' },
      { id: '2', title: 'Department Complaints', type: 'page', access: 'department_head' },
      { id: '3', title: 'Anonymous Complaints', type: 'page', access: 'admin' },
      { id: '4', title: 'Moderator Tools', type: 'page', access: 'moderator' },
      { id: '5', title: 'Admin Dashboard', type: 'page', access: 'admin' },
    ];
    
    // Filter results based on permissions
    return allResults.filter(result => {
      if (result.access === 'public') return true;
      if (result.access === 'department_head' && (permissions.isDepartmentHead || permissions.isAdmin)) return true;
      if (result.access === 'moderator' && (permissions.isModerator || permissions.isAdmin)) return true;
      if (result.access === 'admin' && permissions.isAdmin) return true;
      return false;
    });
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
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
              <li key={result.id} className="px-4 py-2 hover:bg-gray-800 cursor-pointer">
                <div className="font-medium">{result.title}</div>
                <div className="text-xs text-gray-400">{result.type}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 