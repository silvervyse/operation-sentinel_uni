import { useGameState } from '../../hooks/use-game-state';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

export interface MissionBriefingProps {}

function MissionBriefing() {
  const { state, dispatch } = useGameState();
  const mission = state.currentMission;

  if (!mission) return null;

  return (
    <div data-testid="mission-briefing" className="space-y-6">
      <Card elevation="lg" className="border border-accent-primary/20">
        <div className="text-center mb-4">
          <span className="text-xs tracking-[0.3em] text-danger font-bold uppercase">
            CLASSIFIED
          </span>
          <div className="h-px bg-accent-primary/20 mt-2" />
        </div>

        <h1 className="text-xl font-bold text-text-primary mb-3">
          {mission.title}
        </h1>
        <p className="text-text-secondary leading-relaxed mb-4">
          {mission.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Badge variant="info">{mission.scenarios.length} Szenarien</Badge>
        </div>
      </Card>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => dispatch({ type: 'BEGIN_TUTORIAL' })}
      >
        Mission beginnen
      </Button>
    </div>
  );
}

export default MissionBriefing;
