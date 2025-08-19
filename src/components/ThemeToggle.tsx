'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

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
    // Render a placeholder to avoid layout shift
    return <div className={`w-10 h-10 ${className}`} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-10 h-10 flex items-center justify-center rounded-full bg-bg-tertiary hover:bg-hover-bg transition-colors ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {theme === 'dark' ? (
            <FiSun className="text-text-primary" />
          ) : (
            <FiMoon className="text-text-primary" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
} 