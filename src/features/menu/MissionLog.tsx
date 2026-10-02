import { Star, FileText, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { loadProgress } from '../../services/persistence-service';

/**
 * Einsatzberichte – Zeigt abgeschlossene Missionen in der Agentenakte.
 * Mit Buttons für Briefing und Analyzer.
 */
export function MissionLog({ animate = false }: { animate?: boolean }) {
  const progress = loadProgress();
  const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');

  if (!mission1) {
    return (
      <div
        style={{
          padding: '5% 6%',
        }}
      >
        <p style={{
          fontSize: 'clamp(11px, 1.0vw, 18px)',
          color: '#1a2a4a',
          fontFamily: "'Special Elite', monospace",
        }}>
          Keine Einträge vorhanden.
        </p>
        <p style={{
          fontSize: 'clamp(11px, 1.0vw, 18px)',
          color: '#1a2a4a',
          fontFamily: "'Special Elite', monospace",
          marginTop: '1em',
        }}>
          Schließe eine Mission ab, um hier weitere Informationen zu finden.
        </p>
      </div>
    );
  }

  const starCount = mission1.score >= 10 ? 3 : 2;

  const handleBriefingClick = () => {
    window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'mission-briefing-view' }));
  };

  const handleAnalyzerClick = () => {
    window.dispatchEvent(new CustomEvent('navigate-to', { detail: 'password-analyzer' }));
  };

  return (
    <div
      style={{
        padding: '5% 6%',
        height: '100%',
      }}
    >
      {/* Mission 1 Eintrag – zweispaltig */}
      <div style={{ display: 'flex', gap: '6%', height: '100%' }}>
        {/* Linke Spalte: Info */}
        <div style={{ flex: 1 }}>
          <motion.h3
            style={{
              fontSize: 'clamp(14px, 1.6vw, 30px)',
              color: '#0c1e3a',
              fontFamily: "'Bebas Neue', sans-serif",
              fontWeight: 400,
              letterSpacing: '0.04em',
              marginBottom: '3%',
            }}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            transition={{ duration: animate ? 0.6 : 0, delay: animate ? 0.3 : 0 }}
          >
            Operation: Passwortschutz
          </motion.h3>

          {/* Status + Sterne */}
          <motion.div
            style={{ display: 'flex', alignItems: 'center', gap: '1em', marginBottom: '4%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: animate ? 0.5 : 0, delay: animate ? 0.8 : 0 }}
          >
            <span style={{
              fontSize: 'clamp(11px, 1vw, 17px)',
              color: '#166534',
              fontFamily: "'Special Elite', monospace",
              fontWeight: 600,
            }}>
              ✓ Abgeschlossen
            </span>
            {starCount < 3 && (
              <span style={{
                fontSize: 'clamp(11px, 1vw, 17px)',
                color: '#dc2626',
                fontFamily: "'Special Elite', monospace",
                fontWeight: 600,
                textDecoration: 'underline',
                textDecorationColor: '#dc2626',
                textUnderlineOffset: '3px',
              }}>
                Prüfung nicht bestanden
              </span>
            )}
            <span style={{ display: 'flex', gap: '3px' }}>
              {[1, 2, 3].map(i => (
                <Star
                  key={i}
                  size={20}
                  className={i <= starCount ? 'text-yellow-600 fill-yellow-500' : 'text-gray-400 stroke-[#1a2a4a]'}
                />
              ))}
            </span>
          </motion.div>

          {/* Zusammenfassung */}
          <motion.p
            style={{
              fontSize: 'clamp(11px, 1.05vw, 18px)',
              color: '#1a2a4a',
              fontFamily: "'Special Elite', monospace",
              lineHeight: 1.6,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: animate ? 0.8 : 0, delay: animate ? 1.3 : 0 }}
          >
            {starCount >= 3
              ? 'Fünf verdächtige Laptops geknackt, Dateien sicher verschlüsselt und Abschlussprüfung zum Thema Passwortsicherheit bestanden.'
              : 'Fünf verdächtige Laptops geknackt und Dateien sicher verschlüsselt. Die Abschlussprüfung wurde nicht bestanden – wiederhole die Mission, um alle Sterne zu erreichen.'}
          </motion.p>
        </div>

        {/* Rechte Spalte: Buttons */}
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: '0.8em', minWidth: '35%', maxWidth: '35%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: animate ? 0.5 : 0, delay: animate ? 1.8 : 0 }}
        >
          <button
            type="button"
            onClick={handleBriefingClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6em',
              fontSize: 'clamp(10px, 0.9vw, 15px)',
              color: '#0c2d5a',
              fontFamily: "'Special Elite', monospace",
              fontWeight: 600,
              background: 'rgba(12, 30, 58, 0.06)',
              border: '1.5px solid rgba(12, 30, 58, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '0.6em 1em',
              transition: 'all 0.2s',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(12, 30, 58, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(12, 30, 58, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(12, 30, 58, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(12, 30, 58, 0.3)';
            }}
          >
            <FileText size={15} style={{ flexShrink: 0 }} />
            Missionsbriefing
          </button>
          <button
            type="button"
            onClick={handleAnalyzerClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6em',
              fontSize: 'clamp(10px, 0.9vw, 15px)',
              color: '#0c2d5a',
              fontFamily: "'Special Elite', monospace",
              fontWeight: 600,
              background: 'rgba(12, 30, 58, 0.06)',
              border: '1.5px solid rgba(12, 30, 58, 0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              padding: '0.6em 1em',
              transition: 'all 0.2s',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(12, 30, 58, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(12, 30, 58, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(12, 30, 58, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(12, 30, 58, 0.3)';
            }}
          >
            <ShieldCheck size={15} style={{ flexShrink: 0 }} />
            Passwort-Analyzer
          </button>
        </motion.div>
      </div>
    </div>
  );
}
