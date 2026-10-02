import { motion } from 'motion/react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { assetPath } from '../../utils/asset-path';

interface Mission2PlaceholderProps {
  onBack: () => void;
}

/**
 * Platzhalter-Screen für Mission 2 – wird angezeigt wenn der Spieler
 * Mission 2 aus dem Missionsnetzwerk oder der Badge-Zeremonie heraus startet.
 */
export function Mission2Placeholder({ onBack }: Mission2PlaceholderProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${assetPath('/assets/images/Missionsnetzwerk/Background.webp')})` }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '520px', padding: '0 2rem' }}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Construction size={72} className="text-accent-primary drop-shadow-[0_0_12px_rgba(0,212,255,0.4)]" />
        </motion.div>

        {/* Titel */}
        <h1
          className="font-display text-accent-primary tracking-wide"
          style={{ fontSize: 'clamp(22px, 2.5vw, 40px)' }}
        >
          Mission 2: Social Engineering
        </h1>

        {/* Beschreibung */}
        <p
          className="text-text-secondary leading-relaxed"
          style={{ fontSize: 'clamp(13px, 1.1vw, 18px)' }}
        >
          Bei diesem Projekt handelt es sich um einen Proof of Concept. Im aktuellen Prototyp ist nur Mission 1 vollständig spielbar. Weitere Missionen wie Social Engineering oder Phishing sind konzeptionell geplant, aber noch nicht umgesetzt.
        </p>

        <p
          className="text-text-secondary/60 italic"
          style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}
        >
          Vielen Dank fürs Spielen, Agent. Dein Einsatz ist beendet – vorerst.
        </p>

        {/* Zurück-Button */}
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          onMouseEnter={playHover}
          className="flex items-center gap-2 font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
          style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.8vh 2.5vw', marginTop: '3vh' }}
        >
          <ArrowLeft size={18} />
          Zurück zum Missionsnetzwerk
        </button>
      </motion.div>

      {/* Lautstärkeregler */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}
