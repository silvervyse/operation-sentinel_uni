import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, FileText, KeyRound } from 'lucide-react';
import { TypewriterText } from '../onboarding/TypewriterText';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { getDirectorImagePath } from '../onboarding/director';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { getCharacterImagePath } from '../onboarding/characters';
import { analyzePassword, type PasswordAnalysis } from '../../services/password-analyzer';
import { assetPath } from '../../utils/asset-path';

/** Einfacher Hook für Hover/Click-Sounds */
function useUISounds() {
  const { volume } = useVolume();
  const hoverRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);
  const lockedRef = useRef<HTMLAudioElement | null>(null);

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

  const playLockedClick = useCallback(() => {
    if (!lockedRef.current) lockedRef.current = new Audio(assetPath('/assets/audio/clicknotpossible.mp3'));
    lockedRef.current.volume = volume;
    lockedRef.current.currentTime = 0;
    lockedRef.current.play().catch(() => {});
  }, [volume]);

  return { playHover, playClick, playLockedClick };
}

type Phase = 'director-dialog' | 'encrypt' | 'password-manager-prompt' | 'password-manager-dialog' | 'password-manager-view' | 'final-learning';

const FILE_NAMES = [
  'Akte_Verdächtiger_3.pdf',
  'Protokoll_Überwachung.pdf',
  'Kommunikationslog_encrypted.pdf',
  'Finanzbericht_Q4.pdf',
  'Geheime_Akte_X7.pdf',
];

const FILE_CLASSIFICATIONS = [
  'Vertraulich',
  'Vertraulich',
  'Vertraulich',
  'Streng vertraulich',
  'Streng vertraulich',
];

const FILE_TOOLTIPS = [
  '💡 Experimentiere mit der Länge: Probiere kurze und lange Passwörter aus. Nur Buchstaben erlaubt! Schau dir an, welche Auswirkung die Länge auf die Dauer eines Brute-Force-Angriffs hat.',
  '💡 Feste Länge: 13 Zeichen. Probiere nur Buchstaben, dann Buchstaben und Zahlen, dann Buchstaben, Zahlen und Sonderzeichen. Schau dir an, wie sich die Brute-Force-Dauer verändert.',
  '💡 Probiere mal ein deutsches Wort in Kombination mit einer Zahlenreihe und Sonderzeichen aus. Und dann zufällige Buchstabenfolgen.',
  '💡 Jetzt probiere selbst ein sicheres Passwort zu finden!',
  '💡 Letzte Datei: Probiere doch hier mal eine Passphrase aus! Die kann man sich leichter merken.',
];

const DIRECTOR_PARAGRAPHS_TEMPLATE = [
  'Tolle Arbeit Agent {codename}, alle 5 Laptops in Rekordzeit geknackt!',
  'Dabei hast du vieles über unsichere Passwörter gelernt. Nun ist es deine Aufgabe, die erlangten Dateien sicher zu verschlüsseln.',
  'Ich habe dir unseren Passwort-Analyzer freigeschaltet – ein Tool, das die Sicherheit deiner Passwörter in Echtzeit prüft.',
  'Einloggen solltest du immer nur ein ausreichend sicheres Passwort. Ein Tooltip verrät dir, was du ausprobieren kannst.',
];

export interface MissionPasswordCreationProps {
  onComplete: (password: string) => void;
}

export function MissionPasswordCreation({ onComplete }: MissionPasswordCreationProps) {
  const [phase, setPhase] = useState<Phase>('director-dialog');
  const [directorParagraph, setDirectorParagraph] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textReady, setTextReady] = useState(false);

  // Encrypt phase
  const [currentFile, setCurrentFile] = useState(0);
  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveHint, setShowSaveHint] = useState(false);
  const [isFileTransitioning, setIsFileTransitioning] = useState(false);
  const [showStrictWarning, setShowStrictWarning] = useState(false);
  const [strictWarningTyping, setStrictWarningTyping] = useState(true);
  const [finalTextReady, setFinalTextReady] = useState(false);
  const [finalLearningDone, setFinalLearningDone] = useState(false);
  const [showLengthTooltip, setShowLengthTooltip] = useState(false);
  const [showLettersTooltip, setShowLettersTooltip] = useState(false);
  const [showExampleTooltip, setShowExampleTooltip] = useState(false);
  const [showPassphraseHelp, setShowPassphraseHelp] = useState(false);
  const [passphraseHelpTyping, setPassphraseHelpTyping] = useState(true);
  const [pwManagerDialogTyping, setPwManagerDialogTyping] = useState(true);
  const strictWarningRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);
  const pwManagerDialogRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);
  const passphraseHelpRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);
  const lengthTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lettersTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exampleTooltipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { volume, setVolume } = useVolume();
  const { playHover, playClick, playLockedClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  const codename = profile?.codename ?? 'Agent';

  useEffect(() => {
    const timer = setTimeout(() => setTextReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDirectorContinue = () => {
    if (!textReady) return;
    if (isTyping) { typewriterRef.current?.skip(); return; }
    if (directorParagraph < DIRECTOR_PARAGRAPHS_TEMPLATE.length - 1) {
      playClick();
      setDirectorParagraph(prev => prev + 1);
      setIsTyping(true);
    } else {
      playClick();
      setPhase('encrypt');
    }
  };

  const playAnalyzerSound = useCallback(() => {
    const audio = new Audio(assetPath('/assets/audio/analyzer.mp3'));
    audio.volume = volume;
    audio.play().catch(() => {});
  }, [volume]);

  const BLOCKED_EXAMPLES = ['Haus1Maus&Hund', 'Kaktus!Laterne7Wal'];

  const handleAnalyze = async () => {
    if (!password.trim() || isAnalyzing) return;
    // Beispiel-Passphrasen blockieren (case-insensitive)
    if (BLOCKED_EXAMPLES.some(ex => password.trim().toLowerCase() === ex.toLowerCase())) {
      playLockedClick();
      setShowExampleTooltip(true);
      if (exampleTooltipTimer.current) clearTimeout(exampleTooltipTimer.current);
      exampleTooltipTimer.current = setTimeout(() => setShowExampleTooltip(false), 4000);
      return;
    }
    // Datei 2: genau 13 Zeichen erforderlich
    if (currentFile === 1 && password.length < 13) return;
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);

    const result = await analyzePassword(password.trim());
    setAnalysis(result);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setAnalysisStep(step);
      if (step >= 6) {
        clearInterval(interval);
        setIsAnalyzing(false);
        playAnalyzerSound();
      }
    }, 600);
  };

  const canSave = (): boolean => {
    if (!analysis || analysisStep < 6) return false;
    // Datei 1: Nur Länge zählt – muss "Hervorragend" sein (≥13 Zeichen)
    if (currentFile === 0) {
      return analysis.length.rating === 'hervorragend';
    }
    // Datei 2: Feste Länge, nur Entropie zählt – muss "Hoch" sein
    if (currentFile === 1) {
      return analysis.entropy.rating === 'hervorragend';
    }
    // Datei 3: Kein einzelnes deutsches Wort (Passphrasen erlaubt) + Gesamtbewertung muss stimmen
    if (currentFile === 2) {
      if (analysis.dictionary.found && !analysis.dictionary.isPassphrase) return false;
      return analysis.overall.rating === 'sehr sicher' || analysis.overall.rating === 'sicher' || analysis.overall.rating === 'mittel';
    }
    // Datei 5: Passphrase + Länge hervorragend + Entropie hoch + Vorhersagbarkeit hervorragend (= sehr sicher)
    if (currentFile === 4) {
      return !!analysis.dictionary.isPassphrase && analysis.length.rating === 'hervorragend' && analysis.entropy.rating === 'hervorragend' && analysis.predictability.rating === 'hervorragend';
    }
    // Ab Datei 4: Gesamtbewertung muss stimmen
    const isStrictlyConfidential = FILE_CLASSIFICATIONS[currentFile] === 'Streng vertraulich';
    if (isStrictlyConfidential) return analysis.overall.rating === 'sehr sicher';
    return analysis.overall.rating === 'sehr sicher' || analysis.overall.rating === 'sicher' || analysis.overall.rating === 'mittel';
  };

  const handleSave = () => {
    if (!canSave()) {
      playLockedClick();
      setShowSaveHint(true);
      setTimeout(() => setShowSaveHint(false), 8000);
      return;
    }
    playClick();

    // Passwort im Passwortmanager speichern (localStorage)
    const savedPasswords = JSON.parse(localStorage.getItem('op-sentinel-passwords') || '[]');
    savedPasswords.push({
      file: FILE_NAMES[currentFile],
      password: password.trim(),
      rating: analysis?.overall.rating ?? 'unsicher',
      timestamp: Date.now(),
    });
    localStorage.setItem('op-sentinel-passwords', JSON.stringify(savedPasswords));

    if (currentFile < FILE_NAMES.length - 1) {
      setIsFileTransitioning(true);
      setTimeout(() => {
        const nextFile = currentFile + 1;
        setCurrentFile(nextFile);
        setPassword('');
        setAnalysis(null);
        setAnalysisStep(0);
        setShowSaveHint(false);
        setIsFileTransitioning(false);
        // Bei Datei 4 (index 3) die Direktorin-Warnung zeigen
        if (nextFile === 3) {
          setShowStrictWarning(true);
          setStrictWarningTyping(true);
        }
      }, 600);
    } else {
      // Letzte Datei (Datei 5) → Passphrase in localStorage speichern für Quiz
      localStorage.setItem('op-sentinel-passphrase', password);
      playClick();
      setPhase('password-manager-prompt');
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      {/* Laptop-Zoom Hintergrund */}
      <img
        src={assetPath("/assets/images/Mission1/Hintergründe/Laptop-zoom.webp")}
        alt="Laptop"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Phase: Direktorin Dialog */}
      <AnimatePresence>
        {phase === 'director-dialog' && (
          <motion.div
            key="director"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-20 flex bg-black/70 backdrop-blur-sm"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={directorParagraph >= 1 ? 'neutral' : 'lobend'}
                src={getDirectorImagePath(directorParagraph >= 1 ? 'neutral' : 'lobend')}
                alt="Direktor Nova"
                className="absolute bottom-0 object-contain"
                style={{ height: directorParagraph >= 1 ? '65vh' : '80vh', left: directorParagraph >= 1 ? '3vw' : '5vw', bottom: directorParagraph >= 1 ? '0' : '-10%' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[37vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
              style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
                Direktor Nova
              </span>
              <div className="min-h-[6rem]">
                <TypewriterText
                  ref={typewriterRef}
                  key={textReady ? directorParagraph : 'waiting'}
                  text={textReady ? DIRECTOR_PARAGRAPHS_TEMPLATE[directorParagraph].replace('{codename}', codename) : ''}
                  speed={20}
                  className="text-text-primary text-xl leading-relaxed"
                  highlight={directorParagraph === 0 ? codename : undefined}
                  onComplete={() => { if (textReady) setIsTyping(false); }}
                />
              </div>
            </motion.div>

            <motion.div
              className="absolute left-[37vw] flex justify-end z-20"
              style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 15vh, 6rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <button
                type="button"
                onClick={handleDirectorContinue}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
              >
                {directorParagraph < DIRECTOR_PARAGRAPHS_TEMPLATE.length - 1 ? 'Weiter' : 'Los geht\'s'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Dateien verschlüsseln */}
      {phase === 'encrypt' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          {/* Übergangs-Overlay */}
          <AnimatePresence>
            {isFileTransitioning && (
              <motion.div
                key="file-transition"
                className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.p
                  className="text-accent-primary font-display text-xl tracking-wide"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  ✓ Passwort gespeichert — Nächste Datei...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Direktorin-Warnung bei streng vertraulich */}
          <AnimatePresence>
            {showStrictWarning && (
              <motion.div
                key="strict-warning"
                className="absolute inset-0 z-50 flex bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={getDirectorImagePath('skeptisch')}
                  alt="Direktor Nova"
                  className="absolute bottom-0 left-[5vw] object-contain"
                  style={{ height: '65vh' }}
                  initial={{ opacity: 0, x: '-20%' }}
                  animate={{ opacity: 1, x: '0%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />

                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 left-[37vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
                  style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
                    Direktor Nova
                  </span>
                  <div className="min-h-[5rem]">
                    <TypewriterText
                      ref={strictWarningRef}
                      key="strict-warning-text"
                      text="Achtung! Die beiden nächsten Dateien sind streng vertraulich. Hier ist es besonders wichtig, ein sicheres Passwort zu finden. Du weißt wie es geht – vergebe ein sehr sicheres Passwort!"
                      speed={20}
                      className="text-text-primary text-xl leading-relaxed"
                      onComplete={() => setStrictWarningTyping(false)}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[37vw] flex justify-end z-20"
                  style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 15vh, 6rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (strictWarningTyping) { strictWarningRef.current?.skip(); return; }
                      playClick();
                      setShowStrictWarning(false);
                    }}
                    className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                    style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                  >
                    Verstanden
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Passphrase-Hilfe Overlay */}
          <AnimatePresence>
            {showPassphraseHelp && (
              <motion.div
                key="passphrase-help"
                className="absolute inset-0 z-50 flex bg-black/70 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.img
                  src={getDirectorImagePath('neutral')}
                  alt="Direktor Nova"
                  className="absolute bottom-0 left-[5vw] object-contain"
                  style={{ height: '65vh' }}
                  initial={{ opacity: 0, x: '-20%' }}
                  animate={{ opacity: 1, x: '0%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />

                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 left-[37vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
                  style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
                    Direktor Nova
                  </span>
                  <div className="min-h-[10rem]">
                    <TypewriterText
                      ref={passphraseHelpRef}
                      key="passphrase-help-text"
                      text={`Agent ${profile?.codename ?? 'XXX'}, erinnern Sie sich an ihr Training.\n\nEine Passphrase ist eine Kombination aus mehreren zufälligen Wörtern und Zahlen/Sonderzeichen.\n\nSie sind leichter merkbar als ein zufällig generiertes Passwort und können trotzdem sehr sicher sein.\n\nEin Beispiel: Kaktus!Laterne7Wal\n\nMehrere unabhängige, zufällige Wörter ergeben nämlich sehr viel Entropie und gleichzeitig eine gute Merkbarkeit.`}
                      speed={18}
                      className="text-text-primary text-lg leading-relaxed whitespace-pre-line"
                      onComplete={() => setPassphraseHelpTyping(false)}
                    />
                  </div>
                </motion.div>

                <motion.div
                  className="absolute left-[37vw] flex justify-end z-20"
                  style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 10vh, 5rem)' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (passphraseHelpTyping) {
                        passphraseHelpRef.current?.skip();
                      } else {
                        playClick();
                        setShowPassphraseHelp(false);
                        setPassphraseHelpTyping(true);
                      }
                    }}
                    onMouseEnter={playHover}
                    className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                    style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                  >
                    Verstanden
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Tooltip */}
          <div className="rounded-lg bg-bg-primary/80 backdrop-blur-sm border border-accent-primary/30" style={{ padding: '1rem 2rem', width: 'clamp(750px, 70vw, 1100px)', marginBottom: '1.5rem' }}>
            <p className="text-text-primary text-base">{FILE_TOOLTIPS[currentFile]}</p>
          </div>

          {/* Haupt-Container: Zwei-Spalten-Layout */}
          <div className="flex gap-5" style={{ width: 'clamp(750px, 70vw, 1100px)' }}>
            {/* Linke Spalte: Datei + Eingabe */}
            <div
              className="flex-1 rounded-xl bg-[#1a1f2e]/90 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col overflow-hidden"
            >
              {/* Titelleiste */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-text-secondary text-xs ml-2 font-mono">Verschlüsselung — Datei {currentFile + 1}/{FILE_NAMES.length}</span>
              </div>

              <div style={{ padding: '2rem 2.5rem' }} className="flex flex-col flex-1">
                {/* Header mit Datei-Icon */}
                <div className="flex items-center justify-between" style={{ marginBottom: '2rem' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-14 bg-accent-primary/20 border-2 border-accent-primary/50 rounded-md flex items-center justify-center shadow-[0_0_12px_rgba(0,212,255,0.2)]">
                      <span className="text-accent-primary text-xs font-mono font-bold">PDF</span>
                    </div>
                    <div>
                      <h2 className="text-accent-primary font-display text-lg tracking-wide">
                        Datei {currentFile + 1} von {FILE_NAMES.length}
                      </h2>
                      <p className="text-text-secondary text-sm">{FILE_NAMES[currentFile]}</p>
                      <span className={`text-xs font-semibold uppercase tracking-wide ${FILE_CLASSIFICATIONS[currentFile] === 'Streng vertraulich' ? 'text-danger' : 'text-warning'}`}>
                        {FILE_CLASSIFICATIONS[currentFile]}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {FILE_NAMES.map((_, i) => (
                      <div key={i} className={`w-3 h-3 rounded-full ${i < currentFile ? 'bg-accent-secondary' : i === currentFile ? 'bg-accent-primary' : 'bg-text-secondary/30'}`} />
                    ))}
                  </div>
                </div>

              {/* Passwort-Eingabe */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Datei 1: nur Buchstaben erlaubt
                    if (currentFile === 0 && val !== '' && !/^[a-zA-ZäöüÄÖÜß]+$/.test(val)) {
                      setShowLettersTooltip(true);
                      if (lettersTooltipTimer.current) clearTimeout(lettersTooltipTimer.current);
                      lettersTooltipTimer.current = setTimeout(() => setShowLettersTooltip(false), 4000);
                      return;
                    }
                    // Datei 2: maximal 13 Zeichen
                    if (currentFile === 1 && val.length > 13) return;
                    setPassword(val);
                    if (currentFile === 0) setShowLettersTooltip(false);
                    if (currentFile === 1 && val.length >= 13) setShowLengthTooltip(false);
                  }}
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Passwort eingeben..."
                  className="flex-1 rounded-lg bg-bg-primary border-2 border-accent-primary/50 text-text-primary font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all duration-200"
                  style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', padding: '0.8em 1.2em' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (currentFile === 1 && password.length < 13) {
                        playLockedClick();
                        setShowLengthTooltip(true);
                        if (lengthTooltipTimer.current) clearTimeout(lengthTooltipTimer.current);
                        lengthTooltipTimer.current = setTimeout(() => setShowLengthTooltip(false), 4000);
                        return;
                      }
                      handleAnalyze();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const isDisabled = !password.trim() || isAnalyzing || (currentFile === 1 && password.length < 13);
                    if (isDisabled) {
                      playLockedClick();
                      if (currentFile === 1 && password.trim() && password.length < 13) {
                        setShowLengthTooltip(true);
                        if (lengthTooltipTimer.current) clearTimeout(lengthTooltipTimer.current);
                        lengthTooltipTimer.current = setTimeout(() => setShowLengthTooltip(false), 4000);
                      }
                      return;
                    }
                    setShowLengthTooltip(false);
                    handleAnalyze();
                  }}
                  onMouseEnter={playHover}
                  className={`font-semibold rounded-lg border-2 transition-all duration-200 whitespace-nowrap ${
                    !password.trim() || isAnalyzing || (currentFile === 1 && password.length < 13)
                      ? 'bg-accent-primary/5 border-accent-primary/30 text-accent-primary/50 opacity-50 cursor-pointer'
                      : 'bg-accent-primary/10 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)]'
                  }`}
                  style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.8em 1.5em' }}
                >
                  Prüfen
                </button>
              </div>
              {/* Tooltip-Bereich (feste Höhe, kein Layout-Shift) */}
              <div className="h-6 mt-1">
                {showLengthTooltip && (
                  <p className="text-amber-400 text-sm">
                    Bitte nutze genau 13 Zeichen
                  </p>
                )}
                {showLettersTooltip && (
                  <p className="text-amber-400 text-sm">
                    Bitte teste hier erst mal nur mit Buchstaben
                  </p>
                )}
                {showExampleTooltip && (
                  <p className="text-amber-400 text-sm">
                    Finde eine eigene individuelle Passphrase
                  </p>
                )}
              </div>
              {/* Hilfe-Button bei Datei 5 */}
              {currentFile === 4 && (
                <button
                  type="button"
                  onClick={() => { playClick(); setShowPassphraseHelp(true); }}
                  onMouseEnter={playHover}
                  className="mt-2 text-sm text-accent-primary/70 hover:text-accent-primary underline underline-offset-2 transition-colors"
                >
                  Was ist eine Passphrase?
                </button>
              )}
              </div>
            </div>

            {/* Rechte Spalte: Analyzer */}
            <div
              className="rounded-xl bg-[#1a1f2e]/90 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col overflow-hidden"
              style={{ width: 'clamp(320px, 32vw, 480px)', minHeight: 'clamp(200px, 22vh, 300px)' }}
            >
              {/* Titelleiste */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/5">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-text-secondary text-xs ml-2 font-mono">Passwort-Analyzer</span>
              </div>

              <div style={{ padding: '2rem 2.5rem' }}>

              {!analysis && !isAnalyzing && (
                <p className="text-text-secondary text-base italic">Gib ein Passwort ein und klicke „Prüfen"...</p>
              )}

              {isAnalyzing && !analysis && (
                <p className="text-accent-primary text-base animate-pulse">Analyse läuft...</p>
              )}

              {analysis && (
                <div className="space-y-4 text-base">
                  {analysisStep >= 1 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Länge</span>
                        <span className={`font-medium ${getRatingColor(analysis.length.rating)}`}>{analysis.length.label}</span>
                      </div>
                      <p className="text-text-secondary/70 text-sm mt-0.5">{analysis.length.value} Zeichen</p>
                    </motion.div>
                  )}
                  {analysisStep >= 2 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Entropie</span>
                        <span className={`font-medium ${getRatingColor(analysis.entropy.rating)}`}>{analysis.entropy.label}</span>
                      </div>
                      <p className="text-text-secondary/70 text-sm mt-0.5">Zeichensatz: {analysis.entropy.charsetSize} mögliche Zeichen</p>
                    </motion.div>
                  )}
                  {analysisStep >= 3 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Wörterbuch</span>
                        <span className={`font-medium ${analysis.dictionary.found ? 'text-danger' : 'text-accent-secondary'}`}>
                          {analysis.dictionary.isPassphrase ? 'Super Passphrase!' : analysis.dictionary.found ? 'Gefunden' : 'Sicher'}
                        </span>
                      </div>
                      {analysis.dictionary.found && !analysis.dictionary.isPassphrase && (
                        <p className="text-danger/70 text-sm mt-0.5">Enthält: „{analysis.dictionary.word}"</p>
                      )}
                    </motion.div>
                  )}
                  {analysisStep >= 4 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Vorhersagbarkeit</span>
                        <span className={`font-medium ${getRatingColor(analysis.predictability.rating)}`}>{analysis.predictability.label}</span>
                      </div>
                      {analysis.predictability.reason && analysis.predictability.rating === 'schlecht' && (
                        <p className="text-danger/70 text-sm mt-0.5">{analysis.predictability.reason}</p>
                      )}
                    </motion.div>
                  )}
                  {analysisStep >= 5 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="flex justify-between items-center">
                        <span className="text-text-secondary">Brute-Force</span>
                        <span className="font-medium text-text-primary">{analysis.bruteForce.label}</span>
                      </div>
                    </motion.div>
                  )}
                  {analysisStep >= 6 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-4 pt-4 border-t border-accent-primary/20 flex justify-between items-center">
                      <span className="text-text-secondary font-medium">Bewertung</span>
                      <span className={`text-xl font-bold ${getOverallColor(analysis.overall.rating)}`}>{analysis.overall.label}</span>
                    </motion.div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Speichern-Button */}
          <div className="relative">
            <button
              type="button"
              onClick={handleSave}
              onMouseEnter={() => { if (canSave()) playHover(); }}
              className={`font-semibold rounded-lg border-2 transition-all duration-200 ${
                canSave()
                  ? 'bg-accent-secondary/10 border-accent-secondary text-accent-secondary shadow-[0_0_12px_rgba(0,255,136,0.4)] hover:bg-accent-secondary/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]'
                  : 'bg-bg-secondary/50 border-text-secondary/20 text-text-secondary/50 cursor-pointer'
              }`}
              style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', padding: '0.8em 2.5em' }}
            >
              {currentFile < FILE_NAMES.length - 1 ? 'Speichern & Nächste Datei' : 'Speichern & Abschließen'}
            </button>
            {showSaveHint && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 rounded-lg bg-warning/10 border border-warning/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]" style={{ padding: '1rem 1.5rem', whiteSpace: 'nowrap', marginTop: '1.5rem' }}>
                <p className="text-warning text-base text-center">
                  {currentFile === 0
                    ? 'Für diese Vertraulichkeitsstufe brauchst du bei Länge die Bewertung „Hervorragend".'
                    : currentFile === 1
                      ? 'Nutze Buchstaben, Zahlen und Sonderzeichen um eine hohe Entropie zu erreichen.'
                      : currentFile === 2
                        ? 'Achte darauf kein einzelnes deutsches Wort zu verwenden, das macht Wörterbuchangriffe einfach. Wende außerdem dein Wissen zu Passwortlänge und Entropie an.'
                        : currentFile === 4
                          ? 'Verwende eine Passphrase (mehrere zufällige Wörter), mindestens 13 Zeichen lang, mit Buchstaben, Zahlen und Sonderzeichen. Keine vorhersagbaren Muster! z.B. Haus1Maus&Hund'
                          : FILE_CLASSIFICATIONS[currentFile] === 'Streng vertraulich'
                            ? 'Für die Vertraulichkeitsstufe „Streng vertraulich" brauchst du ein sehr sicheres Passwort.'
                            : 'Für die Vertraulichkeitsstufe „Vertraulich" musst du mindestens ein halbwegs sicheres Passwort erstellen.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phase: Passwortmanager-Frage */}
      <AnimatePresence>
        {phase === 'password-manager-prompt' && (
          <motion.div
            key="pw-manager-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              className="rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] text-center"
              style={{ width: 'clamp(380px, 35vw, 520px)', padding: '3rem 2.5rem' }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-text-primary text-xl" style={{ marginBottom: '3rem' }}>Möchtest du für deine neuen Passwörter einen Passwortmanager verwenden?</p>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    localStorage.setItem('op-sentinel-use-pwmanager', 'true');
                    setPhase('password-manager-dialog');
                  }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(14px, 1.1vw, 18px)', padding: '0.8em 2.5em' }}
                >
                  Ja
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    localStorage.setItem('op-sentinel-use-pwmanager', 'false');
                    setPhase('final-learning');
                    setTimeout(() => setFinalTextReady(true), 1800);
                  }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-transparent border-2 border-text-secondary/50 text-text-secondary hover:border-text-secondary hover:text-text-primary transition-all duration-200"
                  style={{ fontSize: 'clamp(14px, 1.1vw, 18px)', padding: '0.8em 2.5em' }}
                >
                  Nein
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Passwortmanager-Dialog mit Nova */}
      <AnimatePresence>
        {phase === 'password-manager-dialog' && (
          <motion.div
            key="pw-manager-dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex bg-black/80 backdrop-blur-sm"
          >
            <motion.img
              src={getDirectorImagePath('lobend')}
              alt="Direktor Nova"
              className="absolute bottom-0 left-[5vw] object-contain"
              style={{ height: '70vh' }}
              initial={{ opacity: 0, x: '-20%' }}
              animate={{ opacity: 1, x: '0%' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />

            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[37vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
              style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
                Direktor Nova
              </span>
              <div className="min-h-[6rem]">
                <TypewriterText
                  ref={pwManagerDialogRef}
                  key="pw-manager-dialog-text"
                  text={`Gute Entscheidung, Agent ${profile?.codename ?? 'XXX'}. Ein Passwortmanager hilft dabei verschiedene Passwörter sicher zu speichern. So brauchst du dir deine Passwörter nicht auswendig merken und kannst jederzeit auf sie zugreifen.`}
                  speed={20}
                  className="text-text-primary text-lg leading-relaxed"
                  onComplete={() => setPwManagerDialogTyping(false)}
                />
              </div>
            </motion.div>

            <motion.div
              className="absolute left-[37vw] flex justify-end z-20"
              style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 15vh, 6rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
            >
              <button
                type="button"
                onClick={() => {
                  if (pwManagerDialogTyping) {
                    pwManagerDialogRef.current?.skip();
                  } else {
                    playClick();
                    setPhase('password-manager-view');
                  }
                }}
                onMouseEnter={playHover}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
              >
                Weiter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Passwortmanager-Ansicht */}
      <AnimatePresence>
        {phase === 'password-manager-view' && (
          <motion.div
            key="pw-manager-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center"
          >
            <PasswordManagerView
              onContinue={() => {
                playClick();
                setPhase('final-learning');
                setTimeout(() => setFinalTextReady(true), 1800);
              }}
              playHover={playHover}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Final Learning */}
      <AnimatePresence>
        {phase === 'final-learning' && (
          <motion.div
            key="final-learning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex bg-black/70 backdrop-blur-sm"
          >
            {/* Charakter links */}
            {profile && (
              <motion.img
                src={getCharacterImagePath(profile.selectedCharacter, 'tutorial')}
                alt="Agent"
                className="absolute bottom-0 left-[12vw] object-contain flex-shrink-0 z-10 -scale-x-100"
                style={{ height: '75vh' }}
                initial={{ opacity: 0, x: '-20%' }}
                animate={{ opacity: 1, x: '0%' }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
            )}

            {/* Textbox */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[42vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)]"
              style={{ width: 'clamp(420px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
            >
              {profile && (
                <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
                  Agent {profile.codename}
                </span>
              )}
              <FinalLearningContent startReady={finalTextReady} onAllDone={() => setFinalLearningDone(true)} />
            </motion.div>

            {/* Weiter-Button — unter der Box, rechts */}
            <motion.div
              className="absolute left-[42vw] flex justify-end z-20"
              style={{ width: 'clamp(420px, 40vw, 650px)', bottom: 'clamp(2rem, 12vh, 5rem)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.2 }}
            >
              {!finalLearningDone && (
                <button
                  type="button"
                  onClick={() => { (window as unknown as Record<string, () => void>).__finalLearningContinue?.(); }}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                >
                  Weiter
                </button>
              )}
              {finalLearningDone && (
                <button
                  type="button"
                  onClick={() => { playClick(); onComplete(password.trim()); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
                  style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
                >
                  Weiter zum Quiz
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Volume */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}

const FINAL_LEARNING_PARAGRAPHS = [
  'Ich bin jetzt richtig gut darin, sehr sichere Passwörter zu erstellen.',
  'Ich merke mir: Sichere Passwörter entsprechen folgenden Kriterien:',
  '✓ Mindestens 12 Zeichen\n✓ Groß- und Kleinbuchstaben\n✓ Mindestens eine Zahl\n✓ Mindestens ein Sonderzeichen\n✓ Kein Wort aus dem Wörterbuch\n✓ Keine persönlichen Informationen',
  'Gut geeignet sind Passphrasen. Diese sind sehr sicher gegen Wörterbuchattacken und Brute-Force-Angriffe und lassen sich leichter merken. Z.B. Wolke$Haus7Katze.',
];

function getFinalLearningParagraphs(): string[] {
  const usePwManager = localStorage.getItem('op-sentinel-use-pwmanager') === 'true';
  if (usePwManager) {
    return [...FINAL_LEARNING_PARAGRAPHS, 'Außerdem hilft mir ein Passwortmanager meine Passwörter sicher zu speichern.'];
  }
  return FINAL_LEARNING_PARAGRAPHS;
}

function FinalLearningContent({ startReady, onAllDone }: { startReady: boolean; onAllDone: () => void }) {
  const [paragraphs] = useState(() => getFinalLearningParagraphs());
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [allDone, setAllDone] = useState(false);
  const { playClick } = useUISounds();
  const twRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__finalLearningContinue = () => {
      if (!startReady) return;
      if (isTyping) { twRef.current?.skip(); return; }
      if (!allDone && paragraphIndex < paragraphs.length - 1) {
        playClick();
        setParagraphIndex(prev => prev + 1);
        setIsTyping(true);
      }
    };
    return () => { delete (window as unknown as Record<string, unknown>).__finalLearningContinue; };
  });

  return (
    <div className="min-h-[10rem]">
      <TypewriterText
        ref={twRef}
        key={startReady ? paragraphIndex : 'waiting'}
        text={startReady ? paragraphs[paragraphIndex] : ''}
        speed={20}
        className="text-text-primary text-xl leading-relaxed whitespace-pre-wrap"
        onComplete={() => {
          if (!startReady) return;
          setIsTyping(false);
          if (paragraphIndex >= paragraphs.length - 1) {
            setAllDone(true);
            onAllDone();
          }
        }}
      />
    </div>
  );
}

function getRatingColor(rating: 'sehr schlecht' | 'schlecht' | 'ok' | 'hervorragend'): string {
  switch (rating) {
    case 'sehr schlecht': return 'text-danger';
    case 'schlecht': return 'text-danger';
    case 'ok': return 'text-warning';
    case 'hervorragend': return 'text-accent-secondary';
  }
}

function getOverallColor(rating: 'unsicher' | 'mittel' | 'sicher' | 'sehr sicher'): string {
  switch (rating) {
    case 'unsicher': return 'text-danger';
    case 'mittel': return 'text-warning';
    case 'sicher': return 'text-accent-secondary';
    case 'sehr sicher': return 'text-accent-primary drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]';
  }
}

// === Passwortmanager-Ansicht ===

function PasswordManagerView({ onContinue, playHover }: { onContinue: () => void; playHover: () => void }) {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<number, boolean>>({});
  const savedPasswords: { file: string; password: string; rating: string }[] = JSON.parse(localStorage.getItem('op-sentinel-passwords') || '[]').slice(-5);

  const toggleVisibility = (idx: number) => {
    setVisiblePasswords(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'sehr sicher': return { text: 'Sehr Sicher', color: 'text-accent-primary' };
      case 'sicher': return { text: 'Sicher', color: 'text-accent-secondary' };
      case 'mittel': return { text: 'Halbwegs Sicher', color: 'text-warning' };
      default: return { text: 'Unsicher', color: 'text-danger' };
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        className="rounded-xl bg-[#1a1f2e]/95 border border-accent-primary/40 shadow-[0_0_40px_rgba(0,212,255,0.15)] backdrop-blur-md overflow-hidden"
        style={{ width: 'clamp(650px, 60vw, 850px)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Titelleiste */}
        <div className="flex items-center gap-3 px-8 py-5 border-b border-accent-primary/20 bg-accent-primary/5">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <KeyRound size={20} className="text-accent-primary ml-3" />
          <span className="text-accent-primary text-lg font-mono font-semibold">Passwortmanager</span>
        </div>

        {/* Passwort-Liste */}
        <div style={{ padding: '2rem 2.5rem' }} className="space-y-5">
          {savedPasswords.map((entry, idx) => {
            const ratingInfo = getRatingLabel(entry.rating);
            const isVisible = visiblePasswords[idx] ?? false;
            return (
              <div key={idx} className="rounded-lg bg-white/5 border border-white/10 hover:bg-white/8 transition-colors" style={{ padding: '1.2rem 1.8rem' }}>
                <div className="flex items-center gap-4 mb-3">
                  <FileText size={22} className="text-accent-primary/70 flex-shrink-0" />
                  <p className="text-text-primary text-base font-medium">{entry.file}</p>
                </div>
                <div className="flex items-center gap-3 mb-3" style={{ marginLeft: '2.4rem' }}>
                  <KeyRound size={16} className="text-text-secondary/50" />
                  <p className="text-text-primary font-mono text-lg">
                    {isVisible ? entry.password : '•'.repeat(Math.min(entry.password.length, 16))}
                  </p>
                </div>
                <div className="flex items-center justify-between" style={{ marginLeft: '2.4rem' }}>
                  <span className={`text-sm font-semibold ${ratingInfo.color}`}>
                    {ratingInfo.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(idx)}
                    className="flex items-center gap-2 text-text-secondary/70 hover:text-accent-primary text-sm transition-colors px-3 py-1.5 rounded-md hover:bg-white/10 border border-transparent hover:border-accent-primary/30"
                  >
                    {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>{isVisible ? 'Ausblenden' : 'Passwort anzeigen'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Weiter-Button */}
      <motion.button
        type="button"
        onClick={onContinue}
        onMouseEnter={playHover}
        className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
        style={{ fontSize: 'clamp(15px, 1.2vw, 20px)', padding: '1em 3em' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Weiter
      </motion.button>
    </div>
  );
}

export default MissionPasswordCreation;
