import type { ReactNode, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Schattentiefe */
  elevation?: 'sm' | 'md' | 'lg';
  /** Zusätzliche CSS-Klassen */
  className?: string;
  /** Inhalt */
  children: ReactNode;
}

function Card({
  elevation = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  const elevationClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={`bg-bg-secondary rounded-lg p-4 ${elevationClasses[elevation]} ${className ?? ''}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
