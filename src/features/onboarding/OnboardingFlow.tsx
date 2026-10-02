import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { AgentCharacterId } from '../../types/player-profile.types';
import { saveProfile } from '../../services/profile-service';
import { usePlayerProfile } from '../../hooks/use-player-profile';
import { useVolume } from '../../hooks/use-volume';
import { VolumeSlider } from '../../components/VolumeSlider';
import { GreetingScreen } from './GreetingScreen';
import { CodenameScreen } from './CodenameScreen';
import { CharacterSelectionScreen } from './CharacterSelectionScreen';
import { ConfirmationDialog } from './ConfirmationDialog';
import { BadgeCeremonyScreen } from './BadgeCeremonyScreen';

type OnboardingStep = 'greeting' | 'codename' | 'character-selection' | 'confirmation' | 'badge-ceremony';

export interface OnboardingFlowProps {
  onComplete: (destination: 'mission' | 'agent-file' | 'menu') => void;
}

/**
 * OnboardingFlow – Container-Komponente für den vierstufigen Onboarding-Prozess.
 *
 * Verwaltet den aktuellen Step und die gesammelten Daten (Codename, Charakter).
 * Rendert den jeweils aktiven Step-Screen mit Übergangsanimationen.
 *
 * State Machine:
 *   greeting → codename → character-selection → confirmation
 *   confirmation → (cancel) → character-selection (selectedCharacter bleibt erhalten)
 *   confirmation → (confirm) → save + onComplete()
 */
export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('greeting');
  const [codename, setCodename] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState<AgentCharacterId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { setProfile } = usePlayerProfile();
  const { volume, setVolume } = useVolume();

  // Step-Transitions
  const handleGreetingContinue = useCallback(() => {
    setCurrentStep('codename');
  }, []);

  const handleCodenameSubmit = useCallback((submittedCodename: string) => {
    setCodename(submittedCodename);
    setCurrentStep('character-selection');
  }, []);

  const handleCharacterSelect = useCallback((characterId: AgentCharacterId) => {
    setSelectedCharacter(characterId);
    setCurrentStep('confirmation');
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setCurrentStep('codename');
  }, []);

  // Save flow
  const handleConfirm = useCallback(async () => {
    if (!selectedCharacter) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const profile = { codename, selectedCharacter };
      saveProfile(profile);
      setProfile(profile);
      setCurrentStep('badge-ceremony');
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Profil konnte nicht gespeichert werden.';
      setSaveError(message);
      setIsSaving(false);
    }
  }, [codename, selectedCharacter, setProfile]);

  const handleRetry = useCallback(() => {
    handleConfirm();
  }, [handleConfirm]);

  // Render current step with transition animation
  function renderStep() {
    switch (currentStep) {
      case 'greeting':
        return <GreetingScreen onContinue={handleGreetingContinue} />;

      case 'codename':
        return (
          <CodenameScreen
            onSubmit={handleCodenameSubmit}
            initialValue={codename}
          />
        );

      case 'character-selection':
        return (
          <CharacterSelectionScreen
            onSelect={handleCharacterSelect}
            initialCharacter={selectedCharacter ?? undefined}
            codename={codename}
          />
        );

      case 'confirmation':
        return (
          <ConfirmationDialog
            codename={codename}
            selectedCharacter={selectedCharacter!}
            onConfirm={handleConfirm}
            onCancel={handleConfirmCancel}
            isSaving={isSaving}
            saveError={saveError}
            onRetry={handleRetry}
          />
        );

      case 'badge-ceremony':
        return (
          <BadgeCeremonyScreen
            codename={codename}
            onGoToAgentFile={() => onComplete('agent-file')}
            onGoToMission={() => onComplete('mission')}
            onGoToMenu={() => onComplete('menu')}
          />
        );
    }
  }

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="h-screen w-screen"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Volume Control – fixed bottom right, above all screens */}
      <div className="fixed bottom-6 right-6 z-[60]">
        <VolumeSlider volume={volume} onChange={setVolume} />
      </div>
    </>
  );
}
