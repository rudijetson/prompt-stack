'use client'

import { useEffect } from 'react'
import { useTheme } from '@/lib/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, isDarkMode } = useTheme()

  useEffect(() => {
    // This is handled in the hook, but we keep the provider
    // for potential future context needs
  }, [theme, isDarkMode])

  return <>{children}</>
}