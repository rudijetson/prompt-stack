/**
 * ERROR BOUNDARY PAGE
 * 
 * Catches and displays errors gracefully.
 * Prevents white screen of death.
 * 
 * TRIGGERED BY:
 * - JavaScript errors
 * - Unhandled promise rejections
 * - Component crashes
 * 
 * FEATURES:
 * - Shows error in development
 * - User-friendly message in production
 * - Reset functionality
 * - Error reporting (optional)
 * 
 * COMMON AI PROMPTS:
 * - "Add error reporting to Sentry"
 * - "Add error details toggle"
 * - "Add automatic retry logic"
 * - "Style error page to match brand"
 */

'use client'

import { useEffect } from 'react'

const getIsDevelopment = () => process.env.NODE_ENV === 'development'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (getIsDevelopment()) {
      console.error('Error boundary caught:', error)
    }
    
    // TODO: Log to error reporting service
    // Example: Sentry.captureException(error)
  }, [error])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4 max-w-md">
        {/* Error icon */}
        <div className="text-6xl mb-4">⚠️</div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Oops! Something went wrong
        </h1>
        
        {/* Message */}
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Don't worry, it's not your fault!
        </p>
        
        {/* Show error details in development */}
        {getIsDevelopment() && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Error details (development only)
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto text-foreground">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
          <a href="/" className="inline-flex items-center px-4 py-2 border border-border text-foreground bg-card rounded-md hover:bg-muted transition-colors">
            Go Home
          </a>
        </div>
        
        {/* Support message */}
        <p className="mt-6 text-sm text-muted-foreground">
          If this keeps happening, please{' '}
          <a href="/contact" className="text-accent hover:text-accent/80 transition-colors">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}