import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, RotateCcw } from 'lucide-react';
import { TypewriterText } from '../onboarding/TypewriterText';
import type { TypewriterTextHandle } from '../onboarding/TypewriterText';
import { getDirectorImagePath } from '../onboarding/director';
import type { DirectorPose } from '../onboarding/director';
import { useAudio } from '../../hooks/useAudio';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { assetPath } from '../../utils/asset-path';

const BACKGROUND_SRC = assetPath('/assets/images/Badge-Ceremony/Background.webp');
const BADGE_AGENT_SRC = assetPath('/assets/images/Badges/Agent.webp');

type CeremonyPhase = 'stars' | 'dialog' | 'badge' | 'buttons';

interface StarData {
  label: string;
  earned: boolean;
}

export interface MissionBadgeCeremonyProps {
  /** Ob der Spieler 10/10 im Quiz hatte */
  hasFullScore: boolean;
  /** Callback: Zurück zum Hauptmenü */
  onGoToMenu: () => void;
  /** Callback: Zur Agentenakte */
  onGoToAgentFile: () => void;
  /** Callback: Mission wiederholen */
  onRepeatMission: () => void;
  /** Callback: Nächste Mission starten */
  onNextMission: () => void;
}

function getDialogParagraphs(codename: string, hasFullScore: boolean): { text: string; pose: DirectorPose }[] {
  if (hasFullScore) {
    return [
      { text: `Hervorragende Arbeit, Agent ${codename}!`, pose: 'lobend' },
      { text: 'Du hast die Mission erfolgreich abgeschlossen und in der Abschlussprüfung alle Fragen korrekt beantwortet.', pose: 'lobend' },
      { text: 'Damit hast du bewiesen, dass du sichere und unsichere Passwörter zuverlässig unterscheiden kannst und weißt, wie digitale Konten wirksam geschützt werden.', pose: 'neutral' },
      { text: 'Genau dieses Wissen macht den Unterschied zwischen einem gewöhnlichen Nutzer und einem echten Cyber-Agenten. Mit jedem Einsatz wirst du besser darauf vorbereitet, Angriffe zu erkennen und sensible Informationen zu schützen.', pose: 'neutral' },
      { text: 'Alles, was du in dieser Mission gelernt hast, bleibt dauerhaft in deiner Agentenakte gespeichert. Dort kannst du die wichtigsten Erkenntnisse jederzeit nachschlagen und dein Wissen vor zukünftigen Missionen auffrischen.', pose: 'freundlich' },
      { text: 'Für deine herausragende Leistung erhältst du 3 von 3 Sternen. Außerdem wirst du für deinen erfolgreichen ersten Einsatz befördert und trägst ab sofort den Rang Agent.', pose: 'lobend' },
    ];
  }
  return [
    { text: `Gute Arbeit, Agent ${codename}. Die Mission wurde erfolgreich abgeschlossen und die Daten sind sicher verschlüsselt.`, pose: 'freundlich' },
    { text: 'Allerdings hast du bei der Abschlussprüfung nicht alle Fragen richtig beantwortet. Das zeigt mir, dass dein Wissen über Passwortsicherheit noch kleine Lücken aufweist.', pose: 'skeptisch' },
    { text: 'Im Einsatz kann bereits ein einziges unsicheres Passwort ausreichen, um vertrauliche Informationen in die falschen Hände geraten zu lassen. Wiederhole deshalb die wichtigsten Grundlagen und halte dein Wissen stets aktuell.', pose: 'neutral' },
    { text: 'Keine Sorge – alles, was du in dieser Mission gelernt hast, findest du jederzeit in deiner Agentenakte wieder. Nutze sie als Nachschlagewerk, bevor du dich der nächsten Herausforderung stellst.', pose: 'freundlich' },
    { text: 'Für deine Leistung erhältst du 2 von 3 Sternen. Eine solide Leistung – doch ich bin überzeugt, dass du beim nächsten Einsatz alle drei Sterne erreichen wirst. Viel Erfolg, Agent!', pose: 'lächelnd' },
  ];
}

/**
 * MissionBadgeCeremony – Badge-Zeremonie nach Abschluss von Mission 1.
 *
 * Flow: Sterne-Bewertung → Direktorin-Dialog → Badge (nur bei 3 Sternen) → Buttons.
 */
export function MissionBadgeCeremony({
  hasFullScore,
  onGoToMenu,
  onGoToAgentFile,
  onRepeatMission,
  onNextMission,
}: MissionBadgeCeremonyProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { profile } = usePlayerProfile();
  const { volume, setVolume } = useVolume();
  const codename = profile?.codename ?? 'Agent';

  const [phase, setPhase] = useState<CeremonyPhase>('stars');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const typewriterRef = useRef<TypewriterTextHandle>(null);

  // Sequentielles Stern-Reveal
  const [revealedStars, setRevealedStars] = useState(0);
  const starTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stars: StarData[] = [
    { label: 'Alle Laptops geknackt', earned: true },
    { label: 'Alle Dateien sicher verschlüsselt', earned: true },
    { label: '10 Punkte im Abschlussquiz', earned: hasFullScore },
  ];

  const earnedCount = stars.filter(s => s.earned).length;
  const dialogLines = getDialogParagraphs(codename, hasFullScore);

  // Sound für Stern-Reveal abspielen (erste Sekunde)
  const playStarSound = useCallback((earned: boolean) => {
    const src = earned ? assetPath('/assets/audio/Sucess.mp3') : assetPath('/assets/audio/Failure.mp3');
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
    // Nach 1 Sekunde stoppen
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 1000);
  }, [volume]);

  // Sterne nacheinander aufdecken wenn Phase 'stars' ist
  useEffect(() => {
    if (phase !== 'stars') return;
    if (revealedStars >= 3) return;

    const delay = revealedStars === 0 ? 800 : 1200; // Erster Stern nach 800ms, danach 1200ms Abstand
    starTimerRef.current = setTimeout(() => {
      playStarSound(stars[revealedStars].earned);
      setRevealedStars(prev => prev + 1);
    }, delay);

    return () => {
      if (starTimerRef.current) clearTimeout(starTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, revealedStars]);

  const handleTypingComplete = useCallback(() => {
    setIsTyping(false);
  }, []);

  const handleDialogContinue = () => {
    if (isTyping) {
      typewriterRef.current?.skip();
      return;
    }

    if (paragraphIndex < dialogLines.length - 1) {
      playClick();
      setParagraphIndex(prev => prev + 1);
      setIsTyping(true);
    } else {
      playClick();
      // Nach Dialog: Badge anzeigen (nur bei 3 Sternen), sonst direkt zu Buttons
      if (hasFullScore) {
        setPhase('badge');
      } else {
        setPhase('buttons');
      }
    }
  };

  const handleStarsContinue = () => {
    playClick();
    setPhase('dialog');
  };

  const handleBadgeContinue = () => {
    playClick();
    setPhase('buttons');
  };

  const currentPose = dialogLines[paragraphIndex]?.pose ?? 'neutral';

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      {/* Background */}
      <img
        src={BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Phase: Sterne-Bewertung */}
      <AnimatePresence>
        {phase === 'stars' && (
          <motion.div
            key="stars"
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Titel */}
              <h1
                className="font-display text-accent-primary tracking-wide text-center"
                style={{ fontSize: 'clamp(22px, 2.5vw, 40px)' }}
              >
                Missionsbewertung
              </h1>

              {/* Sterne */}
              <div className="flex gap-6" style={{ marginTop: '2vh' }}>
                {stars.map((star, i) => (
                  <motion.div
                    key={i}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={i < revealedStars ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                  >
                    <Star
                      size={64}
                      className={star.earned
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                        : 'text-text-secondary/30'
                      }
                    />
                    <span
                      className={`text-center max-w-[140px] ${star.earned ? 'text-text-primary' : 'text-text-secondary/60'}`}
                      style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}
                    >
                      {star.label}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Ergebnis-Text */}
              <motion.p
                className="text-text-secondary text-center"
                style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', marginTop: '3vh' }}
                initial={{ opacity: 0 }}
                animate={revealedStars >= 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                {earnedCount} von 3 Sternen erreicht
              </motion.p>

              {/* Weiter-Button */}
              <motion.button
                type="button"
                onClick={handleStarsContinue}
                onMouseEnter={playHover}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.8em 2.5em', marginTop: '3vh' }}
                initial={{ opacity: 0 }}
                animate={revealedStars >= 3 ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                Weiter
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Direktorin-Dialog */}
      <AnimatePresence>
        {phase === 'dialog' && (
          <motion.div
            key="dialog"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Director Nova */}
            <div className="absolute bottom-0 h-full flex items-end" style={{ width: '35%', left: '3%' }}>
              <img
                src={getDirectorImagePath(currentPose)}
                alt="Director Nova"
                className="max-h-[85%] w-auto object-contain"
              />
            </div>

            {/* Dialog-Box */}
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
                    {dialogLines.reduce((a, b) => a.text.length > b.text.length ? a : b, dialogLines[0]).text}
                  </p>
                  <div className="absolute top-0 left-0 right-0">
                    <TypewriterText
                      ref={typewriterRef}
                      key={paragraphIndex}
                      text={dialogLines[paragraphIndex].text}
                      onComplete={handleTypingComplete}
                      className="text-white text-2xl leading-relaxed whitespace-pre-wrap"
                      highlight={codename}
                    />
                  </div>
                </div>
              </div>

              {/* Weiter-Button */}
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

      {/* Phase: Badge-Verleihung (nur bei 3 Sternen) */}
      <AnimatePresence>
        {phase === 'badge' && (
          <motion.div
            key="badge"
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-black/80" />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* Badge-Bild */}
              <motion.img
                src={BADGE_AGENT_SRC}
                alt="Badge: Agent"
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
                  Befördert!
                </h2>
                <p
                  className="text-text-primary mt-2"
                  style={{ fontSize: 'clamp(14px, 1.4vw, 26px)' }}
                >
                  Neuer Rang: <span className="text-accent-primary font-bold">Agent</span>
                </p>
              </div>

              {/* Weiter-Button */}
              <button
                type="button"
                onClick={handleBadgeContinue}
                onMouseEnter={playHover}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw', marginTop: '3vh' }}
              >
                Weiter
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Abschluss-Buttons */}
      <AnimatePresence>
        {phase === 'buttons' && (
          <motion.div
            key="buttons"
            className="absolute inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <motion.div
              className="relative z-10 flex flex-col items-center gap-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* Titel */}
              <div className="text-center">
                <h2
                  className="font-display text-accent-primary tracking-wide"
                  style={{ fontSize: 'clamp(20px, 2.2vw, 36px)' }}
                >
                  Mission abgeschlossen
                </h2>
                <div className="flex gap-2 justify-center mt-3">
                  {stars.map((star, i) => (
                    <Star
                      key={i}
                      size={32}
                      className={star.earned
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-text-secondary/30'
                      }
                    />
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col items-center gap-3" style={{ marginTop: '3vh', width: 'clamp(200px, 20vw, 320px)' }}>
                <button
                  type="button"
                  onClick={() => { playClick(); onGoToMenu(); }}
                  onMouseEnter={playHover}
                  className="w-full font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
                >
                  Zum Hauptmenü
                </button>
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
                  onClick={() => { playClick(); onRepeatMission(); }}
                  onMouseEnter={playHover}
                  className="w-full flex items-center justify-center gap-2 font-semibold rounded-lg bg-transparent border-2 border-text-secondary/40 text-text-secondary hover:bg-text-secondary/10 hover:border-text-secondary/60 transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 1vw, 18px)', padding: '0.8vh 2vw' }}
                >
                  <RotateCcw size={18} />
                  Mission wiederholen
                </button>
              </div>

              {/* Mission 2 – abgesetzt und größer */}
              <button
                type="button"
                onClick={() => { playClick(); onNextMission(); }}
                onMouseEnter={playHover}
                className="font-semibold rounded-lg bg-accent-primary/20 border-2 border-accent-primary text-accent-primary shadow-[0_0_18px_rgba(0,212,255,0.5)] hover:bg-accent-primary/30 hover:shadow-[0_0_28px_rgba(0,212,255,0.7)] transition-colors duration-200"
                style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', padding: '1.2vh 3vw', marginTop: '3vh' }}
              >
                Mission 2 starten
              </button>
            </motion.div>
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
