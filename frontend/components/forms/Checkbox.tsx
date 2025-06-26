import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  name,
  label,
  error,
  helperText,
  disabled,
  className = '',
  id,
  ...props
}, ref) => {
  const checkboxId = id || name
  const hasError = !!error
  
  return (
    <div className="relative">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            name={name}
            type="checkbox"
            disabled={disabled}
            className={`
              h-4 w-4 rounded border-border text-accent 
              focus:ring-2 focus:ring-accent focus:ring-offset-0
              disabled:cursor-not-allowed disabled:opacity-50
              ${hasError ? 'border-destructive' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            aria-invalid={hasError}
            aria-describedby={
              hasError 
                ? `${checkboxId}-error` 
                : helperText 
                ? `${checkboxId}-helper` 
                : undefined
            }
            {...props}
          />
        </div>
        
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className={`font-medium ${disabled ? 'text-muted-foreground' : 'text-foreground'} cursor-pointer`}
            >
              {label}
            </label>
          </div>
        )}
      </div>
      
      {(hasError || helperText) && (
        <div className="ml-7 mt-1">
          {hasError && (
            <p
              id={`${checkboxId}-error`}
              className="text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
          )}
          
          {helperText && !hasError && (
            <p
              id={`${checkboxId}-helper`}
              className="text-sm text-muted-foreground"
            >
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'