import '../lib/firebase'; // Initialize firebase
import './globals.css';
import AppProvider from './providers';
import { Metadata } from 'next';
import ConditionalLayoutShell from '@/components/ConditionalLayoutShell';

export const metadata: Metadata = {
  title: 'CampusWell - Student Mental Health & Community Support',
  description: 'A platform for student mental health support, campus activities, and community building at your college.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-black text-white min-h-screen">
        <AppProvider>
          <ConditionalLayoutShell>
            {children}
          </ConditionalLayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}
