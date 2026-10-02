import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AgentCharacterId } from '../../types/player-profile.types';
import { AGENT_CHARACTERS } from './characters';
import { CharacterCarousel } from './CharacterCarousel';
import { TypewriterText } from './TypewriterText';
import type { TypewriterTextHandle } from './TypewriterText';
import { getDirectorImagePath } from './director';
import { loadDialog } from '../../services/dialog-service';
import { replaceCodename } from '../../utils/template-utils';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

const INTRO_BACKGROUND_SRC = assetPath('/assets/images/Intro/Background.webp');
const CHARACTER_BACKGROUND_SRC = assetPath('/assets/images/Charakterauswahl/Background_character.webp');

export interface CharacterSelectionScreenProps {
  onSelect: (characterId: AgentCharacterId) => void;
  initialCharacter?: AgentCharacterId;
  codename: string;
}

/**
 * CharacterSelectionScreen – Schritt 3 des Onboarding-Flows.
 *
 * Dialog-Phase: Intro-Hintergrund + Director Nova mit personalisertem Dialog.
 * Selection-Phase: Crossfade zum Charakterauswahl-Hintergrund + Carousel.
 */
export function CharacterSelectionScreen({ onSelect, initialCharacter, codename }: CharacterSelectionScreenProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const [phase, setPhase] = useState<'dialog' | 'selection'>('dialog');

  // Dialog state
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const typewriterRef = useRef<TypewriterTextHandle>(null);

  // Character selection state
  const initialIndex = initialCharacter
    ? AGENT_CHARACTERS.findIndex(c => c.id === initialCharacter)
    : 0;
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [characterDescriptions, setCharacterDescriptions] = useState<Record<string, string>>({});

  // Load character descriptions
  useEffect(() => {
    const ids: AgentCharacterId[] = ['alpha', 'beta', 'charlie', 'delta'];
    Promise.all(
      ids.map(id =>
        fetch(assetPath(`/assets/dialogs/Characters/${id}.md`))
          .then(r => r.ok ? r.text() : '')
          .catch(() => '')
      )
    ).then(results => {
      const map: Record<string, string> = {};
      ids.forEach((id, i) => { map[id] = results[i]; });
      setCharacterDescriptions(map);
    });
  }, []);

  // Load dialog
  useEffect(() => {
    loadDialog(assetPath('/assets/dialogs/charakterauswahl.md'))
      .then((result) => {
        const replaced = result.map(p => replaceCodename(p, codename));
        setParagraphs(replaced);
        setDialogLoaded(true);
      })
      .catch(() => {
        setParagraphs([`Willkommen, ${codename}. Wählen Sie Ihr Erscheinungsbild.`]);
        setDialogLoaded(true);
      });
  }, [codename]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  const handleDialogContinue = () => {
    if (isTyping) {
      typewriterRef.current?.skip();
      return;
    }

    if (currentParagraphIndex < paragraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1);
      setIsTyping(true);
    } else {
      setPhase('selection');
    }
  };

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 1 : -1;
    setCurrentIndex(prev => (prev + delta + AGENT_CHARACTERS.length) % AGENT_CHARACTERS.length);
  }, []);

  const currentCharacter = AGENT_CHARACTERS[currentIndex];

  const handleMissionStart = () => {
    onSelect(currentCharacter.id);
  };

  return (
    <div className="relative h-screen w-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background images – crossfade between phases */}
      <AnimatePresence mode="wait">
        {phase === 'dialog' ? (
          <motion.img
            key="intro-bg"
            src={INTRO_BACKGROUND_SRC}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        ) : (
          <motion.img
            key="character-bg"
            src={CHARACTER_BACKGROUND_SRC}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}
      </AnimatePresence>

      {/* No dark overlay – keep background fully visible */}

      {/* Dialog phase – Director Nova with text */}
      <AnimatePresence>
        {phase === 'dialog' && dialogLoaded && (
          <motion.div
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Director Nova – neutral */}
            <div className="absolute bottom-0 left-8 max-w-[40%] h-full flex items-end">
              <img
                src={getDirectorImagePath('neutral')}
                alt="Director Nova"
                className="max-h-[85%] w-auto object-contain"
              />
            </div>

            {/* Dialog box */}
            <div className="absolute left-[38%] right-[27%] bottom-[2%] max-h-[45%] overflow-y-auto">
              {/* Speech bubble */}
              <div
                className="bg-black/75 backdrop-blur-sm border border-accent-primary/30 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                style={{ padding: '2.5rem 3.5rem 2rem' }}
              >
                <span className="text-accent-primary font-semibold text-lg block mb-3">
                  Director Nova
                </span>

                <div className="relative">
                  <p
                    className="text-white text-2xl leading-relaxed whitespace-pre-wrap invisible"
                    aria-hidden="true"
                  >
                    {paragraphs.reduce((a, b) => a.length > b.length ? a : b, '')}
                  </p>
                  <div className="absolute top-0 left-0 right-0">
                    <TypewriterText
                      ref={typewriterRef}
                      key={currentParagraphIndex}
                      text={paragraphs[currentParagraphIndex] ?? ''}
                      onComplete={handleTypingComplete}
                      className="text-white text-2xl leading-relaxed whitespace-pre-wrap"
                      highlight={codename}
                    />
                  </div>
                </div>
              </div>

              {/* Continue button */}
              <div className="flex items-center justify-end mr-2" style={{ marginTop: '2vh' }}>
                <button
                  type="button"
                  onClick={handleDialogContinue}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                  style={{ fontSize: '1vw', padding: '0.8vh 2vw' }}
                >
                  Weiter
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection phase – Character Carousel */}
      {phase === 'selection' && (
        <motion.div
          className="absolute inset-0 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {/* Top-left: Logo + Agency name */}
          <div className="absolute top-6 left-8 flex items-center gap-4">
            <img
              src={assetPath("/assets/images/Logo.webp")}
              alt="Operation Sentinel"
              className="h-12 w-auto object-contain"
            />
            <span className="text-accent-primary font-display tracking-wider" style={{ fontSize: '1vw' }}>
              Cyber Intelligence Unit
            </span>
          </div>

          {/* Left-center: Character description – styled as agent dossier */}
          <div className="absolute max-w-[22%]" style={{ left: '14vw', top: '35%' }}>
            <p className="text-accent-primary font-semibold border-b border-accent-primary/30" style={{ fontSize: '1.1vw', paddingBottom: '0.8vh', marginBottom: '2vh' }}>
              Agentenakte: <span className="font-bold">{codename}</span>
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={AGENT_CHARACTERS[currentIndex].id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <CharacterDossier text={characterDescriptions[AGENT_CHARACTERS[currentIndex].id] || ''} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: Carousel – shifted right to center in frame */}
          <div className="h-full flex flex-col items-center justify-center gap-8 px-4" style={{ marginLeft: '20vw' }}>
            <h1 className="font-display text-2xl sm:text-3xl text-text-primary tracking-wide text-center">
              Wähle dein Erscheinungsbild
            </h1>

            <CharacterCarousel
              characters={[...AGENT_CHARACTERS]}
              currentIndex={currentIndex}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Mission starten – bottom right */}
          <div className="absolute bottom-[5%] right-[10%]">
            <button
              type="button"
              onClick={() => { playClick(); handleMissionStart(); }}
              onMouseEnter={playHover}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
              style={{ fontSize: '1.1vw', padding: '1vh 2.5vw' }}
            >
              Mission starten
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Parst den Charakter-Beschreibungstext und rendert ihn als formatierte Akte */
function CharacterDossier({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const sections: { heading?: string; items: string[] }[] = [];
  let current: { heading?: string; items: string[] } = { items: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith(':') && trimmed.length < 40) {
      if (current.heading || current.items.length > 0) {
        sections.push(current);
      }
      current = { heading: trimmed.replace(/:$/, ''), items: [] };
    } else {
      current.items.push(trimmed);
    }
  }
  if (current.heading || current.items.length > 0) {
    sections.push(current);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
      {sections.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <h3 style={{
              color: 'var(--color-accent-primary, #00d4ff)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.75vw',
              marginBottom: '0.8vh',
            }}>
              {section.heading}
            </h3>
          )}
          {section.items.map((item, j) => (
            <p key={j} style={{
              color: 'var(--color-text-primary, #e8edf5)',
              fontSize: '0.85vw',
              lineHeight: 1.6,
            }}>
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
