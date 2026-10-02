import { Lock } from 'lucide-react';

export interface LockedMenuItemProps {
  /** Beschriftung des Menüpunkts */
  label: string;
  /** Callback bei Klick (zeigt Hint) */
  onClick: () => void;
  /** Hover-Sound abspielen */
  onHover?: () => void;
}

function LockedMenuItem({ label, onClick, onHover }: LockedMenuItemProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    // Enter/Space soll KEINE Navigation auslösen, nur onClick für Hint
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }

  return (
    <button
      type="button"
      className="inline-flex items-center gap-4 px-16 py-7 text-6xl font-medium rounded-md
        min-w-[500px] justify-center
        opacity-50 cursor-not-allowed
        text-text-secondary
        transition-[filter] duration-200
        hover:brightness-125
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-secondary"
      aria-disabled="true"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={onHover}
    >
      <Lock size={48} aria-hidden="true" />
      {label}
    </button>
  );
}

export default LockedMenuItem;
