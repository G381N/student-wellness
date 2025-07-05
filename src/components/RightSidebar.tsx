import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function RightSidebar({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (v: boolean) => void }) {
  const { user } = useAuth();
  // Placeholder data for what's happening and quick actions
  const whatsHappening = [
    { title: 'No Breaks', desc: 'Not being able to go for washroom breaks during 2 hour lab sessions feel inhuman...' },
  ];
  return (
    <aside
      className={`hidden lg:flex flex-col fixed right-0 top-0 z-50 h-full w-80 bg-black/80 backdrop-blur-xl border-l border-gray-800 transition-transform duration-300 ${collapsed ? 'translate-x-full' : 'translate-x-0'}`}
    >
      {/* Collapse button */}
      <div className="flex justify-end p-4">
        <button className="p-2 rounded-full hover:bg-gray-800" onClick={() => setCollapsed(true)}>
          <FiX className="text-white text-xl" />
        </button>
      </div>
      {/* Profile box */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-700">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
              <span className="text-white text-xl font-bold">{user?.displayName?.[0] || 'U'}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold">{user?.displayName || user?.email?.split('@')[0]}</p>
          <p className="text-gray-400 text-xs">{user?.email}</p>
        </div>
      </div>
      {/* What's happening */}
      <div className="px-6 py-4 border-b border-gray-800">
        <h3 className="text-white font-bold text-lg mb-2">What's happening</h3>
        <ul className="space-y-2">
          {whatsHappening.map((item, i) => (
            <li key={i} className="bg-gray-900 rounded-lg p-3 text-gray-200 text-sm">
              <span className="font-semibold text-white">{item.title}</span>
              <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
      {/* Quick Actions */}
      <div className="px-6 py-4">
        <h3 className="text-white font-bold text-lg mb-2">Quick Actions</h3>
        <button className="w-full mb-3 py-2 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition">Create Post</button>
        <button className="w-full py-2 rounded-full bg-gray-800 text-white font-semibold hover:bg-gray-700 transition">Report Issue</button>
      </div>
    </aside>
  );
} 