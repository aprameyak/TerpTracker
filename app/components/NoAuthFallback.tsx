'use client'

import { ReactNode } from 'react'

interface NoAuthFallbackProps {
  children: ReactNode
}

export default function NoAuthFallback({ children }: NoAuthFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-600 mb-2">TerpTracker</h1>
          <p className="text-gray-600 mb-4">UMD Schedule Analyzer</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-yellow-800 text-sm">
              ⚠️ Authentication is currently unavailable. Some features may be limited.
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
