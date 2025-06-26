# CSS Alert & Notification Patterns

## ✅ Correct Patterns

### Light Background Alerts (Semi-transparent)
Use the base color for text when background has opacity:

```tsx
// ✅ Warning Alert
<div className="bg-warning/10 text-warning">
  <AlertCircle className="w-5 h-5" />
  <span>Warning message</span>
</div>

// ✅ Success Alert
<div className="bg-success/10 text-success">
  <CheckCircle className="w-5 h-5" />
  <span>Success message</span>
</div>

// ✅ Error Alert
<div className="bg-destructive/10 text-destructive">
  <XCircle className="w-5 h-5" />
  <span>Error message</span>
</div>

// ✅ Info Alert
<div className="bg-info/10 text-info">
  <Info className="w-5 h-5" />
  <span>Info message</span>
</div>
```

### Solid Background Alerts
Use the -foreground color for text on solid backgrounds:

```tsx
// ✅ Solid Warning
<div className="bg-warning text-warning-foreground">
  <span>Warning message</span>
</div>

// ✅ Solid Success
<div className="bg-success text-success-foreground">
  <span>Success message</span>
</div>
```

## ❌ Incorrect Patterns

```tsx
// ❌ Wrong - Poor contrast
<div className="bg-warning/10 text-warning-foreground">
  <span>Hard to read</span>
</div>

// ❌ Wrong - Text same as background
<div className="bg-warning/10 text-warning/10">
  <span>Invisible</span>
</div>

// ❌ Wrong - Using foreground on light bg
<div className="bg-success/10 text-foreground">
  <span>Not semantic</span>
</div>
```

## 🎨 Color Contrast Rules

1. **Light backgrounds** (*/10 opacity):
   - Use the base semantic color for text
   - Icons inherit the text color
   - Provides proper contrast in both light/dark modes

2. **Solid backgrounds**:
   - Use the -foreground variant
   - Ensures readable text on colored backgrounds

3. **Border variations**:
   ```tsx
   // Light alert with border
   <div className="bg-warning/10 border border-warning/20 text-warning">
   ```

## 🌓 Dark Mode Behavior

These patterns work automatically in dark mode:
- The base colors (warning, success, etc.) adjust for dark backgrounds
- The opacity values create appropriate contrast
- No additional dark mode classes needed

## 📋 Quick Reference

| Background | Text Color | Use Case |
|------------|------------|----------|
| `bg-warning/10` | `text-warning` | Light warning alerts |
| `bg-success/10` | `text-success` | Light success messages |
| `bg-destructive/10` | `text-destructive` | Light error alerts |
| `bg-info/10` | `text-info` | Light info boxes |
| `bg-warning` | `text-warning-foreground` | Solid warning buttons |
| `bg-success` | `text-success-foreground` | Solid success buttons |

## ✨ Examples in Context

### Login Page Demo Mode Alert
```tsx
<div className="rounded-md bg-warning/10 p-4">
  <div className="flex">
    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
    <div className="ml-3">
      <h3 className="text-sm font-medium text-warning">
        Demo Mode
      </h3>
      <p className="mt-2 text-sm text-warning/80">
        Supabase is not configured...
      </p>
    </div>
  </div>
</div>
```

### Homepage Status Badge
```tsx
{readyCount === 0 ? (
  <div className="bg-warning/10 text-warning rounded-lg px-4 py-2">
    <AlertCircle className="w-5 h-5 mr-2" />
    <span>Demo Mode - All features work with mock data</span>
  </div>
) : (
  <div className="bg-success/10 text-success rounded-lg px-4 py-2">
    <CheckCircle className="w-5 h-5 mr-2" />
    <span>{readyCount} services configured</span>
  </div>
)}
```