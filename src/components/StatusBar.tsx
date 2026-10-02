import ProgressBar from './ProgressBar';

export interface StatusBarProps {
  progress?: number;
  label?: string;
  className?: string;
}

function StatusBar({ progress, label, className }: StatusBarProps) {
  return (
    <footer
      className={`flex items-center px-4 md:px-6 h-12 bg-bg-secondary border-t border-accent-primary/20 shrink-0 animate-fade-in ${className ?? ''}`}
    >
      <div className="flex items-center gap-3 w-full max-w-[var(--max-width)] mx-auto">
        {label && (
          <span className="text-xs text-text-secondary whitespace-nowrap">
            {label}
          </span>
        )}
        {progress !== undefined && (
          <div className="flex-1">
            <ProgressBar value={progress} size="sm" />
          </div>
        )}
      </div>
    </footer>
  );
}

export default StatusBar;
