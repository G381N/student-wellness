'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({ className = '', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we can safely show the theme toggle
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <span className="text-text-secondary font-medium">Theme</span>
      )}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-bg-tertiary hover:bg-hover-bg transition-colors flex items-center justify-center"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <FiSun className="text-text-primary w-5 h-5" />
        ) : (
          <FiMoon className="text-text-primary w-5 h-5" />
        )}
      </button>
    </div>
  );
} 