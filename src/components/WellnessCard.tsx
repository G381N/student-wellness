'use client';

import { useState } from 'react';
import { FiHeart, FiUser, FiExternalLink, FiPhone, FiMail, FiClock } from 'react-icons/fi';

interface WellnessResource {
  id: string;
  title: string;
  description: string;
  category: 'Mental Health' | 'Physical Health' | 'Academic Support' | 'Crisis Support' | 'Counseling';
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  availability?: string;
  isEmergency?: boolean;
}

interface WellnessCardProps {
  resource: WellnessResource;
}

export default function WellnessCard({ resource }: WellnessCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColors = {
    'Mental Health': { bg: 'bg-blue-900', text: 'text-blue-300', border: 'border-blue-500' },
    'Physical Health': { bg: 'bg-green-900', text: 'text-green-300', border: 'border-green-500' },
    'Academic Support': { bg: 'bg-purple-900', text: 'text-purple-300', border: 'border-purple-500' },
    'Crisis Support': { bg: 'bg-red-900', text: 'text-red-300', border: 'border-red-500' },
    'Counseling': { bg: 'bg-teal-900', text: 'text-teal-300', border: 'border-teal-500' }
  };

  const categoryStyle = categoryColors[resource.category] || categoryColors['Mental Health'];

  return (
    <div className="p-6 hover:bg-gray-950 hover:bg-opacity-40 transition-all duration-300 cursor-pointer border-b border-gray-800 card-hover">
      <div className="flex space-x-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${categoryStyle.bg} rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105`}>
          <FiHeart className={`text-lg ${categoryStyle.text}`} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 flex-wrap">
              <h3 className="font-bold text-white text-lg">{resource.title}</h3>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} border-opacity-30`}>
                {resource.category}
              </span>
              {resource.isEmergency && (
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-900 text-red-300 border border-red-500 border-opacity-30 animate-pulse">
                  Emergency
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-white text-lg leading-relaxed">{resource.description}</p>
          </div>

          {/* Availability */}
          {resource.availability && (
            <div className="flex items-center space-x-2 mb-4 bg-gray-900 px-3 py-2 rounded-lg w-fit">
              <FiClock className="text-lg text-blue-400" />
              <span className="text-gray-300 font-medium">{resource.availability}</span>
            </div>
          )}

          {/* Contact Information */}
          {resource.contact && (
            <div className="space-y-3 mb-4">
              {resource.contact.phone && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-green-900 bg-opacity-30 transition-all duration-200 transform hover:scale-110">
                    <FiPhone className="text-xl text-green-400" />
                  </div>
                  <a 
                    href={`tel:${resource.contact.phone}`}
                    className="text-green-400 hover:text-green-300 transition-colors duration-200 font-medium text-base"
                  >
                    {resource.contact.phone}
                  </a>
                </div>
              )}

              {resource.contact.email && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-blue-900 bg-opacity-30 transition-all duration-200 transform hover:scale-110">
                    <FiMail className="text-xl text-blue-400" />
                  </div>
                  <a 
                    href={`mailto:${resource.contact.email}`}
                    className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium text-base"
                  >
                    {resource.contact.email}
                  </a>
                </div>
              )}

              {resource.contact.website && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-purple-900 bg-opacity-30 transition-all duration-200 transform hover:scale-110">
                    <FiExternalLink className="text-xl text-purple-400" />
                  </div>
                  <a 
                    href={resource.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium text-base"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-between items-center mt-4 pt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 border-2 transform hover:scale-105 custom-cursor border-blue-500 text-blue-400 hover:bg-blue-500 hover:bg-opacity-20 hover:text-blue-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/25 bg-transparent"
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
            </button>

            {resource.isEmergency && (
              <div className="text-red-400 text-sm font-medium bg-red-900 bg-opacity-20 px-3 py-2 rounded-lg">
                Available 24/7
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 