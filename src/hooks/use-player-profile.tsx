import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { PlayerProfile } from '../types/player-profile.types';
import { loadProfile, saveProfile } from '../services/profile-service';

// === Context Value Interface ===

interface PlayerProfileContextValue {
  profile: PlayerProfile | null;
  isLoading: boolean;
  setProfile: (profile: PlayerProfile) => void;
  clearProfile: () => void;
}

// === Context ===

const PlayerProfileContext = createContext<PlayerProfileContextValue | null>(null);

// === Provider ===

interface PlayerProfileProviderProps {
  children: ReactNode;
}

export function PlayerProfileProvider({ children }: PlayerProfileProviderProps) {
  const [profile, setProfileState] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const stored = loadProfile();
    setProfileState(stored);
    setIsLoading(false);
  }, []);

  function setProfile(newProfile: PlayerProfile): void {
    saveProfile(newProfile);
    setProfileState(newProfile);
  }

  function clearProfile(): void {
    localStorage.removeItem('it-security-player-profile');
    localStorage.removeItem('it-security-game-progress');
    localStorage.removeItem('op-sentinel-mission-checkpoints');
    localStorage.removeItem('op-sentinel-passphrase');
    localStorage.removeItem('op-sentinel-akte-seen');
    localStorage.removeItem('op-sentinel-last-screen');
    localStorage.removeItem('op-sentinel-report-tooltip-shown');
    localStorage.removeItem('op-sentinel-report-data');
    setProfileState(null);
  }

  return (
    <PlayerProfileContext.Provider value={{ profile, isLoading, setProfile, clearProfile }}>
      {children}
    </PlayerProfileContext.Provider>
  );
}

// === Hook ===

export function usePlayerProfile(): PlayerProfileContextValue {
  const context = useContext(PlayerProfileContext);
  if (!context) {
    throw new Error('usePlayerProfile must be used within a PlayerProfileProvider');
  }
  return context;
}
