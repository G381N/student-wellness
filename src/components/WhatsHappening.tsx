'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiExternalLink } from 'react-icons/fi';
import { getMindWallIssues, MindWallIssue } from '@/lib/firebase-utils';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function WhatsHappening() {
  const [topIssues, setTopIssues] = useState<MindWallIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTopIssues = async () => {
      try {
        setLoading(true);
        const issues = await getMindWallIssues();
        
        // Sort by count (upvotes) and take the top 3
        const sortedIssues = issues
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, 3);
        
        setTopIssues(sortedIssues);
      } catch (error) {
        console.error('Error fetching top mind wall issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopIssues();
  }, []);

  const handleClick = () => {
    router.push('/dashboard/mind-wall');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-text-primary font-bold text-lg mb-2">What's Happening</h3>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <LoadingSpinner size="md" color="accent" />
        </div>
      ) : topIssues.length > 0 ? (
        <>
          {topIssues.map((issue) => (
            <div 
              key={issue.id} 
              className="bg-bg-tertiary rounded-xl p-3 hover:bg-hover-bg transition-colors cursor-pointer"
              onClick={handleClick}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">
                  {issue.category} • Trending
                </span>
                <div className="flex items-center text-text-tertiary text-xs">
                  <FiTrendingUp className="mr-1" />
                  <span>{issue.count || 0}</span>
                </div>
              </div>
              <p className="text-text-primary text-sm font-medium mt-1 line-clamp-2">
                {issue.title}
              </p>
            </div>
          ))}
          
          <button 
            onClick={handleClick}
            className="text-accent-blue text-sm hover:text-accent-blue-hover transition-colors flex items-center"
          >
            <span>View Mind Wall</span>
            <FiExternalLink className="ml-1" />
          </button>
        </>
      ) : (
        <div className="text-text-tertiary text-sm p-3">
          No trending issues at the moment.
        </div>
      )}
    </div>
  );
} 