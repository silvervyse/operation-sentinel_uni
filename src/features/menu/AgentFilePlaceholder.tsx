import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useAudio } from '../../hooks/useAudio';
import { getCharacterImagePath } from '../onboarding/characters';
import { MissionLog } from './MissionLog';
import { loadProgress } from '../../services/persistence-service';
import { assetPath } from '../../utils/asset-path';

interface AgentFilePlaceholderProps {
  onBack: () => void;
}

/**
 * Agentenakte – Zeigt das Agentenprofil im Stil einer digitalen Ermittlungsakte.
 * Alle Elemente sind prozentual zum Hintergrundbild positioniert,
 * damit das Layout bei jeder Fenstergröße korrekt bleibt.
 */
export function AgentFilePlaceholder({ onBack }: AgentFilePlaceholderProps) {
  const { profile, clearProfile } = usePlayerProfile();
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [characterDescription, setCharacterDescription] = useState('');

  // Animation-Tracking: was hat der Spieler bereits in der Akte gesehen?
  const [animateFirstVisit] = useState(() => {
    const seenData = JSON.parse(localStorage.getItem('op-sentinel-akte-seen') || '{}');
    return !seenData.hasVisitedAkte;
  });
  const [animateBadge] = useState(() => {
    const progress = loadProgress();
    const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
    const seenData = JSON.parse(localStorage.getItem('op-sentinel-akte-seen') || '{}');
    const currentRank = mission1 && mission1.score >= 10 ? 'Agent' : 'Rekrut';
    return seenData.lastSeenRank !== currentRank;
  });
  const [animateMissionLog] = useState(() => {
    const progress = loadProgress();
    const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
    const seenData = JSON.parse(localStorage.getItem('op-sentinel-akte-seen') || '{}');
    return !!mission1 && seenData.lastSeenMission1Score !== mission1.score;
  });

  useEffect(() => {
    if (!profile) return;
    fetch(assetPath(`/assets/dialogs/Characters/${profile.selectedCharacter}.md`))
      .then(r => r.ok ? r.text() : '')
      .then(setCharacterDescription)
      .catch(() => setCharacterDescription(''));
  }, [profile]);

  // Beim Verlassen der Akte: aktuellen Zustand als gesehen markieren
  useEffect(() => {
    return () => {
      const freshProgress = loadProgress();
      const freshMission1 = freshProgress.completedMissions.find(m => m.missionId === 'mission-1');
      const freshRank = freshMission1 && freshMission1.score >= 10 ? 'Agent' : 'Rekrut';
      localStorage.setItem('op-sentinel-akte-seen', JSON.stringify({
        hasVisitedAkte: true,
        lastSeenRank: freshRank,
        lastSeenMission1Score: freshMission1?.score ?? null,
      }));
    };
  }, []);

  const handleDeleteProfile = () => {
    clearProfile();
    onBack();
  };

  if (!profile) return null;

  const passfotoPath = getCharacterImagePath(profile.selectedCharacter, 'passfoto');
  const progress = loadProgress();
  const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
  const hasFullScore = mission1 ? mission1.score >= 10 : false;
  const rank = hasFullScore ? 'Agent' : 'Rekrut';

  return (
    <div className="fixed inset-0" style={{ background: '#0a0e1a' }}>
      {/* Container – Hintergrund und Inhalte beziehen sich auf denselben Bereich */}
      <div
        className="relative w-full h-full"
        style={{
          backgroundImage: `url(${assetPath('/assets/images/Agentenakte/Background.webp')})`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minWidth: '800px',
        }}
      >

        {/* Alle Inhalte relativ zum Bild positioniert */}
        <div
          className="absolute inset-0"
          style={{ fontFamily: "'Special Elite', monospace" }}
        >
          {/* Passfoto */}
          <motion.div
            style={{ position: 'absolute', bottom: '61%', left: '11%', width: '9%' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animateFirstVisit ? 0.8 : 0, delay: animateFirstVisit ? 0.2 : 0 }}
          >
            <img
              src={passfotoPath}
              alt={`Agent ${profile.codename}`}
              className="w-full h-auto object-contain"
            />
          </motion.div>

          {/* Agentenname */}
          <motion.div
            style={{ position: 'absolute', top: '19.7%', left: '25%' }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: animateFirstVisit ? 0.8 : 0, delay: animateFirstVisit ? 0.4 : 0 }}
          >
            <h1 style={{
              fontSize: 'clamp(18px, 2.2vw, 42px)',
              color: '#0a1628',
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              letterSpacing: '0.05em',
            }}>
              {`Agent ${profile.codename}`}
            </h1>
            <p style={{
              fontSize: 'clamp(12px, 1.4vw, 30px)',
              color: '#1a2a4a',
              fontFamily: "'Special Elite', monospace",
              fontWeight: 400,
              marginTop: '10%',
            }}>
              Rang: {rank}
            </p>
          </motion.div>

          {/* Badges – eigenes Element, frei positionierbar */}
          <div style={{ position: 'absolute', top: '30%', left: '24%', display: 'flex', alignItems: 'center' }}>
            <motion.img
              src={assetPath("/assets/images/Badges/Rekrut.webp")}
              alt="Badge: Rekrut"
              style={{ width: 'clamp(60px, 8vw, 800px)' }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: animateFirstVisit ? 1.0 : 0, delay: animateFirstVisit ? 0.6 : 0, type: 'spring', bounce: 0.3 }}
            />
            {hasFullScore && (
              <motion.img
                src={assetPath("/assets/images/Badges/Agent.webp")}
                alt="Badge: Agent"
                style={{ width: 'clamp(60px, 8vw, 800px)', marginLeft: '-2vw' }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: animateBadge ? 1.0 : 0, delay: animateBadge ? 0.8 : 0, type: 'spring', bounce: 0.4 }}
              />
            )}
          </div>

          {/* Agentenprofil – linke Seite */}
          <motion.div
            style={{
              position: 'absolute',
              top: '44%',
              left: '10%',
              width: '33%',
              maxHeight: '40%',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: animateFirstVisit ? 0.8 : 0, delay: animateFirstVisit ? 0.8 : 0 }}
          >
            <h2 style={{
              fontSize: 'clamp(14px, 1.8vw, 40px)',
              color: '#0c1e3a',
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              letterSpacing: '0.05em',
              marginBottom: '2%',
            }}>
              Agentenprofil
            </h2>
            <CharacterDossier text={characterDescription} />
          </motion.div>

          {/* Missionsprotokoll – rechte Seite */}
          <motion.div
            style={{
              position: 'absolute',
              top: '18%',
              left: '53%',
              width: '35%',
              height: '55%',
              overflow: 'hidden',
            }}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: animateMissionLog ? 1.0 : 0, delay: animateMissionLog ? 0.8 : 0, ease: [0.16, 1, 0.3, 1] }}
          >
            <MissionLog animate={animateMissionLog} />
          </motion.div>

          {/* Buttons */}
          <div style={{
            position: 'absolute',
            bottom: '4%',
            left: '3%',
            right: '3%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              type="button"
              onClick={() => { playClick(); onBack(); }}
              onMouseEnter={playHover}
              className="flex items-center gap-2 font-semibold rounded-lg bg-gray-800/80 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-gray-700/80 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
              style={{ fontSize: 'clamp(12px, 1.2vw, 20px)', padding: '0.7em 1.6em', fontFamily: 'Inter, sans-serif' }}
            >
              <ArrowLeft size={16} />
              Zurück zum Hauptmenü
            </button>

            <button
              type="button"
              onClick={() => { playClick(); setShowConfirm(true); }}
              onMouseEnter={playHover}
              className="flex items-center gap-2 font-semibold rounded-lg bg-gray-800/80 border-2 border-red-500/60 text-red-400 hover:bg-gray-700/80 hover:border-red-400 transition-colors duration-200"
              style={{ fontSize: 'clamp(12px, 1.2vw, 20px)', padding: '0.7em 1.6em', fontFamily: 'Inter, sans-serif' }}
            >
              <Trash2 size={16} />
              Profil löschen &amp; zurücksetzen
            </button>
          </div>
        </div>
      </div>

      {/* Bestätigungsdialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowConfirm(false)} />
          <div
            className="relative z-10 rounded-2xl bg-black/90 border border-red-500/40 shadow-[0_0_30px_rgba(255,50,50,0.2)]"
            style={{ padding: '3rem 4rem', maxWidth: '500px' }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle size={48} className="text-red-400" />
              <h2 className="text-red-400 font-display" style={{ fontSize: 'clamp(14px, 1.3vw, 24px)' }}>
                Bist du sicher?
              </h2>
              <p className="text-text-secondary" style={{ fontSize: 'clamp(11px, 0.9vw, 16px)' }}>
                Dein gesamtes Agentenprofil und dein Spielfortschritt werden unwiderruflich gelöscht.
              </p>
              <div className="flex gap-4" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-red-500/20 border-2 border-red-500 text-red-400 hover:bg-red-500/30 transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                >
                  Ja, alles löschen
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setShowConfirm(false); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary hover:bg-accent-primary/20 transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Parst den Charakter-Beschreibungstext und rendert ihn als formatierte Akte */
function CharacterDossier({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const sections: { heading?: string; items: string[] }[] = [];
  let current: { heading?: string; items: string[] } = { items: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.endsWith(':') && trimmed.length < 40) {
      if (current.heading || current.items.length > 0) {
        sections.push(current);
      }
      current = { heading: trimmed.replace(/:$/, ''), items: [] };
    } else {
      current.items.push(trimmed);
    }
  }
  if (current.heading || current.items.length > 0) {
    sections.push(current);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8em' }}>
      {sections.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <h3 style={{
              color: '#0c2d5a',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: 'clamp(12px, 1.3vw, 25px)',
              marginBottom: '0.3em',
            }}>
              {section.heading}
            </h3>
          )}
          {section.items.map((item, j) => (
            <p key={j} style={{
              color: '#0a1e3d',
              fontSize: 'clamp(12px, 1.2vw, 27px)',
              lineHeight: 1.5,
            }}>
              {item}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}
