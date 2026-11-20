$content = @"
import React from 'react'
import { clsx } from 'clsx'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
  className?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress = 0,
  size = 120,
  strokeWidth = 10,
  color = '#00ff88',
  bgColor = '#2a2a2a',
  children,
  className
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1))
  return (
    <div className={clsx('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className='ring-progress'>
        <circle cx={size / 2} cy={size / 2} r={radius} fill='none' stroke={bgColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill='none'
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))' }}
        />
      </svg>
      <div className='absolute inset-0 flex items-center justify-center'>{children}</div>
    </div>
  )
}
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\components\ProgressRing.tsx', $content)
Write-Host 'ProgressRing.tsx written'
