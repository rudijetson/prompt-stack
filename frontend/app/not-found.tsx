/**
 * 404 NOT FOUND PAGE
 * 
 * Shown when a page doesn't exist.
 * Provides helpful navigation options.
 * 
 * TRIGGERED BY:
 * - Invalid URLs
 * - Deleted pages
 * - Typos in navigation
 * 
 * COMMON AI PROMPTS:
 * - "Add search functionality to 404 page"
 * - "Add recent pages list"
 * - "Add funny 404 animation"
 * - "Add contact support link"
 */

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        {/* Big 404 */}
        <h1 className="text-9xl font-bold text-muted">404</h1>
        
        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mt-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        
        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="inline-flex items-center px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors">
            Go Home
          </Link>
          <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-border text-foreground bg-card rounded-md hover:bg-muted transition-colors">
            Dashboard
          </Link>
        </div>
        
        {/* Helpful links */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Here are some helpful links:</p>
          <div className="mt-2 flex flex-wrap gap-4 justify-center">
            <Link href="/docs" className="text-accent hover:text-accent/80 transition-colors">
              Documentation
            </Link>
            <Link href="/support" className="text-accent hover:text-accent/80 transition-colors">
              Support
            </Link>
            <Link href="/contact" className="text-accent hover:text-accent/80 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}