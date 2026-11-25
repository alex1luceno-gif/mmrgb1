import React from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  helperText?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder,
  className,
  disabled
}) => {
  const id = label?.toLowerCase().replace(/\s+/g, '-') || 'select'
  return (
    <div className='w-full'>
      {label && (
        <label htmlFor={id} className='block text-sm font-medium text-mmrgb-textMuted mb-2'>{label}</label>
      )}
      <div className='relative'>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={clsx(
            'w-full appearance-none bg-mmrgb-surfaceElevated border rounded-xl px-4 py-3 pr-12 text-mmrgb-text text-base transition-all duration-200 focus:outline-none focus:ring-2',
            error ? 'border-mmrgb-danger focus:ring-mmrgb-danger/30' : 'border-mmrgb-border focus:ring-mmrgb-primary/30',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? "${id}-error" : helperText ? "${id}-helper" : undefined}
        >
          {placeholder && (
            <option value='' disabled>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-mmrgb-textDim'>
          <ChevronDown className='w-5 h-5' />
        </div>
      </div>
      {error && (
        <p id="${id}-error" className='mt-1.5 text-sm text-mmrgb-danger' role='alert'>{error}</p>
      )}
      {helperText && !error && (
        <p id="${id}-helper" className='mt-1.5 text-sm text-mmrgb-textDim'>{helperText}</p>
      )}
    </div>
  )
}