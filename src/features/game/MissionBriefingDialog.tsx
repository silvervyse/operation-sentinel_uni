import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TypewriterText } from '../onboarding/TypewriterText';
import type { TypewriterTextHandle } from '../onboarding/TypewriterText';
import { getDirectorImagePath } from '../onboarding/director';
import { loadDialog } from '../../services/dialog-service';
import { replaceCodename } from '../../utils/template-utils';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { assetPath } from '../../utils/asset-path';

const BACKGROUND_SRC = assetPath('/assets/images/Mission-briefing/Background.webp');
const LEVEL_MUSIC_SRC = assetPath('/assets/audio/Levelmusic.mp3');

export interface MissionBriefingDialogProps {
  /** Pfad zur Dialog-Markdown-Datei */
  dialogPath: string;
  /** Titel der Mission (z.B. "Operation: Passwortschutz") */
  missionTitle?: string;
  /** Hintergrundbild für den Splash-Screen */
  splashBackground?: string;
  /** Pfad zur Briefing-Markdown-Datei (wird auf dem Laptop angezeigt) */
  briefingPath?: string;
  /** Wird aufgerufen wenn der Dialog beendet ist */
  onComplete: () => void;
  /** Wird aufgerufen wenn der Spieler zurück zum Menü möchte */
  onBack: () => void;
}

/**
 * MissionBriefingDialog – Zeigt ein Mission-Briefing mit der Direktorin.
 * 
 * Phase 1 (Splash): Fullscreen mit Logo + Missionstitel (3 Sekunden, Glitch-Animation)
 * Phase 2 (Dialog): Direktorin spricht das Briefing.
 * Phase 3 (Finished): Platzhalter mit Zurück-Button.
 */
export function MissionBriefingDialog({ dialogPath, missionTitle, splashBackground, briefingPath, onComplete, onBack }: MissionBriefingDialogProps) {
  const { profile } = usePlayerProfile();
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();

  const [showSplash, setShowSplash] = useState(!!missionTitle);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const [dialogFinished, setDialogFinished] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [briefingContent, setBriefingContent] = useState('');
  const [showDialogText, setShowDialogText] = useState(false);
  const typewriterRef = useRef<TypewriterTextHandle>(null);

  const codename = profile?.codename ?? 'Agent';

  // Verzögerung: Text erst nach 1.5s anzeigen (Direktorin zuerst sichtbar)
  useEffect(() => {
    if (showSplash || dialogFinished || !dialogLoaded) return;
    setShowDialogText(false);
    const timer = setTimeout(() => setShowDialogText(true), 1500);
    return () => clearTimeout(timer);
  }, [showSplash, dialogFinished, dialogLoaded]);

  // Pose der Direktorin: lächelnd beim 1. und letzten Absatz, sonst neutral
  const getDirectorPose = () => {
    if (currentParagraphIndex === 0) return 'lächelnd';
    if (currentParagraphIndex === paragraphs.length - 1) return 'lächelnd';
    return 'neutral';
  };

  // Kein Auto-Timer mehr – Splash wird manuell beendet

  // Level-Musik während Splash abspielen
  const musicRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!showSplash) {
      // Splash beendet → Musik stoppen
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current.currentTime = 0;
        musicRef.current = null;
      }
      return;
    }
    // Splash aktiv → Musik starten
    const audio = new Audio(LEVEL_MUSIC_SRC);
    audio.loop = true;
    audio.volume = volume;
    musicRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSplash]);

  // Sync volume to level music
  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    loadDialog(dialogPath)
      .then((result) => {
        const replaced = result.map(p => replaceCodename(p, codename));
        setParagraphs(replaced);
        setDialogLoaded(true);
      })
      .catch(() => {
        setParagraphs([`Agent ${codename}, dein nächster Einsatz wartet.`]);
        setDialogLoaded(true);
      });
  }, [dialogPath, codename]);

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
      setDialogFinished(true);
      if (briefingPath) {
        setShowBriefing(true);
      }
    }
  };

  // Briefing-Text laden
  useEffect(() => {
    if (!briefingPath) return;
    fetch(briefingPath)
      .then(r => r.ok ? r.text() : '')
      .then(text => setBriefingContent(replaceCodename(text, codename)))
      .catch(() => setBriefingContent(''));
  }, [briefingPath, codename]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              backgroundImage: splashBackground ? `url('${splashBackground}')` : undefined,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundColor: splashBackground ? undefined : '#0a0e1a',
            }}
          >
            {/* Container mit transparentem Rahmen */}
            <div
              className="flex flex-col items-center rounded-2xl bg-black/50 backdrop-blur-sm border border-accent-primary/30 shadow-[0_0_30px_rgba(0,212,255,0.1)]"
              style={{ padding: 'clamp(2rem, 4vh, 4rem) clamp(2rem, 5vw, 6rem)' }}
            >
              {/* Logo */}
              <motion.img
                src={assetPath("/assets/images/Logo.webp")}
                alt="Operation Sentinel"
                className="mb-6"
                style={{ width: 'clamp(60px, 8vw, 120px)' }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              />

              {/* Missionstitel mit endlosem Glitch-Effekt */}
              <motion.h1
                className="font-display text-accent-primary tracking-wider text-center"
                style={{ fontSize: 'clamp(24px, 3.5vw, 60px)' }}
                animate={{
                  opacity: [1, 0.8, 1, 0.9, 1],
                  x: [0, -2, 3, -1, 0],
                  filter: [
                    'brightness(1) hue-rotate(0deg)',
                    'brightness(1.3) hue-rotate(15deg)',
                    'brightness(0.9) hue-rotate(-10deg)',
                    'brightness(1.2) hue-rotate(5deg)',
                    'brightness(1) hue-rotate(0deg)',
                  ],
                }}
                transition={{
                  duration: 2.0,
                  ease: 'easeInOut',
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
              >
                {missionTitle}
              </motion.h1>

              {/* Button: Mission starten */}
              <motion.button
                type="button"
                onClick={() => { playClick(); setShowSplash(false); }}
                onMouseEnter={playHover}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', padding: '0.8em 2em', marginTop: '5vh' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                Mission starten
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background */}
      <img
        src={BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Zurück-Button unten links */}
      <button
        type="button"
        onClick={() => { playClick(); onBack(); }}
        onMouseEnter={playHover}
        className="fixed bottom-6 left-6 z-[60] flex items-center gap-2 font-semibold rounded-lg bg-black/60 backdrop-blur-sm border border-accent-primary/30 text-text-secondary hover:bg-black/70 hover:text-text-primary hover:border-accent-primary/50 transition-colors duration-200"
        style={{ fontSize: 'clamp(12px, 1.1vw, 18px)', padding: '0.7em 1.4em' }}
      >
        ← Hauptmenü
      </button>

      {/* Volume Control */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>

      {/* Dialog Phase */}
      <AnimatePresence>
        {!dialogFinished && dialogLoaded && (
          <motion.div
            className="absolute inset-0 z-10"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Director Nova – dynamische Pose */}
            <div className="absolute bottom-0 left-[12%] max-w-[40%] h-full flex items-end">
              <AnimatePresence mode="wait">
                <motion.img
                  key={getDirectorPose()}
                  src={getDirectorImagePath(getDirectorPose())}
                  alt="Director Nova"
                  className="max-h-[85%] w-auto object-contain"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>

            {/* Dialog box – nur wenn showDialogText */}
            {showDialogText && (
            <div className="absolute left-[38%] right-[27%] bottom-[2%] max-h-[45%] overflow-y-auto">
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
                      soundSrc={assetPath("/assets/audio/typing.mp3")}
                    />
                  </div>
                </div>
              </div>

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
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Briefing-Phase: Laptop mit scrollbarem Text */}
      {showBriefing && (
        <motion.div
          className="absolute inset-0 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            backgroundImage: `url(${assetPath('/assets/images/Mission-briefing/Briefing.webp')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Scrollbarer Briefing-Text im "Laptop-Fenster" */}
          <div
            className="absolute overflow-y-auto"
            style={{
              top: '18%',
              left: '20%',
              right: '28%',
              bottom: '30%',
              padding: 'clamp(1rem, 2vw, 2.5rem)',
            }}
          >
            <div
              className="text-text-primary"
              style={{ fontSize: 'clamp(12px, 1vw, 18px)', lineHeight: 1.7, padding: 'clamp(1rem, 2vw, 2.5rem)' }}
            >
              <BriefingMarkdown content={briefingContent} />
            </div>
          </div>

          {/* Mission starten Button */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              type="button"
              onClick={() => { playClick(); onComplete(); }}
              onMouseEnter={playHover}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
              style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', padding: '0.8em 2em' }}
            >
              Mission starten
            </button>
          </div>
        </motion.div>
      )}

      {/* Fallback wenn kein Briefing: Platzhalter */}
      {dialogFinished && !showBriefing && (
        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2
              className="font-display text-accent-primary tracking-wide text-center"
              style={{ fontSize: 'clamp(18px, 2vw, 36px)' }}
            >
              Mission wird vorbereitet...
            </h2>
            <p className="text-text-secondary text-center" style={{ fontSize: 'clamp(12px, 1.1vw, 20px)' }}>
              Dieses Level ist noch in Entwicklung.
            </p>

            <div className="flex flex-col items-center gap-3" style={{ marginTop: '3vh', width: 'clamp(200px, 20vw, 320px)' }}>
              <button
                type="button"
                onClick={() => { playClick(); onBack(); }}
                onMouseEnter={playHover}
                className="w-full font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
              >
                Zurück zum Hauptmenü
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Agenten-Briefing Markdown-Renderer */
function BriefingMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="font-display text-accent-primary tracking-wider uppercase mb-4 mt-2 border-b border-accent-primary/30 pb-2" style={{ fontSize: 'clamp(16px, 1.6vw, 28px)' }}>
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-accent-primary font-bold tracking-wide uppercase mt-6 mb-2" style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', letterSpacing: '0.08em' }}>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-5 mb-1.5 text-text-primary/90 list-none before:content-['▸'] before:text-accent-primary before:mr-2">
          {trimmed.slice(2)}
        </li>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={i} className="font-bold text-accent-primary/90 mt-4 mb-2 italic">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="mb-2 text-text-primary/85 leading-relaxed">
          {trimmed}
        </p>
      );
    }
  }

  return <>{elements}</>;
}
