'use client';

import { useState } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { searchAllContent } from '@/lib/firebase-utils'; // Import the new search function

interface SearchComponentProps {
  className?: string;
  placeholder?: string;
}

export default function SearchComponent({ 
  className = '', 
  placeholder = 'Search CampusWell...',
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { user, isAdmin, isModerator, isDepartmentHead, department } = useAuth();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    };
    setIsSearching(true);
    
    try {
      const searchResults = await searchAllContent(searchQuery, {
        isAdmin,
        isModerator,
        isDepartmentHead,
        department
      });
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
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
        <button type="submit" className="absolute left-3 top-2.5 text-gray-500">
          {isSearching ? (
            <FiLoader className="animate-spin" />
          ) : (
            <FiSearch />
          )}
        </button>
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
            {results.map(result => (
              <li 
                key={result.id} 
                onClick={() => handleResultClick(result.link)}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer"
              >
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
 