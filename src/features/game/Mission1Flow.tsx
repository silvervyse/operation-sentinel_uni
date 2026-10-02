import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Laptop, Lock, Save } from 'lucide-react';
import { MissionTutorial } from './MissionTutorial';
import { MissionLaptopLevel } from './MissionLaptopLevel';
import { getRandomizedLevels, LEVELS_FIXED_ORDER } from './laptop-level-config';
import type { LaptopLevelConfig } from './laptop-level-config';
import { useVolume } from '../../hooks/use-volume';
import { saveCheckpoint, loadCheckpoint } from '../../services/checkpoint-service';
import { loadProgress, saveProgress } from '../../services/persistence-service';
import { MissionPasswordCreation } from './MissionPasswordCreation';
import { MissionQuiz } from './MissionQuiz';
import { MissionBadgeCeremony } from './MissionBadgeCeremony';
import { useGameState } from '../../hooks/use-game-state';
import { assetPath } from '../../utils/asset-path';

const MISSION_ID = 'mission-1';

/**
 * Mission 1 Flow Controller.
 * Steuert den Ablauf: Tutorial → Laptop 1 → Laptop 2 → Laptop 3 → Laptop 4 → Fertig.
 * Speichert Checkpoints nach Briefing und nach jedem Laptop.
 */
export function Mission1Flow() {
  const { dispatch } = useGameState();

  // Checkpoint laden oder neue Reihenfolge generieren
  const [levels] = useState<LaptopLevelConfig[]>(() => {
    const checkpoint = loadCheckpoint(MISSION_ID);
    if (checkpoint && checkpoint.levelOrder.length > 0) {
      // Reihenfolge aus Checkpoint wiederherstellen
      return checkpoint.levelOrder
        .map(id => LEVELS_FIXED_ORDER.find(l => l.id === id))
        .filter((l): l is LaptopLevelConfig => !!l);
    }
    return getRandomizedLevels();
  });

  const [currentLevel, setCurrentLevel] = useState(() => {
    const checkpoint = loadCheckpoint(MISSION_ID);
    return checkpoint?.levelIndex ?? 0;
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentSolved, setCurrentSolved] = useState(false);
  const [showBadgeCeremony, setShowBadgeCeremony] = useState(false);
  const [quizFullScore, setQuizFullScore] = useState(false);

  // Hintergrundmusik — läuft über alle Levels hinweg
  const { volume } = useVolume();
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(assetPath('/assets/audio/Mission1.mp3'));
    audio.loop = true;
    audio.volume = volume * 0.5;
    musicRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = volume * 0.5;
    }
  }, [volume]);

  const doSaveCheckpoint = (nextLevel: number) => {
    saveCheckpoint({
      missionId: MISSION_ID,
      levelIndex: nextLevel,
      highestLevel: nextLevel,
      levelOrder: levels.map(l => l.id),
      savedAt: new Date().toISOString(),
    });
  };

  // Initialen Checkpoint speichern wenn Mission neu gestartet wird
  useEffect(() => {
    if (!loadCheckpoint(MISSION_ID)) {
      doSaveCheckpoint(0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLevelComplete = () => {
    const nextLevel = currentLevel + 1;

    // Speichern-Animation zeigen
    setIsTransitioning(true);
    setIsSaving(true);

    // Checkpoint speichern
    doSaveCheckpoint(nextLevel);

    // Kurz Speichern-Screen zeigen, dann weiter
    setTimeout(() => {
      setIsSaving(false);
      setCurrentLevel(nextLevel);
      setCurrentSolved(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 2000);
  };

  const handleCurrentSolved = () => {
    setCurrentSolved(true);
  };

  // Quiz abgeschlossen → Mission als abgeschlossen speichern & Badge-Zeremonie anzeigen
  const handleQuizComplete = (hasFullScore: boolean) => {
    setQuizFullScore(hasFullScore);
    setShowBadgeCeremony(true);

    // Letzten Screen auf Mission 2 setzen (für "Spiel fortsetzen")
    localStorage.setItem('op-sentinel-last-screen', 'mission-2-placeholder');

    // Mission als abgeschlossen speichern – immer überschreiben (auch bei Wiederholung)
    const existing = loadProgress();
    const otherMissions = existing.completedMissions.filter(m => m.missionId !== MISSION_ID);
    const updatedProgress = {
      completedMissions: [
        ...otherMissions,
        {
          missionId: MISSION_ID,
          score: hasFullScore ? 10 : 0,
          completedAt: new Date().toISOString(),
        },
      ],
      totalScore: otherMissions.reduce((sum, m) => sum + m.score, 0) + (hasFullScore ? 10 : 0),
      unlockedAchievements: existing.unlockedAchievements,
      lastPlayedAt: new Date().toISOString(),
    };
    saveProgress(updatedProgress);
  };

  // Badge-Zeremonie beendet → zurück zum Hauptmenü
  const handleMissionFinish = () => {
    // Checkpoint behalten mit höchstem Level, damit Wiederholung alle Einstiegspunkte zeigt
    saveCheckpoint({
      missionId: MISSION_ID,
      levelIndex: 0,
      highestLevel: levels.length + 2,
      levelOrder: levels.map(l => l.id),
      savedAt: new Date().toISOString(),
    });
    dispatch({ type: 'RESET_GAME' });
  };

  // Badge-Zeremonie → zur Agentenakte (erst Mission abschließen, dann navigieren)
  const handleGoToAgentFile = () => {
    saveCheckpoint({
      missionId: MISSION_ID,
      levelIndex: 0,
      highestLevel: levels.length + 2,
      levelOrder: levels.map(l => l.id),
      savedAt: new Date().toISOString(),
    });
    dispatch({ type: 'RESET_GAME' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'agent-file' }));
    }, 100);
  };

  // Badge-Zeremonie → Mission wiederholen
  const handleRepeatMission = () => {
    setShowBadgeCeremony(false);
    setQuizFullScore(false);
    saveCheckpoint({
      missionId: MISSION_ID,
      levelIndex: 0,
      highestLevel: levels.length + 2,
      levelOrder: levels.map(l => l.id),
      savedAt: new Date().toISOString(),
    });
    dispatch({ type: 'RESET_GAME' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'missions' }));
    }, 100);
  };

  // Badge-Zeremonie → Nächste Mission (Mission 2) starten
  const handleNextMission = () => {
    saveCheckpoint({
      missionId: MISSION_ID,
      levelIndex: 0,
      highestLevel: levels.length + 2,
      levelOrder: levels.map(l => l.id),
      savedAt: new Date().toISOString(),
    });
    dispatch({ type: 'RESET_GAME' });
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'mission-2-placeholder' }));
    }, 100);
  };

  // Mission komplett abgeschlossen (nach Quiz) → zurück zum Hauptmenü
  useEffect(() => {
    if (currentLevel > levels.length + 2 && !showBadgeCeremony) {
      // Checkpoint mit höchstem Level behalten
      saveCheckpoint({
        missionId: MISSION_ID,
        levelIndex: 0,
        highestLevel: levels.length + 2,
        levelOrder: levels.map(l => l.id),
        savedAt: new Date().toISOString(),
      });
      dispatch({ type: 'RESET_GAME' });
    }
  }, [currentLevel, levels.length, dispatch, showBadgeCeremony, levels]);

  if (currentLevel > levels.length + 2 && !showBadgeCeremony) {
    return null;
  }

  // Badge-Zeremonie anzeigen (nach Quiz abgeschlossen)
  if (showBadgeCeremony) {
    return (
      <div className="fixed inset-0">
        <MissionBadgeCeremony
          hasFullScore={quizFullScore}
          onGoToMenu={handleMissionFinish}
          onGoToAgentFile={handleGoToAgentFile}
          onRepeatMission={handleRepeatMission}
          onNextMission={handleNextMission}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <AnimatePresence mode="wait">
        {!isTransitioning && currentLevel === 0 && (
          <motion.div
            key="tutorial"
            className="absolute inset-0"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MissionTutorial onComplete={handleLevelComplete} onSolved={handleCurrentSolved} />
          </motion.div>
        )}

        {!isTransitioning && currentLevel > 0 && currentLevel <= levels.length && (
          <motion.div
            key={levels[currentLevel - 1].id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MissionLaptopLevel
              config={levels[currentLevel - 1]}
              onComplete={handleLevelComplete}
              onSolved={handleCurrentSolved}
              isLastLevel={currentLevel === levels.length}
            />
          </motion.div>
        )}

        {!isTransitioning && currentLevel === levels.length + 1 && (
          <motion.div
            key="password-creation"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MissionPasswordCreation
              onComplete={(_password) => { handleLevelComplete(); }}
            />
          </motion.div>
        )}

        {!isTransitioning && currentLevel === levels.length + 2 && (
          <motion.div
            key="quiz"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MissionQuiz onComplete={handleQuizComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Speichern-/Transitions-Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="transition"
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {isSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex items-center gap-3 text-accent-primary"
              >
                <Save size={28} className="animate-pulse" />
                <span className="font-display text-xl tracking-wide">Speichern...</span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fortschrittsanzeige oben rechts – nur während Laptop-Hacking-Phase */}
      {currentLevel <= levels.length && (
        <div className="fixed top-8 right-[5vw] z-[50] flex items-center gap-5 bg-bg-primary/70 backdrop-blur-sm rounded-xl px-6 py-4 border border-accent-primary/20">
          {Array.from({ length: 5 }).map((_, i) => {
            const isCracked = i < currentLevel || (i === currentLevel && currentSolved);
            return (
              <div key={i} className="relative flex items-center justify-center">
                <Laptop
                  size={48}
                  className={`transition-colors duration-300 ${isCracked ? 'text-accent-primary' : 'text-text-secondary/40'}`}
                />
                {!isCracked && (
                  <Lock size={24} className="absolute -top-2 -right-2 text-warning/80" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Mission1Flow;
