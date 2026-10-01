import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizeStyles[size]} max-h-[92vh] flex flex-col bg-bg-card border border-border rounded-2xl shadow-[0_24px_64px_-12px_rgba(0,0,0,0.75)] surface-glass animate-[slideUp_.2s_ease-out]`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 shrink-0">
          <h2 className="text-text-primary font-sans font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="btn-icon-chip text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex-1 min-h-0">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/80 bg-white/[0.015] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
