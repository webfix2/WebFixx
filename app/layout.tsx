import './globals.css'
import { Inter } from 'next/font/google'
import { AppProvider } from './context/AppContext'
import { LoadingProvider } from './context/LoadingContext'
import RootLayout from './RootLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'WebFixx',
  description: 'Your complete web solution platform',
}

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoadingProvider>
          <AppProvider>
            <RootLayout inter={inter}>
              {children}
            </RootLayout>
          </AppProvider>
        </LoadingProvider>
      </body>
    </html>
  )
}