'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DarkModeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial dark mode state
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className={cn(
        "relative inline-flex h-9 w-16 items-center rounded-full transition-colors",
        "bg-muted hover:bg-muted/80",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        className
      )}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span
        className={cn(
          "inline-block h-7 w-7 transform rounded-full bg-background shadow-sm transition-transform",
          isDark ? "translate-x-8" : "translate-x-1"
        )}
      >
        {isDark ? (
          <Moon className="h-full w-full p-1.5 text-accent" />
        ) : (
          <Sun className="h-full w-full p-1.5 text-accent" />
        )}
      </span>
    </button>
  );
}