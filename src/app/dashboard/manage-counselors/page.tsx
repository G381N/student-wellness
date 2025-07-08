'use client';

import ManageCounselors from '@/components/ManageCounselors';
import { AuthProvider } from '@/contexts/AuthContext'; // Ensure context is available

export default function ManageCounselorsPage() {
  return (
    <AuthProvider>
      <ManageCounselors />
    </AuthProvider>
  );
} 

import ManageCounselors from '@/components/ManageCounselors';
import { AuthProvider } from '@/contexts/AuthContext'; // Ensure context is available

export default function ManageCounselorsPage() {
  return (
    <AuthProvider>
      <ManageCounselors />
    </AuthProvider>
  );
} 