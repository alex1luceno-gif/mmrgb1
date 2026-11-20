$content = @"
import React from 'react'
import { clsx } from 'clsx'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export const Card: React.FC<CardProps> = ({ children, className, padding = 'md', hover = false, onClick }) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6'
  }
  return (
    <div
      className={clsx(
        'bg-mmrgb-surface border border-mmrgb-border rounded-2xl transition-all duration-200',
        paddings[padding],
        hover && 'hover:border-mmrgb-textMuted/50 hover:shadow-[0_0_30px_rgba(0,255,136,0.05)] cursor-pointer',
        onClick && 'active:scale-[0.98]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      {children}
    </div>
  )
}
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\components\Card.tsx', $content)
Write-Host 'Card.tsx written'
