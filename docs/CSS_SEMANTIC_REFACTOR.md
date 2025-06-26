# CSS Semantic Refactoring Guide

## Overview
The frontend components were using hardcoded colors instead of semantic CSS variables, making theming and dark mode support difficult. This document tracks the refactoring progress.

## CSS Variable System

### Core Variables (in globals.css)
- **Colors**: background, foreground, card, muted, border, input
- **Semantic**: success, error, warning, info, destructive
- **Theme**: accent (changes based on selected theme)
- **Spacing**: --space-1 through --space-16
- **Radius**: --radius-sm through --radius-full
- **Typography**: --text-xs through --text-4xl
- **Shadows**: --shadow-sm through --shadow-xl

## Components Updated ✅

### 1. Button.tsx
**Before**: `bg-purple-600`, `text-white`, `hover:bg-purple-700`
**After**: `bg-accent`, `text-accent-foreground`, `hover:bg-accent/90`
- All variants now use semantic colors
- Supports theme switching and dark mode

### 2. Card.tsx
**Before**: `bg-white`, `text-gray-500`
**After**: `bg-card`, `text-muted-foreground`
- Now respects dark mode

### 3. Navigation.tsx (Partial)
**Before**: `bg-white border-gray-200`
**After**: `bg-background border-border`
- Started conversion, more work needed

## Components Still Needing Updates ❌

### High Priority
1. **Select.tsx** - Uses `border-red-300`, `bg-gray-50`, `text-gray-700`
2. **Textarea.tsx** - Similar hardcoded colors
3. **Navigation.tsx** - Many more hardcoded colors throughout
4. **Spinner.tsx** - Uses `bg-white`, `text-blue-600`

### Medium Priority
1. **Checkbox.tsx** - Check for hardcoded colors
2. **FormGroup.tsx** - Check for hardcoded colors
3. **Admin page** - Uses some non-standard classes

## How to Update Components

### 1. Replace Color Values
```tsx
// ❌ Bad - Hardcoded
className="bg-white text-gray-700 border-gray-300"

// ✅ Good - Semantic
className="bg-background text-foreground border-border"
```

### 2. Use Opacity Modifiers
```tsx
// For hover states
className="hover:bg-accent/90"  // 90% opacity

// For disabled states
className="disabled:opacity-50"
```

### 3. Common Replacements
- `bg-white` → `bg-background` or `bg-card`
- `text-gray-*` → `text-foreground` or `text-muted-foreground`
- `border-gray-*` → `border-border`
- `bg-gray-50` → `bg-muted`
- `text-red-*` → `text-destructive`
- `bg-red-*` → `bg-destructive`
- `text-blue-*` → `text-accent` or `text-info`
- `bg-purple-*` → `bg-accent`

### 4. Use Design Tokens
```tsx
// Spacing
className="p-[var(--space-4)]"  // Instead of p-4

// Border radius
className="rounded-[var(--radius-md)]"  // Instead of rounded-md

// Shadows
className="shadow-[var(--shadow-md)]"  // Instead of shadow-md
```

## Benefits of Semantic CSS

1. **Theme Switching**: Users can change accent color instantly
2. **Dark Mode**: Automatic dark mode support
3. **Consistency**: Single source of truth for design tokens
4. **Maintainability**: Change colors in one place
5. **Accessibility**: Better contrast control
6. **Branding**: Easy to apply custom brand colors

## Next Steps

1. Complete refactoring of remaining components
2. Add TypeScript types for design tokens
3. Create Storybook stories showing theme variations
4. Add CSS-in-JS solution for dynamic styling
5. Document theme customization for users

## Testing Checklist

- [ ] Test all components in light mode
- [ ] Test all components in dark mode
- [ ] Test theme switching (orange, blue, purple, green, rose)
- [ ] Verify hover/focus/active states
- [ ] Check disabled states
- [ ] Test responsive breakpoints
- [ ] Verify print styles