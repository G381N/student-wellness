'use client';

import { useState } from 'react';
import { FiHeart, FiUser, FiExternalLink, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();

  const categoryStyles = {
    'Mental Health': { bg: 'bg-bg-tertiary', text: 'text-text-primary', border: 'border-border-primary' },
    'Physical Health': { bg: 'bg-bg-tertiary', text: 'text-text-primary', border: 'border-border-primary' },
    'Academic Support': { bg: 'bg-bg-tertiary', text: 'text-text-primary', border: 'border-border-primary' },
    'Crisis Support': { bg: 'bg-bg-tertiary', text: 'text-text-primary', border: 'border-border-primary' },
    'Counseling': { bg: 'bg-bg-tertiary', text: 'text-text-primary', border: 'border-border-primary' }
  };

  const categoryStyle = categoryStyles[resource.category] || categoryStyles['Mental Health'];

  return (
    <div className="card p-6 hover:bg-hover-bg transition-all duration-300 cursor-pointer rounded-xl mb-4">
      <div className="flex space-x-4">
        {/* Icon */}
        <div className={`w-12 h-12 ${categoryStyle.bg} rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105`}>
          <FiHeart className={`text-lg ${resource.isEmergency ? 'text-text-primary' : 'text-text-secondary'}`} />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3 flex-wrap">
              <h3 className="font-bold text-text-primary text-lg">{resource.title}</h3>
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${categoryStyle.bg} ${categoryStyle.text} border ${categoryStyle.border} border-opacity-30`}>
                {resource.category}
              </span>
              {resource.isEmergency && (
                <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-bg-tertiary text-text-primary border border-border-primary border-opacity-30 animate-pulse">
                  Emergency
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-text-primary text-lg leading-relaxed">{resource.description}</p>
          </div>

          {/* Availability */}
          {resource.availability && (
            <div className="flex items-center space-x-2 mb-4 bg-bg-tertiary px-3 py-2 rounded-lg w-fit">
              <FiClock className="text-lg text-text-secondary" />
              <span className="text-text-secondary font-medium">{resource.availability}</span>
            </div>
          )}

          {/* Contact Information */}
          {resource.contact && (
            <div className="space-y-3 mb-4">
              {resource.contact.phone && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-bg-tertiary transition-all duration-200 transform hover:scale-110">
                    <FiPhone className="text-xl text-text-secondary" />
                  </div>
                  <a 
                    href={`tel:${resource.contact.phone}`}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium text-base"
                  >
                    {resource.contact.phone}
                  </a>
                </div>
              )}

              {resource.contact.email && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-bg-tertiary transition-all duration-200 transform hover:scale-110">
                    <FiMail className="text-xl text-text-secondary" />
                  </div>
                  <a 
                    href={`mailto:${resource.contact.email}`}
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium text-base"
                  >
                    {resource.contact.email}
                  </a>
                </div>
              )}

              {resource.contact.website && (
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-bg-tertiary transition-all duration-200 transform hover:scale-110">
                    <FiExternalLink className="text-xl text-text-secondary" />
                  </div>
                  <a 
                    href={resource.contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium text-base"
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
              className="px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 border-2 transform hover:scale-105 custom-cursor border-border-primary text-text-secondary hover:bg-hover-bg hover:text-text-primary hover:border-accent-blue hover:shadow-app bg-transparent"
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
            </button>

            {resource.isEmergency && (
              <div className="text-text-secondary text-sm font-medium bg-bg-tertiary px-3 py-2 rounded-lg">
                Available 24/7
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 