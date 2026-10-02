import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TypewriterText } from './TypewriterText';
import type { TypewriterTextHandle } from './TypewriterText';
import { getDirectorImagePath, GREETING_POSE } from './director';
import type { DirectorPose } from './director';
import { loadDialog } from '../../services/dialog-service';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

export interface GreetingScreenProps {
  onContinue: () => void;
}

const FALLBACK_MESSAGE = 'Willkommen bei der Agentur für Cybersicherheit. Lassen Sie uns beginnen.';

/**
 * GreetingScreen – Erster Schritt des Onboarding-Flows.
 *
 * Zeigt Director Nova mit einem Glitch-Effekt beim Erscheinen und
 * einem mehrseitigen Dialog (Typewriter-Effekt).
 * Klick auf "Weiter" während der Animation zeigt den Text sofort fertig.
 * Nach dem letzten Absatz wird onContinue() aufgerufen.
 */
/** Verzögerung in ms nach dem Glitch-Effekt, bevor der Text startet */
const TEXT_START_DELAY = 1000;

export function GreetingScreen({ onContinue }: GreetingScreenProps) {
  useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [_loadError, setLoadError] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [directorImageError, setDirectorImageError] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const typewriterRef = useRef<TypewriterTextHandle>(null);

  // Load dialog on mount
  useEffect(() => {
    loadDialog(assetPath('/assets/dialogs/intro.md'))
      .then((result) => {
        setParagraphs(result);
        setIsLoading(false);
      })
      .catch(() => {
        setParagraphs([FALLBACK_MESSAGE]);
        setLoadError(true);
        setIsLoading(false);
      });
  }, []);

  // Start text after a delay (wait for glitch to finish + pause)
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => setShowDialog(true), TEXT_START_DELAY);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  const handleContinue = () => {
    // If still typing, skip the animation instead of blocking
    if (isTyping) {
      typewriterRef.current?.skip();
      return;
    }

    if (currentParagraphIndex < paragraphs.length - 1) {
      // Navigate to next paragraph
      setCurrentParagraphIndex((prev) => prev + 1);
      setIsTyping(true);
    } else {
      // Last paragraph – transition to next screen
      onContinue();
    }
  };

  /** Pose der Direktorin pro Absatz – 1-4 freundlich, 8 skeptisch, Rest neutral */
  const getPose = (): DirectorPose => {
    if (currentParagraphIndex >= 1 && currentParagraphIndex <= 4) return 'freundlich';
    if (currentParagraphIndex >= 8) return 'skeptisch';
    return GREETING_POSE;
  };
  const directorPose = getPose();
  const directorImagePath = getDirectorImagePath(directorPose);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary text-lg">Lade...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Background image with fallback */}
      {!bgImageError ? (
        <img
          src={assetPath("/assets/images/Intro/Background.webp")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setBgImageError(true)}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-bg-primary" aria-hidden="true" />
      )}

      {/* Content overlay */}
      <div className="relative z-10 h-full">
        {/* Director Nova – left side with glitch entrance */}
        {!directorImageError && (
          <motion.div
            className="absolute bottom-0 left-8 max-w-[40%] h-full flex items-end"
            initial={{ opacity: 0, filter: 'brightness(2) saturate(0)' }}
            animate={{
              opacity: [0, 0.4, 0, 0.7, 0.3, 1, 0.8, 1],
              filter: [
                'brightness(2) saturate(0)',
                'brightness(1.5) saturate(0.5) hue-rotate(90deg)',
                'brightness(2) saturate(0)',
                'brightness(1.2) saturate(0.8) hue-rotate(-45deg)',
                'brightness(1.8) saturate(0.3)',
                'brightness(1) saturate(1)',
                'brightness(1.1) saturate(0.9) hue-rotate(10deg)',
                'brightness(1) saturate(1) hue-rotate(0deg)',
              ],
              x: [0, -4, 6, -2, 3, 0, -1, 0],
            }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              times: [0, 0.1, 0.2, 0.35, 0.5, 0.7, 0.85, 1],
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={directorPose}
                src={directorImagePath}
                alt="Director Nova"
                className="max-h-[85%] w-auto object-contain"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
                onError={() => setDirectorImageError(true)}
              />
            </AnimatePresence>
          </motion.div>
        )}

        {/* Dialog panel – centered horizontally, positioned at ~55% from top */}
        {showDialog && (
          <motion.div
            className="absolute left-[38%] right-[27%] bottom-[2%] max-h-[45%] overflow-y-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Speech bubble */}
            <div
              className="bg-black/75 backdrop-blur-sm border border-accent-primary/30 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.15)]"
              style={{ padding: '2.5rem 3.5rem 2rem' }}
            >
              {/* Speaker name */}
              <span className="text-accent-primary font-semibold text-lg block mb-3">
                Director Nova
              </span>

              {/* Dialog text – uses a relative container with the longest paragraph for sizing */}
              <div className="relative">
                {/* Invisible longest paragraph to reserve consistent height */}
                <p
                  className="text-white text-2xl leading-relaxed whitespace-pre-wrap invisible"
                  aria-hidden="true"
                >
                  {paragraphs.reduce((a, b) => a.length > b.length ? a : b, '')}
                </p>
                {/* Actual visible typewriter text layered on top */}
                <div className="absolute top-0 left-0 right-0">
                  <TypewriterText
                    ref={typewriterRef}
                    key={currentParagraphIndex}
                    text={paragraphs[currentParagraphIndex] ?? ''}
                    onComplete={handleTypingComplete}
                    className="text-white text-2xl leading-relaxed whitespace-pre-wrap"
                  />
                </div>
              </div>
            </div>

            {/* Navigation – outside the speech bubble */}
            <div className="flex items-center justify-end mr-2" style={{ marginTop: '2vh' }}>
              {/* Continue button */}
              <button
                type="button"
                onClick={handleContinue}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: '1vw', padding: '0.8vh 2vw' }}
              >
                Weiter
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
