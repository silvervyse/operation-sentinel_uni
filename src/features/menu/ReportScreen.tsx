import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAudio } from '../../hooks/useAudio';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { loadProgress } from '../../services/persistence-service';
import { assetPath } from '../../utils/asset-path';

const STORAGE_KEY = 'op-sentinel-report-data';

interface ReportData {
  name: string;
  email: string;
  manager: string;
}

interface ReportScreenProps {
  onBack: () => void;
}

function loadReportData(): ReportData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveReportData(data: ReportData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Zertifikat generieren – Formular für Mitarbeiterdaten + PDF-Download.
 */
export function ReportScreen({ onBack }: ReportScreenProps) {
  const { playHover, playClick } = useAudio({
    hoverSrc: assetPath('/assets/audio/Hover.mp3'),
    clickSrc: assetPath('/assets/audio/Click.mp3'),
  });
  const { volume, setVolume } = useVolume();

  const [phase, setPhase] = useState<'confirm' | 'form' | 'generate'>('confirm');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [manager, setManager] = useState('');
  const [reportContent, setReportContent] = useState('');

  // Gespeicherte Daten laden
  const [savedData] = useState<ReportData | null>(() => loadReportData());

  useEffect(() => {
    if (savedData) {
      setName(savedData.name);
      setEmail(savedData.email);
      setManager(savedData.manager);
      setPhase('confirm');
    } else {
      setPhase('form');
    }
  }, [savedData]);

  // Berichtsinhalte laden
  useEffect(() => {
    fetch(assetPath('/assets/dialogs/Mission1_Bericht.md'))
      .then(r => r.ok ? r.text() : '')
      .then(setReportContent)
      .catch(() => setReportContent(''));
  }, []);

  const handleConfirmYes = () => {
    playClick();
    setPhase('generate');
  };

  const handleConfirmNo = () => {
    playClick();
    setPhase('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !manager.trim()) return;
    playClick();
    saveReportData({ name: name.trim(), email: email.trim(), manager: manager.trim() });
    setPhase('generate');
  };

  const handleGeneratePDF = async () => {
    playClick();

    const progress = loadProgress();
    const mission1 = progress.completedMissions.find(m => m.missionId === 'mission-1');
    const quizPercent = mission1 && mission1.score >= 10 ? 100 : Math.round((mission1?.score ?? 0) * 10);

    const now = new Date();
    const dateStr = now.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    // Einzigartige Verifizierungsdaten
    const certId = crypto.randomUUID();
    const verifyData = `${certId}|${name}|${email}|${dateStr}|${quizPercent}`;
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifyData));
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const doc = new jsPDF();

    // === Wasserzeichen (diagonal, halbtransparent) ===
    doc.saveGraphicsState();
    // @ts-expect-error jsPDF GState API
    doc.setGState(new doc.GState({ opacity: 0.06 }));
    doc.setFontSize(52);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 100, 150);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth * 0.6;
    const centerY = pageHeight / 2;
    doc.text('OPERATION SENTINEL', centerX, centerY, { angle: 35, align: 'center' });
    doc.setFontSize(28);
    doc.text('VERIFIZIERTES ZERTIFIKAT', centerX, centerY + 25, { angle: 35, align: 'center' });
    doc.restoreGraphicsState();
    doc.setTextColor(0, 0, 0);

    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Abschlusszertifikat IT-Security Training', 20, y);
    y += 12;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Datum: ${dateStr}, ${timeStr}`, 20, y);
    y += 8;
    doc.text(`Name Mitarbeiter:in: ${name}`, 20, y);
    y += 7;
    doc.text(`E-Mail: ${email}`, 20, y);
    y += 7;
    doc.text(`Führungskraft: ${manager}`, 20, y);
    y += 14;

    // Trennlinie
    doc.setDrawColor(0, 150, 200);
    doc.line(20, y, 190, y);
    y += 10;

    // Text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const mainText = `${name} hat am ${dateStr} das verpflichtende Training zur IT-Security erfolgreich abgeschlossen.`;
    const lines = doc.splitTextToSize(mainText, 170);
    doc.text(lines, 20, y);
    y += lines.length * 7 + 8;

    // Inhalte
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Folgende Inhalte wurden bearbeitet:', 20, y);
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const contentLines = reportContent.split('\n').filter(l => l.trim().length > 0);
    for (const line of contentLines) {
      const text = line.replace(/^-\s*/, '\u2022 ');
      doc.text(text, 25, y);
      y += 7;
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
    }

    y += 8;

    // Quiz-Ergebnis
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const quizText = `Beim Abschlussquiz zum Thema Passwortsicherheit wurden ${quizPercent}% der Fragen richtig beantwortet.`;
    const quizLines = doc.splitTextToSize(quizText, 170);
    doc.text(quizLines, 20, y);
    y += quizLines.length * 7 + 16;

    // Trennlinie vor Verifizierung
    doc.setDrawColor(150, 150, 150);
    doc.line(20, y, 190, y);
    y += 10;

    // Verifizierungsdaten
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Verifizierungsdaten (maschinell generiert):', 20, y);
    y += 5;
    doc.setFontSize(8);
    doc.text(`Zertifikat-ID: ${certId}`, 20, y);
    y += 4;
    doc.text(`SHA-256: ${hashHex}`, 20, y);
    y += 4;
    doc.text('Dieses Dokument wurde automatisch von Operation Sentinel generiert.', 20, y);

    // Download
    doc.save(`IT-Security-Zertifikat_${name.replace(/\s+/g, '_')}_${dateStr.replace(/\./g, '-')}.pdf`);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${assetPath('/assets/images/Mainmenu.webp')})` }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Zentrierte Card */}
      <motion.div
        className="relative z-10 rounded-2xl bg-black/80 backdrop-blur-md border border-accent-primary/30 shadow-[0_0_40px_rgba(0,212,255,0.1)]"
        style={{ width: 'clamp(420px, 40vw, 600px)', padding: 'clamp(2rem, 4vh, 3.5rem) clamp(2.5rem, 4vw, 4rem)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <h1
          className="font-display text-accent-primary tracking-wide text-center mb-2"
          style={{ fontSize: 'clamp(20px, 2.2vw, 36px)' }}
        >
          Zertifikat generieren
        </h1>
        <p className="text-text-secondary text-center mb-8" style={{ fontSize: 'clamp(12px, 0.95vw, 16px)' }}>
          Erstelle einen Nachweis über dein absolviertes IT-Security Training.
        </p>

        {/* Phase: Bestätigung gespeicherter Daten */}
        {phase === 'confirm' && savedData && (
          <div className="flex flex-col gap-5">
            <p className="text-text-primary text-center" style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}>
              Sind deine Daten noch aktuell?
            </p>
            <div className="rounded-lg bg-bg-secondary/40 border border-accent-primary/15 flex flex-col gap-3" style={{ padding: '1.5rem 2rem' }}>
              <p className="text-text-primary" style={{ fontSize: 'clamp(12px, 0.95vw, 16px)' }}>
                <span className="text-text-secondary">Name: </span>{savedData.name}
              </p>
              <p className="text-text-primary" style={{ fontSize: 'clamp(12px, 0.95vw, 16px)' }}>
                <span className="text-text-secondary">E-Mail: </span>{savedData.email}
              </p>
              <p className="text-text-primary" style={{ fontSize: 'clamp(12px, 0.95vw, 16px)' }}>
                <span className="text-text-secondary">Führungskraft: </span>{savedData.manager}
              </p>
            </div>
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={handleConfirmYes}
                onMouseEnter={playHover}
                className="flex-1 font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.8em 1.5em' }}
              >
                Ja, weiter
              </button>
              <button
                type="button"
                onClick={handleConfirmNo}
                onMouseEnter={playHover}
                className="flex-1 font-semibold rounded-lg bg-transparent border-2 border-text-secondary/40 text-text-secondary hover:bg-text-secondary/10 hover:border-text-secondary/60 transition-colors duration-200"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.8em 1.5em' }}
              >
                Nein, ändern
              </button>
            </div>
          </div>
        )}

        {/* Phase: Formular */}
        {phase === 'form' && (
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary font-medium" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>Name Mitarbeiter:in</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Max Mustermann"
                className="rounded-lg bg-bg-secondary/60 border border-accent-primary/30 text-text-primary focus:outline-none focus:border-accent-primary/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.8em 1.2em' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary font-medium" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>E-Mail Adresse</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="max.mustermann@firma.de"
                className="rounded-lg bg-bg-secondary/60 border border-accent-primary/30 text-text-primary focus:outline-none focus:border-accent-primary/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.8em 1.2em' }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-text-secondary font-medium" style={{ fontSize: 'clamp(11px, 0.9vw, 15px)' }}>Führungskraft</label>
              <input
                type="text"
                value={manager}
                onChange={e => setManager(e.target.value)}
                required
                placeholder="Name der Führungskraft"
                className="rounded-lg bg-bg-secondary/60 border border-accent-primary/30 text-text-primary focus:outline-none focus:border-accent-primary/60 focus:shadow-[0_0_12px_rgba(0,212,255,0.15)] transition-all"
                style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.8em 1.2em' }}
              />
            </div>
            <button
              type="submit"
              onMouseEnter={playHover}
              disabled={!name.trim() || !manager.trim()}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.9em 2em', marginTop: '0.5rem' }}
            >
              Weiter
            </button>
          </form>
        )}

        {/* Phase: PDF generieren */}
        {phase === 'generate' && (
          <div className="flex flex-col items-center gap-6">
            <p className="text-text-primary text-center" style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}>
              Dein Zertifikat ist bereit. Klicke auf den Button um das PDF herunterzuladen.
            </p>
            <button
              type="button"
              onClick={handleGeneratePDF}
              onMouseEnter={playHover}
              className="flex items-center gap-3 font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-colors duration-200"
              style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', padding: '1em 2.5em' }}
            >
              <FileDown size={22} />
              PDF herunterladen
            </button>
          </div>
        )}

        {/* Zurück-Button */}
        <button
          type="button"
          onClick={() => { playClick(); onBack(); }}
          onMouseEnter={playHover}
          className="flex items-center gap-2 font-semibold rounded-lg bg-transparent border border-text-secondary/30 text-text-secondary hover:bg-text-secondary/10 hover:border-text-secondary/50 transition-colors duration-200 mx-auto"
          style={{ fontSize: 'clamp(12px, 0.95vw, 16px)', padding: '0.7em 1.8em', marginTop: '2rem' }}
        >
          <ArrowLeft size={16} />
          Zurück zum Hauptmenü
        </button>
      </motion.div>

      {/* Volume Control */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}
