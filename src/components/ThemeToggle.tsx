'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
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
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-text-secondary font-medium">Theme</span>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-bg-tertiary hover:bg-hover-bg transition-colors"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <FiSun className="text-text-primary" />
        ) : (
          <FiMoon className="text-text-primary" />
        )}
      </button>
    </div>
  );
} 