import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useVolume } from '../../hooks/use-volume';
import { assetPath } from '../../utils/asset-path';

export interface TypewriterTextProps {
  /** Vollständiger Text zum zeichenweisen Anzeigen */
  text: string;
  /** Millisekunden pro Zeichen (default: 20ms) */
  speed?: number;
  /** Pfad zur Tipp-Sound-Datei (default: /assets/audio/typing.mp3) */
  soundSrc?: string;
  /** Callback wenn die Animation abgeschlossen ist */
  onComplete: () => void;
  /** Optionale CSS-Klassen für den Text-Paragraph */
  className?: string;
  /** Optional: Wort/Phrase oder Array von Wörtern die im Text blau + kursiv hervorgehoben werden */
  highlight?: string | string[];
}

export interface TypewriterTextHandle {
  /** Überspringt die Animation und zeigt sofort den vollständigen Text */
  skip: () => void;
  /** Gibt zurück, ob die Animation noch läuft */
  isAnimating: () => boolean;
}

/**
 * TypewriterText – Rendert Text zeichenweise mit konfigurierbarer Geschwindigkeit.
 *
 * Spielt während der Animation einen Tipp-Sound im Loop-Modus.
 * Graceful Degradation: Wenn die Audio-Datei nicht geladen werden kann,
 * läuft die Animation ohne Sound weiter.
 *
 * Über die ref (TypewriterTextHandle) kann die Animation übersprungen werden.
 */
export const TypewriterText = forwardRef<TypewriterTextHandle, TypewriterTextProps>(
  function TypewriterText(
    { text, speed = 20, soundSrc = assetPath('/assets/audio/typing.mp3'), onComplete, className, highlight },
    ref
  ) {
    const [displayedText, setDisplayedText] = useState('');
    const { volume } = useVolume();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const charIndexRef = useRef(0);
    const onCompleteRef = useRef(onComplete);
    const isAnimatingRef = useRef(true);

    // Keep onComplete ref up-to-date without triggering effects
    useEffect(() => {
      onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Sync volume changes to typing audio
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.volume = volume * 0.3;
      }
    }, [volume]);

    const stopAudio = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }, []);

    const cleanup = useCallback(() => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stopAudio();
    }, [stopAudio]);

    // Expose skip method via ref
    useImperativeHandle(ref, () => ({
      skip() {
        if (!isAnimatingRef.current) return;
        cleanup();
        setDisplayedText(text);
        isAnimatingRef.current = false;
        onCompleteRef.current();
      },
      isAnimating() {
        return isAnimatingRef.current;
      },
    }), [text, cleanup]);

    useEffect(() => {
      // Reset state when text changes
      setDisplayedText('');
      charIndexRef.current = 0;
      isAnimatingRef.current = true;
      cleanup();

      if (!text || text.length === 0) {
        isAnimatingRef.current = false;
        onCompleteRef.current();
        return;
      }

      // Create Audio element for typing sound
      const audio = new Audio(soundSrc);
      audio.loop = true;
      audio.volume = volume * 0.3;
      audioRef.current = audio;

      // Start audio playback (graceful degradation on failure)
      audio.play().catch(() => {
        // Audio file couldn't be loaded or autoplay blocked – continue silently
      });

      // Start character-by-character reveal
      intervalRef.current = setInterval(() => {
        charIndexRef.current += 1;
        const currentIndex = charIndexRef.current;

        setDisplayedText(text.slice(0, currentIndex));

        if (currentIndex >= text.length) {
          // Animation complete
          if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          audio.pause();
          audio.currentTime = 0;
          isAnimatingRef.current = false;
          onCompleteRef.current();
        }
      }, speed);

      // Cleanup on unmount or text change
      return () => {
        cleanup();
      };
    }, [text, speed, soundSrc, cleanup]);

    /** Rendert den Text mit optionalem Highlight (einzeln oder Array) */
    function renderText(content: string) {
      const highlights = !highlight ? [] : Array.isArray(highlight) ? highlight : [highlight];
      if (highlights.length === 0) return content;

      // Regex bauen die alle Highlights matcht
      const escaped = highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regex = new RegExp(`(${escaped.join('|')})`, 'g');
      const parts = content.split(regex);

      return parts.map((part, i) =>
        highlights.includes(part)
          ? <span key={i} className="text-accent-primary font-bold">{part}</span>
          : part
      );
    }

    return (
      <p className={className ?? "text-white text-lg leading-relaxed whitespace-pre-wrap"}>
        {renderText(displayedText)}
      </p>
    );
  }
);
