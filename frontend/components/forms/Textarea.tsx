import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  showCharCount?: boolean
  maxLength?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  name,
  label,
  error,
  helperText,
  fullWidth = true,
  resize = 'vertical',
  showCharCount = false,
  maxLength,
  required,
  disabled,
  className = '',
  id,
  value,
  ...props
}, ref) => {
  const textareaId = id || name
  const hasError = !!error
  const charCount = String(value || '').length
  
  const baseClasses = 'block w-full rounded-md border px-3 py-2 text-sm placeholder-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  const stateClasses = hasError
    ? 'border-destructive focus:border-destructive focus:ring-destructive'
    : 'border-input focus:border-accent focus:ring-accent'
  
  const disabledClasses = disabled
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : 'bg-background text-foreground'
  
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }
  
  const containerClasses = fullWidth ? 'w-full' : 'inline-block'
  
  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        value={value}
        className={cn(
          baseClasses,
          stateClasses,
          disabledClasses,
          resizeClasses[resize],
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          hasError 
            ? `${textareaId}-error` 
            : helperText 
            ? `${textareaId}-helper` 
            : undefined
        }
        {...props}
      />
      
      {(showCharCount || hasError || helperText) && (
        <div className="mt-1 flex justify-between items-start">
          <div className="flex-1">
            {hasError && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-destructive"
                role="alert"
              >
                {error}
              </p>
            )}
            
            {helperText && !hasError && (
              <p
                id={`${textareaId}-helper`}
                className="text-sm text-muted-foreground"
              >
                {helperText}
              </p>
            )}
          </div>
          
          {showCharCount && (
            <span className="text-sm text-muted-foreground ml-2">
              {charCount}
              {maxLength && ` / ${maxLength}`}
            </span>
          )}
        </div>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'