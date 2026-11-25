import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', loading = false, fullWidth = false, className, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-mmrgb-bg disabled:opacity-50 disabled:cursor-not-allowed'
    const variants = {
      primary: 'bg-gradient-to-r from-mmrgb-primary to-mmrgb-primaryDim text-mmrgb-bg hover:from-mmrgb-primaryDim hover:to-mmrgb-primary focus:ring-mmrgb-primary',
      secondary: 'bg-mmrgb-surfaceElevated text-mmrgb-text border border-mmrgb-border hover:bg-mmrgb-border hover:border-mmrgb-textMuted focus:ring-mmrgb-textMuted',
      ghost: 'bg-transparent text-mmrgb-textMuted hover:bg-mmrgb-surfaceElevated hover:text-mmrgb-text focus:ring-mmrgb-textMuted',
      danger: 'bg-gradient-to-r from-mmrgb-danger to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-mmrgb-danger'
    }
    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-3'
    }
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className='animate-spin h-4 w-4' viewBox='0 0 24 24'>
            <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='3' fill='none' />
            <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'