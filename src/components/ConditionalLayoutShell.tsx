'use client';

import { usePathname } from 'next/navigation';
import LayoutShell from './LayoutShell';

export default function ConditionalLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Pages that should use the simple layout (no sidebars)
  const simpleLayoutPages = ['/', '/login', '/signup', '/about'];
  
  // Check if current page should use simple layout
  const useSimpleLayout = simpleLayoutPages.includes(pathname);
  
  if (useSimpleLayout) {
    return (
      <main className="min-h-screen bg-black text-white">
        {children}
      </main>
    );
  }
  
  // Use the full layout with sidebars for dashboard pages
  return (
    <LayoutShell>
      {children}
    </LayoutShell>
  );
} 