'use client';

import { useState } from 'react';
import MindWall from '@/components/MindWall';
import WhatsHappening from '@/components/WhatsHappening';

export default function MindWallPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1">
        <MindWall searchQuery={searchQuery} />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex-shrink-0 p-4 border-l border-gray-800">
        <WhatsHappening />
      </div>
    </div>
  );
} 