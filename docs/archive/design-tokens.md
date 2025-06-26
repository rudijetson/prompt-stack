# Design Tokens & Theme

This guide covers the design system, tokens, and theming approach for the Prompt-Stack application.

## Design Token Overview

Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.

```
┌─────────────────┐
│   Base Tokens   │  Core values (colors, sizes)
└────────┬────────┘
         │
┌────────▼────────┐
│ Semantic Tokens │  Purpose-based tokens
└────────┬────────┘
         │
┌────────▼────────┐
│Component Tokens│  Component-specific values
└─────────────────┘
```

## Color System

### Base Colors

```css
/* styles/tokens/colors.css */
:root {
  /* Primary Palette */
  --color-blue-50: #eff6ff;
  --color-blue-100: #dbeafe;
  --color-blue-200: #bfdbfe;
  --color-blue-300: #93c5fd;
  --color-blue-400: #60a5fa;
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-blue-700: #1d4ed8;
  --color-blue-800: #1e40af;
  --color-blue-900: #1e3a8a;
  --color-blue-950: #172554;
  
  /* Neutral Palette */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-gray-950: #030712;
  
  /* Feedback Colors */
  --color-green-500: #10b981;
  --color-green-600: #059669;
  --color-yellow-500: #eab308;
  --color-yellow-600: #ca8a04;
  --color-red-500: #ef4444;
  --color-red-600: #dc2626;
}
```

### Semantic Colors

```css
/* Light Theme */
:root {
  /* Background */
  --color-bg-primary: var(--color-gray-50);
  --color-bg-secondary: white;
  --color-bg-tertiary: var(--color-gray-100);
  --color-bg-inverse: var(--color-gray-900);
  
  /* Text */
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-600);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-inverse: white;
  
  /* Borders */
  --color-border-primary: var(--color-gray-200);
  --color-border-secondary: var(--color-gray-300);
  --color-border-focus: var(--color-blue-500);
  
  /* Interactive */
  --color-primary: var(--color-blue-600);
  --color-primary-hover: var(--color-blue-700);
  --color-primary-active: var(--color-blue-800);
  
  /* Feedback */
  --color-success: var(--color-green-600);
  --color-warning: var(--color-yellow-600);
  --color-error: var(--color-red-600);
  --color-info: var(--color-blue-600);
}

/* Dark Theme */
[data-theme="dark"] {
  /* Background */
  --color-bg-primary: var(--color-gray-950);
  --color-bg-secondary: var(--color-gray-900);
  --color-bg-tertiary: var(--color-gray-800);
  --color-bg-inverse: white;
  
  /* Text */
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-400);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-inverse: var(--color-gray-900);
  
  /* Borders */
  --color-border-primary: var(--color-gray-800);
  --color-border-secondary: var(--color-gray-700);
  
  /* Interactive */
  --color-primary: var(--color-blue-500);
  --color-primary-hover: var(--color-blue-400);
  --color-primary-active: var(--color-blue-600);
}
```

## Typography System

### Font Families

```css
:root {
  /* Font Stacks */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
    "Helvetica Neue", Arial, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas, 
    "Liberation Mono", Menlo, monospace;
  
  /* Font Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Font Sizes - Type Scale */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
  
  /* Letter Spacing */
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
}
```

### Typography Components

```css
/* Typography Mixins */
.text-heading-1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

.text-heading-2 {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.text-heading-3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}

.text-body {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}

.text-caption {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-regular);
  line-height: var(--line-height-normal);
}

.text-code {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}
```

## Spacing System

### Base Scale

```css
:root {
  /* Spacing Scale (4px base) */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
  
  /* Component Spacing */
  --space-component-padding: var(--space-4);
  --space-component-gap: var(--space-3);
  --space-section-gap: var(--space-8);
}
```

## Layout Tokens

```css
:root {
  /* Container Widths */
  --container-xs: 20rem;     /* 320px */
  --container-sm: 24rem;     /* 384px */
  --container-md: 28rem;     /* 448px */
  --container-lg: 32rem;     /* 512px */
  --container-xl: 36rem;     /* 576px */
  --container-2xl: 42rem;    /* 672px */
  --container-3xl: 48rem;    /* 768px */
  --container-4xl: 56rem;    /* 896px */
  --container-5xl: 64rem;    /* 1024px */
  --container-6xl: 72rem;    /* 1152px */
  --container-7xl: 80rem;    /* 1280px */
  
  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  
  /* Border Radius */
  --radius-none: 0;
  --radius-sm: 0.125rem;    /* 2px */
  --radius-base: 0.25rem;   /* 4px */
  --radius-md: 0.375rem;    /* 6px */
  --radius-lg: 0.5rem;      /* 8px */
  --radius-xl: 0.75rem;     /* 12px */
  --radius-2xl: 1rem;       /* 16px */
  --radius-full: 9999px;
}
```

## Shadow System

```css
:root {
  /* Shadow tokens */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  /* Colored shadows */
  --shadow-primary: 0 4px 14px 0 rgb(59 130 246 / 0.25);
  --shadow-error: 0 4px 14px 0 rgb(239 68 68 / 0.25);
  
  /* Dark mode shadows */
  --shadow-dark: 0 4px 6px -1px rgb(0 0 0 / 0.3);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
  --shadow-base: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-md: 0 10px 15px -3px rgb(0 0 0 / 0.5);
}
```

## Animation Tokens

```css
:root {
  /* Durations */
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
  
  /* Easings */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
  
  /* Transitions */
  --transition-colors: color var(--duration-base) var(--ease-in-out),
    background-color var(--duration-base) var(--ease-in-out),
    border-color var(--duration-base) var(--ease-in-out);
  --transition-shadow: box-shadow var(--duration-base) var(--ease-in-out);
  --transition-transform: transform var(--duration-base) var(--ease-in-out);
  --transition-all: all var(--duration-base) var(--ease-in-out);
}
```

## Component Token Examples

### Button Tokens

```css
:root {
  /* Button Base */
  --button-height-sm: 2rem;      /* 32px */
  --button-height-base: 2.5rem;  /* 40px */
  --button-height-lg: 3rem;      /* 48px */
  
  --button-padding-x-sm: var(--space-3);
  --button-padding-x-base: var(--space-4);
  --button-padding-x-lg: var(--space-6);
  
  --button-font-size-sm: var(--font-size-sm);
  --button-font-size-base: var(--font-size-base);
  --button-font-size-lg: var(--font-size-lg);
  
  --button-radius: var(--radius-md);
  --button-font-weight: var(--font-weight-medium);
  
  /* Button Variants */
  --button-primary-bg: var(--color-primary);
  --button-primary-bg-hover: var(--color-primary-hover);
  --button-primary-text: white;
  
  --button-secondary-bg: var(--color-bg-tertiary);
  --button-secondary-bg-hover: var(--color-gray-200);
  --button-secondary-text: var(--color-text-primary);
  --button-secondary-border: var(--color-border-primary);
}
```

### Form Tokens

```css
:root {
  /* Input */
  --input-height: 2.5rem;  /* 40px */
  --input-padding-x: var(--space-3);
  --input-font-size: var(--font-size-base);
  --input-radius: var(--radius-md);
  
  --input-bg: var(--color-bg-secondary);
  --input-border: var(--color-border-primary);
  --input-border-focus: var(--color-primary);
  --input-text: var(--color-text-primary);
  --input-placeholder: var(--color-text-tertiary);
  
  --input-shadow-focus: 0 0 0 3px rgb(59 130 246 / 0.1);
  
  /* Label */
  --label-font-size: var(--font-size-sm);
  --label-font-weight: var(--font-weight-medium);
  --label-color: var(--color-text-primary);
  --label-margin-bottom: var(--space-2);
}
```

## Theme Implementation

### CSS Variables Approach

```css
/* components/Button.module.css */
.button {
  /* Base styles using tokens */
  height: var(--button-height-base);
  padding: 0 var(--button-padding-x-base);
  font-size: var(--button-font-size-base);
  font-weight: var(--button-font-weight);
  border-radius: var(--button-radius);
  transition: var(--transition-colors);
  
  /* Remove default styles */
  appearance: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
}

/* Variants */
.button--primary {
  background-color: var(--button-primary-bg);
  color: var(--button-primary-text);
}

.button--primary:hover {
  background-color: var(--button-primary-bg-hover);
}

.button--secondary {
  background-color: var(--button-secondary-bg);
  color: var(--button-secondary-text);
  border: 1px solid var(--button-secondary-border);
}

/* Sizes */
.button--sm {
  height: var(--button-height-sm);
  padding: 0 var(--button-padding-x-sm);
  font-size: var(--button-font-size-sm);
}

.button--lg {
  height: var(--button-height-lg);
  padding: 0 var(--button-padding-x-lg);
  font-size: var(--button-font-size-lg);
}
```

### Tailwind Config with Tokens

```javascript
// tailwind.config.js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
        },
        gray: {
          50: "var(--color-gray-50)",
          100: "var(--color-gray-100)",
          // ... etc
        },
        bg: {
          primary: "var(--color-bg-primary)",
          secondary: "var(--color-bg-secondary)",
          tertiary: "var(--color-bg-tertiary)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
        },
      },
      spacing: {
        // Map spacing tokens
        18: "var(--space-18)",
        22: "var(--space-22)",
      },
      fontSize: {
        // Map typography tokens
        "heading-1": ["var(--font-size-4xl)", {
          lineHeight: "var(--line-height-tight)",
          letterSpacing: "var(--letter-spacing-tight)",
          fontWeight: "var(--font-weight-bold)",
        }],
      },
      borderRadius: {
        base: "var(--radius-base)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        base: "var(--shadow-base)",
        primary: "var(--shadow-primary)",
      },
    },
  },
}
```

## Theme Provider

### React Context Implementation

```typescript
// contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  
  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])
  
  useEffect(() => {
    // Apply theme
    const root = document.documentElement
    
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light'
        root.setAttribute('data-theme', newTheme)
        setResolvedTheme(newTheme)
      }
      
      // Initial check
      const systemTheme = mediaQuery.matches ? 'dark' : 'light'
      root.setAttribute('data-theme', systemTheme)
      setResolvedTheme(systemTheme)
      
      // Listen for changes
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      root.setAttribute('data-theme', theme)
      setResolvedTheme(theme)
    }
  }, [theme])
  
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
```

## Theme Toggle Component

```typescript
// components/ThemeToggle.tsx
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const
  
  return (
    <div className="theme-toggle">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`theme-toggle__option ${
            theme === value ? 'theme-toggle__option--active' : ''
          }`}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon size={20} />
        </button>
      ))}
    </div>
  )
}
```

## Custom Themes

### Creating Theme Variations

```css
/* Brand theme example */
[data-theme="brand"] {
  /* Override primary colors */
  --color-primary: #8b5cf6;  /* Purple */
  --color-primary-hover: #7c3aed;
  --color-primary-active: #6d28d9;
  
  /* Custom accent colors */
  --color-accent: #ec4899;  /* Pink */
  --color-accent-hover: #db2777;
  
  /* Adjusted neutrals */
  --color-bg-primary: #faf5ff;  /* Light purple tint */
}

/* High contrast theme */
[data-theme="high-contrast"] {
  /* Stronger contrasts */
  --color-text-primary: #000000;
  --color-bg-primary: #ffffff;
  --color-border-primary: #000000;
  
  /* Bolder weights */
  --font-weight-regular: 500;
  --font-weight-medium: 600;
  --font-weight-semibold: 700;
  --font-weight-bold: 800;
}
```

## Best Practices

### 1. Token Naming
- Use consistent naming patterns
- Group related tokens
- Avoid abbreviations
- Use semantic names for purpose

### 2. Token Organization
```css
/* Good: Organized by category and purpose */
:root {
  /* Colors: Base */
  --color-blue-500: #3b82f6;
  
  /* Colors: Semantic */
  --color-primary: var(--color-blue-500);
  
  /* Component: Button */
  --button-bg-primary: var(--color-primary);
}
```

### 3. Theme Testing
- Test all themes thoroughly
- Check contrast ratios
- Verify all components
- Test theme transitions

### 4. Performance
- Use CSS variables for dynamic values
- Minimize token inheritance depth
- Consider using PostCSS for optimization
- Lazy load theme variations

### 5. Documentation
- Document all tokens
- Provide usage examples
- Show theme variations
- Include migration guides