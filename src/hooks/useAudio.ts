import { useEffect, useRef, useCallback } from 'react';
import { useVolume } from './use-volume';

export interface UseAudioOptions {
  /** Pfad zur Hintergrundmusik */
  musicSrc?: string;
  /** Pfad zum Hover-Sound */
  hoverSrc?: string;
  /** Pfad zum Click-Sound */
  clickSrc?: string;
  /** Pfad zum Locked-Click-Sound */
  lockedClickSrc?: string;
}

export interface UseAudioReturn {
  /** Musik starten (mit Autoplay-Fallback) */
  startMusic: () => void;
  /** Musik mit Fade-Out stoppen */
  stopMusic: (fadeMs?: number) => void;
  /** Hover-Sound abspielen */
  playHover: () => void;
  /** Click-Sound abspielen */
  playClick: () => void;
  /** Locked-Click-Sound abspielen (für gesperrte Menüpunkte) */
  playLockedClick: () => void;
  /** Aufräumen (bei Unmount) */
  cleanup: () => void;
}

/**
 * UI-Sounds werden relativ zum globalen Volume abgespielt.
 * Musik nutzt den globalen Volume-Wert direkt.
 * UI-Effekte (Hover, Click) sind leiser (30% des Gesamtvolumes).
 */
const UI_VOLUME_FACTOR = 0.3;

export function useAudio(options: UseAudioOptions = {}): UseAudioReturn {
  const { musicSrc, hoverSrc, clickSrc, lockedClickSrc } = options;
  const { volume } = useVolume();

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const hoverRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const lockedClickRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoplayListenerRef = useRef<(() => void) | null>(null);

  // Initialize audio elements
  useEffect(() => {
    if (musicSrc) {
      const music = new Audio(musicSrc);
      music.loop = true;
      music.volume = volume;
      music.preload = 'auto';
      music.onerror = () => {};
      musicRef.current = music;
    }

    if (hoverSrc) {
      const hover = new Audio(hoverSrc);
      hover.volume = volume * UI_VOLUME_FACTOR;
      hover.onerror = () => {};
      hoverRef.current = hover;
    }

    if (clickSrc) {
      const click = new Audio(clickSrc);
      click.volume = volume * UI_VOLUME_FACTOR;
      click.onerror = () => {};
      clickRef.current = click;
    }

    if (lockedClickSrc) {
      const lockedClick = new Audio(lockedClickSrc);
      lockedClick.volume = volume * UI_VOLUME_FACTOR;
      lockedClick.onerror = () => {};
      lockedClickRef.current = lockedClick;
    }

    return () => {
      cleanupAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume changes to existing audio elements
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = volume;
    }
    if (hoverRef.current) {
      hoverRef.current.volume = volume * UI_VOLUME_FACTOR;
    }
    if (clickRef.current) {
      clickRef.current.volume = volume * UI_VOLUME_FACTOR;
    }
    if (lockedClickRef.current) {
      lockedClickRef.current.volume = volume * UI_VOLUME_FACTOR;
    }
  }, [volume]);

  const cleanupAudio = useCallback(() => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    if (autoplayListenerRef.current) {
      document.removeEventListener('click', autoplayListenerRef.current);
      document.removeEventListener('keydown', autoplayListenerRef.current);
      document.removeEventListener('touchstart', autoplayListenerRef.current);
      autoplayListenerRef.current = null;
    }

    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.src = '';
      musicRef.current = null;
    }
    if (hoverRef.current) {
      hoverRef.current.pause();
      hoverRef.current.src = '';
      hoverRef.current = null;
    }
    if (clickRef.current) {
      clickRef.current.pause();
      clickRef.current.src = '';
      clickRef.current = null;
    }
    if (lockedClickRef.current) {
      lockedClickRef.current.pause();
      lockedClickRef.current.src = '';
      lockedClickRef.current = null;
    }
  }, []);

  const startMusic = useCallback(() => {
    const music = musicRef.current;
    if (!music) return;

    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const handleInteraction = () => {
          music.play().catch(() => {});
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('keydown', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
          autoplayListenerRef.current = null;
        };

        autoplayListenerRef.current = handleInteraction;
        document.addEventListener('click', handleInteraction);
        document.addEventListener('keydown', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
      });
    }
  }, []);

  const stopMusic = useCallback((fadeMs: number = 500) => {
    const music = musicRef.current;
    if (!music) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    const steps = 20;
    const stepTime = fadeMs / steps;
    const volumeStep = music.volume / steps;

    fadeIntervalRef.current = setInterval(() => {
      if (music.volume - volumeStep <= 0) {
        music.volume = 0;
        music.pause();
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
      } else {
        music.volume = Math.max(0, music.volume - volumeStep);
      }
    }, stepTime);
  }, []);

  const playHover = useCallback(() => {
    const hover = hoverRef.current;
    if (!hover) return;
    hover.pause();
    hover.currentTime = 0;
    hover.play().catch(() => {});
  }, []);

  const playClick = useCallback(() => {
    const click = clickRef.current;
    if (!click) return;
    click.currentTime = 0;
    click.play().catch(() => {});
  }, []);

  const playLockedClick = useCallback(() => {
    const lockedClick = lockedClickRef.current;
    if (!lockedClick) return;
    lockedClick.currentTime = 0;
    lockedClick.play().catch(() => {});
  }, []);

  return {
    startMusic,
    stopMusic,
    playHover,
    playClick,
    playLockedClick,
    cleanup: cleanupAudio,
  };
}
