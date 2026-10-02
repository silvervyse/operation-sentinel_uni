import type { LucideIcon } from 'lucide-react';

export interface IconWrapperProps {
  /** lucide-react Icon-Komponente */
  icon: LucideIcon;
  /** Größe in px */
  size?: 'sm' | 'md' | 'lg';
  /** Farbe (CSS color string oder Tailwind text-* Klasse) */
  color?: string;
  /** Wenn gesetzt: Icon ist informativ (role="img" + aria-label) */
  ariaLabel?: string;
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

function IconWrapper({
  icon: Icon,
  size = 'md',
  color,
  ariaLabel,
  className,
}: IconWrapperProps) {
  const sizeMap = { sm: 16, md: 20, lg: 24 };
  const pixelSize = sizeMap[size];

  if (ariaLabel) {
    return (
      <span role="img" aria-label={ariaLabel} className={className}>
        <Icon size={pixelSize} color={color ?? 'currentColor'} aria-hidden="true" />
      </span>
    );
  }

  return (
    <Icon
      size={pixelSize}
      color={color ?? 'currentColor'}
      aria-hidden="true"
      className={className}
    />
  );
}

export default IconWrapper;
