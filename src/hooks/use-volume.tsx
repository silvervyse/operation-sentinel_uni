import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

const VOLUME_STORAGE_KEY = 'op-sentinel-music-volume';
const VOLUME_STORAGE_VERSION_KEY = 'op-sentinel-music-volume-v';
const VOLUME_DEFAULT = 0.05;

interface VolumeContextValue {
  /** Globale Lautstärke (0.0–1.0) */
  volume: number;
  /** Lautstärke ändern und persistieren */
  setVolume: (v: number) => void;
}

const VolumeContext = createContext<VolumeContextValue | null>(null);

function loadInitialVolume(): number {
  const versionApplied = localStorage.getItem(VOLUME_STORAGE_VERSION_KEY);
  if (versionApplied !== '2') {
    localStorage.removeItem(VOLUME_STORAGE_KEY);
    localStorage.setItem(VOLUME_STORAGE_VERSION_KEY, '2');
    return VOLUME_DEFAULT;
  }
  const stored = localStorage.getItem(VOLUME_STORAGE_KEY);
  if (stored !== null) {
    const parsed = parseFloat(stored);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
  }
  return VOLUME_DEFAULT;
}

export function VolumeProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(loadInitialVolume);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem(VOLUME_STORAGE_KEY, String(clamped));
  }, []);

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
}

export function useVolume(): VolumeContextValue {
  const ctx = useContext(VolumeContext);
  if (!ctx) {
    throw new Error('useVolume must be used within a VolumeProvider');
  }
  return ctx;
}
