'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

function ThemeWrapper({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={theme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default function AppProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </ThemeProvider>
    </AuthProvider>
  );
} 