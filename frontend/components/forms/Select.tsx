import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  name: string
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  name,
  label,
  error,
  helperText,
  options,
  placeholder = 'Select an option',
  fullWidth = true,
  required,
  disabled,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || name
  const hasError = !!error
  
  const baseClasses = 'block w-full rounded-md border px-3 py-2 pr-10 text-sm appearance-none bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0'
  
  const stateClasses = hasError
    ? 'border-destructive focus:border-destructive focus:ring-destructive'
    : 'border-input focus:border-accent focus:ring-accent'
  
  const disabledClasses = disabled
    ? 'bg-muted text-muted-foreground cursor-not-allowed'
    : 'bg-background cursor-pointer'
  
  const containerClasses = fullWidth ? 'w-full' : 'inline-block'
  
  return (
    <div className={containerClasses}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-foreground mb-1"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          required={required}
          className={cn(
            baseClasses,
            stateClasses,
            disabledClasses,
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError 
              ? `${selectId}-error` 
              : helperText 
              ? `${selectId}-helper` 
              : undefined
          }
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-0 top-0 h-full flex items-center pr-2 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
      
      {hasError && (
        <p
          id={`${selectId}-error`}
          className="mt-1 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
      
      {helperText && !hasError && (
        <p
          id={`${selectId}-helper`}
          className="mt-1 text-sm text-muted-foreground"
        >
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'