import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { TypewriterText } from '../onboarding/TypewriterText';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { getCharacterImagePath } from '../onboarding/characters';
import { assetPath } from '../../utils/asset-path';

type TutorialView = 'desk' | 'laptop' | 'akte';
type ZoomTarget = 'laptop' | 'akte' | null;

/** Einfacher Hook für Hover/Click-Sounds */
function useUISounds() {
  const { volume } = useVolume();
  const hoverRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);

  const playHover = useCallback(() => {
    if (!hoverRef.current) hoverRef.current = new Audio(assetPath('/assets/audio/Hover.mp3'));
    hoverRef.current.volume = volume;
    hoverRef.current.currentTime = 0;
    hoverRef.current.play().catch(() => {});
  }, [volume]);

  const playClick = useCallback(() => {
    if (!clickRef.current) clickRef.current = new Audio(assetPath('/assets/audio/Click.mp3'));
    clickRef.current.volume = volume;
    clickRef.current.currentTime = 0;
    clickRef.current.play().catch(() => {});
  }, [volume]);

  return { playHover, playClick };
}

/**
 * Tutorial-Level für Mission 1: Operation Codebreaker
 * 
 * Zeigt einen Schreibtisch mit klickbarem Laptop (links) und Akte (rechts).
 * Bei Klick auf Laptop → Zoom-Animation auf Laptop → Laptop-Zoom-Ansicht
 * Bei Klick auf Akte → Zoom-Animation auf Akte → Akte aufgeschlagen
 * Jeweils mit Zurück-Button zur Schreibtisch-Ansicht.
 */
export function MissionTutorial({ onComplete, onSolved }: { onComplete?: () => void; onSolved?: () => void }) {
  const [view, setView] = useState<TutorialView>('desk');
  const [zoomTarget, setZoomTarget] = useState<ZoomTarget>(null);
  const [isZooming, setIsZooming] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [laptopVisited, setLaptopVisited] = useState(false);
  const [akteVisited, setAkteVisited] = useState(false);

  // Laptop-Passwort State — auf Parent-Ebene, damit er beim View-Wechsel erhalten bleibt
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [solved, setSolved] = useState(false);
  const [hintAnimationDone, setHintAnimationDone] = useState({ hint1Intro: false, hint1Detail: false, hint2Intro: false, hint2Detail: false });

  // Lautstärke (kein Musik-Start hier — läuft im Mission1Flow)
  const { volume, setVolume } = useVolume();

  const handleZoomTo = useCallback((target: 'laptop' | 'akte') => {
    if (isZooming) return;
    setIsZooming(true);
    setZoomTarget(target);
    // Nach der Zoom-Animation den View wechseln
    setTimeout(() => {
      setView(target);
      setIsZooming(false);
      setZoomTarget(null);
    }, 350);
  }, [isZooming]);

  const handleBack = useCallback(() => {
    setView('desk');
  }, []);

  // Zoom-Transform-Werte basierend auf Ziel
  const getZoomTransform = () => {
    if (zoomTarget === 'laptop') {
      return { scale: 3, x: '15%', y: '-10%' };
    }
    if (zoomTarget === 'akte') {
      return { scale: 3.5, x: '-30%', y: '-25%' };
    }
    return { scale: 1, x: '0%', y: '0%' };
  };

  const zoomTransform = getZoomTransform();

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      <AnimatePresence mode="popLayout">
        {view === 'desk' && (
          <motion.div
            key="desk"
            initial={{ opacity: 0 }}
            animate={{
              opacity: isZooming ? 0 : 1,
              scale: isZooming ? zoomTransform.scale : 1,
              x: isZooming ? zoomTransform.x : '0%',
              y: isZooming ? zoomTransform.y : '0%',
            }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{
              duration: isZooming ? 0.35 : 0.25,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-0 origin-center"
          >
            <DeskView
              onOpenLaptop={() => { setLaptopVisited(true); handleZoomTo('laptop'); }}
              onOpenAkte={() => { setAkteVisited(true); handleZoomTo('akte'); }}
              introComplete={introComplete}
              onIntroComplete={() => setIntroComplete(true)}
              laptopVisited={laptopVisited}
              akteVisited={akteVisited}
            />
          </motion.div>
        )}

        {view === 'laptop' && (
          <motion.div
            key="laptop"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute inset-0"
          >
            <LaptopView
              onBack={handleBack}
              onComplete={onComplete}
              onSolved={onSolved}
              attempts={attempts}
              setAttempts={setAttempts}
              showHint={showHint}
              setShowHint={setShowHint}
              showHint2={showHint2}
              setShowHint2={setShowHint2}
              solved={solved}
              setSolved={setSolved}
              hintAnimationDone={hintAnimationDone}
              setHintAnimationDone={setHintAnimationDone}
            />
          </motion.div>
        )}

        {view === 'akte' && (
          <motion.div
            key="akte"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="absolute inset-0"
          >
            <AkteView onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lautstärkeregler */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}

// === Schreibtisch-Ansicht ===

interface DeskViewProps {
  onOpenLaptop: () => void;
  onOpenAkte: () => void;
  introComplete: boolean;
  onIntroComplete: () => void;
  laptopVisited: boolean;
  akteVisited: boolean;
}

const INTRO_DIALOG_PATH = assetPath('/assets/dialogs/Mission1/Tutorial.md');

function DeskView({ onOpenLaptop, onOpenAkte, introComplete, onIntroComplete, laptopVisited, akteVisited }: DeskViewProps) {
  const { playHover, playClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const [introParagraphs, setIntroParagraphs] = useState<string[]>([]);
  const [introParagraph, setIntroParagraph] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [introAllDone, setIntroAllDone] = useState(introComplete);
  const [dialogLoaded, setDialogLoaded] = useState(false);
  const [textReady, setTextReady] = useState(false);
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  // Dialog-Text aus MD laden
  useEffect(() => {
    if (introComplete) { setDialogLoaded(true); setTextReady(true); return; }
    fetch(INTRO_DIALOG_PATH)
      .then(r => r.ok ? r.text() : '')
      .then(text => {
        const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
        setIntroParagraphs(paragraphs);
        setDialogLoaded(true);
        // Text erst starten wenn Box-Animation fertig (1.2s delay + 0.4s duration)
        setTimeout(() => setTextReady(true), 1600);
      })
      .catch(() => { setIntroAllDone(true); onIntroComplete(); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleIntroContinue = () => {
    if (isTyping) {
      typewriterRef.current?.skip();
      return;
    }
    if (introParagraph < introParagraphs.length - 1) {
      playClick();
      setIntroParagraph(introParagraph + 1);
      setIsTyping(true);
    } else {
      playClick();
      setIntroAllDone(true);
      onIntroComplete();
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Schreibtisch-Hintergrund */}
      <img
        src={assetPath("/assets/images/Mission1/Hintergründe/Schreibtisch.webp")}
        alt="Schreibtisch"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Klickbarer Laptop (linke Seite) */}
      <button
        type="button"
        onClick={() => { if (!introAllDone) return; playClick(); onOpenLaptop(); }}
        onMouseEnter={() => { if (introAllDone) playHover(); }}
        className={`absolute left-[14%] top-[33%] w-[40%] h-[65%] group ${introAllDone ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label="Laptop öffnen"
        disabled={!introAllDone}
      >
        <img
          src={assetPath("/assets/images/Mission1/Laptops/Laptop-Turotial.webp")}
          alt="Laptop"
          className={`w-full h-full object-contain drop-shadow-lg transition-all duration-200 ${introAllDone ? 'group-hover:scale-[1.02]' : ''} ${introAllDone && !laptopVisited ? 'animate-[glow-pulse_2s_ease-in-out_infinite]' : ''}`}
        />
      </button>

      {/* Klickbare Akte (rechte Seite) */}
      <button
        type="button"
        onClick={() => { if (!introAllDone) return; playClick(); onOpenAkte(); }}
        onMouseEnter={() => { if (introAllDone) playHover(); }}
        className={`absolute right-[22%] top-[49%] w-[30%] h-[55%] group ${introAllDone ? 'cursor-pointer' : 'cursor-default'}`}
        aria-label="Akte öffnen"
        disabled={!introAllDone}
      >
        <img
          src={assetPath("/assets/images/Mission1/Akten/Akte-Tisch.webp")}
          alt="Akte"
          className={`w-full h-full object-contain drop-shadow-lg transition-all duration-200 ${introAllDone ? 'group-hover:scale-[1.02]' : ''} ${introAllDone && !akteVisited ? 'animate-[glow-pulse_2s_ease-in-out_infinite_0.5s]' : ''}`}
        />
      </button>

      {/* Intro-Dialog Overlay */}
      <AnimatePresence>
        {!introAllDone && dialogLoaded && introParagraphs.length > 0 && (
          <motion.div
            key="intro-overlay"
            className="absolute inset-0 z-30 flex bg-black/50"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
          {/* Charakter rechts unten — slided rein */}
          {profile && (
            <motion.img
              src={getCharacterImagePath(profile.selectedCharacter, 'tutorial')}
              alt="Agent"
              className="absolute bottom-[-28%] right-[3vw] object-contain z-10"
              style={{ height: '105vh' }}
              initial={{ opacity: 0, x: '30%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {/* Textbox oben links neben dem Kopf — erscheint verzögert */}
          <motion.div
            className="absolute top-[20vh] left-[40vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
            style={{ width: 'clamp(400px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="min-h-[7rem]">
              {profile && (
                <p className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2">
                  Agent {profile.codename}
                </p>
              )}
              <TypewriterText
                ref={typewriterRef}
                key={textReady ? introParagraph : 'waiting'}
                text={textReady ? (introParagraphs[introParagraph] ?? '') : ''}
                speed={20}
                className="text-text-primary text-xl leading-relaxed"
                highlight={introParagraph === 1 ? ['Gerät', 'Ermittlungsakte'] : undefined}
                onComplete={() => setIsTyping(false)}
              />
            </div>
          </motion.div>

          {/* Weiter-Button unter der Textbox */}
          <motion.div
            className="absolute left-[40vw] flex justify-end z-20"
            style={{ width: 'clamp(400px, 40vw, 650px)', top: 'calc(20vh + 17rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1.4 }}
          >
            <button
              type="button"
              onClick={handleIntroContinue}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
              style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
            >
              Weiter
            </button>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// === Laptop-Zoom-Ansicht ===

interface HintAnimationState {
  hint1Intro: boolean;
  hint1Detail: boolean;
  hint2Intro: boolean;
  hint2Detail: boolean;
}

// === Learning-Dialog Typewriter ===

const LEARNING_PARAGRAPHS = [
  'Wow – das ging schneller als gedacht. Ein Haustiername kombiniert mit einem Geburtsjahr war alles, was nötig war. Ein paar Informationen aus den sozialen Medien haben gereicht, um das Passwort zu erraten.',
  'Bewertung: Sehr unsicher!',
  'Leider verwenden viele Menschen persönliche Daten, die leicht herauszufinden sind. Das könnte auch sein:\n• Vor- und Nachname\n• Namen von Haustieren oder Kindern\n• Geburtsdaten\n• Lieblingsvereine oder Lieblingsbands',
  'Ich merke mir also: Ein sicheres Passwort sollte keine persönlichen Informationen enthalten.',
];

function LearningTypewriter({ onComplete, startReady }: { onComplete: () => void; startReady: boolean }) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const { playClick } = useUISounds();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  const handleParagraphComplete = () => {
    // Nur als fertig markieren wenn tatsächlich Text getippt wurde
    if (!startReady) return;
    setIsTyping(false);
    if (paragraphIndex >= LEARNING_PARAGRAPHS.length - 1) {
      setAllDone(true);
      onComplete();
    }
  };

  // Exposed via window for external button
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__learningContinue = () => {
      if (!startReady) return;
      if (isTyping) {
        typewriterRef.current?.skip();
        return;
      }
      if (!allDone && paragraphIndex < LEARNING_PARAGRAPHS.length - 1) {
        playClick();
        setParagraphIndex(paragraphIndex + 1);
        setIsTyping(true);
      }
    };
    return () => { delete (window as unknown as Record<string, unknown>).__learningContinue; };
  });

  return (
    <div className="min-h-[8rem]">
      <TypewriterText
        ref={typewriterRef}
        key={startReady ? paragraphIndex : 'waiting'}
        text={startReady ? LEARNING_PARAGRAPHS[paragraphIndex] : ''}
        speed={20}
        className="text-text-primary text-xl leading-relaxed whitespace-pre-wrap"
        onComplete={handleParagraphComplete}
      />
    </div>
  );
}

function LearningContinueButton() {
  return (
    <button
      type="button"
      onClick={() => { (window as unknown as Record<string, () => void>).__learningContinue?.(); }}
      className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
      style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
    >
      Weiter
    </button>
  );
}

interface LaptopViewProps {
  onBack: () => void;
  onComplete?: () => void;
  onSolved?: () => void;
  attempts: number;
  setAttempts: (v: number) => void;
  showHint: boolean;
  setShowHint: (v: boolean) => void;
  showHint2: boolean;
  setShowHint2: (v: boolean) => void;
  solved: boolean;
  setSolved: (v: boolean) => void;
  hintAnimationDone: HintAnimationState;
  setHintAnimationDone: (v: HintAnimationState) => void;
}

function LaptopView({ onBack, onComplete, onSolved, attempts, setAttempts, showHint, setShowHint, showHint2, setShowHint2, solved, setSolved, hintAnimationDone, setHintAnimationDone }: LaptopViewProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hint1IntroComplete, setHint1IntroComplete] = useState(hintAnimationDone.hint1Intro);
  const [hint1DetailComplete, setHint1DetailComplete] = useState(hintAnimationDone.hint1Detail);
  const [hint2IntroComplete, setHint2IntroComplete] = useState(hintAnimationDone.hint2Intro);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [learningDone, setLearningDone] = useState(false);
  const [learningTextReady, setLearningTextReady] = useState(false);

  const { volume } = useVolume();
  const { playHover, playClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const buzzAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  const CORRECT_PASSWORD = 'Simba1996';

  const playBuzz = useCallback(() => {
    if (!buzzAudioRef.current) {
      buzzAudioRef.current = new Audio(assetPath('/assets/audio/warningbuzz.mp3'));
    }
    buzzAudioRef.current.volume = volume;
    buzzAudioRef.current.currentTime = 0;
    buzzAudioRef.current.play().catch(() => {});
  }, [volume]);

  const playCorrect = useCallback(() => {
    if (!correctAudioRef.current) {
      correctAudioRef.current = new Audio(assetPath('/assets/audio/correct.mp3'));
    }
    correctAudioRef.current.volume = volume;
    correctAudioRef.current.currentTime = 0;
    correctAudioRef.current.play().catch(() => {});
  }, [volume]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solved) return;

    if (password === CORRECT_PASSWORD) {
      setSolved(true);
      setError(null);
      playCorrect();
      onSolved?.();
      // Nach kurzer Verzögerung Dateiexplorer zeigen
      setTimeout(() => {
        setShowFileExplorer(true);
      }, 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Falsches Passwort. Versuche es erneut.');
      playBuzz();
      if (newAttempts >= 3) {
        setShowHint(true);
      }
      if (newAttempts >= 6) {
        setShowHint2(true);
      }
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Laptop-Zoom-Hintergrund */}
      <img
        src={assetPath("/assets/images/Mission1/Hintergründe/Laptop-zoom.webp")}
        alt="Laptop Nahansicht"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Passwort-Eingabe in der Mitte */}
      <div className="absolute inset-0 flex flex-col items-center justify-start z-10 gap-4" style={{ paddingTop: '24vh' }}>

        {/* Dauerhafter Hinweis: Passwortlänge */}
        <div
          className="flex items-center gap-3 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10"
          style={{ padding: '0.5rem 1rem', width: 'clamp(350px, 35vw, 550px)' }}
        >
          <img
            src={assetPath("/assets/images/Direktor Nova/Geheimdienstchefin_lächelnd.webp")}
            alt="Direktor Nova"
            className="w-8 h-8 rounded-full object-cover object-top flex-shrink-0 opacity-80"
          />
          <p className="text-text-secondary text-base leading-snug">
            <span className="text-text-primary/70 font-medium">Direktor Nova:</span>{' '}
            Unsere Spezialisten konnten herausfinden, dass das Passwort aus <span className="text-text-primary font-semibold">{CORRECT_PASSWORD.length} Zeichen</span> besteht.
          </p>
        </div>

        <div
          className="rounded-2xl bg-black/40 border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] backdrop-blur-sm"
          style={{ padding: '3rem 4rem', width: 'clamp(350px, 35vw, 550px)' }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col items-center">
            <h2
              className="font-display text-accent-primary text-center tracking-wide leading-heading"
              style={{ fontSize: 'clamp(16px, 1.5vw, 26px)', marginBottom: '2rem' }}
            >
              Passwort eingeben
            </h2>

            <div className="w-full flex flex-col" style={{ gap: '1rem' }}>
              <input
                id="password-input"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={solved}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                placeholder="••••••••"
                className="w-full rounded-lg bg-bg-primary border-2 border-accent-primary/50 text-text-primary text-center font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all duration-200"
                style={{ fontSize: 'clamp(16px, 1.3vw, 24px)', padding: '1.2vh 1.5vw' }}
              />

              {/* Zeichenzähler */}
              <p className="text-text-secondary/60 text-sm text-right font-mono">
                {password.length} Zeichen
              </p>

              {/* Fehlermeldung */}
              {error && !solved && (
                <motion.p
                  key={attempts}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-danger text-center font-medium"
                  style={{ fontSize: 'clamp(12px, 0.9vw, 16px)' }}
                >
                  {error}
                </motion.p>
              )}



              {/* Erfolgsmeldung */}
              {solved && (
                <div className="p-3 rounded-lg bg-accent-secondary/10 border border-accent-secondary/30">
                  <p
                    className="text-accent-secondary text-center font-medium"
                    style={{ fontSize: 'clamp(12px, 0.9vw, 16px)' }}
                  >
                    Zugang gewährt. Dateien werden entschlüsselt<span className="inline-flex w-6"><motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}>...</motion.span></span>
                  </p>
                </div>
              )}
            </div>
            {/* Submit-Button */}
            <button
              type="submit"
              disabled={solved || !password}
              className={`w-full font-semibold rounded-lg border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200 ${solved ? 'bg-accent-secondary/20 border-accent-secondary text-accent-secondary' : 'bg-accent-primary/10'} disabled:opacity-50 disabled:cursor-not-allowed`}
              style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', padding: '0.8em 2em', marginTop: '1.5rem' }}
            >
              {solved ? '✓ Zugang gewährt' : 'Entsperren'}
            </button>
          </form>
        </div>

        {/* Hinweis-Notification von Direktor Nova nach 3 Fehlversuchen */}
        {showHint && !solved && (
          <div
            className="relative flex items-start rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] overflow-visible"
            style={{ padding: '1rem 1.2rem', width: 'clamp(350px, 35vw, 550px)', paddingLeft: '8rem', minHeight: showHint2 ? '11rem' : '7rem' }}
          >
            {/* Portrait Direktor Nova — absolut links positioniert */}
            <img
              src={assetPath("/assets/images/Direktor Nova/Geheimdienstchefin_lächelnd.webp")}
              alt="Direktor Nova"
              className="absolute bottom-0 left-0 w-36 h-36 object-cover object-top"
              style={{ marginLeft: '-2.5rem' }}
            />
            {/* Nachricht */}
            <div className="flex flex-col gap-0">
              <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-1">
                Direktor Nova
              </span>

              {/* Hinweis 1 */}
              {hintAnimationDone.hint1Detail ? (
                <>
                  <p className="text-text-primary text-base leading-relaxed">Wir konnten einen weiteren Hinweis sichern:</p>
                  <p className="text-warning font-medium text-base leading-relaxed">Das Passwort hat 9 Zeichen und besteht aus Buchstaben und Zahlen.</p>
                </>
              ) : (
                <>
                  <TypewriterText
                    key="hint1-intro"
                    text="Wir konnten einen weiteren Hinweis sichern:"
                    speed={25}
                    className="text-text-primary text-base leading-relaxed"
                    onComplete={() => { setHint1IntroComplete(true); setHintAnimationDone({ ...hintAnimationDone, hint1Intro: true }); }}
                  />
                  {hint1IntroComplete && (
                    <TypewriterText
                      key="hint1-detail"
                      text="Das Passwort hat 9 Zeichen und besteht aus Buchstaben und Zahlen."
                      speed={25}
                      className="text-warning font-medium text-base leading-relaxed"
                      onComplete={() => { setHint1DetailComplete(true); setHintAnimationDone({ ...hintAnimationDone, hint1Intro: true, hint1Detail: true }); }}
                    />
                  )}
                </>
              )}

              {/* Hinweis 2 */}
              {showHint2 && (
                hintAnimationDone.hint2Detail ? (
                  <>
                    <p className="text-text-primary text-base leading-relaxed mt-2">Außerdem haben wir gerade herausgefunden:</p>
                    <p className="text-warning font-medium text-base leading-relaxed">Es setzt sich wie folgt zusammen: Hundename + Geburtsjahr.</p>
                  </>
                ) : hint1DetailComplete ? (
                  <>
                    <TypewriterText
                      key="hint2-intro"
                      text="Außerdem haben wir gerade herausgefunden:"
                      speed={25}
                      className="text-text-primary text-base leading-relaxed mt-2"
                      onComplete={() => { setHint2IntroComplete(true); setHintAnimationDone({ ...hintAnimationDone, hint1Intro: true, hint1Detail: true, hint2Intro: true }); }}
                    />
                    {hint2IntroComplete && (
                      <TypewriterText
                        key="hint2-detail"
                        text="Es setzt sich wie folgt zusammen: Hundename + Geburtsjahr."
                        speed={25}
                        className="text-warning font-medium text-base leading-relaxed"
                        onComplete={() => { setHintAnimationDone({ ...hintAnimationDone, hint1Intro: true, hint1Detail: true, hint2Intro: true, hint2Detail: true }); }}
                      />
                    )}
                  </>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dateiexplorer nach erfolgreichem Login */}
      <AnimatePresence>
        {showFileExplorer && (
          <motion.div
            key="file-explorer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            {/* Laptop-Hintergrund bleibt sichtbar, Explorer als Overlay */}
            <div
              className="rounded-xl bg-[#1a1f2e] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col"
              style={{ width: 'clamp(500px, 55vw, 800px)', height: 'clamp(380px, 50vh, 600px)' }}
            >
              {/* Titelleiste */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5 rounded-t-xl">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-text-secondary text-xs ml-2 font-mono">Dateien — /verschlüsselt/</span>
              </div>

              {/* Datei-Inhalt */}
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 border border-white/10 hover:border-accent-primary/40 transition-colors duration-200 cursor-default">
                  {/* Datei-Icon */}
                  <div className="w-16 h-20 bg-accent-primary/20 border-2 border-accent-primary/50 rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.2)]">
                    <span className="text-accent-primary text-xs font-mono font-bold">PDF</span>
                  </div>
                  <span className="text-text-primary text-sm font-medium">Geheime_Akte_X7.pdf</span>
                  <span className="text-text-secondary text-xs">2.4 MB — Verschlüsselt</span>
                </div>

                <button
                  type="button"
                  onClick={() => { playClick(); setShowLearning(true); setTimeout(() => setLearningTextReady(true), 1200); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', padding: '0.8em 2.5em' }}
                >
                  Datei sichern
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Learning-Dialog nach "Datei sichern" */}
      <AnimatePresence>
        {showLearning && (
          <motion.div
            key="learning-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex bg-black/70 backdrop-blur-sm"
          >
            {/* Charakter-Bild — links unten, slidet rein */}
            {profile && (
              <motion.img
                src={getCharacterImagePath(profile.selectedCharacter, 'tutorial')}
                alt="Agent"
                className="absolute bottom-0 left-[12vw] object-contain flex-shrink-0 z-10 -scale-x-100"
                style={{ height: '75vh' }}
                initial={{ opacity: 0, x: '-20%' }}
                animate={{ opacity: 1, x: '0%' }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              />
            )}

            {/* Textbox — mittig, erscheint verzögert */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[38vw] flex flex-col gap-4 rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)]"
              style={{ width: 'clamp(400px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <LearningTypewriter onComplete={() => setLearningDone(true)} startReady={learningTextReady} />
            </motion.div>

            {/* Buttons — unter der Textbox */}
            <motion.div
              className="absolute left-[38vw] flex justify-end"
              style={{ width: 'clamp(400px, 40vw, 650px)', bottom: 'clamp(2rem, 12vh, 5rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              {!learningDone && (
                <LearningContinueButton />
              )}
              {learningDone && (
                <button
                  type="button"
                  onClick={() => { playClick(); onComplete?.(); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                >
                  Verstanden – Nächster Laptop
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zurück-Button */}
      {!solved && (
      <div className="absolute top-10 left-6 z-10">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          onMouseEnter={playHover}
          className="flex items-center gap-4 font-semibold rounded-lg bg-bg-primary/85 backdrop-blur-sm border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-bg-primary/95 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
          style={{ fontSize: 'clamp(14px, 1.4vw, 22px)', padding: '0.8em 2em' }}
        >
          <ArrowLeft size={28} />
          Zurück zum Schreibtisch
        </button>
      </div>
      )}
    </div>
  );
}

// === Akte-Ansicht ===

interface AkteViewProps {
  onBack: () => void;
}

const AKTE_PAGES = [
  assetPath('/assets/images/Mission1/Akten/Tutorial/Seite1.webp'),
  assetPath('/assets/images/Mission1/Akten/Tutorial/Seite2.webp'),
  assetPath('/assets/images/Mission1/Akten/Tutorial/Seite3.webp'),
];

function AkteView({ onBack }: AkteViewProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const { volume } = useVolume();
  const { playHover, playClick } = useUISounds();
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  const playFlipSound = useCallback(() => {
    if (!flipAudioRef.current) {
      flipAudioRef.current = new Audio(assetPath('/assets/audio/blättern.mp3'));
    }
    flipAudioRef.current.volume = volume;
    flipAudioRef.current.currentTime = 0.8;
    flipAudioRef.current.playbackRate = 1.5;
    flipAudioRef.current.play().catch(() => {});
  }, [volume]);

  const goNext = () => {
    if (pageIndex < AKTE_PAGES.length - 1) {
      setPageIndex(pageIndex + 1);
      playFlipSound();
    }
  };

  const goPrev = () => {
    if (pageIndex > 0) {
      setPageIndex(pageIndex - 1);
      playFlipSound();
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useState(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  return (
    <div className="relative w-full h-full">
      {/* Seiten — z-0, liegen HINTER dem Akte-Rahmen */}
      <div className="absolute z-0 flex items-center justify-center" style={{ width: '42%', height: '103.5%', top: '0%', right: '11.2%' }}>
        <div className="relative w-full h-full overflow-hidden rounded-sm">
          {/* Nur die aktive Seite wird angezeigt */}
          <img
            src={AKTE_PAGES[pageIndex]}
            alt={`Akte Seite ${pageIndex + 1}`}
            className="absolute inset-0 w-full h-full object-fill"
            draggable={false}
          />
        </div>
      </div>

      {/* Akte aufgeschlagen — z-10, liegt ÜBER den Seiten (PNG mit Transparenz) */}
      <img
        src={assetPath("/assets/images/Mission1/Hintergründe/Akte aufgeschlagen.webp")}
        alt="Akte aufgeschlagen"
        className="absolute inset-0 w-full h-full object-fill z-10 pointer-events-none"
      />

      {/* Navigation Pfeile — z-20, ganz oben */}
      {pageIndex > 0 && (
        <button
          type="button"
          onClick={goPrev}
          aria-label="Vorherige Seite"
          className="absolute right-[50%] top-1/2 -translate-y-1/2 z-20 text-black font-bold transition-all duration-200 hover:scale-125 select-none"
          style={{ fontSize: '5.5vw', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' }}
        >
          ‹
        </button>
      )}

      {pageIndex < AKTE_PAGES.length - 1 && (
        <button
          type="button"
          onClick={goNext}
          aria-label="Nächste Seite"
          className="absolute right-[10%] top-1/2 -translate-y-1/2 z-20 text-black font-bold transition-all duration-200 hover:scale-125 select-none"
          style={{ fontSize: '5.5vw', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8)) drop-shadow(0 0 12px rgba(255,255,255,0.4))' }}
        >
          ›
        </button>
      )}

      {/* Zurück-Button — z-20 */}
      <div className="absolute top-10 left-6 z-20">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          onMouseEnter={playHover}
          className="flex items-center gap-4 font-semibold rounded-lg bg-bg-primary/85 backdrop-blur-sm border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-bg-primary/95 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
          style={{ fontSize: 'clamp(14px, 1.4vw, 22px)', padding: '0.8em 2em' }}
        >
          <ArrowLeft size={28} />
          Zurück zum Schreibtisch
        </button>
      </div>
    </div>
  );
}

export default MissionTutorial;
