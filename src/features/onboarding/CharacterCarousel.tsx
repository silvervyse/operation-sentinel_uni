import { useState, useEffect, useCallback } from 'react';
import type { AgentCharacter } from './characters';
import { getCharacterImagePath } from './characters';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

export interface CharacterCarouselProps {
  characters: AgentCharacter[];
  currentIndex: number;
  onNavigate: (direction: 'prev' | 'next') => void;
}

/**
 * CharacterCarousel – Zeigt einen Charakter mit Bild und Name,
 * navigierbar über benutzerdefinierte Pfeil-Buttons und Pfeiltasten.
 *
 * Fallbacks:
 * - Pfeilbilder: Text-Pfeile (← / →) bei Ladefehler
 * - Charakter-Bild: farbiger Platzhalter bei Ladefehler
 */
export function CharacterCarousel({ characters, currentIndex, onNavigate }: CharacterCarouselProps) {
  const [characterImageError, setCharacterImageError] = useState(false);
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });

  const currentCharacter = characters[currentIndex];

  // Reset image error state when character changes
  useEffect(() => {
    setCharacterImageError(false);
  }, [currentIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate('next');
      }
    },
    [onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const characterImageSrc = getCharacterImagePath(currentCharacter.id, 'charakterauswahl');

  return (
    <div className="flex items-center justify-center" style={{ gap: '6vw' }}>
      {/* Left arrow button */}
      <button
        type="button"
        onClick={() => { playClick(); onNavigate('prev'); }}
        onMouseEnter={playHover}
        aria-label="Vorheriger Charakter"
        className="flex-shrink-0 rounded-lg transition-all duration-200 hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(0,212,255,0.5)] outline-none text-accent-primary select-none"
        style={{ fontSize: '4vw', padding: '1vw' }}
      >
        ‹
      </button>

      {/* Character display */}
      <div className="flex flex-col items-center gap-4">
        {/* Character image or fallback */}
        {characterImageError ? (
          <div
            className="rounded-lg flex items-center justify-center bg-accent-secondary/30 border border-accent-secondary/50"
            style={{ width: '20vw', height: '50vh' }}
            aria-label={`Platzhalter für ${currentCharacter.name}`}
          >
            <span className="text-4xl text-accent-secondary/70">?</span>
          </div>
        ) : (
          <img
            src={characterImageSrc}
            alt={currentCharacter.name}
            className="object-contain drop-shadow-[0_0_16px_rgba(0,212,255,0.2)]"
            style={{ width: '20vw', height: '50vh' }}
            onError={() => setCharacterImageError(true)}
          />
        )}

        {/* Character name – without "Agent" prefix */}
        <p className="font-display text-xl text-accent-primary tracking-wide text-center">
          {currentCharacter.name.replace('Agent ', '')}
        </p>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-2">
          {characters.map((_, i) => (
            <span
              key={i}
              className={`rounded-full transition-all duration-200 ${i === currentIndex ? 'bg-accent-primary' : 'bg-accent-primary/30'}`}
              style={{ width: i === currentIndex ? '12px' : '8px', height: i === currentIndex ? '12px' : '8px' }}
            />
          ))}
        </div>
      </div>

      {/* Right arrow button */}
      <button
        type="button"
        onClick={() => { playClick(); onNavigate('next'); }}
        onMouseEnter={playHover}
        aria-label="Nächster Charakter"
        className="flex-shrink-0 rounded-lg transition-all duration-200 hover:scale-110 hover:drop-shadow-[0_0_12px_rgba(0,212,255,0.5)] outline-none text-accent-primary select-none"
        style={{ fontSize: '4vw', padding: '1vw' }}
      >
        ›
      </button>
    </div>
  );
}
