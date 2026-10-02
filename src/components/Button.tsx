import type { ReactNode, ButtonHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  /** Visuelle Variante */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Größe */
  size?: 'sm' | 'md' | 'lg';
  /** Ladezustand — zeigt Spinner, deaktiviert Interaktion */
  loading?: boolean;
  /** Deaktiviert den Button */
  disabled?: boolean;
  /** Optionales Icon (lucide-react Icon-Komponente) */
  icon?: LucideIcon;
  /** Button-Inhalt */
  children: ReactNode;
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  children,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary';

  const variantClasses = {
    primary: 'bg-transparent border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/10 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]',
    secondary: 'bg-transparent border border-accent-primary text-accent-primary hover:bg-accent-primary/10',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = isDisabled ? 'opacity-50 pointer-events-none' : '';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className ?? ''}`}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : Icon ? (
        <Icon size={iconSize} aria-hidden="true" />
      ) : null}
      {children}
    </button>
  );
}

export default Button;
