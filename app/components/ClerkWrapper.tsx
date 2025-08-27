'use client'

import { ReactNode, useEffect } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import NoAuthFallback from './NoAuthFallback'

interface ClerkWrapperProps {
  children: ReactNode
  publishableKey?: string
}

export default function ClerkWrapper({ children, publishableKey }: ClerkWrapperProps) {
  useEffect(() => {
    console.log('ClerkWrapper: publishableKey available:', !!publishableKey)
    console.log('ClerkWrapper: publishableKey length:', publishableKey?.length)
    if (publishableKey) {
      console.log('ClerkWrapper: Key starts with:', publishableKey.substring(0, 20) + '...')
    }
  }, [publishableKey])

  // If no publishable key is provided, render children without Clerk
  if (!publishableKey) {
    console.warn('No Clerk publishable key provided, rendering without authentication')
    return <NoAuthFallback>{children}</NoAuthFallback>
  }

  try {
    console.log('ClerkWrapper: Attempting to render ClerkProvider')
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
