import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useGameState } from '../../hooks/use-game-state';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useVolume } from '../../hooks/use-volume';
import AppShell from '../../components/AppShell';
import MainMenu from '../menu/MainMenu';
import { MissionsPlaceholder } from '../menu/MissionsPlaceholder';
import { AgentFilePlaceholder } from '../menu/AgentFilePlaceholder';
import MissionBriefing from './MissionBriefing';
import Mission1Flow from './Mission1Flow';
import MissionPlaying from './MissionPlaying';
import MissionDebriefing from '../results/MissionDebriefing';
import { MissionBriefingDialog } from './MissionBriefingDialog';
import { Mission2Placeholder } from './Mission2Placeholder';
import { MissionBriefingView } from '../menu/MissionBriefingView';
import { PasswordAnalyzerView } from '../menu/PasswordAnalyzerView';
import { ReportScreen } from '../menu/ReportScreen';
import { AboutScreen } from '../menu/AboutScreen';
import { QuitMissionButton } from '../../components/QuitMissionButton';
import { OnboardingFlow } from '../onboarding';
import { MISSIONS } from '../../data/missions';
import { hasCheckpoint, loadCheckpoint } from '../../services/checkpoint-service';
import { assetPath } from '../../utils/asset-path';

/** Lautstärken für Background-Musik */
const MUSIC_VOLUME_QUIET_FACTOR = 0.4; // Faktor für leiser während Onboarding

/**
 * Leitet den aktuell anzuzeigenden Screen deterministisch
 * aus dem GameState ab. Keine eigene State-Verwaltung.
 * Zeigt den Onboarding-Flow wenn kein PlayerProfile existiert
 * und der User "Neues Spiel" geklickt hat.
 */
export function ScreenNavigator() {
  const { state, dispatch } = useGameState();
  const { profile, isLoading } = usePlayerProfile();
  const { volume: musicVolume, setVolume: setMusicVolume } = useVolume();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [isQuitting, setIsQuitting] = useState(false);
  const [hasEnteredMenu, setHasEnteredMenu] = useState(false);
  const { missionStatus, phase, currentMission, currentScenarioIndex } = state;

  // Zentrale Musikverwaltung – lebt im ScreenNavigator, überlebt Screen-Wechsel
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const musicStartedRef = useRef(false);

  // Sync ref mit state
  useEffect(() => {
    musicStartedRef.current = musicStarted;
  }, [musicStarted]);

  // Erstelle Audio-Element + Web Audio API GainNode einmalig
  // GainNode erlaubt In-App-Lautstärkeregelung ohne die Windows-Systemlautstärke zu blockieren
  useEffect(() => {
    const audio = new Audio(assetPath('/assets/audio/mainmenu.mp3'));
    audio.loop = true;
    audio.volume = 1; // Volume auf 1 lassen – Regelung erfolgt über GainNode
    audio.preload = 'auto';
    musicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      musicRef.current = null;
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      gainNodeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Web Audio API Setup – wird beim ersten Play initialisiert (braucht User-Interaktion)
  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current && gainNodeRef.current) return;
    const music = musicRef.current;
    if (!music) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaElementSource(music);
    const gainNode = ctx.createGain();
    gainNode.gain.value = musicVolume;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gainNode;
  }, [musicVolume]);

  // Volume-Änderungen DIREKT auf den GainNode anwenden
  const handleVolumeChange = useCallback((newVolume: number) => {
    setMusicVolume(newVolume);
    // Über GainNode regeln – lässt Windows-Systemlautstärke intakt
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  }, [setMusicVolume]);

  // Lautstärke anpassen je nach aktuellem Screen (über GainNode)
  useEffect(() => {
    const gain = gainNodeRef.current;
    const music = musicRef.current;
    if (!gain || !music || !musicStarted) return;

    if (showOnboarding) {
      // Während Onboarding leiser
      gain.gain.value = musicVolume * MUSIC_VOLUME_QUIET_FACTOR;
    } else if (missionStatus === 'not-started' && !activeScreen?.startsWith('briefing-')) {
      // Im Hauptmenü eingestellte Lautstärke (nur wenn kein Briefing aktiv)
      gain.gain.value = musicVolume;
    } else {
      // Mission gestartet oder Briefing aktiv → Musik ausblenden
      const fadeMs = 800;
      const steps = 20;
      const stepTime = fadeMs / steps;
      const startVol = gain.gain.value;
      const volumeStep = startVol / steps;

      const interval = setInterval(() => {
        const currentVol = gain.gain.value;
        if (currentVol - volumeStep <= 0) {
          gain.gain.value = 0;
          music.pause();
          clearInterval(interval);
          setMusicStarted(false);
        } else {
          gain.gain.value = Math.max(0, currentVol - volumeStep);
        }
      }, stepTime);

      return () => clearInterval(interval);
    }
  }, [showOnboarding, missionStatus, musicStarted, musicVolume, activeScreen]);

  // Callback für MainMenu: Musik starten (wird beim "Entry Gate" Klick aufgerufen)
  const handleMusicStart = useCallback(() => {
    const music = musicRef.current;
    if (!music || musicStarted) return;

    // AudioContext muss nach User-Interaktion erstellt werden
    ensureAudioContext();

    const playPromise = music.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setMusicStarted(true))
        .catch(() => {
          // Autoplay blockiert – Listener auf erste Interaktion
          const handleInteraction = () => {
            ensureAudioContext();
            music.play().then(() => setMusicStarted(true)).catch(() => {});
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('keydown', handleInteraction);
          };
          document.addEventListener('click', handleInteraction);
          document.addEventListener('keydown', handleInteraction);
        });
    }
  }, [musicStarted, ensureAudioContext]);

  // Wird vom MainMenu aufgerufen wenn "Neues Spiel" / "Spiel fortsetzen" geklickt wird
  const handleStartGame = useCallback(() => {
    if (!profile) {
      // Kein Profil → Onboarding anzeigen
      setShowOnboarding(true);
    } else {
      // Letzten Aufenthaltsort laden (z.B. 'mission-2-placeholder')
      const lastScreen = localStorage.getItem('op-sentinel-last-screen');

      // Profil vorhanden → aktuelles Level starten (das noch nicht bestanden wurde)
      const progress = JSON.parse(localStorage.getItem('it-security-game-progress') || '{"completedMissions":[]}');
      const completedIds = (progress.completedMissions || []).map((m: { missionId: string }) => m.missionId);

      if (completedIds.includes('mission-1')) {
        // Mission 1 abgeschlossen
        const checkpoint = hasCheckpoint('mission-1') ? loadCheckpoint('mission-1') : null;
        if (checkpoint && checkpoint.levelIndex > 0 && !lastScreen) {
          // Spieler hat Mission 1 Wiederholung gestartet und ist mittendrin
          dispatch({ type: 'START_MISSION', payload: MISSIONS[0] });
          setActiveScreen(null);
        } else if (lastScreen) {
          // Letzten Fortschritts-Screen wiederherstellen (z.B. Mission 2 Platzhalter)
          setActiveScreen(lastScreen);
        } else {
          // Fallback → Mission 2 Platzhalter
          setActiveScreen('mission-2-placeholder');
        }
      } else if (hasCheckpoint('mission-1')) {
        // Mission 1 noch nicht abgeschlossen, aber Checkpoint → direkt fortsetzen
        dispatch({ type: 'START_MISSION', payload: MISSIONS[0] });
        setActiveScreen(null);
      } else {
        setActiveScreen('briefing-mission-1');
      }
    }
  }, [profile, dispatch]);

  // Wird aufgerufen wenn Onboarding abgeschlossen ist → Navigation je nach Ziel
  const handleOnboardingComplete = useCallback((destination: 'mission' | 'agent-file' | 'menu') => {
    setShowOnboarding(false);
    switch (destination) {
      case 'mission':
        setActiveScreen('briefing-mission-1');
        break;
      case 'agent-file':
        setActiveScreen('agent-file');
        break;
      case 'menu':
        // Einfach zum Hauptmenü → nichts weiter nötig
        break;
    }
  }, []);

  // Navigation zu Unterseiten (Missionen, Agentenakte)
  const handleNavigate = useCallback((screen: string) => {
    setActiveScreen(screen);
  }, []);

  // Letzten besuchten Screen speichern für "Spiel fortsetzen"
  // Nur Screens die als "Spielfortschritt" gelten (nicht Menüs oder Agentenakte)
  useEffect(() => {
    if (activeScreen === 'mission-2-placeholder') {
      localStorage.setItem('op-sentinel-last-screen', activeScreen);
    }
  }, [activeScreen]);

  // Listener für Navigation-Events aus der Badge-Zeremonie
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setActiveScreen(detail);
    };
    window.addEventListener('navigate-to', handler);
    return () => window.removeEventListener('navigate-to', handler);
  }, []);

  // Mission-Briefing starten (oder direkt zur Mission wenn Checkpoint vorhanden)
  const handleSelectMission = useCallback((missionId: string) => {
    // Noch nicht implementierte Missionen → Platzhalter-Screen
    if (missionId !== 'mission-1') {
      setActiveScreen('mission-2-placeholder');
      return;
    }

    // Mission 1 wird gestartet/fortgesetzt → lastScreen löschen damit Fortsetzen hierher zurückkehrt
    localStorage.removeItem('op-sentinel-last-screen');

    if (hasCheckpoint(missionId)) {
      const checkpoint = loadCheckpoint(missionId);
      // Wenn levelIndex 0 → User will ganz von vorne starten → Briefing zeigen
      if (checkpoint && checkpoint.levelIndex === 0) {
        setActiveScreen(`briefing-${missionId}`);
      } else {
        // Checkpoint existiert mit Fortschritt → Briefing überspringen, direkt zur Mission
        dispatch({ type: 'START_MISSION', payload: MISSIONS[0] });
        setActiveScreen(null);
      }
    } else {
      setActiveScreen(`briefing-${missionId}`);
    }
  }, [dispatch]);

  const handleBackToMenu = useCallback(() => {
    setActiveScreen(null);
  }, []);

  // Mission verlassen → Fade-out, dann zurück zum Hauptmenü
  const handleQuitMission = useCallback(() => {
    setIsQuitting(true);
    setTimeout(() => {
      dispatch({ type: 'RESET_GAME' });
      setActiveScreen(null);
      setIsQuitting(false);
    }, 600);
  }, [dispatch]);

  // Loading state while profile is being loaded from localStorage
  if (isLoading) {
    return (
      <div data-testid="screen-navigator" className="h-screen w-screen flex items-center justify-center bg-bg-primary">
        <p className="text-text-secondary text-lg">Lade...</p>
      </div>
    );
  }

  // StatusBar nur während Playing-Phase
  const showStatusBar = phase === 'playing';
  const totalScenarios = currentMission?.scenarios.length ?? 0;
  const progressPercent = totalScenarios > 0
    ? (currentScenarioIndex / totalScenarios) * 100
    : 0;
  const progressLabel = showStatusBar
    ? `Szenario ${currentScenarioIndex + 1} von ${totalScenarios}`
    : undefined;

  // Onboarding-Flow: nur wenn User "Neues Spiel" geklickt hat und kein Profil existiert
  if (showOnboarding) {
    return (
      <div data-testid="screen-navigator">
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  // MainMenu rendert fullscreen ohne AppShell
  if (missionStatus === 'not-started') {
    // Bestimme welcher Screen angezeigt wird + einen Key für AnimatePresence
    const screenKey = activeScreen ?? 'main-menu';

    const renderActiveScreen = () => {
      if (activeScreen === 'missions') {
        return <MissionsPlaceholder onBack={handleBackToMenu} onSelectMission={handleSelectMission} />;
      }
      if (activeScreen === 'agent-file') {
        return <AgentFilePlaceholder onBack={handleBackToMenu} />;
      }
      if (activeScreen === 'mission-2-placeholder') {
        return <Mission2Placeholder onBack={() => setActiveScreen('missions')} />;
      }
      if (activeScreen === 'mission-briefing-view') {
        return <MissionBriefingView onBack={() => setActiveScreen('agent-file')} />;
      }
      if (activeScreen === 'password-analyzer') {
        return <PasswordAnalyzerView onBack={() => setActiveScreen('agent-file')} />;
      }
      if (activeScreen === 'report') {
        return <ReportScreen onBack={handleBackToMenu} />;
      }
      if (activeScreen === 'about') {
        return <AboutScreen onBack={handleBackToMenu} />;
      }
      if (activeScreen?.startsWith('briefing-')) {
        const missionId = activeScreen.replace('briefing-', '');
        const dialogMap: Record<string, string> = {
          'mission-1': assetPath('/assets/dialogs/Mission-Briefings/MB1.md'),
          'mission-2': assetPath('/assets/dialogs/Mission-Briefings/MB2.md'),
          'mission-3': assetPath('/assets/dialogs/Mission-Briefings/MB3.md'),
        };
        const titleMap: Record<string, string> = {
          'mission-1': 'Operation: Passwortschutz',
          'mission-2': 'Operation: Social Engineering',
          'mission-3': 'Operation: Netzwerksicherheit',
        };
        const splashMap: Record<string, string> = {
          'mission-1': assetPath('/assets/images/Level 1/Background.webp'),
          'mission-2': assetPath('/assets/images/Level 1/Background.webp'),
          'mission-3': assetPath('/assets/images/Level 1/Background.webp'),
        };
        const dialogPath = dialogMap[missionId] ?? dialogMap['mission-1'];
        const missionTitle = titleMap[missionId] ?? 'Mission';
        const splashBg = splashMap[missionId];

        const handleBriefingComplete = () => {
          if (missionId === 'mission-1') {
            dispatch({ type: 'START_MISSION', payload: MISSIONS[0] });
            setActiveScreen(null);
          }
        };

        return (
          <MissionBriefingDialog
            dialogPath={dialogPath}
            missionTitle={missionTitle}
            splashBackground={splashBg}
            briefingPath={missionId === 'mission-1' ? assetPath('/assets/dialogs/MissionBriefing1.md') : undefined}
            onComplete={handleBriefingComplete}
            onBack={handleBackToMenu}
          />
        );
      }

      // Default: MainMenu
      return (
        <MainMenu
          onStartGame={handleStartGame}
          onMusicStart={handleMusicStart}
          onNavigate={handleNavigate}
          hasEntered={hasEnteredMenu}
          onEntry={() => setHasEnteredMenu(true)}
          musicVolume={musicVolume}
          onVolumeChange={handleVolumeChange}
        />
      );
    };

    return (
      <div data-testid="screen-navigator">
        <AnimatePresence mode="wait">
          <motion.div
            key={screenKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-0"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Tutorial-Phase rendert fullscreen ohne AppShell
  if (missionStatus === 'in-progress' && phase === 'tutorial') {
    return (
      <div data-testid="screen-navigator">
        <QuitMissionButton onQuit={handleQuitMission} />
        <Mission1Flow />
        {/* Fade-out Overlay beim Verlassen */}
        <AnimatePresence>
          {isQuitting && (
            <motion.div
              key="quit-fade"
              className="fixed inset-0 z-[150] bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Alle anderen Screens innerhalb AppShell
  const renderScreen = () => {
    if (missionStatus === 'in-progress' && phase === 'briefing') {
      return <MissionBriefing />;
    }
    if (missionStatus === 'in-progress' && phase === 'playing') {
      return <MissionPlaying />;
    }
    if (missionStatus === 'completed' && phase === 'debriefing') {
      return <MissionDebriefing />;
    }
    // Fallback
    return <MainMenu />;
  };

  return (
    <>
      <QuitMissionButton onQuit={handleQuitMission} />
      <AppShell
        showStatusBar={showStatusBar}
        statusBarProps={{
          progress: progressPercent,
          label: progressLabel,
        }}
      >
        <div data-testid="screen-navigator">
          {renderScreen()}
        </div>
      </AppShell>
    </>
  );
}

export default ScreenNavigator;
