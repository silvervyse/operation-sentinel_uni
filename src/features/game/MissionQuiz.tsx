import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Send } from 'lucide-react';
import { TypewriterText } from '../onboarding/TypewriterText';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { getDirectorImagePath } from '../onboarding/director';
import { getCharacterImagePath } from '../onboarding/characters';
import type { DirectorPose } from '../onboarding/director';
import { QUIZ_QUESTIONS } from './quiz-data';
import type { QuizQuestion } from './quiz-data';
import { assetPath } from '../../utils/asset-path';

type QuizPhase = 'director-intro' | 'agent-intro' | 'start-screen' | 'questions' | 'bonus-question' | 'results';

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Anzahl der Fragen pro Quiz-Durchlauf */
const QUIZ_QUESTION_COUNT = 10;

/** Erstellt eine randomisierte Kopie der Fragen mit gemischten Antworten */
function createRandomizedQuiz(): QuizQuestion[] {
  return shuffle(QUIZ_QUESTIONS)
    .slice(0, QUIZ_QUESTION_COUNT)
    .map(q => ({
      ...q,
      options: shuffle([...q.options]),
    }));
}

/** Direktorin-Absätze mit zugehöriger Pose */
interface DirectorLine {
  text: string;
  pose: DirectorPose;
}

function getDirectorLines(codename: string): DirectorLine[] {
  return [
    { text: `Hervorragend, Agent ${codename}.`, pose: 'lobend' },
    { text: 'Sie haben die Dateien sicher verschlüsselt. Damit sind Sie fast am Ende der Mission.', pose: 'neutral' },
    { text: 'Zum Schluss haben wir noch eine abschließende Prüfung, um sicherzustellen, dass Sie die Trainingsinhalte perfekt beherrschen.', pose: 'neutral' },
    { text: 'Viel Erfolg!', pose: 'lächelnd' },
  ];
}

/** Einfacher Hook für Hover/Click-Sounds */
function useUISounds() {
  const { volume } = useVolume();
  const hoverRef = useRef<HTMLAudioElement | null>(null);
  const clickRef = useRef<HTMLAudioElement | null>(null);

  const playHover = useCallback(() => {
    if (!hoverRef.current) hoverRef.current = new Audio(assetPath('/assets/audio/Hover.mp3'));
    hoverRef.current.volume = volume;
    hoverRef.current.currentTime = 0;
    hoverRef.current.play().catch(() => {});
  }, [volume]);

  const playClick = useCallback(() => {
    if (!clickRef.current) clickRef.current = new Audio(assetPath('/assets/audio/Click.mp3'));
    clickRef.current.volume = volume;
    clickRef.current.currentTime = 0;
    clickRef.current.play().catch(() => {});
  }, [volume]);

  return { playHover, playClick };
}

/**
 * Quiz-Screen: Direktorin-Intro → Agent-Intro → Start-Button → Fragen → Ergebnisse.
 */
export function MissionQuiz({ onComplete }: { onComplete: (hasFullScore: boolean) => void }) {
  const [phase, setPhase] = useState<QuizPhase>('director-intro');
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textReady, setTextReady] = useState(false);

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 Minuten in Sekunden
  const [timerRunning, setTimerRunning] = useState(false);
  const [bonusCorrect, setBonusCorrect] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [randomizedQuestions, setRandomizedQuestions] = useState<QuizQuestion[]>(() => createRandomizedQuiz());

  const { volume, setVolume } = useVolume();
  const { playHover, playClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  const codename = profile?.codename ?? 'Agent';
  const directorLines = getDirectorLines(codename);

  useEffect(() => {
    const timer = setTimeout(() => setTextReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Timer-Logik
  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  // Timer bei Ablauf automatisch abgeben
  useEffect(() => {
    if (timeLeft === 0 && phase === 'questions') {
      setPhase('bonus-question');
    }
  }, [timeLeft, phase]);

  const handleDirectorContinue = () => {
    if (!textReady) return;
    if (isTyping) { typewriterRef.current?.skip(); return; }
    if (paragraphIndex < directorLines.length - 1) {
      playClick();
      setParagraphIndex(prev => prev + 1);
      setIsTyping(true);
    } else {
      playClick();
      setPhase('agent-intro');
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionId: string) => {
    playClick();
    setAnswers(prev => ({ ...prev, [questionIndex]: optionId }));
  };

  const handleSubmit = () => {
    playClick();
    setTimerRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('bonus-question');
  };

  const correctCount = randomizedQuestions.filter((q, i) => answers[i] === q.correctId).length;
  const currentPose = directorLines[paragraphIndex]?.pose ?? 'neutral';

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      {/* Quiz-Hintergrund – etwas reingezoomt für mehr Tablet-Fläche */}
      <img
        src={assetPath("/assets/images/Mission1/Hintergründe/Quiz.webp")}
        alt="Quiz"
        className="absolute inset-0 w-full h-full object-cover scale-[1.25]"
      />

      {/* Phase: Direktorin Intro */}
      <AnimatePresence>
        {phase === 'director-intro' && (
          <motion.div key="director-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-20 flex bg-black/70 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.img key={currentPose} src={getDirectorImagePath(currentPose)} alt="Direktor Nova" className="absolute object-contain object-top" style={{ height: '55vh', left: '4vw', bottom: '-5vh' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} />
            </AnimatePresence>
            <motion.div className="absolute top-1/2 -translate-y-1/2 left-[37vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20" style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
              <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">Direktor Nova</span>
              <div className="min-h-[6rem]">
                <TypewriterText ref={typewriterRef} key={textReady ? paragraphIndex : 'waiting'} text={textReady ? directorLines[paragraphIndex].text : ''} speed={20} className="text-text-primary text-xl leading-relaxed" highlight={paragraphIndex === 0 ? codename : undefined} onComplete={() => { if (textReady) setIsTyping(false); }} />
              </div>
            </motion.div>
            <motion.div className="absolute left-[37vw] flex justify-end z-20" style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 15vh, 6rem)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.8 }}>
              <button type="button" onClick={handleDirectorContinue} onMouseEnter={playHover} className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200" style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}>
                {paragraphIndex < directorLines.length - 1 ? 'Weiter' : 'Verstanden'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Phase: Agent Intro */}
      <AnimatePresence>
        {phase === 'agent-intro' && <AgentIntroOverlay onComplete={() => setPhase('start-screen')} />}
      </AnimatePresence>

      {/* Phase: Start-Button */}
      {phase === 'start-screen' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <motion.button type="button" onClick={() => { playClick(); setTimerRunning(true); setPhase('questions'); }} onMouseEnter={playHover} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} className="font-display font-semibold rounded-xl bg-accent-primary/15 border-2 border-accent-primary text-accent-primary shadow-[0_0_20px_rgba(0,212,255,0.5)] hover:bg-accent-primary/25 hover:shadow-[0_0_35px_rgba(0,212,255,0.7)] hover:scale-[1.03] transition-all duration-200" style={{ fontSize: 'clamp(16px, 1.5vw, 26px)', padding: '1.2em 3em' }}>
            Abschlussprüfung starten
          </motion.button>
        </div>
      )}

      {/* Phase: Fragen */}
      {phase === 'questions' && (
        <QuizQuestionsView
          questions={randomizedQuestions}
          currentQuestion={currentQuestion}
          setCurrentQuestion={setCurrentQuestion}
          answers={answers}
          onSelectAnswer={handleSelectAnswer}
          onSubmit={handleSubmit}
          timeLeft={timeLeft}
        />
      )}

      {/* Phase: Bonus-Frage (Passphrase eingeben) */}
      {phase === 'bonus-question' && (
        <BonusQuestionView onComplete={(correct) => { setBonusCorrect(correct); setPhase('results'); }} />
      )}

      {/* Phase: Ergebnisse */}
      {phase === 'results' && (
        <QuizResultsView
          questions={randomizedQuestions}
          answers={answers}
          correctCount={correctCount}
          bonusCorrect={bonusCorrect}
          expandedResult={expandedResult}
          setExpandedResult={setExpandedResult}
          onComplete={onComplete}
          onRestartQuiz={() => {
            setPhase('start-screen');
            setCurrentQuestion(0);
            setAnswers({});
            setTimeLeft(180);
            setTimerRunning(false);
            setBonusCorrect(false);
            setExpandedResult(null);
            setRandomizedQuestions(createRandomizedQuiz());
          }}
        />
      )}

      {/* Lautstärkeregler */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </div>
  );
}

export default MissionQuiz;


// === Agent Intro Overlay ===

const AGENT_INTRO_PARAGRAPHS = [
  'Jetzt kommt es darauf an. Nur wenn ich alle Fragen in der vorgesehenen Zeit richtig beantworte, kann ich die Mission mit 3 Sternen abschließen.',
  'Ich werde mir also größte Mühe geben.',
];

function AgentIntroOverlay({ onComplete }: { onComplete: () => void }) {
  const [paragraphIndex, setParagraphIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textReady, setTextReady] = useState(false);
  const { profile } = usePlayerProfile();
  const { playHover, playClick } = useUISounds();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setTextReady(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    if (!textReady) return;
    if (isTyping) { typewriterRef.current?.skip(); return; }
    if (paragraphIndex < AGENT_INTRO_PARAGRAPHS.length - 1) {
      playClick();
      setParagraphIndex(prev => prev + 1);
      setIsTyping(true);
    } else {
      playClick();
      onComplete();
    }
  };

  return (
    <motion.div key="agent-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 z-20 flex bg-black/60 backdrop-blur-sm">
      {profile && (
        <motion.img src={getCharacterImagePath(profile.selectedCharacter, 'tutorial')} alt="Agent" className="absolute bottom-0 right-[10vw] object-contain flex-shrink-0 z-10" style={{ height: '75vh' }} initial={{ opacity: 0, x: '20%' }} animate={{ opacity: 1, x: '0%' }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }} />
      )}
      <motion.div className="absolute top-1/2 -translate-y-1/2 left-[35vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20" style={{ width: 'clamp(380px, 38vw, 600px)', padding: '2.5rem 2.5rem' }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        {profile && <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">Agent {profile.codename}</span>}
        <div className="min-h-[6rem]">
          <TypewriterText ref={typewriterRef} key={textReady ? paragraphIndex : 'waiting'} text={textReady ? AGENT_INTRO_PARAGRAPHS[paragraphIndex] : ''} speed={20} className="text-text-primary text-xl leading-relaxed" onComplete={() => { if (textReady) setIsTyping(false); }} />
        </div>
      </motion.div>
      <motion.div className="absolute left-[35vw] flex justify-end z-20" style={{ width: 'clamp(380px, 38vw, 600px)', bottom: 'clamp(2rem, 15vh, 6rem)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 1.0 }}>
        <button type="button" onClick={handleContinue} onMouseEnter={playHover} className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200" style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}>
          {paragraphIndex < AGENT_INTRO_PARAGRAPHS.length - 1 ? 'Weiter' : 'Los geht\'s'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// === Quiz Questions View ===

interface QuizQuestionsViewProps {
  questions: QuizQuestion[];
  currentQuestion: number;
  setCurrentQuestion: (i: number) => void;
  answers: Record<number, string>;
  onSelectAnswer: (questionIndex: number, optionId: string) => void;
  onSubmit: () => void;
  timeLeft: number;
}

function QuizQuestionsView({ questions, currentQuestion, setCurrentQuestion, answers, onSelectAnswer, onSubmit, timeLeft }: QuizQuestionsViewProps) {
  const { playHover, playClick } = useUISounds();
  const question = questions[currentQuestion];
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isLowTime = timeLeft <= 30;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
      style={{ padding: '3vh 2vw' }}
    >
      {/* Dunkles Overlay über dem Hintergrund */}
      <div className="absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-[850px]" style={{ gap: '2vh' }}>

        {/* Fortschrittsleiste */}
        <div className="relative flex items-center justify-center w-full" style={{ marginTop: '1.5cm', marginBottom: '0.5rem' }}>
          <div className="flex items-center gap-2">
            {questions.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => { playClick(); setCurrentQuestion(i); }}
                onMouseEnter={playHover}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  i === currentQuestion
                    ? 'bg-accent-primary text-bg-primary shadow-[0_0_12px_rgba(0,212,255,0.5)]'
                    : answers[i] !== undefined
                      ? 'bg-accent-primary/20 border border-accent-primary/50 text-accent-primary'
                      : 'bg-bg-secondary/60 border border-text-secondary/20 text-text-secondary/60'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Timer – absolut rechts */}
          <div className={`absolute right-0 font-mono font-bold rounded-lg border ${
            isLowTime
              ? 'border-danger/60 text-danger bg-danger/10 animate-pulse'
              : 'border-accent-primary/40 text-accent-primary bg-accent-primary/10'
          }`} style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', padding: '0.4em 1.5em' }}>
            ⏱ {timerDisplay}
          </div>
        </div>

        {/* Frage-Card */}
        <div
          className="w-full rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/30 shadow-[0_0_30px_rgba(0,212,255,0.1)]"
          style={{ padding: 'clamp(1.5rem, 3vh, 2.5rem) clamp(1.5rem, 3vw, 3rem)', minHeight: 'clamp(380px, 50vh, 500px)' }}
        >
          {/* Titel */}
          <p className="text-accent-primary/70 text-sm uppercase tracking-wider font-medium mb-2">
            Frage {currentQuestion + 1} – {question.title}
          </p>

          {/* Frage */}
          <p className="text-text-primary font-medium leading-relaxed mb-6" style={{ fontSize: 'clamp(15px, 1.2vw, 20px)' }}>
            {question.question}
          </p>

          {/* Antwortmöglichkeiten */}
          <div className="flex flex-col gap-3">
            {question.options.map((option) => {
              const isSelected = answers[currentQuestion] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectAnswer(currentQuestion, option.id)}
                  onMouseEnter={playHover}
                  className={`w-full text-left rounded-lg border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-accent-primary bg-accent-primary/10 shadow-[0_0_12px_rgba(0,212,255,0.2)]'
                      : 'border-text-secondary/20 bg-bg-secondary/40 hover:border-accent-primary/40 hover:bg-accent-primary/5'
                  }`}
                  style={{ padding: 'clamp(0.8rem, 1.2vh, 1.2rem) clamp(1rem, 1.5vw, 1.5rem)' }}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${isSelected ? 'text-text-primary' : 'text-text-secondary'}`} style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}>
                      {option.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between w-full" style={{ marginTop: '-1vh' }}>
          <button
            type="button"
            onClick={() => { playClick(); setCurrentQuestion(Math.max(0, currentQuestion - 1)); }}
            onMouseEnter={playHover}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 font-semibold rounded-lg bg-bg-secondary/60 border border-text-secondary/30 text-text-secondary hover:text-text-primary hover:border-text-secondary/60 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.6em 1.5em' }}
          >
            <ChevronLeft size={18} /> Zurück
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              type="button"
              onClick={() => { playClick(); setCurrentQuestion(currentQuestion + 1); }}
              onMouseEnter={playHover}
              className="flex items-center gap-2 font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
              style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.6em 1.5em' }}
            >
              Weiter <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { if (allAnswered) onSubmit(); }}
              onMouseEnter={() => { if (allAnswered) playHover(); }}
              className={`flex items-center gap-2 font-semibold rounded-lg border-2 transition-all duration-200 ${
                allAnswered
                  ? 'bg-accent-secondary/10 border-accent-secondary text-accent-secondary shadow-[0_0_12px_rgba(0,255,136,0.4)] hover:bg-accent-secondary/20 hover:shadow-[0_0_20px_rgba(0,255,136,0.6)]'
                  : 'bg-bg-secondary/50 border-text-secondary/20 text-text-secondary/50 cursor-not-allowed'
              }`}
              style={{ fontSize: 'clamp(12px, 1vw, 16px)', padding: '0.6em 1.5em' }}
            >
              <Send size={18} /> Test abgeben
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// === Quiz Results View ===

interface QuizResultsViewProps {
  questions: QuizQuestion[];
  answers: Record<number, string>;
  correctCount: number;
  bonusCorrect: boolean;
  expandedResult: number | null;
  setExpandedResult: (i: number | null) => void;
  onComplete: (hasFullScore: boolean) => void;
  onRestartQuiz: () => void;
}

function QuizResultsView({ questions, answers, correctCount, bonusCorrect, expandedResult, setExpandedResult, onComplete, onRestartQuiz }: QuizResultsViewProps) {
  const { playHover, playClick } = useUISounds();
  const [showConfirm, setShowConfirm] = useState(false);

  const totalScore = correctCount + (bonusCorrect ? 1 : 0);
  const hasFullScore = totalScore >= 10; // 10/10 oder 9+1 Bonus

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-10 flex flex-col items-center overflow-y-auto"
      style={{ padding: '14vh 2vw 4vh' }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[800px]" style={{ gap: '2.5vh' }}>

        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-accent-primary tracking-wide" style={{ fontSize: 'clamp(20px, 2.2vw, 34px)' }}>
            Ergebnis: Abschlussprüfung
          </h1>
          <p className="text-text-secondary mt-2" style={{ fontSize: 'clamp(14px, 1.1vw, 20px)' }}>
            {correctCount} von {questions.length} Fragen richtig{bonusCorrect ? ' + 1 Bonuspunkt' : ''} — Gesamt: {totalScore}/10
          </p>
        </div>

        {/* Fragen-Übersicht */}
        <div className="w-full flex flex-col gap-2">
          {questions.map((q, i) => {
            const isCorrect = answers[i] === q.correctId;
            const isExpanded = expandedResult === i;

            return (
              <div key={q.id}>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setExpandedResult(isExpanded ? null : i);
                  }}
                  onMouseEnter={playHover}
                  className={`w-full flex items-center gap-3 rounded-lg border transition-all duration-200 text-left ${
                    isCorrect
                      ? 'border-accent-secondary/30 bg-accent-secondary/5 hover:border-accent-secondary/50 cursor-pointer'
                      : 'border-danger/30 bg-danger/5 hover:border-danger/50 cursor-pointer'
                  }`}
                  style={{ padding: '0.8rem 1.2rem' }}
                >
                  {isCorrect ? (
                    <CheckCircle size={22} className="text-accent-secondary flex-shrink-0" />
                  ) : (
                    <XCircle size={22} className="text-danger flex-shrink-0" />
                  )}
                  <span className="text-text-primary flex-1" style={{ fontSize: 'clamp(13px, 1vw, 16px)' }}>
                    Frage {i + 1}: {q.title}
                  </span>
                  <span className="text-text-secondary/60 text-xs">
                    {isExpanded ? '▲' : '▼ Erklärung'}
                  </span>
                </button>

                {/* Erklärung (bei richtig und falsch) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className={`rounded-b-lg bg-bg-secondary/60 border border-t-0 ${isCorrect ? 'border-accent-secondary/20' : 'border-danger/20'}`} style={{ padding: '1rem 1.5rem' }}>
                        {!isCorrect && (
                          <>
                            <p className="text-text-secondary text-sm mb-2">
                              <span className="text-danger font-medium">Deine Antwort:</span> {q.options.find(o => o.id === answers[i])?.text}
                            </p>
                            <p className="text-text-secondary text-sm mb-3">
                              <span className="text-accent-secondary font-medium">Richtige Antwort:</span> {q.options.find(o => o.id === q.correctId)?.text}
                            </p>
                          </>
                        )}
                        <p className="text-text-primary text-sm leading-relaxed">{q.explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Bonusfrage */}
          <div className={`w-full rounded-lg border transition-all duration-200 ${
            bonusCorrect
              ? 'border-accent-secondary/30 bg-accent-secondary/5'
              : 'border-danger/30 bg-danger/5'
          }`} style={{ padding: '0.8rem 1.2rem' }}>
            <div className="flex items-center gap-3">
              {bonusCorrect ? (
                <CheckCircle size={22} className="text-accent-secondary flex-shrink-0" />
              ) : (
                <XCircle size={22} className="text-danger flex-shrink-0" />
              )}
              <span className="text-text-primary flex-1" style={{ fontSize: 'clamp(13px, 1vw, 16px)' }}>
                Bonusfrage: Passphrase eingeben
              </span>
              <span className="text-accent-primary/60 text-xs font-medium">+1 Bonus</span>
            </div>
            <p className="text-text-primary text-sm leading-relaxed mt-2 ml-[34px]">
              {bonusCorrect
                ? (localStorage.getItem('op-sentinel-use-pwmanager') === 'true'
                    ? 'Eine Passphrase ist ein sehr starkes Passwort – und mit einem Passwortmanager ist es sowieso ein Kinderspiel, sich auch sichere Passwörter zu merken.'
                    : 'Eine Passphrase ist ein sehr starkes Passwort – und leicht zu merken, wie du siehst.')
                : 'Eine Passphrase ist ein sehr starkes Passwort – wenn dir das Merken trotzdem schwerfällt, nutze einen Passwortmanager.'}
            </p>
          </div>
        </div>

        {/* Abschließen-Button */}
        <button
          type="button"
          onClick={() => {
            playClick();
            if (hasFullScore) {
              onComplete(true);
            } else {
              setShowConfirm(true);
            }
          }}
          onMouseEnter={playHover}
          className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
          style={{ fontSize: 'clamp(14px, 1.2vw, 20px)', padding: '0.8em 2.5em', marginTop: '1vh' }}
        >
          Mission abschließen
        </button>

        {/* Bestätigungsdialog bei weniger als voller Punktzahl */}
        <AnimatePresence>
          {showConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/80" onClick={() => setShowConfirm(false)} />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 rounded-2xl bg-black/90 border border-warning/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                style={{ padding: '2.5rem 3rem', maxWidth: '480px', width: '90%' }}
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <p className="text-warning font-display" style={{ fontSize: 'clamp(15px, 1.3vw, 22px)' }}>
                    3 Sterne bekommst du nur bei voller Punktzahl.
                  </p>
                  <p className="text-text-secondary" style={{ fontSize: 'clamp(12px, 1vw, 16px)' }}>
                    Möchtest du sicher beenden?
                  </p>
                  <div className="flex gap-4" style={{ marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => { playClick(); setShowConfirm(false); onRestartQuiz(); }}
                      onMouseEnter={playHover}
                      className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary hover:bg-accent-primary/20 transition-colors duration-200"
                      style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                    >
                      Quiz von vorne starten
                    </button>
                    <button
                      type="button"
                      onClick={() => { playClick(); setShowConfirm(false); onComplete(false); }}
                      onMouseEnter={playHover}
                      className="font-semibold rounded-lg bg-warning/20 border-2 border-warning text-warning hover:bg-warning/30 transition-colors duration-200"
                      style={{ fontSize: 'clamp(12px, 0.9vw, 16px)', padding: '0.6em 1.4em' }}
                    >
                      Ja, Mission beenden
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}


// === Bonus Question View (Passphrase eingeben) ===

function BonusQuestionView({ onComplete }: { onComplete: (correct: boolean) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [failDialogReady, setFailDialogReady] = useState(false);
  const [failTyping, setFailTyping] = useState(true);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [textReady, setTextReady] = useState(false);
  const [showPhoneOverlay, setShowPhoneOverlay] = useState(false);
  const { playHover, playClick } = useUISounds();
  const { profile } = usePlayerProfile();
  const typewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);
  const failTypewriterRef = useRef<{ skip: () => void; isAnimating: () => boolean } | null>(null);
  const { volume } = useVolume();
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const buzzAudioRef = useRef<HTMLAudioElement | null>(null);

  const savedPassphrase = localStorage.getItem('op-sentinel-passphrase') ?? '';
  const usePwManager = localStorage.getItem('op-sentinel-use-pwmanager') === 'true';
  const savedPasswords: { file: string; password: string; rating: string }[] = JSON.parse(localStorage.getItem('op-sentinel-passwords') || '[]').slice(-5);
  const codename = profile?.codename ?? 'Agent';
  // Erstes Wort der Passphrase als Hinweis extrahieren
  const firstWord = savedPassphrase.split(/[^a-zA-ZäöüÄÖÜß]+/)[0] ?? '';

  const dialogLines = [
    `Agent ${codename}, ich brauche dringend Zugriff auf die 5. Datei – die „Geheime_Akte_X7.pdf".`,
    'Sie haben diese Datei mit einer selbst gewählten Passphrase verschlüsselt. Bitte geben Sie mir das Passwort.',
  ];

  const failMessage = 'Schade. Vielleicht sollten Sie beim nächsten Mal eine für Sie leichter merkbare Passphrase benutzen – oder noch besser, einen Passwortmanager.';

  useEffect(() => {
    const timer = setTimeout(() => setTextReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Wenn failed gesetzt wird, kurz warten und dann den Fail-Dialog zeigen
  useEffect(() => {
    if (failed) {
      const timer = setTimeout(() => setFailDialogReady(true), 600);
      return () => clearTimeout(timer);
    }
  }, [failed]);

  const handleDialogContinue = () => {
    if (!textReady) return;
    if (isTyping) { typewriterRef.current?.skip(); return; }
    if (dialogIndex < dialogLines.length - 1) {
      playClick();
      setDialogIndex(prev => prev + 1);
      setIsTyping(true);
    }
  };

  const dialogDone = dialogIndex >= dialogLines.length - 1 && !isTyping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (success || failed) return;
    if (password === savedPassphrase) {
      setSuccess(true);
      setError(false);
      // Bonuspunkt nur wenn innerhalb von 3 Versuchen gelöst (ohne Hinweis)
      const earned = attempts < 3;
      if (!correctAudioRef.current) correctAudioRef.current = new Audio(assetPath('/assets/audio/correct.mp3'));
      correctAudioRef.current.volume = volume;
      correctAudioRef.current.currentTime = 0;
      correctAudioRef.current.play().catch(() => {});
      setTimeout(() => onComplete(earned), 2000);
    } else {
      setError(true);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (!buzzAudioRef.current) buzzAudioRef.current = new Audio(assetPath('/assets/audio/warningbuzz.mp3'));
      buzzAudioRef.current.volume = volume;
      buzzAudioRef.current.currentTime = 0;
      buzzAudioRef.current.play().catch(() => {});
      // Mit Passwortmanager: nach 3 Versuchen Abbruch (kein Hinweis)
      if (usePwManager && newAttempts >= 3) {
        setFailed(true);
      }
      // Ohne Passwortmanager: nach 6 Versuchen Abbruch
      if (!usePwManager && newAttempts >= 6) {
        setFailed(true);
      }
    }
  };

  // Fail-Zustand: Direktorin-Nachricht und dann weiter zum Ergebnis
  if (failed) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 z-30 flex bg-black/70 backdrop-blur-sm"
      >
        <motion.img
          src={getDirectorImagePath('neutral')}
          alt="Direktor Nova"
          className="absolute object-contain object-top"
          style={{ height: '55vh', left: '4vw', bottom: '-5vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.div
          className="absolute top-1/2 -translate-y-1/2 left-[35vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-danger/40 shadow-[0_0_24px_rgba(239,68,68,0.2)] z-20"
          style={{ width: 'clamp(400px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
            Direktor Nova
          </span>
          <div className="min-h-[6rem]">
            {failDialogReady && (
              <TypewriterText
                ref={failTypewriterRef}
                text={failMessage}
                speed={20}
                className="text-text-primary text-lg leading-relaxed"
                onComplete={() => setFailTyping(false)}
              />
            )}
          </div>
        </motion.div>

        {!failTyping && (
          <motion.div
            className="absolute left-[35vw] flex justify-end z-20"
            style={{ width: 'clamp(400px, 40vw, 650px)', bottom: 'clamp(2rem, 15vh, 6rem)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => { playClick(); onComplete(false); }}
              onMouseEnter={playHover}
              className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
              style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
            >
              Weiter zum Ergebnis
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-30 flex bg-black/70 backdrop-blur-sm"
    >
      {/* Direktorin links */}
      <motion.img
        src={getDirectorImagePath('neutral')}
        alt="Direktor Nova"
        className="absolute object-contain object-top"
        style={{ height: '55vh', left: '4vw', bottom: '-5vh' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      />

      {/* Dialog + Eingabe */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-[35vw] rounded-xl bg-bg-primary/95 backdrop-blur-md border border-accent-primary/40 shadow-[0_0_24px_rgba(0,212,255,0.2)] z-20"
        style={{ width: 'clamp(400px, 40vw, 650px)', padding: '2.5rem 2.5rem' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <span className="text-accent-primary font-semibold text-sm tracking-wide uppercase mb-2 block">
          Direktor Nova
        </span>

        {/* Dialog-Text */}
        <div className="min-h-[5rem] mb-4">
          <TypewriterText
            ref={typewriterRef}
            key={textReady ? dialogIndex : 'waiting'}
            text={textReady ? dialogLines[dialogIndex] : ''}
            speed={20}
            className="text-text-primary text-lg leading-relaxed"
            highlight={dialogIndex === 0 ? codename : undefined}
            onComplete={() => { if (textReady) setIsTyping(false); }}
          />
        </div>

        {/* Passwort-Eingabe wenn Dialog fertig */}
        {dialogDone && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <p className="text-text-secondary text-sm">Bonusfrage: Gib deine Passphrase für die 5. Datei ein.</p>
            <p className="text-accent-primary/80 text-sm font-mono">📄 Geheime_Akte_X7.pdf</p>
            <input
              type="text"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              disabled={success}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              placeholder="Passphrase eingeben..."
              className="w-full rounded-lg bg-bg-primary border-2 border-accent-primary/50 text-text-primary font-mono placeholder:text-text-secondary/40 focus:outline-none focus:border-accent-primary focus:shadow-[0_0_12px_rgba(0,212,255,0.3)] transition-all duration-200"
              style={{ fontSize: 'clamp(14px, 1.1vw, 20px)', padding: '0.8em 1.2em' }}
            />

            {error && !failed && (
              <p className="text-danger text-sm font-medium">Falsche Passphrase. Versuche es erneut.</p>
            )}

            {!usePwManager && attempts >= 3 && attempts < 6 && !success && (
              <p className="text-warning text-sm">Hinweis: Das erste Wort lautet „{firstWord}"</p>
            )}

            {success && (
              <p className="text-accent-secondary text-sm font-medium">✓ Korrekt! Datei entschlüsselt.</p>
            )}

            <div className="flex gap-3">
              {!success && (
                <button
                  type="submit"
                  disabled={!password.trim()}
                  onMouseEnter={playHover}
                  className="flex-1 font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: 'clamp(13px, 1vw, 17px)', padding: '0.7em 2em' }}
                >
                  Entschlüsseln
                </button>
              )}

              {/* Passwortmanager-Button nur wenn aktiviert */}
              {usePwManager && !success && (
                <button
                  type="button"
                  onClick={() => { playClick(); setShowPhoneOverlay(true); }}
                  onMouseEnter={playHover}
                  className="font-semibold rounded-lg bg-accent-secondary/10 border-2 border-accent-secondary/60 text-accent-secondary hover:bg-accent-secondary/20 hover:border-accent-secondary hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all duration-200"
                  style={{ fontSize: 'clamp(11px, 0.9vw, 15px)', padding: '0.7em 1.2em' }}
                >
                  🔑 Passwortmanager
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>

      {/* Weiter-Button außerhalb der Dialogbox */}
      {!dialogDone && (
        <motion.div
          className="absolute left-[35vw] flex justify-end z-20"
          style={{ width: 'clamp(400px, 40vw, 650px)', bottom: 'clamp(2rem, 15vh, 6rem)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <button
            type="button"
            onClick={handleDialogContinue}
            onMouseEnter={playHover}
            className="font-semibold rounded-lg bg-accent-primary/10 border-2 border-accent-primary text-accent-primary shadow-[0_0_12px_rgba(0,212,255,0.4)] hover:bg-accent-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.6)] transition-all duration-200"
            style={{ fontSize: 'clamp(13px, 1.1vw, 18px)', padding: '0.7em 2em' }}
          >
            Weiter
          </button>
        </motion.div>
      )}

      {/* Passwortmanager Smartphone-Overlay */}
      <AnimatePresence>
        {showPhoneOverlay && (
          <motion.div
            key="phone-overlay"
            className="absolute inset-0 z-[60] flex items-end justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Dunkler Hintergrund zum Schließen */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => { playClick(); setShowPhoneOverlay(false); }}
            />

            {/* Handy mit Passwortmanager */}
            <motion.div
              className="relative z-10 flex"
              style={{ marginRight: '3vw', marginBottom: '-2vh' }}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Hand-Bild als Container */}
              <div className="relative" style={{ height: '85vh' }}>
                <img
                  src={assetPath("/assets/images/Mission1/Hand.webp")}
                  alt="Smartphone mit Passwortmanager"
                  className="h-full object-contain"
                  draggable={false}
                />

                {/* Passwortmanager-Inhalt auf dem Smartphone-Screen */}
                <div
                  className="absolute flex flex-col overflow-hidden"
                  style={{
                    top: '13.5%',
                    left: '22%',
                    width: '28.6%',
                    height: '58%',
                    borderRadius: '16px',
                  }}
                >
                  {/* App-Header */}
                  <div className="bg-[#1a1f2e] border-b border-accent-primary/30 flex items-center gap-2 flex-shrink-0" style={{ padding: '0.6rem 0.8rem' }}>
                    <span className="text-accent-primary text-sm font-bold">🔑 Passwortmanager</span>
                  </div>

                  {/* Passwort-Liste */}
                  <div className="flex-1 overflow-y-auto bg-[#0d1117]" style={{ padding: '0.4rem' }}>
                    {savedPasswords.map((entry, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playClick();
                          setPassword(entry.password);
                          setError(false);
                          setShowPhoneOverlay(false);
                        }}
                        onMouseEnter={playHover}
                        className="w-full text-left rounded-md bg-white/5 border border-white/10 hover:bg-accent-primary/10 hover:border-accent-primary/40 transition-all duration-150 cursor-pointer"
                        style={{ padding: '0.4rem 0.6rem', marginBottom: '0.3rem' }}
                      >
                        <p className="text-text-primary font-medium truncate" style={{ fontSize: 'clamp(10px, 0.9vw, 14px)' }}>
                          {entry.file}
                        </p>
                        <p className="text-text-secondary font-mono truncate" style={{ fontSize: 'clamp(9px, 0.8vw, 12px)' }}>
                          {'•'.repeat(Math.min(entry.password.length, 12))}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
