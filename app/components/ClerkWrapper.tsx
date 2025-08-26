'use client'

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import NoAuthFallback from './NoAuthFallback'

interface ClerkWrapperProps {
  children: ReactNode
  publishableKey?: string
}

export default function ClerkWrapper({ children, publishableKey }: ClerkWrapperProps) {
  // If no publishable key is provided, render children without Clerk
  if (!publishableKey) {
    console.warn('No Clerk publishable key provided, rendering without authentication')
    return <NoAuthFallback>{children}</NoAuthFallback>
  }

  try {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        {children}
      </ClerkProvider>
    )
  } catch (error) {
    console.error('Failed to initialize Clerk:', error)
    // Fallback: render children without Clerk
    return <NoAuthFallback>{children}</NoAuthFallback>
  }
}
