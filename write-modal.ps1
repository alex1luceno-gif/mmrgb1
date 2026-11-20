$content = @"
import React, { useEffect } from 'react'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  closeOnOverlayClick?: boolean
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', className, closeOnOverlayClick = true }) => {
  if (!isOpen) return null

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = '' }
  }, [onClose])

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'max-w-4xl' }

  const modalContent = (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={closeOnOverlayClick ? onClose : undefined} />
      <div className={clsx('relative bg-mmrgb-surface border border-mmrgb-border rounded-2xl shadow-2xl w-full animate-scale-in', sizes[size], className)}>
        {title && (
          <div className='flex items-center justify-between p-5 border-b border-mmrgb-border'>
            <h2 className='text-xl font-bold text-mmrgb-text'>{title}</h2>
            <button onClick={onClose} className='p-2 text-mmrgb-textMuted hover:text-mmrgb-text hover:bg-mmrgb-surfaceElevated rounded-xl transition-colors' aria-label='Close modal'>
              <X className='w-5 h-5' />
            </button>
          </div>
        )}
        <div className='p-5'>{children}</div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
"@
[System.IO.File]::WriteAllText('C:\Users\Lenovo\Downloads\Documents\hobbyvcode\mmrgb\src\components\Modal.tsx', $content)
Write-Host 'Modal.tsx written'
