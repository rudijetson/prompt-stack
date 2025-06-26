# Immediate CSS Tasks - Quick Wins

## 🚀 Priority 1: Fix Breaking Issues (Do Now)

### 1. Add Missing Tailwind Mappings
```javascript
// Add to tailwind.config.js under colors:
destructive: {
  DEFAULT: 'hsl(var(--destructive))',
  foreground: 'hsl(var(--destructive-foreground))'
},
primary: {
  DEFAULT: 'hsl(var(--primary))',
  foreground: 'hsl(var(--primary-foreground))'
},
secondary: {
  DEFAULT: 'hsl(var(--secondary))',
  foreground: 'hsl(var(--secondary-foreground))'
},
```

### 2. Install Required Utilities
```bash
npm install clsx tailwind-merge class-variance-authority
```

### 3. Create cn() utility
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## 🔧 Priority 2: Component Quick Fixes

### Button.tsx - Complete Fix
```tsx
// Current broken state uses non-existent Tailwind classes
// Quick fix - update the component to use proper Tailwind classes:

const variantClasses = {
  primary: 'bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent',
  secondary: 'bg-muted text-foreground border border-border hover:bg-muted/80',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost: 'text-foreground hover:bg-muted focus:ring-accent'
}
```

### Navigation.tsx - Critical Fixes
```tsx
// Replace all instances:
'text-gray-600' → 'text-muted-foreground'
'text-gray-900' → 'text-foreground'
'bg-gray-100' → 'bg-muted'
'hover:bg-gray-50' → 'hover:bg-muted/50'
'border-gray-200' → 'border-border'
```

### Select.tsx - Quick Fix
```tsx
// Replace hardcoded colors:
'border-red-300' → 'border-destructive'
'text-red-500' → 'text-destructive'
'bg-gray-50' → 'bg-muted'
'text-gray-700' → 'text-foreground'
'text-gray-500' → 'text-muted-foreground'
```

## 📋 Priority 3: Add Missing Primary/Secondary Colors

### Update globals.css
```css
/* Add after accent colors */
:root {
  /* Primary - can be same as accent or different */
  --primary: var(--accent);
  --primary-foreground: var(--accent-foreground);
  
  /* Secondary - muted variant */
  --secondary: var(--muted);
  --secondary-foreground: var(--muted-foreground);
}
```

## ✅ Quick Test Checklist

1. [ ] Button component renders without errors
2. [ ] Navigation shows proper colors
3. [ ] Dark mode toggle works
4. [ ] Form inputs have proper focus states
5. [ ] No console errors about missing classes

## 🎯 Next Phase Tasks

### Phase 1: Foundation (1-2 days)
- [ ] Update all form components
- [ ] Create component variants using CVA
- [ ] Add animation utilities
- [ ] Document patterns

### Phase 2: Enhanced Components (3-4 days)
- [ ] Create Alert component
- [ ] Create Badge component
- [ ] Create Modal/Dialog
- [ ] Create Toast notifications

### Phase 3: Polish (2-3 days)
- [ ] Add loading states
- [ ] Add skeleton screens
- [ ] Add transitions
- [ ] Accessibility audit

## 🚨 Common Pitfalls to Avoid

1. **Don't use arbitrary values** - Use design tokens
   ```tsx
   // ❌ Bad
   className="p-[17px]"
   
   // ✅ Good
   className="p-4"
   ```

2. **Don't mix systems** - Stick to Tailwind utilities
   ```tsx
   // ❌ Bad
   style={{ padding: 'var(--space-4)' }}
   
   // ✅ Good
   className="p-4"
   ```

3. **Don't forget dark mode** - Always use semantic colors
   ```tsx
   // ❌ Bad
   className="bg-white text-black"
   
   // ✅ Good
   className="bg-background text-foreground"
   ```

## 🎨 Quick Reference

### Color Mappings
- Background: `bg-background`
- Text: `text-foreground`
- Borders: `border-border`
- Muted backgrounds: `bg-muted`
- Muted text: `text-muted-foreground`
- Cards: `bg-card`
- Accents: `bg-accent text-accent-foreground`
- Errors: `text-destructive` or `bg-destructive`

### Common Patterns
```tsx
// Card
className="rounded-lg border bg-card p-6 shadow-sm"

// Button
className="rounded-md bg-accent px-4 py-2 text-accent-foreground hover:bg-accent/90"

// Input
className="rounded-md border border-input bg-background px-3 py-2"

// Error text
className="text-sm text-destructive"
```

## Start Here! 

1. First, fix the Tailwind config (add missing color mappings)
2. Then fix Button.tsx (it's the most reused component)
3. Then Navigation.tsx (it's always visible)
4. Test dark mode after each fix

This approach will get the app working properly in ~1 hour, then you can tackle the comprehensive refactor.