import { useState } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useAudio } from '../hooks/useAudio';
import { assetPath } from '../utils/asset-path';

interface QuitMissionButtonProps {
  onQuit: () => void;
}

/**
 * Button zum Verlassen der aktuellen Mission.
 * Zeigt einen Bestätigungsdialog bevor der Fortschritt verloren geht.
 */
export function QuitMissionButton({ onQuit }: QuitMissionButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });

  return (
    <>
      {/* Fixed Button unten links */}
      <button
        type="button"
        onClick={() => { playClick(); setShowConfirm(true); }}
        onMouseEnter={playHover}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 font-semibold rounded-lg bg-gray-800/80 border border-text-secondary/40 text-text-secondary hover:bg-gray-700/80 hover:text-text-primary hover:border-text-secondary/60 transition-colors duration-200"
        style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.6em 1.2em' }}
      >
        <ArrowLeft size={18} />
        Hauptmenü
      </button>

      {/* Bestätigungsdialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowConfirm(false)} />
          <div
            className="relative z-10 rounded-2xl bg-black/90 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
            style={{ padding: '2.5rem 3.5rem', maxWidth: '450px' }}
          >
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle size={44} className="text-amber-400" />
              <h2 className="text-amber-400 font-display" style={{ fontSize: 'clamp(14px, 1.3vw, 22px)' }}>
                Bist du dir sicher?
              </h2>
              <p className="text-text-secondary" style={{ fontSize: 'clamp(11px, 0.9vw, 16px)' }}>
                Dein Fortschritt ab dem letzten Speicherpunkt geht verloren.
              </p>

              <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => { playClick(); onQuit(); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-amber-500/20 border-2 border-amber-500 text-amber-400 hover:bg-amber-500/30 transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                >
                  Ja, Mission verlassen
                </button>
                <button
                  type="button"
                  onClick={() => { playClick(); setShowConfirm(false); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary hover:bg-accent-primary/20 transition-colors duration-200"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                >
                  Weiterspielen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
