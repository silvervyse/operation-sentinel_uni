import { useGameState } from '../../hooks/use-game-state';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export interface MissionDebriefingProps {}

function MissionDebriefing() {
  const { state, dispatch } = useGameState();
  const mission = state.currentMission;

  if (!mission) return null;

  const maxScore = mission.scenarios.reduce((sum, s) => {
    const correctChoice = s.choices.find(c => c.isCorrect);
    return sum + (correctChoice?.points ?? 0);
  }, 0);

  return (
    <div data-testid="mission-debriefing" className="space-y-6">
      <Card elevation="lg" className="text-center">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Mission abgeschlossen</h1>
        <p className="text-3xl font-bold text-accent-primary">
          {state.score} / {maxScore}
        </p>
        <p className="text-text-secondary text-sm mt-1">Punkte erreicht</p>
      </Card>

      <div className="space-y-2">
        <h2 className="text-text-primary font-semibold">Zusammenfassung</h2>
        {mission.scenarios.map((scenario, index) => {
          const answer = state.answers.find(a => a.scenarioId === scenario.id);
          const isCorrect = answer?.choiceId === scenario.correctChoiceId;

          return (
            <div key={scenario.id} className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg">
              <span className="text-text-primary text-sm">
                Szenario {index + 1}
              </span>
              <Badge variant={isCorrect ? 'success' : 'danger'}>
                {isCorrect ? 'Richtig' : 'Falsch'}
              </Badge>
            </div>
          );
        })}
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={() => dispatch({ type: 'RESET_GAME' })}
      >
        Zurück zum Start
      </Button>
    </div>
  );
}

export default MissionDebriefing;
