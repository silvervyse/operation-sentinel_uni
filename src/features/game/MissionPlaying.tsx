import { useState } from 'react';
import { useGameState } from '../../hooks/use-game-state';
import Card from '../../components/Card';
import Button from '../../components/Button';

export interface MissionPlayingProps {}

function MissionPlaying() {
  const { state, dispatch } = useGameState();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  const mission = state.currentMission;
  if (!mission) return null;

  const scenario = mission.scenarios[state.currentScenarioIndex];
  if (!scenario) return null;

  const selectedChoice = scenario.choices.find(c => c.id === selectedChoiceId);

  const handleSelectChoice = (choiceId: string) => {
    if (selectedChoiceId) return;
    setSelectedChoiceId(choiceId);
    dispatch({
      type: 'SELECT_CHOICE',
      payload: { scenarioId: scenario.id, choiceId },
    });
  };

  const handleNext = () => {
    setSelectedChoiceId(null);
    dispatch({ type: 'NEXT_SCENARIO' });
  };

  return (
    <div data-testid="mission-playing" className="space-y-6">
      <p className="text-sm text-text-secondary text-center">
        Szenario {state.currentScenarioIndex + 1} von {mission.scenarios.length}
      </p>

      <Card elevation="md">
        <p className="text-text-primary leading-relaxed">{scenario.context}</p>
      </Card>

      <div className="space-y-3">
        {scenario.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            disabled={!!selectedChoiceId}
            onClick={() => handleSelectChoice(choice.id)}
            className={`w-full text-left p-4 rounded-lg border transition-colors duration-fast
              ${selectedChoiceId === choice.id
                ? choice.isCorrect
                  ? 'border-accent-secondary bg-accent-secondary/10'
                  : 'border-danger bg-danger/10'
                : selectedChoiceId
                  ? 'opacity-50 cursor-not-allowed border-bg-tertiary'
                  : 'border-bg-tertiary hover:border-accent-primary/50 bg-bg-secondary'
              }`}
          >
            <span className="text-text-primary">{choice.text}</span>
          </button>
        ))}
      </div>

      {selectedChoice && (
        <Card
          elevation="sm"
          className={`border ${
            selectedChoice.isCorrect
              ? 'border-accent-secondary/50 bg-accent-secondary/5'
              : 'border-warning/50 bg-warning/5'
          }`}
        >
          <p className="text-text-primary text-sm">{selectedChoice.feedback}</p>
        </Card>
      )}

      {selectedChoiceId && (
        <Button variant="primary" className="w-full" onClick={handleNext}>
          Weiter
        </Button>
      )}
    </div>
  );
}

export default MissionPlaying;
