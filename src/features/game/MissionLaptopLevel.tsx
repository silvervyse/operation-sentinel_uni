import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { TypewriterText } from '../onboarding/TypewriterText';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { getCharacterImagePath } from '../onboarding/characters';
import type { LaptopLevelConfig, PasswordSet } from './laptop-level-config';
import { pickRandomPasswordSet } from './laptop-level-config';
import { assetPath } from '../../utils/asset-path';

type LevelView = 'desk' | 'laptop' | 'akte';

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

// === Props ===

export interface MissionLaptopLevelProps {
  config: LaptopLevelConfig;
  onComplete: () => void;
  onSolved?: () => void;
  isLastLevel?: boolean;
}

/**
 * Generische Laptop-Level-Komponente.
 * Gleicher Flow wie Tutorial, aber ohne Charakter-Intro und Glows.
 * Startet direkt mit dem klickbaren Schreibtisch.
 */
export function MissionLaptopLevel({ config, onComplete, onSolved, isLastLevel }: MissionLaptopLevelProps) {
  const [view, setView] = useState<LevelView>('desk');
  const [isZooming, setIsZooming] = useState(false);

  // Zufälliges PasswordSet + stabiles Post-It Layout beim Mount wählen
  const [{ passwordSet, stablePostItLayout }] = useState(() => {
    const set = pickRandomPasswordSet(config);
    const postIts = set.displayPostIts;
    let layout: { realColor: string; fakeColor1: string; fakeColor2: string; positions: number[][] } | null = null;
    if (postIts && postIts.length > 0) {
      const shuffle = <T,>(arr: T[]): T[] => {
        const a = [...arr];
        for (let k = a.length - 1; k > 0; k--) {
          const j = Math.floor(Math.random() * (k + 1));
          [a[k], a[j]] = [a[j], a[k]];
        }
        return a;
      };
      const colors = ['text-red-600', 'text-blue-600', 'text-green-700'];
      const shuffledColors = shuffle(colors);
      const positions = postIts.map(() => shuffle([0, 1, 2]));
      layout = { realColor: shuffledColors[0], fakeColor1: shuffledColors[1], fakeColor2: shuffledColors[2], positions };
    }
    return { passwordSet: set, stablePostItLayout: layout };
  });

  // Laptop-Passwort State
  const [attempts, setAttempts] = useState(0);
  const [showHints, setShowHints] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [hintAnimDone, setHintAnimDone] = useState<Record<string, boolean>>({});

  const { volume, setVolume } = useVolume();

  const handleZoomTo = useCallback((target: 'laptop' | 'akte') => {
    if (isZooming) return;
    setIsZooming(true);
    setTimeout(() => {
      setView(target);
      setIsZooming(false);
    }, 350);
  }, [isZooming]);

  const handleBack = useCallback(() => {
    setView('desk');
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      <AnimatePresence mode="popLayout">
        {view === 'desk' && (
          <motion.div
            key="desk"
            initial={{ opacity: 0 }}
            animate={{ opacity: isZooming ? 0 : 1 }}
            exit={{ opacity: 0, transition: { duration: 0 } }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <LevelDeskView
              config={config}
              onOpenLaptop={() => handleZoomTo('laptop')}
              onOpenAkte={() => handleZoomTo('akte')}
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
            <LevelLaptopView
              config={config}
              passwordSet={passwordSet}
              onBack={handleBack}
              attempts={attempts}
              setAttempts={setAttempts}
              showHints={showHints}
              setShowHints={setShowHints}
              solved={solved}
              setSolved={setSolved}
              onComplete={onComplete}
              onSolved={onSolved}
              isLastLevel={isLastLevel}
              hintAnimDone={hintAnimDone}
              setHintAnimDone={setHintAnimDone}
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
            <LevelAkteView
              config={config}
              aktePages={passwordSet.aktePages}
              onBack={handleBack}
              displayWord={passwordSet.displayWord}
              displayWordPage={passwordSet.displayWordPage}
              displayParts={passwordSet.displayParts}
              displayBlocks={passwordSet.displayBlocks}
              displayKeyboard={passwordSet.displayKeyboard}
              displayNewspaper={passwordSet.displayNewspaper}
              displayImage={passwordSet.displayImage}
              displayPostIts={passwordSet.displayPostIts}
              displayEmail={passwordSet.displayEmail}
              displayInterview={passwordSet.displayInterview}
              displayStamp={passwordSet.displayStamp}
              stablePostItLayout={stablePostItLayout}
            />
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

interface LevelDeskViewProps {
  config: LaptopLevelConfig;
  onOpenLaptop: () => void;
  onOpenAkte: () => void;
}

function LevelDeskView({ config, onOpenLaptop, onOpenAkte }: LevelDeskViewProps) {
  const { playHover, playClick } = useUISounds();

  return (
    <div className="relative w-full h-full">
      <img
        src={config.deskBackground}
        alt="Schreibtisch"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Laptop */}
      <button
        type="button"
        onClick={() => { playClick(); onOpenLaptop(); }}
        onMouseEnter={playHover}
        className="absolute left-[14%] top-[33%] w-[40%] h-[65%] cursor-pointer group"
        aria-label="Laptop öffnen"
      >
        <img
          src={config.laptopImage}
          alt="Laptop"
          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </button>

      {/* Akte */}
      <button
        type="button"
        onClick={() => { playClick(); onOpenAkte(); }}
        onMouseEnter={playHover}
        className="absolute right-[22%] top-[49%] w-[30%] h-[55%] cursor-pointer group"
        aria-label="Akte öffnen"
      >
        <img
          src={config.akteImage}
          alt="Akte"
          className="w-full h-full object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </button>
    </div>
  );
}

// === Laptop-Ansicht ===

interface LevelLaptopViewProps {
  config: LaptopLevelConfig;
  passwordSet: PasswordSet;
  onBack: () => void;
  attempts: number;
  setAttempts: (v: number) => void;
  showHints: number[];
  setShowHints: (v: number[]) => void;
  solved: boolean;
  setSolved: (v: boolean) => void;
  onComplete: () => void;
  onSolved?: () => void;
  isLastLevel?: boolean;
  hintAnimDone: Record<string, boolean>;
  setHintAnimDone: (v: Record<string, boolean>) => void;
}

function LevelLaptopView({ config, passwordSet, onBack, attempts, setAttempts, showHints, setShowHints, solved, setSolved, onComplete, onSolved, isLastLevel, hintAnimDone, setHintAnimDone }: LevelLaptopViewProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [learningDone, setLearningDone] = useState(false);
  const [learningTextReady, setLearningTextReady] = useState(false);

  // Lokale Hint-Sequenz-States (wie im Tutorial)
  const [hint0IntroComplete, setHint0IntroComplete] = useState(hintAnimDone['hint-0-intro'] ?? false);
  const [hint0DetailComplete, setHint0DetailComplete] = useState(hintAnimDone['hint-0-detail'] ?? false);
  const [hint1IntroComplete, setHint1IntroComplete] = useState(hintAnimDone['hint-1-intro'] ?? false);
  const { volume } = useVolume();
  const { playHover, playClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const buzzAudioRef = useRef<HTMLAudioElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  const playBuzz = useCallback(() => {
    if (!buzzAudioRef.current) buzzAudioRef.current = new Audio(assetPath('/assets/audio/warningbuzz.mp3'));
    buzzAudioRef.current.volume = volume;
    buzzAudioRef.current.currentTime = 0;
    buzzAudioRef.current.play().catch(() => {});
  }, [volume]);

  const playCorrect = useCallback(() => {
    if (!correctAudioRef.current) correctAudioRef.current = new Audio(assetPath('/assets/audio/correct.mp3'));
    correctAudioRef.current.volume = volume;
    correctAudioRef.current.currentTime = 0;
    correctAudioRef.current.play().catch(() => {});
  }, [volume]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (solved) return;

    if (password === passwordSet.password) {
      setSolved(true);
      setError(null);
      playCorrect();
      onSolved?.();
      setTimeout(() => setShowFileExplorer(true), 1500);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setError('Falsches Passwort. Versuche es erneut.');
      playBuzz();
      // Hinweise freischalten
      const newHints = passwordSet.hints
        .filter(h => newAttempts >= h.atAttempts)
        .map((_, i) => i);
      setShowHints(newHints);
    }
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={config.laptopZoomBackground}
        alt="Laptop Nahansicht"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Passwort-Eingabe */}
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
            Unsere Spezialisten konnten herausfinden, dass das Passwort aus <span className="text-text-primary font-semibold">{passwordSet.password.length} Zeichen</span> besteht.
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
                  <p className="text-accent-secondary text-center font-medium" style={{ fontSize: 'clamp(12px, 0.9vw, 16px)' }}>
                    Zugang gewährt. Dateien werden entschlüsselt<span className="inline-flex w-6"><motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}>...</motion.span></span>
                  </p>
                </div>
              )}
            </div>

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

        {/* Hinweis-Notification */}
        {showHints.length > 0 && !solved && (
          <div
            className="relative flex items-start rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] overflow-visible"
            style={{ padding: '1rem 1.2rem', width: 'clamp(350px, 35vw, 550px)', paddingLeft: '8rem', minHeight: showHints.length > 1 ? '11rem' : '7rem' }}
          >
            <img
              src={assetPath("/assets/images/Direktor Nova/Geheimdienstchefin_lächelnd.webp")}
              alt="Direktor Nova"
              className="absolute bottom-0 left-0 w-36 h-36 object-cover object-top"
              style={{ marginLeft: '-2.5rem' }}
            />
            <div className="flex flex-col gap-0">
              <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-1">
                Direktor Nova
              </span>

              {/* Hinweis 1 */}
              {showHints.includes(0) && (
                hintAnimDone['hint-0-detail'] ? (
                  <>
                    <p className="text-text-primary text-base leading-relaxed">{passwordSet.hints[0]?.introText}</p>
                    <p className="text-warning font-medium text-base leading-relaxed">{passwordSet.hints[0]?.detailText}</p>
                  </>
                ) : (
                  <>
                    <TypewriterText
                      key="hint-0-intro"
                      text={passwordSet.hints[0]?.introText ?? ''}
                      speed={25}
                      className="text-text-primary text-base leading-relaxed"
                      onComplete={() => { setHint0IntroComplete(true); setHintAnimDone({ ...hintAnimDone, 'hint-0-intro': true }); }}
                    />
                    {hint0IntroComplete && (
                      <TypewriterText
                        key="hint-0-detail"
                        text={passwordSet.hints[0]?.detailText ?? ''}
                        speed={25}
                        className="text-warning font-medium text-base leading-relaxed"
                        onComplete={() => { setHint0DetailComplete(true); setHintAnimDone({ ...hintAnimDone, 'hint-0-intro': true, 'hint-0-detail': true }); }}
                      />
                    )}
                  </>
                )
              )}

              {/* Hinweis 2 — erst wenn Hinweis 1 komplett fertig */}
              {showHints.includes(1) && (
                hintAnimDone['hint-1-detail'] ? (
                  <>
                    <p className="text-text-primary text-base leading-relaxed mt-2">{passwordSet.hints[1]?.introText}</p>
                    <p className="text-warning font-medium text-base leading-relaxed">{passwordSet.hints[1]?.detailText}</p>
                  </>
                ) : hint0DetailComplete ? (
                  <>
                    <TypewriterText
                      key="hint-1-intro"
                      text={passwordSet.hints[1]?.introText ?? ''}
                      speed={25}
                      className="text-text-primary text-base leading-relaxed mt-2"
                      onComplete={() => { setHint1IntroComplete(true); setHintAnimDone({ ...hintAnimDone, 'hint-0-intro': true, 'hint-0-detail': true, 'hint-1-intro': true }); }}
                    />
                    {hint1IntroComplete && (
                      <TypewriterText
                        key="hint-1-detail"
                        text={passwordSet.hints[1]?.detailText ?? ''}
                        speed={25}
                        className="text-warning font-medium text-base leading-relaxed"
                        onComplete={() => { setHintAnimDone({ ...hintAnimDone, 'hint-0-intro': true, 'hint-0-detail': true, 'hint-1-intro': true, 'hint-1-detail': true }); }}
                      />
                    )}
                  </>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* Dateiexplorer */}
      <AnimatePresence>
        {showFileExplorer && (
          <motion.div
            key="file-explorer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex items-center justify-center"
          >
            <div
              className="rounded-xl bg-[#1a1f2e] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col"
              style={{ width: 'clamp(500px, 55vw, 800px)', height: 'clamp(380px, 50vh, 600px)' }}
            >
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5 rounded-t-xl">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-text-secondary text-xs ml-2 font-mono">Dateien — /verschlüsselt/</span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
                <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-white/5 border border-white/10">
                  <div className="w-16 h-20 bg-accent-primary/20 border-2 border-accent-primary/50 rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.2)]">
                    <span className="text-accent-primary text-xs font-mono font-bold">PDF</span>
                  </div>
                  <span className="text-text-primary text-sm font-medium">{config.fileName}</span>
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

      {/* Learning-Dialog */}
      <AnimatePresence>
        {showLearning && (
          <motion.div
            key="learning-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex bg-black/70 backdrop-blur-sm"
          >
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

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[38vw] flex flex-col gap-4 rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)]"
              style={{ width: 'clamp(400px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <LevelLearningTypewriter
                paragraphs={config.learningParagraphs}
                startReady={learningTextReady}
                onComplete={() => setLearningDone(true)}
              />
            </motion.div>

            <motion.div
              className="absolute left-[38vw] flex justify-end"
              style={{ width: 'clamp(400px, 40vw, 650px)', bottom: 'clamp(2rem, 12vh, 5rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              {!learningDone && (
                <LevelLearningContinueButton />
              )}
              {learningDone && (
                <button
                  type="button"
                  onClick={() => { playClick(); onComplete(); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                >
                  {isLastLevel ? 'Weiter' : 'Verstanden – Nächster Laptop'}
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

interface LevelAkteViewProps {
  config: LaptopLevelConfig;
  aktePages: string[];
  onBack: () => void;
  displayWord?: string;
  displayWordPage?: number;
  displayParts?: { page: number; text: string; position?: 'top' | 'center' | 'bottom' }[];
  displayBlocks?: { page: number; lines: string[]; title?: string }[];
  displayKeyboard?: { page: number; highlightKeys: string[] };
  displayNewspaper?: { page: number; date: string };
  displayImage?: { page: number; src: string; width?: string }[];
  displayPostIts?: { page: number; realText: string; fakeText: string; fakeText2: string }[];
  displayEmail?: { page: number; from: string; to: string; subject: string; date: string; body: string[] };
  displayInterview?: { page: number; portraitSrc: string; lines: { speaker: string; text: string }[] };
  displayStamp?: { page: number; label?: string; date: string };
  stablePostItLayout?: { realColor: string; fakeColor1: string; fakeColor2: string; positions: number[][] } | null;
}

function LevelAkteView({ config, aktePages, onBack, displayWord, displayWordPage, displayParts, displayBlocks, displayKeyboard, displayNewspaper, displayImage, displayPostIts, displayEmail, displayInterview, displayStamp, stablePostItLayout }: LevelAkteViewProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const { volume } = useVolume();
  const { playHover, playClick } = useUISounds();
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  // Post-It Layout: Verwende stabile Props vom Parent, Fallback auf lokale Berechnung
  const postItLayout = useRef<{ realColor: string; fakeColor1: string; fakeColor2: string; positions: number[][] } | null>(stablePostItLayout ?? null);
  if (!postItLayout.current && displayPostIts && displayPostIts.length > 0) {
    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let k = a.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [a[k], a[j]] = [a[j], a[k]];
      }
      return a;
    };
    const colors = ['text-red-600', 'text-blue-600', 'text-green-700'];
    const shuffledColors = shuffle(colors);
    // Positionen werden pro Seite zufällig gemischt
    const positions = displayPostIts.map(() => shuffle([0, 1, 2]));
    postItLayout.current = {
      realColor: shuffledColors[0],
      fakeColor1: shuffledColors[1],
      fakeColor2: shuffledColors[2],
      positions,
    };
  }

  const playFlipSound = useCallback(() => {
    if (!flipAudioRef.current) flipAudioRef.current = new Audio(assetPath('/assets/audio/blättern.mp3'));
    flipAudioRef.current.volume = volume;
    flipAudioRef.current.currentTime = 0.8;
    flipAudioRef.current.playbackRate = 1.5;
    flipAudioRef.current.play().catch(() => {});
  }, [volume]);

  const goNext = () => { if (pageIndex < aktePages.length - 1) { setPageIndex(pageIndex + 1); playFlipSound(); } };
  const goPrev = () => { if (pageIndex > 0) { setPageIndex(pageIndex - 1); playFlipSound(); } };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goNext(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="relative w-full h-full">
      {/* Seiten */}
      <div className="absolute z-0 flex items-center justify-center" style={{ width: '42%', height: '103.5%', top: '0%', right: '11.2%' }}>
        <div className="relative w-full h-full overflow-hidden rounded-sm">
          <img
            src={aktePages[pageIndex]}
            alt={`Akte Seite ${pageIndex + 1}`}
            className="absolute inset-0 w-full h-full object-fill"
            draggable={false}
          />
          {/* Dynamisches Wort-Overlay */}
          {displayWord && displayWordPage === pageIndex && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-800 bg-white/80 px-6 py-3 rounded-lg shadow-md" style={{ fontFamily: 'cursive' }}>
                {displayWord}
              </span>
            </div>
          )}
          {/* Dynamische Parts-Overlays */}
          {displayParts?.filter(p => p.page === pageIndex).map((part, i) => (
            <div
              key={i}
              className={`absolute left-0 right-0 flex justify-center ${
                part.position === 'top' ? 'top-[20%]' : part.position === 'bottom' ? 'bottom-[20%]' : 'top-1/2 -translate-y-1/2'
              }`}
            >
              <span className="text-3xl font-bold text-gray-800 bg-yellow-100/90 px-5 py-2 rounded-md shadow-md border border-yellow-300/50 font-mono tracking-widest">
                {part.text}
              </span>
            </div>
          ))}
          {/* Mehrzeilige Textblöcke (z.B. Datenleak-Einträge) */}
          {displayBlocks && displayBlocks.filter(b => b.page === pageIndex).length > 0 && (
            <div className="absolute top-[20%] bottom-[10%] left-1/2 -translate-x-1/2 flex flex-col justify-center gap-2" style={{ width: '65%' }}>
              {displayBlocks.filter(b => b.page === pageIndex).map((block, i) => (
                <div key={i} className={`${block.title ? 'bg-white border border-gray-300 rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.15)]' : ''} text-lg`} style={{ padding: '0.8rem 1.2rem' }}>
                  {block.title && (
                    <p className="text-gray-700 font-bold mb-1 text-lg border-b border-gray-200 pb-1">{block.title}</p>
                  )}
                  {block.lines.map((line, j) => (
                    <p key={j} className={`leading-snug ${line === '' ? 'h-2' : ''} ${block.title ? 'text-gray-800 font-mono' : 'text-gray-700'}`}>{line}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
          {/* Datumsstempel-Overlay */}
          {displayStamp && displayStamp.page === pageIndex && (
            <div className="absolute bottom-[78%] right-[22%] z-20" style={{ transform: 'rotate(-8deg)' }}>
              <div className="border-[3px] border-red-600/70 rounded px-3 py-1.5 text-center" style={{ backgroundColor: 'rgba(255,235,235,0.9)', boxShadow: '0 2px 8px rgba(180,0,0,0.2)' }}>
                {displayStamp.label && (
                  <p className="text-red-600 font-black tracking-widest uppercase" style={{ fontSize: 'clamp(8px, 0.85vw, 12px)', letterSpacing: '0.15em' }}>
                    {displayStamp.label}
                  </p>
                )}
                <p className="text-red-700 font-bold" style={{ fontSize: 'clamp(10px, 1.1vw, 16px)' }}>
                  {displayStamp.date}
                </p>
              </div>
            </div>
          )}
          {/* E-Mail Overlay */}
          {displayEmail && displayEmail.page === pageIndex && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '8%' }}>
              <div className="bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden" style={{ width: '75%' }}>
                {/* Mail Header */}
                <div className="bg-gray-50 border-b border-gray-200" style={{ padding: '0.8rem 1.2rem' }}>
                  <div style={{ fontSize: 'clamp(10px, 1vw, 14px)' }} className="text-gray-500 space-y-0.5">
                    <p><span className="font-semibold text-gray-700">Von:</span> {displayEmail.from}</p>
                    <p><span className="font-semibold text-gray-700">An:</span> {displayEmail.to}</p>
                    <p><span className="font-semibold text-gray-700">Datum:</span> {displayEmail.date}</p>
                  </div>
                  <p className="font-bold text-gray-800 mt-1" style={{ fontSize: 'clamp(12px, 1.2vw, 17px)' }}>
                    {displayEmail.subject}
                  </p>
                </div>
                {/* Mail Body */}
                <div style={{ padding: '1rem 1.2rem', fontSize: 'clamp(11px, 1.1vw, 15px)', lineHeight: '1.6' }} className="text-gray-700">
                  {displayEmail.body.map((line, j) => (
                    <p key={j} className={line === '' ? 'h-3' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Interview/Blog Overlay */}
          {displayInterview && displayInterview.page === pageIndex && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ padding: '5%' }}>
              <div className="bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.15)] border border-gray-200 overflow-hidden" style={{ width: '65%' }}>
                {/* Blog Header */}
                <div className="bg-pink-50 border-b border-pink-200 flex items-center gap-3" style={{ padding: '0.7rem 1.2rem' }}>
                  <img
                    src={displayInterview.portraitSrc}
                    alt="Portrait"
                    className="w-14 h-14 rounded-full object-cover border-2 border-pink-300"
                  />
                  <p className="font-bold text-gray-800" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(11px, 1.2vw, 16px)' }}>
                    {displayInterview.lines[0]?.text}
                  </p>
                </div>
                {/* Interview Body */}
                <div style={{ padding: '1rem 1.2rem', fontSize: 'clamp(13px, 1.3vw, 18px)', lineHeight: '1.6' }} className="text-gray-700 space-y-1.5">
                  {displayInterview.lines.slice(1).map((line, j) => (
                    <p key={j}>
                      {line.speaker && <span className="font-bold text-gray-900">{line.speaker}: </span>}
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* Tastatur-Overlay */}
          {displayKeyboard && displayKeyboard.page === pageIndex && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-white shadow-[2px_3px_12px_rgba(0,0,0,0.2)] flex flex-col items-center gap-3"
                style={{
                  padding: 'clamp(12px, 1.5vw, 24px)',
                  transform: 'rotate(-0.5deg)',
                  clipPath: 'polygon(1% 0%, 99% 0.5%, 100% 98%, 98% 100%, 0.5% 99%, 0% 2%)',
                }}
              >
                {/* Handschriftliche Notiz */}
                <p className="text-gray-600 text-center" style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive", fontSize: 'clamp(12px, 1.2vw, 18px)', transform: 'rotate(-0.5deg)', lineHeight: '1.6' }}>
                  Erster Teil → Richtung beides möglich
                </p>
                <GermanKeyboard highlightKeys={displayKeyboard.highlightKeys} />
              </div>
            </div>
          )}
          {/* Zeitungsausschnitt */}
          {displayNewspaper && displayNewspaper.page === pageIndex && (
            <div className="absolute inset-0 flex items-center justify-center">
              <NewspaperClipping date={displayNewspaper.date} />
            </div>
          )}
          {/* Bild-Overlays */}
          {displayImage?.filter(img => img.page === pageIndex).map((img, i) => (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <img
                src={img.src}
                alt="Akte-Inhalt"
                className="object-contain shadow-md"
                style={{ width: img.width ?? '70%' }}
                draggable={false}
              />
            </div>
          ))}
          {/* Post-It Overlays */}
          {displayPostIts?.filter(p => p.page === pageIndex).map((postIt, i) => {
            const layout = postItLayout.current;
            const isLastPage = postIt.page === (displayPostIts?.length ?? 1) - 1;
            // Finde den Index dieses Post-Its im Gesamt-Array für stabile Position
            const globalIdx = displayPostIts.indexOf(postIt);
            const posOrder = layout?.positions[globalIdx] ?? [0, 1, 2];

            // Items: realText, fakeText, fakeText2 mit konsistenten Farben
            const allItems = isLastPage ? [
              { text: postIt.realText, color: 'text-gray-800' },
              { text: postIt.fakeText, color: 'text-gray-800' },
              { text: postIt.fakeText2, color: 'text-gray-800' },
            ] : [
              { text: postIt.realText, color: layout?.realColor ?? 'text-red-600' },
              { text: postIt.fakeText, color: layout?.fakeColor1 ?? 'text-blue-600' },
              { text: postIt.fakeText2, color: layout?.fakeColor2 ?? 'text-green-700' },
            ];
            // Positionen mischen (stabil pro Seite)
            const items = posOrder.map(p => allItems[p]);
            const rotations = [-2, 1.5, -1];

            return (
              <div key={i} className="absolute inset-[5%]">
                {/* Post-It 1: oben links */}
                <div className="absolute" style={{ top: '12%', left: '5%', width: '35%', transform: `rotate(${rotations[0]}deg)` }}>
                  <img src={assetPath("/assets/images/Mission1/Akten/Laptop1/Postit1.webp")} alt="Post-It" className="w-full" draggable={false} />
                  <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold ${items[0].color}`} style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive", fontSize: 'clamp(12px, 1.5vw, 24px)' }}>{items[0].text}</span>
                </div>
                {/* Post-It 2: oben rechts */}
                <div className="absolute" style={{ top: '15%', right: '8%', width: '35%', transform: `rotate(${rotations[1]}deg)` }}>
                  <img src={assetPath("/assets/images/Mission1/Akten/Laptop1/Postit.webp")} alt="Post-It" className="w-full" draggable={false} />
                  <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold ${items[1].color}`} style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive", fontSize: 'clamp(12px, 1.5vw, 24px)' }}>{items[1].text}</span>
                </div>
                {/* Post-It 3: unten mitte */}
                <div className="absolute" style={{ bottom: '25%', left: '22%', width: '35%', transform: `rotate(${rotations[2]}deg)` }}>
                  <img src={assetPath("/assets/images/Mission1/Akten/Laptop1/Postit1.webp")} alt="Post-It" className="w-full" draggable={false} />
                  <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold ${items[2].color}`} style={{ fontFamily: "'Segoe Script', 'Comic Sans MS', cursive", fontSize: 'clamp(12px, 1.5vw, 24px)' }}>{items[2].text}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Akte-Rahmen */}
      <img
        src={config.akteFrameImage}
        alt="Akte aufgeschlagen"
        className="absolute inset-0 w-full h-full object-fill z-10 pointer-events-none"
      />

      {/* Navigation */}
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
      {pageIndex < aktePages.length - 1 && (
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

      {/* Zurück-Button */}
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

// === Learning Typewriter ===

function LevelLearningTypewriter({ paragraphs, startReady, onComplete }: { paragraphs: string[]; startReady: boolean; onComplete: () => void }) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const { playClick } = useUISounds();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  const handleParagraphComplete = () => {
    if (!startReady) return;
    setIsTyping(false);
    if (paragraphIndex >= paragraphs.length - 1) {
      setAllDone(true);
      onComplete();
    }
  };

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__levelLearningContinue = () => {
      if (!startReady) return;
      if (isTyping) { typewriterRef.current?.skip(); return; }
      if (!allDone && paragraphIndex < paragraphs.length - 1) {
        playClick();
        setParagraphIndex(paragraphIndex + 1);
        setIsTyping(true);
      }
    };
    return () => { delete (window as unknown as Record<string, unknown>).__levelLearningContinue; };
  });

  return (
    <div className="min-h-[8rem]">
      <TypewriterText
        ref={typewriterRef}
        key={startReady ? paragraphIndex : 'waiting'}
        text={startReady ? paragraphs[paragraphIndex] : ''}
        speed={20}
        className="text-text-primary text-xl leading-relaxed whitespace-pre-wrap"
        onComplete={handleParagraphComplete}
      />
    </div>
  );
}

function LevelLearningContinueButton() {
  return (
    <button
      type="button"
      onClick={() => { (window as unknown as Record<string, () => void>).__levelLearningContinue?.(); }}
      className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
      style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
    >
      Weiter
    </button>
  );
}

// === Zeitungsausschnitt ===

function NewspaperClipping({ date }: { date: string }) {
  return (
    <div
      className="bg-[#f8f5e8] shadow-[3px_4px_12px_rgba(0,0,0,0.3)] border border-[#d4c9a8]"
      style={{
        width: '65%',
        padding: 'clamp(12px, 1.4vw, 22px)',
        transform: 'rotate(0.8deg)',
        clipPath: 'polygon(0.5% 1%, 99% 0%, 100% 98.5%, 1% 99.5%)',
      }}
    >
      {/* Zeitungskopf */}
      <div className="border-b-2 border-gray-800 pb-1 mb-2 flex justify-between items-baseline">
        <span className="font-bold text-gray-900" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(9px, 0.9vw, 13px)' }}>
          Stadtanzeiger
        </span>
        <span className="text-gray-600" style={{ fontSize: 'clamp(7px, 0.7vw, 10px)' }}>
          Lokales · Seite 7
        </span>
      </div>

      {/* Überschrift */}
      <h3 className="text-gray-900 font-bold leading-tight mb-2" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(13px, 1.6vw, 22px)' }}>
        Traumhochzeit am {date}: Moritz Meister gibt seiner Anja das Ja-Wort
      </h3>

      {/* Layout: Bild + Text */}
      <div className="flex gap-2">
        <img
          src={assetPath("/assets/images/Mission1/Akten/Laptop3/Hochzeit.webp")}
          alt="Hochzeitsfoto"
          className="object-cover rounded-sm border border-gray-300"
          style={{ width: '35%', height: 'auto', aspectRatio: '4/3' }}
        />
        <div className="flex-1" style={{ fontSize: 'clamp(10px, 1.1vw, 15px)', lineHeight: '1.5', fontFamily: 'Georgia, serif', color: '#333' }}>
          <p className="mb-1">
            Bei strahlendem Sonnenschein feierten Moritz Meister (34) und Anja Lehmann (31) am {date} im Standesamt Neustadt ihre standesamtliche Trauung. Die kirchliche Feier folgte am Nachmittag.
          </p>
          <p className="mb-1">
            Rund 80 Gäste waren angereist, um dem Paar zu gratulieren. Die Feier fand im Landgasthof zur alten Mühle statt.
          </p>
          <p className="text-gray-500 italic" style={{ fontSize: 'clamp(8px, 0.85vw, 12px)' }}>
            Das Paar plant nun eine Hochzeitsreise nach Griechenland.
          </p>
        </div>
      </div>
    </div>
  );
}

// === Deutsche Tastatur mit markierten Tasten ===

const KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'ß'],
  ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä'],
  ['y', 'x', 'c', 'v', 'b', 'n', 'm'],
];

function GermanKeyboard({ highlightKeys }: { highlightKeys: string[] }) {
  const normalizedHighlight = highlightKeys.map(k => k.toLowerCase());

  return (
    <div className="p-2" style={{ width: '95%' }}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5 mb-1.5" style={{ paddingLeft: rowIndex === 2 ? '4%' : rowIndex === 3 ? '10%' : '0' }}>
          {row.map((key) => {
            const isHighlighted = normalizedHighlight.includes(key.toLowerCase());
            return (
              <div
                key={key}
                className={`flex items-center justify-center rounded font-bold uppercase transition-all ${
                  isHighlighted
                    ? 'bg-accent-primary shadow-[0_0_10px_rgba(0,212,255,0.7)]'
                    : 'bg-gray-700'
                }`}
                style={{ width: 'clamp(22px, 3.2vw, 40px)', height: 'clamp(22px, 3.2vw, 40px)' }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default MissionLaptopLevel;
