import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TerpTracker - UMD Schedule Analyzer & Classmate Finder',
  description: 'Smart schedule analyzer and classmate finder for University of Maryland students. Find classmates in the same course sections and connect via Instagram.',
  keywords: 'UMD, University of Maryland, schedule analyzer, classmate finder, course planner, PlanetTerp, GPA calculator',
  authors: [{ name: 'TerpTracker Team' }],
  openGraph: {
    title: 'TerpTracker - UMD Schedule Analyzer',
    description: 'Find classmates in the same course sections and analyze your UMD schedule',
    url: 'https://terptracker.vercel.app',
    siteName: 'TerpTracker',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 32,
        height: 32,
        alt: 'TerpTracker Icon',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'TerpTracker - UMD Schedule Analyzer',
    description: 'Find classmates in the same course sections',
    images: ['/icon.svg'],
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}