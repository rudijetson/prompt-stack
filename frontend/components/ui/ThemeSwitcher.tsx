'use client'

import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react'
import { useTheme, ThemeColor } from '@/lib/hooks/useTheme'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const themeColors: { value: ThemeColor; label: string; class: string }[] = [
  { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
]

export function ThemeSwitcher() {
  const { theme, toggleTheme, setThemeColor } = useTheme()
  const [showColorPicker, setShowColorPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false)
      }
    }

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showColorPicker])

  const getModeIcon = () => {
    switch (theme.mode) {
      case 'light':
        return <Sun className="w-5 h-5" />
      case 'dark':
        return <Moon className="w-5 h-5" />
      case 'system':
        return <Monitor className="w-5 h-5" />
    }
  }

  const getModeLabel = () => {
    switch (theme.mode) {
      case 'light':
        return 'Light mode'
      case 'dark':
        return 'Dark mode'
      case 'system':
        return 'System theme'
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Theme Mode Toggle */}
      <button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label={getModeLabel()}
        title={getModeLabel()}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={theme.mode}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            {getModeIcon()}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Color Theme Picker */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Choose accent color"
          title="Choose accent color"
        >
          <Palette className="w-5 h-5 text-muted-foreground" />
          <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full bg-accent`} />
        </button>

        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 p-2 bg-card border border-border rounded-lg shadow-lg"
            >
              <div className="grid grid-cols-5 gap-2">
                {themeColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => {
                      setThemeColor(color.value)
                      setShowColorPicker(false)
                    }}
                    className={`relative w-8 h-8 rounded-lg ${color.class} hover:scale-110 transition-transform`}
                    title={color.label}
                  >
                    {theme.color === color.value && (
                      <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}