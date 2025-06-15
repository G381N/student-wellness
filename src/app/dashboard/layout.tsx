'use client';

import { ReactNode, useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Hide ONLY the main website navbar, NOT our dashboard sidebar
    const style = document.createElement('style');
    style.textContent = `
      /* Hide the main website navbar from layout.tsx */
      body > div > div:first-child > nav,
      body nav:not(.dashboard-sidebar),
      header nav,
      .navbar {
        display: none !important;
      }
      body {
        background-color: black !important;
      }
      /* Ensure our dashboard sidebar is always visible */
      .dashboard-sidebar {
        display: block !important;
        visibility: visible !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
} 