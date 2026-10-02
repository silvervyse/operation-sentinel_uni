export interface TitleAnimationProps {
  /** Titel-Text */
  title: string;
  /** Untertitel */
  subtitle: string;
  /** Max. Animationsdauer in ms (nicht mehr verwendet, Animation läuft dauerhaft) */
  duration?: number;
  /** Callback wenn Animation beendet (nicht mehr verwendet) */
  onComplete?: () => void;
  /** Animation überspringen (nicht mehr verwendet) */
  skipAnimation?: boolean;
}

function TitleAnimation({
  title,
  subtitle,
}: TitleAnimationProps) {
  // Animation läuft dauerhaft – kein Stop, kein sessionStorage-Check

  return (
    <div
      className="flex flex-col items-center select-none"
      role="presentation"
      data-testid="title-animation"
    >
      <h1
        className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-wider uppercase text-text-primary animate-glitch"
        data-testid="title-text"
        data-text={title}
      >
        {title}
      </h1>
      <p
        className="font-display text-lg md:text-xl lg:text-2xl tracking-widest uppercase text-accent-primary mt-3 opacity-100"
        data-testid="subtitle-text"
      >
        {subtitle}
      </p>
    </div>
  );
}

export default TitleAnimation;
