import { ArrowLeft, ExternalLink, GraduationCap, Bot, User, MessageSquare, ShieldAlert } from 'lucide-react';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { assetPath } from '../../utils/asset-path';

interface AboutScreenProps {
  onBack: () => void;
}

/**
 * About-Seite – Informationen zum Projekt, Autor und KI-Hinweise.
 */
export function AboutScreen({ onBack }: AboutScreenProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${assetPath('/assets/images/Mainmenu.webp')})` }}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center min-h-full" style={{ padding: 'clamp(6rem, 12vh, 8rem) clamp(1.5rem, 5vw, 4rem) clamp(2rem, 4vh, 3rem)' }}>
        {/* Header */}
        <h1
          className="font-display text-accent-primary tracking-wide text-center mb-1"
          style={{ fontSize: 'clamp(22px, 2.2vw, 36px)' }}
        >
          🛡️ Über dieses Projekt
        </h1>
        <p className="text-text-secondary text-center" style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', marginBottom: '3rem' }}>
          Operation Sentinel – Ein Forschungsprototyp zur IT-Security-Awareness
        </p>

        {/* Cards Grid – 3 Spalten für volle Breite */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-[1200px]">

          {/* Projektkontext */}
          <div className="rounded-xl bg-bg-secondary/60 border border-accent-primary/20 backdrop-blur-md flex flex-col gap-3" style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
                <GraduationCap size={22} className="text-accent-primary" />
              </div>
              <h2 className="text-text-primary font-semibold" style={{ fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                Projektkontext
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>
              Dieses Spiel wurde im Rahmen einer Projektarbeit im{' '}
              <a
                href="https://www.uni-bamberg.de/ma-vawi/auf-einen-blick/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline inline-flex items-center gap-1"
              >
                Masterstudiengang VAWi
                <ExternalLink size={11} />
              </a>{' '}
              an der Otto-Friedrich-Universität Bamberg entwickelt. Ziel war die Untersuchung von Vibe Coding als Entwicklungsansatz für gamifizierte IT-Security-Awareness-Anwendungen.
            </p>
          </div>

          {/* Keine kommerzielle Nutzung */}
          <div className="rounded-xl bg-bg-secondary/60 border border-warning/20 backdrop-blur-md flex flex-col gap-3" style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={22} className="text-warning" />
              </div>
              <h2 className="text-text-primary font-semibold" style={{ fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                Nutzungshinweis
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>
              Dies ist ein Forschungsprototyp. Eine kommerzielle Nutzung ist nicht vorgesehen. Die Anwendung dient ausschließlich wissenschaftlichen und Demonstrationszwecken.
            </p>
          </div>

          {/* Autor */}
          <div className="rounded-xl bg-bg-secondary/60 border border-accent-primary/20 backdrop-blur-md flex flex-col gap-3" style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
                <User size={22} className="text-accent-primary" />
              </div>
              <h2 className="text-text-primary font-semibold" style={{ fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                Autor
              </h2>
            </div>
            <p className="text-text-primary font-medium" style={{ fontSize: 'clamp(14px, 1.1vw, 17px)' }}>
              Andreas Rahn
            </p>
          </div>

          {/* KI-Hinweis */}
          <div className="rounded-xl bg-bg-secondary/60 border border-accent-secondary/20 backdrop-blur-md flex flex-col gap-3 md:col-span-2" style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-secondary/10 border border-accent-secondary/30 flex items-center justify-center flex-shrink-0">
                <Bot size={22} className="text-accent-secondary" />
              </div>
              <h2 className="text-text-primary font-semibold" style={{ fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                KI-generierte Inhalte
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>
              Dieses Projekt wurde unter Einsatz von KI-Werkzeugen entwickelt. Folgende Inhalte wurden ganz oder teilweise mithilfe generativer KI erstellt:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Quellcode', detail: 'Kiro / Claude' },
                { label: 'Grafiken & Illustrationen', detail: 'GPT-5.5 / DALL-E' },
                { label: 'Dialog- & Lerntexte', detail: 'ChatGPT (geprüft durch Autor)' },
                { label: 'Soundeffekte & Musik', detail: 'Pixabay' },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
                  <span className="text-accent-secondary text-sm mt-0.5">●</span>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{item.label}</p>
                    <p className="text-text-secondary text-xs">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-text-secondary/70 text-xs italic">
              Sämtliche KI-generierten Inhalte wurden durch den Autor geprüft, angepasst und freigegeben.
            </p>
          </div>

          {/* Feedback */}
          <div className="rounded-xl bg-bg-secondary/60 border border-accent-primary/20 backdrop-blur-md flex flex-col gap-3" style={{ padding: 'clamp(1.2rem, 2.5vw, 2rem)' }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare size={22} className="text-accent-primary" />
              </div>
              <h2 className="text-text-primary font-semibold" style={{ fontSize: 'clamp(14px, 1.1vw, 18px)' }}>
                Feedback geben
              </h2>
            </div>
            <p className="text-text-secondary leading-relaxed" style={{ fontSize: 'clamp(12px, 0.9vw, 15px)' }}>
              Du hast das Spiel gespielt und möchtest mir deine Meinung mitteilen? Ich freue mich über dein Feedback!
            </p>
            <a
              href="https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=DQSIkWdsW0yxEjajBLZtrQAAAAAAAAAAAAMAAM1YKcJUNzRQQzFKTTBZTk41UjNaSERHOTNTRzFBSC4u"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent-primary hover:underline font-medium"
              style={{ fontSize: 'clamp(13px, 1vw, 16px)' }}
            >
              Zum Feedback-Fragebogen
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Zurück-Button */}
      <button
        type="button"
        onClick={() => { playClick(); onBack(); }}
        onMouseEnter={playHover}
        className="fixed top-5 left-5 z-30 flex items-center gap-2 font-semibold rounded-lg bg-gray-900/90 border border-accent-primary/60 text-accent-primary hover:bg-accent-primary/20 hover:border-accent-primary transition-all duration-200 backdrop-blur-sm"
        style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.6em 1.2em' }}
      >
        <ArrowLeft size={16} />
        Hauptmenü
      </button>

      {/* Volume */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}
