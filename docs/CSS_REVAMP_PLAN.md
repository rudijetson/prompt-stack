# CSS System Revamp Plan

## Current State Analysis

### What We Have:
- ✅ Tailwind CSS installed and configured
- ✅ Comprehensive CSS variables in globals.css
- ✅ Dark mode infrastructure
- ✅ Theme system (orange, blue, purple, green, rose)
- ❌ Components using hardcoded Tailwind classes
- ❌ No connection between CSS variables and Tailwind
- ❌ Inconsistent usage patterns

## The Problem

We're using Tailwind CSS but not leveraging its power properly. Components use hardcoded colors like `bg-purple-600` instead of semantic values, making theming impossible.

## The Solution: Tailwind + CSS Variables

### 1. Extend Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind utilities
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
      fontSize: {
        xs: 'var(--text-xs)',
        sm: 'var(--text-sm)',
        base: 'var(--text-base)',
        lg: 'var(--text-lg)',
        xl: 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
  plugins: [],
}
```

### 2. Component Patterns

#### Button Component (Proper Pattern)
```tsx
// ✅ GOOD - Semantic Tailwind Classes
export const Button = ({ variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: 'bg-accent text-accent-foreground hover:bg-accent/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  }
  
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 py-2',
    lg: 'h-11 px-8 text-lg',
  }
  
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium ring-offset-background',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none',
        'disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
```

## Task Breakdown

### Phase 1: Foundation (Week 1)
1. **Update tailwind.config.js**
   - Map all CSS variables to Tailwind utilities
   - Configure spacing, typography, shadows
   - Add custom utilities for common patterns

2. **Create cn() utility**
   ```typescript
   // lib/utils.ts
   import { clsx, type ClassValue } from 'clsx'
   import { twMerge } from 'tailwind-merge'
   
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```

3. **Update globals.css**
   - Ensure all variables use HSL format
   - Add missing semantic tokens
   - Create utility classes for common patterns

### Phase 2: Component Migration (Week 1-2)

#### High Priority Components:
1. **Button.tsx**
   - Remove hardcoded colors
   - Use semantic Tailwind classes
   - Add all variants (primary, secondary, destructive, outline, ghost, link)

2. **Input.tsx**
   - Already good! Minor tweaks for consistency

3. **Select.tsx**
   - Replace all `gray-*` with semantic values
   - Fix error states
   - Add proper focus styles

4. **Card.tsx**
   - Expand with more variants
   - Add hover states
   - Support clickable cards

#### Navigation Components:
1. **navigation.tsx**
   - Complete conversion to semantic classes
   - Add mobile menu animations
   - Fix hover/active states

2. **status-indicator.tsx**
   - Use semantic colors for states

### Phase 3: Advanced Components (Week 2)

1. **Create Missing Components:**
   - Badge
   - Alert
   - Dialog/Modal
   - Dropdown
   - Tabs
   - Toast

2. **Form Components:**
   - Radio
   - Switch/Toggle
   - Slider
   - DatePicker

### Phase 4: Documentation & Testing (Week 3)

1. **Component Library Docs**
   - Usage examples for each component
   - Props documentation
   - Theme customization guide

2. **Storybook Setup** (Optional)
   - Visual testing
   - Component playground
   - Theme switcher

3. **Testing**
   - Visual regression tests
   - Accessibility tests
   - Cross-browser testing

## Implementation Guide

### Step 1: Update a Component
```tsx
// Before
<button className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-md">

// After
<button className="bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-md">
```

### Step 2: Use the cn() utility
```tsx
<button
  className={cn(
    "bg-accent text-accent-foreground hover:bg-accent/90",
    "px-4 py-2 rounded-md transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    className
  )}
>
```

### Step 3: Create Variants
```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Benefits

1. **True Theme Support**: Change colors instantly
2. **Dark Mode**: Automatic with proper semantic classes
3. **Consistency**: Enforced through Tailwind utilities
4. **Developer Experience**: IntelliSense for all tokens
5. **Performance**: PurgeCSS removes unused styles
6. **Maintainability**: Single source of truth

## Success Metrics

- [ ] All components use semantic Tailwind classes
- [ ] Zero hardcoded color values
- [ ] Dark mode works perfectly
- [ ] Theme switching is instant
- [ ] Components are fully accessible
- [ ] Documentation is comprehensive
- [ ] TypeScript support for all props

## Tools Needed

1. **tailwind-merge**: Merge Tailwind classes correctly
2. **clsx**: Conditional classes
3. **class-variance-authority**: Variant management
4. **@tailwindcss/forms**: Better form styles
5. **tailwindcss-animate**: Animation utilities

## Next Steps

1. Install required packages
2. Update tailwind.config.js
3. Start with Button component as reference
4. Migrate one component at a time
5. Test thoroughly
6. Document patterns

This revamp will create a robust, themeable component library that leverages the full power of Tailwind CSS while maintaining flexibility through CSS variables.