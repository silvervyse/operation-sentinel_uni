import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { analyzePassword, type PasswordAnalysis } from '../../services/password-analyzer';
import { assetPath } from '../../utils/asset-path';

const BACKGROUND_SRC = assetPath('/assets/images/Mission1/Hintergründe/Laptop-zoom.webp');

interface PasswordAnalyzerViewProps {
  onBack: () => void;
}

function getRatingColor(rating: string): string {
  switch (rating) {
    case 'hervorragend': return 'text-accent-secondary';
    case 'ok': return 'text-warning';
    default: return 'text-danger';
  }
}

function getOverallColor(rating: string): string {
  switch (rating) {
    case 'sehr sicher': return 'text-accent-secondary';
    case 'sicher': return 'text-accent-secondary';
    case 'mittel': return 'text-warning';
    default: return 'text-danger';
  }
}

/**
 * Standalone Passwort-Analyzer – Gleiches Design wie im Spiel (Terminal-Look).
 * Erreichbar aus der Agentenakte.
 */
export function PasswordAnalyzerView({ onBack }: PasswordAnalyzerViewProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();

  const [password, setPassword] = useState('');
  const [analysis, setAnalysis] = useState<PasswordAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const analyzerAudioRef = useRef<HTMLAudioElement | null>(null);

  const playAnalyzerSound = useCallback(() => {
    const audio = new Audio(assetPath('/assets/audio/analyzer.mp3'));
    audio.volume = volume;
    audio.play().catch(() => {});
    analyzerAudioRef.current = audio;
  }, [volume]);

  const handleAnalyze = async () => {
    if (!password.trim()) return;
    playClick();
    setIsAnalyzing(true);
    setAnalysis(null);
    setAnalysisStep(0);

    const result = await analyzePassword(password.trim());
    setAnalysis(result);

    // Schrittweise Anzeige
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

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      {/* Background */}
      <img
        src={BACKGROUND_SRC}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Dunkles Overlay */}
      <div className="absolute inset-0" />

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

      {/* Analyzer Terminal */}
      <motion.div
        className="absolute z-10 flex flex-col items-center justify-center inset-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div
          className="rounded-xl bg-[#1a1f2e]/90 border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-md flex flex-col overflow-hidden"
          style={{ width: 'clamp(500px, 50vw, 750px)', maxHeight: '85vh' }}
        >
          {/* Titelleiste */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-text-secondary text-sm ml-2 font-mono">Passwort-Analyzer</span>
          </div>

          {/* Content */}
          <div style={{ padding: '2.5rem 3rem' }} className="flex flex-col gap-5 overflow-y-auto">
            {/* Beschreibung */}
            <p className="text-text-secondary" style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}>
              Teste die Sicherheit deiner Passwörter. Die Analyse erfolgt lokal – nichts wird übertragen.
            </p>

            {/* Hinweis */}
            <p className="text-warning/80 italic" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>
              Wir können nicht prüfen, ob persönliche Informationen in deinen Passwörtern stecken. Dafür bist du selbst verantwortlich. Unser Analyzer kann dir aber eine erste Bewertung geben, wie sicher dein Passwort ist.
            </p>

            {/* Input + Button */}
            <div className="flex gap-3">
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAnalyze(); }}
                placeholder="Passwort eingeben..."
                autoComplete="off"
                spellCheck={false}
                className="flex-1 rounded-lg bg-bg-primary border-2 border-accent-primary/50 text-text-primary font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all duration-200"
                style={{ fontSize: 'clamp(15px, 1.2vw, 22px)', padding: '0.8em 1.2em' }}
              />
              <button
                type="button"
                onClick={handleAnalyze}
                onMouseEnter={playHover}
                disabled={!password.trim() || isAnalyzing}
                className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0 1.5em' }}
              >
                Prüfen
              </button>
            </div>

            {/* Ergebnis */}
            {!analysis && !isAnalyzing && (
              <p className="text-text-secondary text-base italic">Gib ein Passwort ein und klicke „Prüfen"...</p>
            )}

            {isAnalyzing && !analysis && (
              <p className="text-accent-primary text-base animate-pulse">Analyse läuft...</p>
            )}

            {analysis && (
              <div className="space-y-4" style={{ fontSize: 'clamp(14px, 1.1vw, 19px)' }}>
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
                      <span className={`font-medium ${analysis.dictionary.found ? (analysis.dictionary.isPassphrase ? 'text-accent-secondary' : 'text-danger') : 'text-accent-secondary'}`}>
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
      </motion.div>
    </div>
  );
}
