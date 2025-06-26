/**
 * DEMO MODE BANNER COMPONENT
 * 
 * Shows a banner when the application is running in demo mode.
 * Helps users understand they're using mock data and features.
 * 
 * USAGE:
 * <DemoModeBanner />  // Place in root layout
 * 
 * FEATURES:
 * - Auto-detects demo mode from environment
 * - Dismissible (remembers choice)
 * - Shows helpful setup link
 * - Sticky positioning
 * 
 * COMMON AI PROMPTS:
 * - "Change demo banner color to match brand"
 * - "Add animation to demo banner"
 * - "Make banner show only on first visit"
 * - "Add countdown to banner"
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useCapabilities } from '@/lib/hooks/useCapabilities'

export function DemoModeBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()
  const { isDemoMode, mode, isLoading } = useCapabilities()
  
  useEffect(() => {
    if (!isLoading) {
      // Check if user has dismissed banner before
      const dismissed = localStorage.getItem('demo-banner-dismissed')
      setIsVisible(isDemoMode && !dismissed)
    }
  }, [isDemoMode, isLoading])
  
  const handleDismiss = () => {
    setIsVisible(false)
    // Remember that user dismissed banner
    localStorage.setItem('demo-banner-dismissed', 'true')
  }
  
  const handleReset = () => {
    // Reset dismissal so banner shows again
    localStorage.removeItem('demo-banner-dismissed')
    setIsVisible(isDemoMode)
  }
  
  // Hide banner on demo page
  if (pathname === '/demo') {
    return null
  }
  
  if (!isVisible) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <Sparkles className="w-5 h-5 animate-pulse" />
            
            {/* Message */}
            <div className="text-sm font-medium">
              <span className="hidden sm:inline">
                🎭 {mode === 'demo' ? 'Demo Mode Active' : `Mixed Mode Active (${mode})`} - You're using {isDemoMode ? 'mock data and simulated features' : 'some real services'}.
              </span>
              <span className="sm:hidden">
                🎭 {mode === 'demo' ? 'Demo Mode' : 'Mixed Mode'} Active
              </span>
              
              {/* Setup link */}
              <a 
                href="/dev-guide" 
                className="ml-2 underline hover:no-underline"
              >
                Configure services →
              </a>
            </div>
          </div>
          
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss demo mode banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * DEMO MODE INDICATOR
 * 
 * Small indicator that shows when in demo mode.
 * Use this in headers or footers as a subtle reminder.
 * 
 * USAGE:
 * <DemoModeIndicator />
 */
export function DemoModeIndicator() {
  const { isDemoMode, mode, isLoading } = useCapabilities()
  
  if (isLoading || !isDemoMode) return null
  
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-medium">
      <Sparkles className="w-3 h-3" />
      <span>{mode === 'demo' ? 'Demo Mode' : 'Mixed Mode'}</span>
    </div>
  )
}

/**
 * DEMO DATA BADGE
 * 
 * Badge to mark data as demo/fake data.
 * Helps users understand what's real vs demo.
 * 
 * USAGE:
 * <DemoDataBadge />  // On cards, lists, etc.
 */
export function DemoDataBadge() {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
      Demo Data
    </span>
  )
}