import './globals.css';
import { Inter } from 'next/font/google';
import RootLayout from './RootLayout';
import { AppProvider } from './context/AppContext';

export const metadata = {
  title: 'WebFixx',
  description: 'Specialized recruitment services for Radiate Hospitalities, connecting top talent with opportunities in the hospitality industry.',
};

const inter = Inter({ subsets: ['latin'] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <RootLayout inter={inter}>
        {children}
      </RootLayout>
    </AppProvider>
  );
}