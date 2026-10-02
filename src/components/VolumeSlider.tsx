import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeSliderProps {
  /** Aktuelle Lautstärke (0.0–1.0) */
  volume: number;
  /** Callback bei Lautstärkeänderung */
  onChange: (volume: number) => void;
}

/**
 * Kompakter Lautstärkeregler im Cyber-Agenten-Stil.
 * Zeigt ein passendes Icon je nach aktuellem Level.
 */
export function VolumeSlider({ volume, onChange }: VolumeSliderProps) {
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleToggleMute = () => {
    onChange(volume === 0 ? 0.05 : 0);
  };

  return (
    <div className="flex items-center gap-3 group" role="group" aria-label="Lautstärkeregelung">
      <button
        type="button"
        onClick={handleToggleMute}
        className="text-accent-primary/70 hover:text-accent-primary transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary rounded"
        aria-label={volume === 0 ? 'Ton einschalten' : 'Stummschalten'}
        title={volume === 0 ? 'Ton einschalten' : 'Stummschalten'}
      >
        <VolumeIcon size={20} />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="volume-slider w-24 h-1.5 appearance-none rounded-full cursor-pointer
          bg-surface-secondary
          accent-accent-primary
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        aria-label="Musiklautstärke"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(volume * 100)}
        aria-valuetext={`${Math.round(volume * 100)} Prozent`}
      />
    </div>
  );
}

export default VolumeSlider;
