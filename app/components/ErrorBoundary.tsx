'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="text-center p-8 max-w-4xl">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            
            {/* Show the actual error details */}
            {this.state.error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
                <p className="text-red-700 font-mono text-sm mb-2">{this.state.error.message}</p>
                {this.state.error.stack && (
                  <details className="text-red-600 text-xs">
                    <summary className="cursor-pointer">Stack Trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            {this.state.errorInfo && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-4 text-left">
                <h3 className="font-semibold text-yellow-800 mb-2">Component Stack:</h3>
                <pre className="text-yellow-700 text-xs whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
