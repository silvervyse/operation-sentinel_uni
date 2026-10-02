import type { AgentCharacterId } from '../../types/player-profile.types';
import { AGENT_CHARACTERS, getCharacterImagePath } from './characters';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

const INTRO_BACKGROUND_SRC = assetPath('/assets/images/Intro/Background.webp');

export interface ConfirmationDialogProps {
  codename: string;
  selectedCharacter: AgentCharacterId;
  onConfirm: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveError?: string | null;
  onRetry?: () => void;
}

/**
 * ConfirmationDialog – Step 4 des Onboarding-Flows.
 *
 * Zeigt eine Bestätigungsfrage mit dem gewählten Decknamen und Charakter.
 * Charakterauswahl-Hintergrund ausgegraut dahinter.
 * Buttons außerhalb der Box.
 */
export function ConfirmationDialog({
  codename,
  selectedCharacter,
  onConfirm,
  onCancel,
  isSaving = false,
  saveError = null,
  onRetry,
}: ConfirmationDialogProps) {
  const character = AGENT_CHARACTERS.find(c => c.id === selectedCharacter);
  const characterName = character ? character.name.replace('Agent ', '') : selectedCharacter;
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <img
        src={INTRO_BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-xl mx-4">
        {/* Dialog panel */}
        <div
          className="w-full rounded-2xl bg-black/75 backdrop-blur-sm border border-accent-primary/30 shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          style={{ padding: '3rem 4rem' }}
        >
          {/* Heading */}
          <h2
            className="font-display text-accent-primary text-center tracking-wide"
            style={{ fontSize: '1.5vw', marginBottom: '2rem' }}
          >
            Bist du dir sicher?
          </h2>

          {/* Summary of choices */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div>
              <p className="text-text-secondary" style={{ fontSize: '0.9vw' }}>Dein Deckname:</p>
              <p className="text-accent-primary font-bold" style={{ fontSize: '1.3vw' }}>{codename}</p>
            </div>

            {/* Character image */}
            <img
              src={getCharacterImagePath(selectedCharacter, 'charakterauswahl')}
              alt={characterName}
              className="object-contain"
              style={{ height: '20vh' }}
            />

            <div>
              <p className="text-text-secondary" style={{ fontSize: '0.9vw' }}>Dein Charakter:</p>
              <p className="text-text-primary font-bold" style={{ fontSize: '1.3vw' }}>{characterName}</p>
            </div>
          </div>

          {/* Error message */}
          {saveError && (
            <div className="flex flex-col items-center gap-2 mt-4">
              <p role="alert" className="text-warning text-center" style={{ fontSize: '0.85vw' }}>
                {saveError}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-accent-primary underline hover:text-accent-primary/80"
                  style={{ fontSize: '0.85vw' }}
                >
                  Erneut versuchen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action buttons – outside the box, equal width */}
        <div className="flex flex-col items-stretch gap-3" style={{ marginTop: '2.5vh', width: '60%' }}>
          <button
            type="button"
            onClick={() => { playClick(); onConfirm(); }}
            onMouseEnter={playHover}
            disabled={isSaving}
            className="w-full font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none text-center"
            style={{ fontSize: '1vw', padding: '0.8vh 2.5vw' }}
          >
            {isSaving ? 'Speichere...' : 'Speichern und Mission starten'}
          </button>

          <button
            type="button"
            onClick={() => { playClick(); onCancel(); }}
            onMouseEnter={playHover}
            disabled={isSaving}
            className="w-full font-semibold rounded-lg bg-transparent border-2 border-text-secondary/50 text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors duration-200 disabled:opacity-40 text-center"
            style={{ fontSize: '1vw', padding: '0.8vh 2.5vw' }}
          >
            Zurück
          </button>
        </div>
      </div>
    </div>
  );
}
