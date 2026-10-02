import type { ReactNode } from 'react';
import Header from './Header';
import MainContent from './MainContent';
import StatusBar from './StatusBar';

export interface StatusBarConfig {
  progress?: number;
  label?: string;
  className?: string;
}

export interface HeaderConfig {
  title?: string;
  score?: number;
  missionBadge?: ReactNode;
}

export interface AppShellProps {
  children: ReactNode;
  showStatusBar?: boolean;
  statusBarProps?: StatusBarConfig;
  headerProps?: HeaderConfig;
}

function AppShell({
  children,
  showStatusBar = false,
  statusBarProps,
  headerProps,
}: AppShellProps) {
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Header
        title={headerProps?.title}
        score={headerProps?.score}
        missionBadge={headerProps?.missionBadge}
      />
      <MainContent>{children}</MainContent>
      {showStatusBar && (
        <StatusBar
          progress={statusBarProps?.progress}
          label={statusBarProps?.label}
          className={statusBarProps?.className}
        />
      )}
    </div>
  );
}

export default AppShell;
