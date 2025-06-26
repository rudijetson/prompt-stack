/**
 * SPINNER COMPONENT
 * 
 * A loading spinner that can be used anywhere in the app
 * Shows a rotating circle to indicate loading/processing
 * 
 * USAGE EXAMPLES:
 * <Spinner />                          // Default medium size
 * <Spinner size="large" />             // Large spinner
 * <Spinner className="text-blue-600" /> // Custom color
 * 
 * COMMON USE CASES:
 * - Inside buttons during form submission
 * - Loading states for data fetching
 * - Processing indicators
 * - Page transitions
 * 
 * COMMON AI PROMPTS:
 * - "Add a loading spinner to the page"
 * - "Show spinner while data is loading"
 * - "Create a full-screen loading overlay with spinner"
 * - "Add loading text next to spinner"
 */

interface SpinnerProps {
  // Size of the spinner
  size?: 'small' | 'medium' | 'large'
  
  // Additional CSS classes
  className?: string
  
  // Accessible label for screen readers
  label?: string
}

export function Spinner({ 
  size = 'medium', 
  className = '',
  label = 'Loading'
}: SpinnerProps) {
  // Size classes for the spinner
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  }
  
  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-block ${className}`}
    >
      <svg
        className={`animate-spin ${sizeClasses[size]}`}
        fill="none"
        viewBox="0 0 24 24"
      >
        {/* Background circle (lighter) */}
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        {/* Spinning partial circle (darker) */}
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {/* Hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </div>
  )
}

/**
 * FULL PAGE SPINNER
 * 
 * Shows a centered spinner that covers the entire viewport
 * Useful for initial page loads or major transitions
 * 
 * USAGE:
 * <FullPageSpinner />
 * <FullPageSpinner message="Loading your data..." />
 */
export function FullPageSpinner({ 
  message = 'Loading...' 
}: { 
  message?: string 
}) {
  return (
    <div className="fixed inset-0 bg-background/90 flex items-center justify-center z-50">
      <div className="text-center">
        <Spinner size="large" className="mx-auto text-accent" />
        {message && (
          <p className="mt-4 text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  )
}

/**
 * INLINE SPINNER
 * 
 * A spinner with text beside it for inline loading states
 * 
 * USAGE:
 * <InlineSpinner>Saving changes</InlineSpinner>
 * <InlineSpinner size="small">Processing</InlineSpinner>
 */
export function InlineSpinner({ 
  children,
  size = 'medium' 
}: { 
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <Spinner size={size} />
      <span>{children}</span>
    </div>
  )
}