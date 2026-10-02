import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { useAudio } from './useAudio';
import { VolumeProvider } from './use-volume';

// Mock HTMLAudioElement
const mockInstances: MockAudio[] = [];

class MockAudio {
  src = '';
  loop = false;
  volume = 1;
  currentTime = 0;
  paused = true;
  preload = '';
  onerror: (() => void) | null = null;

  play = vi.fn(() => Promise.resolve());
  pause = vi.fn(() => { this.paused = true; });

  constructor(src?: string) {
    if (src) this.src = src;
    mockInstances.push(this);
  }
}

function wrapper({ children }: { children: ReactNode }) {
  return createElement(VolumeProvider, null, children);
}

describe('useAudio', () => {
  let originalAudio: typeof Audio;

  beforeEach(() => {
    originalAudio = global.Audio;
    global.Audio = MockAudio as unknown as typeof Audio;
    mockInstances.length = 0;
    vi.useFakeTimers();
    // Ensure localStorage has a known volume
    localStorage.setItem('op-sentinel-music-volume', '0.5');
    localStorage.setItem('op-sentinel-music-volume-v', '2');
  });

  afterEach(() => {
    global.Audio = originalAudio;
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('creates audio elements with correct settings', () => {
    const { result } = renderHook(() =>
      useAudio({
        musicSrc: '/assets/audio/mainmenu.mp3',
        hoverSrc: '/assets/audio/Hover.mp3',
        clickSrc: '/assets/audio/Click.mp3',
        lockedClickSrc: '/assets/audio/clicknotpossible.mp3',
      }),
      { wrapper }
    );

    expect(mockInstances).toHaveLength(4);
    expect(mockInstances[0].src).toBe('/assets/audio/mainmenu.mp3');
    expect(mockInstances[1].src).toBe('/assets/audio/Hover.mp3');
    expect(mockInstances[2].src).toBe('/assets/audio/Click.mp3');
    expect(mockInstances[3].src).toBe('/assets/audio/clicknotpossible.mp3');

    expect(result.current.startMusic).toBeInstanceOf(Function);
    expect(result.current.stopMusic).toBeInstanceOf(Function);
    expect(result.current.playHover).toBeInstanceOf(Function);
    expect(result.current.playClick).toBeInstanceOf(Function);
    expect(result.current.playLockedClick).toBeInstanceOf(Function);
    expect(result.current.cleanup).toBeInstanceOf(Function);
  });

  it('sets music volume based on global volume context', () => {
    renderHook(() =>
      useAudio({ musicSrc: '/assets/audio/mainmenu.mp3' }),
      { wrapper }
    );

    const musicInstance = mockInstances[0];
    expect(musicInstance.loop).toBe(true);
    expect(musicInstance.volume).toBe(0.5);
  });

  it('sets UI sound volume as fraction of global volume', () => {
    renderHook(() =>
      useAudio({
        hoverSrc: '/assets/audio/Hover.mp3',
        clickSrc: '/assets/audio/Click.mp3',
      }),
      { wrapper }
    );

    const hoverInstance = mockInstances[0];
    const clickInstance = mockInstances[1];
    // UI_VOLUME_FACTOR = 0.3, global volume = 0.5
    expect(hoverInstance.volume).toBeCloseTo(0.15);
    expect(clickInstance.volume).toBeCloseTo(0.15);
  });

  it('startMusic calls play on music element', () => {
    const { result } = renderHook(() =>
      useAudio({ musicSrc: '/assets/audio/mainmenu.mp3' }),
      { wrapper }
    );

    const musicInstance = mockInstances[0];

    act(() => {
      result.current.startMusic();
    });

    expect(musicInstance.play).toHaveBeenCalled();
  });

  it('startMusic sets up autoplay fallback on play rejection', async () => {
    const { result } = renderHook(() =>
      useAudio({ musicSrc: '/assets/audio/mainmenu.mp3' }),
      { wrapper }
    );

    const musicInstance = mockInstances[0];
    musicInstance.play = vi.fn(() => Promise.reject(new Error('Autoplay blocked')));

    const addEventSpy = vi.spyOn(document, 'addEventListener');

    act(() => {
      result.current.startMusic();
    });

    await vi.waitFor(() => {
      expect(addEventSpy).toHaveBeenCalledWith('click', expect.any(Function));
    });

    expect(addEventSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    expect(addEventSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

    addEventSpy.mockRestore();
  });

  it('stopMusic fades volume over time', () => {
    const { result } = renderHook(() =>
      useAudio({ musicSrc: '/assets/audio/mainmenu.mp3' }),
      { wrapper }
    );

    const musicInstance = mockInstances[0];
    musicInstance.volume = 0.5;

    act(() => {
      result.current.stopMusic(500);
    });

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(musicInstance.volume).toBeLessThan(0.5);
    expect(musicInstance.volume).toBeGreaterThan(0);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(musicInstance.volume).toBe(0);
    expect(musicInstance.pause).toHaveBeenCalled();
  });

  it('playHover stops previous, resets currentTime, and plays', () => {
    const { result } = renderHook(() =>
      useAudio({ hoverSrc: '/assets/audio/Hover.mp3' }),
      { wrapper }
    );

    const hoverInstance = mockInstances[0];
    hoverInstance.currentTime = 0.5;

    act(() => {
      result.current.playHover();
    });

    expect(hoverInstance.pause).toHaveBeenCalled();
    expect(hoverInstance.currentTime).toBe(0);
    expect(hoverInstance.play).toHaveBeenCalled();
  });

  it('playClick plays click sound', () => {
    const { result } = renderHook(() =>
      useAudio({ clickSrc: '/assets/audio/Click.mp3' }),
      { wrapper }
    );

    const clickInstance = mockInstances[0];

    act(() => {
      result.current.playClick();
    });

    expect(clickInstance.play).toHaveBeenCalled();
  });

  it('playLockedClick plays locked click sound', () => {
    const { result } = renderHook(() =>
      useAudio({ lockedClickSrc: '/assets/audio/clicknotpossible.mp3' }),
      { wrapper }
    );

    const lockedClickInstance = mockInstances[0];

    act(() => {
      result.current.playLockedClick();
    });

    expect(lockedClickInstance.play).toHaveBeenCalled();
  });

  it('cleanup stops all audio and clears resources', () => {
    const { result } = renderHook(() =>
      useAudio({
        musicSrc: '/assets/audio/mainmenu.mp3',
        hoverSrc: '/assets/audio/Hover.mp3',
        clickSrc: '/assets/audio/Click.mp3',
        lockedClickSrc: '/assets/audio/clicknotpossible.mp3',
      }),
      { wrapper }
    );

    const musicInstance = mockInstances[0];

    act(() => {
      result.current.cleanup();
    });

    expect(musicInstance.pause).toHaveBeenCalled();
  });

  it('does not crash when called without any options', () => {
    const { result } = renderHook(() => useAudio(), { wrapper });

    act(() => {
      result.current.startMusic();
      result.current.stopMusic();
      result.current.playHover();
      result.current.playClick();
      result.current.playLockedClick();
      result.current.cleanup();
    });
  });
});
