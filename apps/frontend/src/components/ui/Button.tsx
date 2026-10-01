import { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles = {
  primary: 'bg-status-danger text-white hover:brightness-110 hover:-translate-y-[1px] active:translate-y-0',
  secondary: 'bg-bg-primary border border-border text-text-primary hover:bg-white/5 hover:border-white/20',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-status-danger/15 border border-status-danger/30 text-status-danger hover:bg-status-danger/25',
}

const sizeStyles = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-6 py-3 gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-sans font-semibold rounded-lg transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}
