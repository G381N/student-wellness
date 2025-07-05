'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { MindWallIssue, getMindWallIssues } from '@/lib/firebase-utils';
import { useAuth } from '@/contexts/AuthContext';

export default function WhatsHappening() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<MindWallIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const fetchedIssues = await getMindWallIssues();
        // Sort by count and take top 5
        const sortedIssues = fetchedIssues
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
        setIssues(sortedIssues);
      } catch (error) {
        console.error('Error fetching trending issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 rounded-xl p-4">
        <h2 className="text-xl font-bold mb-4">What's happening</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl p-4">
      <h2 className="text-xl font-bold mb-4">What's happening</h2>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="p-3 hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <FiTrendingUp className="mr-1" />
              <span>Trending in {issue.category}</span>
            </div>
            <h3 className="font-bold text-white mb-1">
              {issue.icon} {issue.title}
            </h3>
            <div className="text-gray-500 text-sm">
              {issue.count} {issue.count === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 