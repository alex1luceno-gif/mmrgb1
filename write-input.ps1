$content = @"
import React from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className='w-full'>
        {label && (
          <label htmlFor={inputId} className='block text-sm font-medium text-mmrgb-textMuted mb-2'>{label}</label>
        )}
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-4 top-1/2 -translate-y-1/2 text-mmrgb-textDim pointer-events-none'>{leftIcon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-mmrgb-surfaceElevated border rounded-xl px-4 py-3 text-mmrgb-text text-base placeholder-mmrgb-textDim transition-all duration-200 focus:outline-none focus:ring-2',
              leftIcon ? 'pl-12' : '',
              rightIcon ? 'pr-12' : '',
              error ? 'border-mmrgb-danger focus:ring-mmrgb-danger/30' : 'border-mmrgb-border focus:ring-mmrgb-primary/30',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? "`${inputId}-error`" : helperText ? "`${inputId}-helper`" : undefined}
            {...props}
          />
          {rightIcon && (
            <div className='absolute right-4 top-1/2 -translate-y-1/2 text-mmrgb-textDim pointer-events-none'>{rightIcon}</div>
          )}
        </div>
        {error && (
          <p id="`${inputId}-error`" className='mt-1.5 text-sm text-mmrgb-danger' role='alert'>{error}</p>
        )}
        {helperText && !error && (
          <p id="`${inputId}-helper`" className='mt-1.5 text-sm text-mmrgb-textDim'>{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\components\Input.tsx', $content)
Write-Host 'Input.tsx written'
