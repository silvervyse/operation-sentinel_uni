import type { ReactNode } from 'react';

export interface MainContentProps {
  children: ReactNode;
  className?: string;
}

function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={`flex-1 overflow-y-auto ${className ?? ''}`}>
      <div className="w-full max-w-[var(--max-width)] mx-auto px-4 md:px-6 py-4">
        {children}
      </div>
    </main>
  );
}

export default MainContent;
