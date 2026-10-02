import type { ReactNode } from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  children: ReactNode;
}

function Badge({ variant = 'neutral', children }: BadgeProps) {
  const variantClasses = {
    success: 'bg-accent-secondary/20 text-accent-secondary',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
    info: 'bg-accent-primary/20 text-accent-primary',
    neutral: 'bg-bg-tertiary text-text-secondary',
  };

  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;
