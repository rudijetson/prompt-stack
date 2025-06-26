/**
 * INPUT COMPONENT
 * 
 * A text input field with built-in error handling and labels
 * One of the core form building blocks
 * 
 * USAGE EXAMPLES:
 * <Input name="email" label="Email" type="email" />
 * <Input name="password" label="Password" type="password" required />
 * <Input name="username" error="Username already taken" />
 * <Input name="search" placeholder="Search..." icon={<SearchIcon />} />
 * 
 * FORM EXAMPLE:
 * const [email, setEmail] = useState('')
 * <Input 
 *   name="email"
 *   label="Email Address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={emailError}
 * />
 * 
 * COMMON AI PROMPTS:
 * - "Add a phone number input with formatting"
 * - "Create an input with a search icon"
 * - "Add character count to input"
 * - "Make input with floating label"
 * - "Add password visibility toggle"
 */

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Input name (also used as id if not provided)
  name: string
  
  // Label shown above the input
  label?: string
  
  // Error message shown below the input
  error?: string
  
  // Helper text shown below the input (when no error)
  helperText?: string
  
  // Icon to show inside the input (left side)
  icon?: ReactNode
  
  // Icon to show inside the input (right side)
  rightIcon?: ReactNode
  
  // Makes the input take full width
  fullWidth?: boolean
}

// Using forwardRef to allow parent components to access the input element
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  name,
  label,
  error,
  helperText,
  icon,
  rightIcon,
  fullWidth = true,
  required,
  disabled,
  className = '',
  id,
  ...props
}, ref) => {
  // Use provided id or fallback to name
  const inputId = id || name
  
  // Determine if input has an error
  const hasError = !!error
  
  // Base classes for the input
  const baseClasses = 'block w-full rounded-md border px-3 py-2 text-sm placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  // State-based classes
  const stateClasses = hasError
    ? 'border-destructive focus:border-destructive focus:ring-destructive'
    : 'border-border focus:border-accent focus:ring-accent'
  
  // Disabled classes
  const disabledClasses = disabled
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : 'bg-background text-foreground'
  
  // Padding adjustments for icons
  const paddingClasses = `
    ${icon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
  `.trim()
  
  // Container width
  const containerClasses = fullWidth ? 'w-full' : 'inline-block'
  
  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      {/* Input container (for positioning icons) */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <div className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none">
            <div className="text-muted-foreground w-5 h-5">
              {icon}
            </div>
          </div>
        )}
        
        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          disabled={disabled}
          required={required}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${disabledClasses}
            ${paddingClasses}
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          aria-invalid={hasError}
          aria-describedby={
            hasError 
              ? `${inputId}-error` 
              : helperText 
              ? `${inputId}-helper` 
              : undefined
          }
          {...props}
        />
        
        {/* Right icon */}
        {rightIcon && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            <div className="text-muted-foreground w-5 h-5">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {/* Error message */}
      {hasError && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !hasError && (
        <p
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

// Add display name for debugging
Input.displayName = 'Input'