'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Hide navbar on login, register, and home pages
  const hideNavbar = ['/login', '/register', '/'].includes(pathname);
  
  if (hideNavbar) {
    return null;
  }
  
  return <Navbar />;
}