import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { replaceCodename } from '../../utils/template-utils';
import { assetPath } from '../../utils/asset-path';

interface MissionBriefingViewProps {
  onBack: () => void;
}

/**
 * Missionsbriefing-Ansicht (Nachschlagewerk) – Zeigt den scrollbaren
 * Briefing-Text auf dem Laptop-Screen, genau wie im Original.
 */
export function MissionBriefingView({ onBack }: MissionBriefingViewProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();
  const { profile } = usePlayerProfile();
  const codename = profile?.codename ?? 'Agent';

  const [briefingContent, setBriefingContent] = useState('');

  useEffect(() => {
    fetch(assetPath('/assets/dialogs/MissionBriefing1.md'))
      .then(r => r.ok ? r.text() : '')
      .then(text => setBriefingContent(replaceCodename(text, codename)))
      .catch(() => setBriefingContent(''));
  }, [codename]);

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Briefing Laptop Background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundImage: `url(${assetPath('/assets/images/Mission-briefing/Briefing.webp')})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Scrollbarer Briefing-Text im "Laptop-Fenster" */}
        <div
          className="absolute overflow-y-auto"
          style={{
            top: '18%',
            left: '20%',
            right: '28%',
            bottom: '30%',
            padding: 'clamp(1rem, 2vw, 2.5rem)',
          }}
        >
          <div
            className="text-text-primary"
            style={{ fontSize: 'clamp(12px, 1vw, 18px)', lineHeight: 1.7, padding: 'clamp(1rem, 2vw, 2.5rem)' }}
          >
            <BriefingMarkdown content={briefingContent} />
          </div>
        </div>
      </motion.div>

      {/* Zurück-Button unten */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-[60]">
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          onMouseEnter={playHover}
          className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
          style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', padding: '0.8em 2em' }}
        >
          ← Zurück zur Agentenakte
        </button>
      </div>

      {/* Volume Control */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}

/** Agenten-Briefing Markdown-Renderer (gleich wie im Original) */
function BriefingMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactElement[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="font-display text-accent-primary tracking-wider uppercase mb-4 mt-2 border-b border-accent-primary/30 pb-2" style={{ fontSize: 'clamp(16px, 1.6vw, 28px)' }}>
          {trimmed.slice(2)}
        </h1>
      );
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-accent-primary font-bold tracking-wide uppercase mt-6 mb-2" style={{ fontSize: 'clamp(13px, 1.2vw, 22px)', letterSpacing: '0.08em' }}>
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('- ')) {
      elements.push(
        <li key={i} className="ml-5 mb-1.5 text-text-primary/90 list-none before:content-['▸'] before:text-accent-primary before:mr-2">
          {trimmed.slice(2)}
        </li>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(
        <p key={i} className="font-bold text-accent-primary/90 mt-4 mb-2 italic">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed === '') {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="mb-2 text-text-primary/85 leading-relaxed">
          {trimmed}
        </p>
      );
    }
  }

  return <>{elements}</>;
}
