import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Lock, AlertTriangle, Info } from 'lucide-react';
import { useGameState } from '../../hooks/use-game-state';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useAudio } from '../../hooks/useAudio';
import { MISSIONS } from '../../data/missions';
import TitleAnimation from './TitleAnimation';
import { MENU_ITEMS } from './menu-config';
import { VolumeSlider } from '../../components/VolumeSlider';
import { loadProgress } from '../../services/persistence-service';
import { assetPath } from '../../utils/asset-path';

const APP_VERSION = '0.1.0';

interface MainMenuProps {
  onStartGame?: () => void;
  onMusicStart?: () => void;
  onNavigate?: (screen: string) => void;
  hasEntered?: boolean;
  onEntry?: () => void;
  musicVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

function MainMenu({ onStartGame, onMusicStart, onNavigate, hasEntered: hasEnteredProp = false, onEntry, musicVolume = 0.05, onVolumeChange }: MainMenuProps) {
  const { dispatch } = useGameState();
  const { profile } = usePlayerProfile();
  const { playHover, playClick, playLockedClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
    lockedClickSrc: assetPath('/assets/audio/clicknotpossible.mp3'),
  });

  // Entry gate – user must click once to allow audio
  const [hasEntered, setHasEntered] = useState(hasEnteredProp);

  // Hint state
  const [visibleHint, setVisibleHint] = useState<string | null>(null);
  const [hintTarget, setHintTarget] = useState<string | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Einmaliger Tooltip für "Bericht generieren" bei erstem 3-Sterne-Abschluss
  const [showReportTooltip, setShowReportTooltip] = useState(false);
  useEffect(() => {
    const progress = loadProgress();
    const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
    const hasThreeStars = mission1 && mission1.score >= 10;
    const alreadyShown = localStorage.getItem('op-sentinel-report-tooltip-shown') === 'true';
    if (hasThreeStars && !alreadyShown) {
      // Kurze Verzögerung damit das Menü erst sichtbar ist
      const timer = setTimeout(() => {
        setShowReportTooltip(true);
        localStorage.setItem('op-sentinel-report-tooltip-shown', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Image error states
  const [bgError, setBgError] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Ref for click-outside detection
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Start music via parent callback after user has entered
  useEffect(() => {
    if (!hasEntered) return;
    if (onMusicStart) {
      onMusicStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEntered]);

  // Auto-dismiss hint after 4 seconds
  useEffect(() => {
    if (visibleHint) {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
      }
      hintTimerRef.current = setTimeout(() => {
        setVisibleHint(null);
        setHintTarget(null);
        hintTimerRef.current = null;
      }, 4000);
    }
    return () => {
      if (hintTimerRef.current) {
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = null;
      }
    };
  }, [visibleHint]);

  // Click outside dismisses hint
  useEffect(() => {
    if (!visibleHint) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      // If click is outside hint area (locked menu items), dismiss
      if (!target.closest('[data-hint-trigger]') && !target.closest('[data-hint-message]')) {
        setVisibleHint(null);
        setHintTarget(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visibleHint]);

  const handleNewGame = useCallback(() => {
    playClick();
    if (onStartGame) {
      onStartGame();
    } else {
      const firstMission = MISSIONS[0];
      dispatch({ type: 'START_MISSION', payload: firstMission });
    }
  }, [dispatch, playClick, onStartGame]);

  const handleLockedClick = useCallback((itemId: string, customMessage?: string) => {
    playLockedClick();
    const item = MENU_ITEMS.find(i => i.id === itemId);
    const message = customMessage || item?.lockedHintMessage;
    if (!message) return;

    setVisibleHint(message);
    setHintTarget(itemId);
  }, [playLockedClick]);

  const handleMenuItemClick = useCallback((itemId: string) => {
    playClick();
    if (onNavigate) {
      onNavigate(itemId);
    }
  }, [playClick, onNavigate]);

  // Determine which items are locked based on profile
  const hasProfile = !!profile;
  const secondaryItems = MENU_ITEMS.filter(item => item.id !== 'new-game');

  // Entry gate overlay – click to start (allows audio autoplay)
  if (!hasEntered) {
    const handleEnterFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      document.documentElement.requestFullscreen?.().catch(() => {});
      setHasEntered(true);
      onEntry?.();
    };

    const handleEnterNormal = () => {
      setHasEntered(true);
      onEntry?.();
    };

    return (
      <div
        className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center"
        data-testid="main-menu-entry"
      >
        {/* Background Image */}
        {!bgError ? (
          <img
            src={assetPath("/assets/images/Mainmenu.webp")}
            alt=""
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={() => setBgError(true)}
            aria-hidden="true"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-bg-primary z-0" />
        )}
        <div className="absolute inset-0 z-10 bg-black/60" aria-hidden="true" />
        <div className="relative z-20 flex flex-col items-center gap-8">
          <h1
            className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-wider uppercase text-text-primary animate-glitch"
            data-text="OPERATION SENTINEL"
          >
            OPERATION SENTINEL
          </h1>

          <p className="text-text-secondary text-center" style={{ fontSize: 'clamp(14px, 1.3vw, 20px)' }}>
            Dieses Spiel funktioniert am besten im Fullscreen-Modus bei maximal 125% Browser-Zoom.
          </p>

          <div className="flex flex-col items-center gap-5">
            <button
              type="button"
              onClick={handleEnterFullscreen}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
              style={{ fontSize: 'clamp(15px, 1.5vw, 24px)', padding: '1em 2.5em' }}
            >
              Im Fullscreen starten
            </button>
            <button
              type="button"
              onClick={handleEnterNormal}
              className="text-text-secondary hover:text-text-primary transition-colors duration-200 underline underline-offset-4"
              style={{ fontSize: 'clamp(13px, 1.1vw, 18px)' }}
            >
              Ohne Fullscreen fortfahren
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuContainerRef}
      className="main-menu-container relative w-full min-h-screen overflow-x-hidden flex flex-col items-center justify-center"
      data-testid="main-menu"
    >
      {/* Background Image */}
      {!bgError ? (
        <img
          src={assetPath("/assets/images/Mainmenu.webp")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-0"
          onError={() => setBgError(true)}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-bg-primary z-0" />
      )}

      {/* Dark overlay */}
      <div
        className="absolute inset-0 z-10 bg-gradient-to-b from-black/50 to-black/70"
        aria-hidden="true"
      />

      {/* Animated scanline overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-full h-[2px] bg-accent-primary/5 animate-scanline" />
      </div>

      {/* Content – leicht links versetzt für Weltkarten-Sichtbarkeit */}
      <div className="relative z-20 flex flex-col items-center gap-[3vh] w-[90%] max-w-[1200px] py-8 main-menu-content mr-[5vw]">
        {/* Logo mit dezenter Schwebanimation */}
        {!logoError && (
          <img
            src={assetPath("/assets/images/Logo.webp")}
            alt="Operation Sentinel"
            className="w-[20vw] max-w-[400px] min-w-[150px] object-contain menu-logo animate-logo-float"
            onError={() => setLogoError(true)}
          />
        )}

        {/* Title Animation */}
        <div className="menu-title-group">
          <TitleAnimation
            title="OPERATION SENTINEL"
            subtitle="Cyber Intelligence Unit"
          />
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col items-stretch gap-[3vh] mt-[4vh] menu-nav w-full max-w-[700px]" aria-label="Hauptmenü">
          {/* Neues Spiel - Primary Action */}
          <button
            type="button"
            className="menu-btn-primary grid grid-cols-[60px_1fr] items-center px-[4vw] py-[2.5vh] font-semibold rounded-lg
              bg-transparent border-2 border-accent-primary text-accent-primary
              shadow-[0_0_20px_rgba(0,212,255,0.5),inset_0_0_20px_rgba(0,212,255,0.05)]
              hover:bg-accent-primary/10 hover:shadow-[0_0_30px_rgba(0,212,255,0.7),inset_0_0_30px_rgba(0,212,255,0.1)]
              hover:border-accent-primary/90
              transition-all duration-300
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
            style={{ fontSize: '1.6vw' }}
            onClick={handleNewGame}
            onMouseEnter={playHover}
          >
            <Play size={48} aria-hidden="true" />
            <span>{hasProfile ? 'Spiel fortsetzen' : 'Neues Spiel'}</span>
          </button>

          {/* Secondary Items – locked or unlocked based on profile/progress */}
          {secondaryItems.map((item) => {
            const ItemIcon = item.icon;
            let isLocked: boolean;
            let lockMessage = item.lockedHintMessage ?? '';

            if (item.id === 'report') {
              const progress = loadProgress();
              const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
              if (!mission1) {
                isLocked = true;
                lockMessage = 'Schließe zuerst eine Mission ab, um ein Zertifikat generieren zu können.';
              } else if (mission1.score < 10) {
                isLocked = true;
                lockMessage = 'Schließe zuerst alle Missionen mit 3 Sternen ab, um das Zertifikat zu generieren.';
              } else {
                isLocked = false;
              }
            } else {
              isLocked = !hasProfile;
            }

            if (isLocked) {
              return (
                <div key={item.id} className="relative" data-hint-trigger>
                  <button
                    type="button"
                    className="grid grid-cols-[60px_1fr] items-center px-[3vw] py-[2vh] font-medium rounded-lg
                      w-full
                      opacity-65 cursor-not-allowed
                      text-text-secondary
                      transition-[filter] duration-200
                      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-secondary"
                    style={{ fontSize: '1.4vw' }}
                    aria-disabled="true"
                    tabIndex={0}
                    onClick={() => handleLockedClick(item.id, lockMessage)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleLockedClick(item.id, lockMessage); } }}
                    onMouseEnter={playHover}
                  >
                    <Lock size={40} className="text-text-secondary/80" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                  {visibleHint && hintTarget === item.id && (
                    <div
                      data-hint-message
                      className="absolute left-full top-1/2 -translate-y-1/2 rounded-2xl
                        bg-black/85 border border-warning/40
                        text-text-primary text-left max-w-[400px] w-max
                        animate-fade-in backdrop-blur-md
                        flex items-start gap-4"
                      style={{ fontSize: '0.9vw', padding: '1.5rem 2rem', marginLeft: '2vw' }}
                      role="tooltip"
                    >
                      <AlertTriangle size={22} className="text-warning shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="leading-relaxed">{visibleHint}</span>
                    </div>
                  )}
                </div>
              );
            }

            // Unlocked – clickable menu item
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  className="grid grid-cols-[60px_1fr] items-center px-[3vw] py-[2vh] font-medium rounded-lg
                    w-full
                    bg-transparent border border-accent-primary/40 text-accent-primary
                    hover:bg-accent-primary/10 hover:border-accent-primary hover:shadow-[0_0_15px_rgba(0,212,255,0.3)]
                    transition-all duration-300
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
                  style={{ fontSize: '1.4vw' }}
                  onClick={() => { handleMenuItemClick(item.id); if (item.id === 'report') setShowReportTooltip(false); }}
                  onMouseEnter={playHover}
                >
                  <ItemIcon size={40} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
                {item.id === 'report' && showReportTooltip && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 rounded-2xl
                      bg-black/85 border border-accent-secondary/40
                      text-text-primary text-left max-w-[420px] w-max
                      animate-fade-in backdrop-blur-md
                      flex items-start gap-4"
                    style={{ fontSize: '0.9vw', padding: '1.5rem 2rem', marginLeft: '2vw' }}
                    role="tooltip"
                  >
                    <span className="text-accent-secondary text-lg shrink-0 mt-0.5">★</span>
                    <span className="leading-relaxed">
                      Super! Du hast alle momentan zur Verfügung stehenden Missionen erfolgreich mit drei Sternen abgeschlossen. Nun kannst du ein Zertifikat generieren, um deiner Führungskraft oder Personalabteilung von deinen Fortschritten zu berichten.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Version Display + About Button */}
      <div className="fixed bottom-4 left-4 z-20 flex items-center gap-4">
        <span
          className="text-text-secondary text-[11px] opacity-50"
          aria-label={`Version ${APP_VERSION}`}
        >
          v{APP_VERSION}
        </span>
        <button
          type="button"
          onClick={() => { playClick(); if (onNavigate) onNavigate('about'); }}
          onMouseEnter={playHover}
          className="flex items-center gap-2 text-text-secondary hover:text-accent-primary transition-all duration-200 rounded-lg border border-text-secondary/30 hover:border-accent-primary/60 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] backdrop-blur-sm bg-black/30 hover:bg-accent-primary/10"
          style={{ fontSize: 'clamp(12px, 0.95vw, 15px)', padding: '0.6em 1.2em' }}
        >
          <Info size={16} />
          Über dieses Projekt
        </button>
      </div>

      {/* Volume Control */}
      {onVolumeChange && (
        <div className="fixed bottom-3 right-3 z-20">
          <VolumeSlider volume={musicVolume} onChange={onVolumeChange} />
        </div>
      )}
    </div>
  );
}

export default MainMenu;
