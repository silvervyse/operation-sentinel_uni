import { useState, useRef, useEffect, useCallback, type FormEvent, type ChangeEvent } from 'react';
import { validateCodename } from '../../services/profile-service';
import { getDirectorImagePath } from './director';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

export interface CodenameScreenProps {
  onSubmit: (codename: string) => void;
  initialValue?: string;
}

/**
 * CodenameScreen – Step 2 des Onboarding-Flows.
 *
 * Fordert den Spieler auf, einen Agenten-Deckname einzugeben.
 * Validiert Eingabe mit `validateCodename()` aus dem ProfileService.
 * Button ist immer klickbar/hoverbar, aber ausgegraut wenn kein Name da ist.
 * Bei Klick ohne gültigen Namen wird ein Error-Sound gespielt und die Fehlermeldung angezeigt.
 */
export function CodenameScreen({ onSubmit, initialValue = '' }: CodenameScreenProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const [value, setValue] = useState(initialValue);
  const [showError, setShowError] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-Focus bei Mount
  useEffect(() => {
    inputRef.current?.focus();
    errorAudioRef.current = new Audio(assetPath('/assets/audio/clicknotpossible.mp3'));
    errorAudioRef.current.volume = 0.1;
  }, []);

  const trimmed = value.trim();
  const validation = validateCodename(trimmed);
  const isValid = validation.valid;

  const errorMessage = !isValid
    ? validation.errors.find(e => e.field === 'codename')?.message ?? null
    : null;

  const playErrorSound = useCallback(() => {
    if (errorAudioRef.current) {
      errorAudioRef.current.currentTime = 0;
      errorAudioRef.current.play().catch(() => {});
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isValid) {
      onSubmit(trimmed);
    } else {
      playErrorSound();
      setShowError(true);
      setErrorKey(prev => prev + 1);
    }
  }

  function handleButtonClick() {
    if (isValid) {
      onSubmit(trimmed);
    } else {
      playErrorSound();
      setShowError(true);
      setErrorKey(prev => prev + 1);
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (e.target.value.trim().length > 0) {
      setShowError(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValid) {
        onSubmit(trimmed);
      } else {
        playErrorSound();
        setShowError(true);
        setErrorKey(prev => prev + 1);
      }
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${assetPath('/assets/images/Intro/Background.webp')})` }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-bg-primary/70" />

      {/* Director Nova – skeptisch, im Hintergrund links */}
      <img
        src={getDirectorImagePath('skeptisch')}
        alt=""
        className="absolute bottom-0 left-8 max-h-[85%] w-auto object-contain z-10 opacity-90"
        aria-hidden="true"
      />

      {/* Content wrapper – shifted right to not overlap director */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-xl mx-4">
        {/* Content panel */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center w-full rounded-2xl bg-black/75 border border-accent-primary/30 shadow-[0_0_20px_rgba(0,212,255,0.15)] backdrop-blur-sm"
          style={{ padding: '2.5rem 3.5rem' }}
        >
          {/* Heading */}
          <h1
            className="font-display text-accent-primary text-center tracking-wide leading-heading"
            style={{ fontSize: '1.5vw', marginBottom: '1.8rem' }}
          >
            Wie lautet Ihr Agenten-Deckname?
          </h1>

          {/* Input */}
          <div className="w-full flex flex-col" style={{ gap: '0.6rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              maxLength={20}
              placeholder="Deckname eingeben..."
              autoComplete="off"
              spellCheck={false}
              aria-label="Agenten-Deckname"
              aria-invalid={showError && !isValid ? true : undefined}
              aria-describedby={showError && errorMessage ? 'codename-error' : undefined}
              className="w-full rounded-lg bg-bg-primary border-2 border-accent-primary/50 text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all duration-200"
              style={{ fontSize: '1.1vw', padding: '1vh 1.5vw' }}
            />

            {/* Validation message – re-animates on each failed attempt */}
            {showError && errorMessage && (
              <p
                key={errorKey}
                id="codename-error"
                role="alert"
                className="text-warning animate-pulse"
                style={{ fontSize: '0.85vw' }}
              >
                {errorMessage}
              </p>
            )}
          </div>
        </form>

        {/* Submit button – outside the box, always hoverable */}
        <div className="flex justify-end w-full" style={{ marginTop: '2vh', paddingRight: '0.5rem' }}>
          <button
            type="button"
            onClick={() => { playClick(); handleButtonClick(); }}
            onMouseEnter={playHover}
            className={`font-semibold rounded-lg border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200 ${isValid ? 'bg-accent-primary/10' : 'bg-accent-primary/5 opacity-60'}`}
            style={{ fontSize: '1vw', padding: '0.8vh 2vw' }}
          >
            Bestätigen
          </button>
        </div>
      </div>
    </div>
  );
}
