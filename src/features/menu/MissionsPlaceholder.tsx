import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Lock, Play, Shield, Wifi, Brain, RotateCcw, Star, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { getCharacterImagePath } from '../onboarding/characters';
import { hasCheckpoint, clearCheckpoint, loadCheckpoint, saveCheckpoint, getHighestLevel } from '../../services/checkpoint-service';
import { loadProgress } from '../../services/persistence-service';
import { assetPath } from '../../utils/asset-path';

export interface MissionsPlaceholderProps {
  onBack: () => void;
  onSelectMission: (missionId: string) => void;
}

interface MissionEntry {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  unlocked: boolean;
  previewImage: string | null;
  icon: typeof Lock;
}

const MISSION_LIST: MissionEntry[] = [
  {
    id: 'mission-1',
    title: 'Mission 1',
    subtitle: 'Operation: Passwortschutz',
    description:
      'Wir haben einige verdächtige Laptops sichergestellt. Sind Sie ein Experte zum Thema Passwortsicherheit und gelangen für uns schnell an die wichtigen Dateien?',
    unlocked: true,
    previewImage: assetPath('/assets/images/Mission1/Vorschaubild.webp'),
    icon: Shield,
  },
  {
    id: 'mission-2',
    title: 'Mission 2',
    subtitle: 'Operation: Social Engineering',
    description:
      'Unbekannte Akteure versuchen, Mitarbeiter zu manipulieren. Erkenne psychologische Tricks und schütze dein Team vor gezielter Täuschung.',
    unlocked: false,
    previewImage: assetPath('/assets/images/Mission 2/Vorschaubild.webp'),
    icon: Brain,
  },
  {
    id: 'mission-3',
    title: 'Mission 3',
    subtitle: 'Operation: Phishing',
    description:
      'Gefälschte E-Mails, täuschend echte Webseiten und manipulierte Links – in dieser Mission lernst du, Phishing-Angriffe zu erkennen, bevor vertrauliche Daten in die falschen Hände geraten.',
    unlocked: false,
    previewImage: assetPath('/assets/images/Mission3/vorschaubild.webp'),
    icon: Wifi,
  },
];

/**
 * Missionsübersicht – Zeigt verfügbare Missionen als Karten mit Vorschaubild,
 * Beschreibung und Start-Button. Gesperrte Missionen sind ausgegraut.
 */
export function MissionsPlaceholder({ onBack, onSelectMission }: MissionsPlaceholderProps) {
  const { playHover, playClick, playLockedClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
    lockedClickSrc: assetPath('/assets/audio/clicknotpossible.mp3'),
  });
  const { profile } = usePlayerProfile();

  const [lockedHint, setLockedHint] = useState<string | null>(null);

  // Dynamisch berechnen welche Missionen freigeschaltet sind
  const progress = loadProgress();
  const completedIds = progress.completedMissions.map(m => m.missionId);
  const missions = MISSION_LIST.map(m => {
    if (m.id === 'mission-1') return { ...m, unlocked: true };
    if (m.id === 'mission-2') return { ...m, unlocked: completedIds.includes('mission-1') };
    if (m.id === 'mission-3') return { ...m, unlocked: completedIds.includes('mission-2') };
    return m;
  });

  const handleLockedClick = (missionId: string) => {
    playLockedClick();
    setLockedHint(missionId);
    setTimeout(() => setLockedHint(null), 3000);
  };

  // Agenten-Bild für die Missionsauswahl
  const agentImagePath = profile
    ? getCharacterImagePath(profile.selectedCharacter, 'mission-select')
    : null;

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start bg-cover bg-center bg-no-repeat overflow-y-auto overflow-x-hidden"
      style={{ backgroundImage: `url(${assetPath('/assets/images/Missionsnetzwerk/Background.webp')})` }}
    >
      <div className="fixed inset-0 bg-gradient-to-b from-black/55 to-black/75 pointer-events-none" />

      {/* Agent Character – rechts positioniert, mit Slide-in Animation */}
      {agentImagePath && (
        <motion.img
          src={agentImagePath}
          alt="Dein Agent"
          className="fixed bottom-0 right-[2%] z-[5] pointer-events-none object-contain hidden xl:block"
          style={{ height: '65%', maxWidth: '25%' }}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      )}

      <div className="relative z-10 flex flex-col items-center w-[90%] max-w-[900px] pb-[4vh]" style={{ paddingTop: '8vh' }}>
        {/* Header */}
        <h1
          className="font-display text-accent-primary tracking-wide text-center mb-[1vh]"
          style={{ fontSize: 'clamp(24px, 2.8vw, 44px)' }}
        >
          Missionsnetzwerk
        </h1>
        <p className="text-text-secondary text-center" style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', marginBottom: '4vh' }}>
          Wähle eine Mission aus dem verfügbaren Netzwerk.
        </p>

        {/* Mission Cards */}
        <div className="flex flex-col gap-[4vh] w-full">
          {missions.map((mission) => {
            const Icon = mission.icon;

            return (
              /* Outer wrapper */
              <div key={mission.id} className="relative">
                {/* Abgeschlossen-Badge oben rechts */}
                {(() => {
                  const missionProgress = progress.completedMissions.find(m => m.missionId === mission.id);
                  if (!missionProgress) return null;
                  const starCount = missionProgress.score >= 10 ? 3 : 2;
                  return (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-green-500/20 border-2 border-green-400 rounded-lg px-3 py-1.5">
                        <CheckCircle size={18} className="text-green-400" />
                        <span className="text-green-400 font-bold uppercase tracking-wider" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>
                          Abgeschlossen
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <Star
                            key={i}
                            size={24}
                            className={i <= starCount
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-text-secondary/30'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {/* Card */}
                <div
                  className={`w-full rounded-xl border transition-all duration-300 ${
                    mission.unlocked
                      ? 'border-accent-primary/30 bg-bg-secondary/80 hover:border-accent-primary/60 hover:shadow-[0_0_25px_rgba(0,212,255,0.15)]'
                      : 'border-text-secondary/15 bg-bg-secondary/40 opacity-55'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row overflow-hidden rounded-xl">
                    {/* Preview Image */}
                    <div className="sm:w-64 w-full h-44 sm:h-auto flex-shrink-0 relative overflow-hidden rounded-t-xl sm:rounded-t-none sm:rounded-l-xl">
                      {mission.previewImage ? (
                        <img
                          src={mission.previewImage}
                          alt={`Vorschau: ${mission.subtitle}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg-tertiary/80 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-3 text-text-secondary/50">
                            <Icon size={42} />
                            <span className="text-sm uppercase tracking-wider">Klassifiziert</span>
                          </div>
                        </div>
                      )}
                      {/* Locked overlay */}
                      {!mission.unlocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Lock size={36} className="text-text-secondary/70" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className="flex-1 flex flex-col justify-center"
                      style={{ padding: 'clamp(20px, 2.5vw, 40px)' }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`uppercase tracking-wider font-medium ${
                            mission.unlocked ? 'text-accent-primary/80' : 'text-text-secondary/50'
                          }`}
                          style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}
                        >
                          {mission.title}
                        </span>
                        {!mission.unlocked && (
                          <span
                            className="bg-text-secondary/10 text-text-secondary/70 px-2.5 py-0.5 rounded-full"
                            style={{ fontSize: 'clamp(10px, 0.75vw, 13px)' }}
                          >
                            Gesperrt
                          </span>
                        )}
                      </div>
                      <h3
                        className={`font-semibold mb-3 ${
                          mission.unlocked ? 'text-text-primary' : 'text-text-secondary'
                        }`}
                        style={{ fontSize: 'clamp(16px, 1.5vw, 26px)' }}
                      >
                        {mission.subtitle}
                      </h3>
                      <p
                        className="text-text-secondary leading-relaxed"
                        style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}
                      >
                        {mission.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Start/Fortsetzen Buttons */}
                <div className="absolute" style={{ right: '0vw', top: '100%', transform: 'translateY(-50%)' }}>
                  <div className="relative flex items-center gap-3">
                    {(() => {
                      const progress = loadProgress();
                      const isCompleted = progress.completedMissions.some(m => m.missionId === mission.id);

                      if (mission.unlocked && isCompleted) {
                        // Mission abgeschlossen → nur "Mission neustarten" mit Wiederholungs-Dialog
                        return (
                          <RestartButton missionId={mission.id} label="Mission neustarten" onRestart={(startLevel) => {
                            playClick();
                            const checkpoint = loadCheckpoint(mission.id);
                            if (checkpoint) {
                              saveCheckpoint({
                                ...checkpoint,
                                levelIndex: startLevel ?? 0,
                                highestLevel: checkpoint.highestLevel ?? checkpoint.levelIndex,
                                savedAt: new Date().toISOString(),
                              });
                            } else {
                              // Neuen Checkpoint anlegen für den gewählten Startpunkt
                              saveCheckpoint({
                                missionId: mission.id,
                                levelIndex: startLevel ?? 0,
                                highestLevel: getHighestLevel(mission.id),
                                levelOrder: [],
                                savedAt: new Date().toISOString(),
                              });
                            }
                            onSelectMission(mission.id);
                          }} />
                        );
                      }

                      // Mission noch nicht abgeschlossen
                      return (
                        <>
                          {/* Von vorne starten (nur wenn Checkpoint existiert) */}
                          {mission.unlocked && hasCheckpoint(mission.id) && (
                            <RestartButton missionId={mission.id} onRestart={(startLevel) => {
                              playClick();
                              const checkpoint = loadCheckpoint(mission.id);
                              if (checkpoint) {
                                saveCheckpoint({
                                  ...checkpoint,
                                  levelIndex: startLevel ?? 0,
                                  highestLevel: checkpoint.highestLevel ?? checkpoint.levelIndex,
                                  savedAt: new Date().toISOString(),
                                });
                              } else {
                                clearCheckpoint(mission.id);
                              }
                              onSelectMission(mission.id);
                            }} />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              if (mission.unlocked) {
                                playClick();
                                if (mission.id === 'mission-1') {
                                  onSelectMission(mission.id);
                                } else {
                                  onSelectMission(mission.id);
                                }
                              } else {
                                handleLockedClick(mission.id);
                              }
                            }}
                            onMouseEnter={() => {
                              if (mission.unlocked) playHover();
                            }}
                            className={`inline-flex items-center gap-3 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                              mission.unlocked
                                ? 'bg-bg-secondary border-2 border-accent-primary text-accent-primary shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:bg-bg-secondary hover:shadow-[0_0_28px_rgba(0,212,255,0.6)] cursor-pointer'
                                : 'bg-bg-secondary/80 border border-text-secondary/20 text-text-secondary/50 cursor-pointer'
                            }`}
                            style={{
                              fontSize: 'clamp(13px, 1.1vw, 18px)',
                              padding: 'clamp(10px, 1.3vh, 16px) clamp(20px, 2vw, 36px)',
                            }}
                          >
                            {mission.unlocked ? (
                              <>
                                <Play size={20} />
                                {hasCheckpoint(mission.id) ? 'Mission fortsetzen' : 'Mission starten'}
                              </>
                            ) : (
                              <>
                                <Lock size={16} />
                                Gesperrt
                              </>
                            )}
                          </button>
                        </>
                      );
                    })()}
                    {/* Tooltip bei gesperrter Mission */}
                    {lockedHint === mission.id && (
                      <div
                        className="absolute left-full top-1/2 -translate-y-1/2 rounded-2xl bg-black/85 border border-warning/40 text-text-primary text-left backdrop-blur-md animate-fade-in flex items-start gap-3"
                        style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', padding: '1.2rem 1.8rem', marginLeft: '1.5vw', whiteSpace: 'nowrap' }}
                      >
                        <Lock size={16} className="text-warning shrink-0 mt-0.5" />
                        <span className="leading-relaxed">Schließe zuerst die vorherigen Missionen ab.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Back button – fixed oben links */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onBack();
          }}
          onMouseEnter={playHover}
          className="fixed top-5 left-5 z-30 flex items-center gap-2 font-semibold rounded-lg bg-gray-900/90 border border-accent-primary/60 text-accent-primary hover:bg-accent-primary/20 hover:border-accent-primary transition-all duration-200 backdrop-blur-sm"
          style={{
            fontSize: 'clamp(12px, 1vw, 16px)',
            padding: '0.6em 1.2em',
          }}
        >
          <ArrowLeft size={16} />
          Hauptmenü
        </button>
      </div>

    </div>
  );
}

// === Von vorne starten Button mit Wiederholungs-Dialog ===

/** Einstiegspunkte für die Mission-Wiederholung */
interface EntryPoint {
  id: string;
  label: string;
  description: string;
  /** Ab welchem levelIndex dieser Einstiegspunkt freigeschaltet ist */
  requiredLevel: number;
  /** Auf welchen levelIndex beim Start gesetzt wird */
  startLevel: number;
}

const MISSION_1_ENTRY_POINTS: EntryPoint[] = [
  {
    id: 'laptop-hacking',
    label: 'Laptop-Hacking',
    description: 'Startet die Mission ganz von vorne.',
    requiredLevel: 0,
    startLevel: 0,
  },
  {
    id: 'password-creation',
    label: 'Dateien verschlüsseln',
    description: 'Startet ab dem zweiten Teil der Mission.',
    requiredLevel: 5,
    startLevel: 5,
  },
  {
    id: 'quiz',
    label: 'Abschlussquiz',
    description: 'Führt direkt zum Abschlussquiz.',
    requiredLevel: 6,
    startLevel: 6,
  },
];

function RestartButton({ missionId, onRestart, label }: { missionId: string; onRestart: (startLevel?: number) => void; label?: string }) {
  const [showDialog, setShowDialog] = useState(false);
  const { playHover, playClick, playLockedClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
    lockedClickSrc: assetPath('/assets/audio/clicknotpossible.mp3'),
  });

  // Höchsten jemals erreichten Fortschritt laden (bleibt dauerhaft)
  const highestLevel = getHighestLevel(missionId);

  return (
    <>
      <button
        type="button"
        onClick={() => { playClick(); setShowDialog(true); }}
        onMouseEnter={playHover}
        className={`inline-flex items-center gap-2 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
          label
            ? 'bg-bg-secondary border-2 border-accent-primary text-accent-primary shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:bg-bg-secondary hover:shadow-[0_0_28px_rgba(0,212,255,0.6)]'
            : 'bg-bg-secondary/80 border border-text-secondary/30 text-text-secondary hover:text-text-primary hover:border-text-secondary/60'
        }`}
        style={{
          fontSize: label ? 'clamp(13px, 1.1vw, 18px)' : 'clamp(11px, 0.9vw, 15px)',
          padding: label ? 'clamp(10px, 1.3vh, 16px) clamp(20px, 2vw, 36px)' : 'clamp(8px, 1vh, 12px) clamp(14px, 1.5vw, 24px)',
        }}
      >
        <RotateCcw size={label ? 20 : 16} />
        {label ?? 'Von vorne'}
      </button>

      {showDialog && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowDialog(false)} />
          <div
            className="relative z-10 rounded-2xl bg-black/90 border border-accent-primary/30 shadow-[0_0_30px_rgba(0,212,255,0.15)]"
            style={{ padding: '2.5rem 3rem', maxWidth: '500px', width: '90%' }}
          >
            <div className="flex flex-col gap-5">
              <h2 className="text-accent-primary font-display text-center" style={{ fontSize: 'clamp(16px, 1.4vw, 24px)' }}>
                Welchen Part möchtest du wiederholen?
              </h2>

              <div className="flex flex-col gap-3">
                {MISSION_1_ENTRY_POINTS.map((entry) => {
                  const isUnlocked = highestLevel >= entry.requiredLevel;

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => {
                        if (isUnlocked) {
                          playClick();
                          setShowDialog(false);
                          onRestart(entry.startLevel);
                        } else {
                          playLockedClick();
                        }
                      }}
                      onMouseEnter={() => { if (isUnlocked) playHover(); }}
                      className={`flex items-center gap-4 rounded-xl border text-left transition-all duration-200 ${
                        isUnlocked
                          ? 'border-accent-primary/30 bg-accent-primary/5 hover:border-accent-primary/60 hover:bg-accent-primary/10 hover:shadow-[0_0_15px_rgba(0,212,255,0.15)] cursor-pointer'
                          : 'border-text-secondary/15 bg-white/[0.02] opacity-50 cursor-not-allowed'
                      }`}
                      style={{ padding: '1.2rem 1.5rem' }}
                      disabled={!isUnlocked}
                    >
                      {/* Icon */}
                      <div className={`flex-shrink-0 ${isUnlocked ? 'text-accent-primary' : 'text-text-secondary/40'}`}>
                        {isUnlocked ? (
                          <Play size={22} />
                        ) : (
                          <Lock size={18} />
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={`font-semibold ${isUnlocked ? 'text-text-primary' : 'text-text-secondary/50'}`}
                          style={{ fontSize: 'clamp(13px, 1.1vw, 18px)' }}
                        >
                          {entry.label}
                        </span>
                        <span
                          className="text-text-secondary"
                          style={{ fontSize: 'clamp(11px, 0.85vw, 14px)' }}
                        >
                          {entry.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Abbrechen */}
              <button
                type="button"
                onClick={() => { playClick(); setShowDialog(false); }}
                onMouseEnter={playHover}
                className="self-center font-semibold rounded-lg bg-transparent border border-text-secondary/30 text-text-secondary hover:text-text-primary hover:border-text-secondary/60 transition-all duration-200"
                style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', padding: '0.6em 1.8em', marginTop: '0.5rem' }}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
