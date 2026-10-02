export interface ProgressBarProps {
  /** Fortschrittswert 0–100 */
  value: number;
  /** Füllfarbe (Tailwind bg-Klasse) */
  color?: string;
  /** Balkenhöhe */
  size?: 'sm' | 'md' | 'lg';
  /** Zusätzliche CSS-Klassen */
  className?: string;
}

function ProgressBar({
  value,
  color = 'bg-accent-primary',
  size = 'md',
  className,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, Number.isNaN(value) ? 0 : value));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full bg-bg-tertiary rounded-full overflow-hidden ${sizeClasses[size]} ${className ?? ''}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-normal ${color}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export default ProgressBar;
