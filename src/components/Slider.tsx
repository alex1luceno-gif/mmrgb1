import React from 'react'
import { clsx } from 'clsx'

interface SliderProps {
  label: string
  min: number
  max: number
  step?: number
  value: number
  onChange: (value: number) => void
  unit?: string
  showValue?: boolean
  className?: string
}

export const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "",
  showValue = true,
  className
}) => {
  const percentage = ((value - min) / (max - min)) * 100
  return (
    <div className={clsx("w-full", className)}>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-mmrgb-textMuted">{label}</label>
        {showValue && (
          <span className="text-lg font-bold text-mmrgb-text tabular-nums">
            {value}{unit && <span className="text-sm font-normal text-mmrgb-textMuted ml-1">{unit}</span>}
          </span>
        )}
      </div>
      <div className="relative h-2">
        <div className="absolute inset-0 bg-mmrgb-border rounded-full" />
        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-mmrgb-primary to-mmrgb-secondary rounded-full transition-all duration-100" style={{ width: `${percentage}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none"
          aria-label={label}
        />
      </div>
    </div>
  )
}