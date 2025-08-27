import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClerkWrapper from './components/ClerkWrapper'
import ErrorBoundary from './components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TerpTracker - UMD Schedule Analyzer',
  description: 'Smart schedule analyzer for University of Maryland students',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ClerkWrapper publishableKey={publishableKey}>
            {children}
          </ClerkWrapper>
        </ErrorBoundary>
      </body>
    </html>
  )
}