import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TypewriterText } from './TypewriterText';
import type { TypewriterTextHandle } from './TypewriterText';
import { getDirectorImagePath } from './director';
import { loadDialog } from '../../services/dialog-service';
import { replaceCodename } from '../../utils/template-utils';
import { useAudio } from '../../hooks/useAudio';
import { assetPath } from '../../utils/asset-path';

const BACKGROUND_SRC = assetPath('/assets/images/Badge-Ceremony/Background.webp');
const BADGE_SRC = assetPath('/assets/images/Badges/Rekrut.webp');

export interface BadgeCeremonyScreenProps {
  codename: string;
  onGoToAgentFile: () => void;
  onGoToMission: () => void;
  onGoToMenu: () => void;
}

/**
 * BadgeCeremonyScreen – Wird nach der Charakterauswahl/Bestätigung gezeigt.
 *
 * Phase 1: Direktorin (lobend) spricht den Dialog aus Badgeceremony1.md.
 * Phase 2: Badge-Overlay mit "Ausgezeichnet! Rang: Rekrut erhalten" + 3 Buttons.
 */
export function BadgeCeremonyScreen({
  codename,
  onGoToAgentFile,
  onGoToMission,
  onGoToMenu,
}: BadgeCeremonyScreenProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });

  const [phase, setPhase] = useState<'dialog' | 'badge'>('dialog');
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const typewriterRef = useRef<TypewriterTextHandle>(null);

  // Load dialog
  useEffect(() => {
    loadDialog(assetPath('/assets/dialogs/Badgeceremony1.md'))
      .then((result) => {
        const replaced = result.map(p => replaceCodename(p, codename));
        setParagraphs(replaced);
        setDialogLoaded(true);
      })
      .catch(() => {
        setParagraphs([`Ausgezeichnet, ${codename}! Ich verleihe dir den Rang Rekrut.`]);
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
      // Dialog fertig → Badge-Overlay anzeigen
      setPhase('badge');
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Background */}
      <img
        src={BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dialog Phase */}
      <AnimatePresence>
        {phase === 'dialog' && dialogLoaded && (
          <motion.div
            className="absolute inset-0 z-10"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Director Nova – lobend */}
            <div className="absolute bottom-0 left-8 max-w-[40%] h-full flex items-end">
              <img
                src={getDirectorImagePath('lobend')}
                alt="Director Nova"
                className="max-h-[85%] w-auto object-contain"
              />
            </div>

            {/* Dialog box */}
            <div className="absolute left-[38%] right-[27%] bottom-[2%] max-h-[45%] overflow-y-auto">
              <div
                className="bg-black/75 backdrop-blur-sm border border-accent-primary/30 rounded-2xl shadow-[0_0_20px_rgba(0,212,255,0.15)]"
                style={{ padding: '2.5rem 3.5rem 2rem' }}
              >
                <span className="text-accent-primary font-semibold text-lg block mb-3">
                  Director Nova
                </span>

                <div className="relative">
                  {/* Invisible longest paragraph for height reservation */}
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
                  onMouseEnter={playHover}
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

      {/* Badge Overlay Phase */}
      {phase === 'badge' && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Dunkler Overlay */}
          <div className="absolute inset-0 bg-black/80" />

          {/* Badge Content */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Badge Bild */}
            <motion.img
              src={BADGE_SRC}
              alt="Badge: Rekrut"
              style={{ width: 'clamp(240px, 30vw, 500px)' }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, type: 'spring', bounce: 0.4 }}
            />

            {/* Text */}
            <div className="text-center">
              <h2
                className="font-display text-accent-primary tracking-wide"
                style={{ fontSize: 'clamp(20px, 2.5vw, 44px)' }}
              >
                Ausgezeichnet!
              </h2>
              <p
                className="text-text-primary mt-2"
                style={{ fontSize: 'clamp(14px, 1.4vw, 26px)' }}
              >
                Rang: <span className="text-accent-primary font-bold">Rekrut</span> erhalten
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col items-center gap-3" style={{ marginTop: '3vh', width: 'clamp(200px, 20vw, 320px)' }}>
              <button
                type="button"
                onClick={() => { playClick(); onGoToAgentFile(); }}
                onMouseEnter={playHover}
                className="w-full font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
              >
                Zur Agentenakte
              </button>
              <button
                type="button"
                onClick={() => { playClick(); onGoToMission(); }}
                onMouseEnter={playHover}
                className="w-full font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
              >
                Zur ersten Mission
              </button>
              <button
                type="button"
                onClick={() => { playClick(); onGoToMenu(); }}
                onMouseEnter={playHover}
                className="w-full font-semibold rounded-lg bg-transparent border-2 border-text-secondary/40 text-text-secondary hover:bg-text-secondary/10 hover:border-text-secondary/60 transition-colors duration-200"
                style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
              >
                Zum Hauptmenü
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
