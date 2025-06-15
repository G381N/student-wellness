import '../lib/firebase'; // Initialize firebase
import './globals.css';
import AppProvider from './providers';
import { Metadata } from 'next';

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
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles/globals.css" />
      </head>
      <body className="antialiased bg-gray-50">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
