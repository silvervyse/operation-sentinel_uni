import type { ReactNode } from 'react';

export interface HeaderProps {
  title?: string;
  score?: number;
  missionBadge?: ReactNode;
}

function Header({
  title = 'IT Security Awareness',
  score,
  missionBadge,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-6 h-14 bg-bg-secondary border-b border-accent-primary/20 shrink-0">
      <h1 className="text-lg font-bold text-text-primary truncate">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        {score !== undefined && (
          <span className="text-sm font-medium text-accent-primary">
            {score} Punkte
          </span>
        )}
        {missionBadge}
      </div>
    </header>
  );
}

export default Header;
