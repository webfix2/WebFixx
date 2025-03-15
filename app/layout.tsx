// app/layout.tsx

// This is a server component
export const metadata = {
  title: 'Ticket Master',
  description: 'Specialized recruitment services for Radiate Hospitalities, connecting top talent with opportunities in the hospitality industry.',
};

import './globals.css';
import { Inter } from 'next/font/google';
import RootLayout from './RootLayout';

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout inter={inter}>
      {children}
    </RootLayout>
  );
}