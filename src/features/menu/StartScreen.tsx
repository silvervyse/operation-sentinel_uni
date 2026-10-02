import { useGameState } from '../../hooks/use-game-state';
import { loadProgress } from '../../services/persistence-service';
import { MISSIONS } from '../../data/missions';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import type { Mission } from '../../types/game.types';

export interface StartScreenProps {}

function StartScreen() {
  const { dispatch } = useGameState();
  const progress = loadProgress();

  const completedCount = progress.completedMissions.length;
  const totalScore = progress.totalScore;

  const isCompleted = (missionId: string) =>
    progress.completedMissions.some(m => m.missionId === missionId);

  const handleStartMission = (mission: Mission) => {
    dispatch({ type: 'START_MISSION', payload: mission });
  };

  return (
    <div data-testid="start-screen" className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-text-secondary text-sm">
          Abgeschlossene Missionen: {completedCount}
        </p>
        <p className="text-accent-primary font-medium">
          Score: {totalScore}
        </p>
      </div>

      {MISSIONS.map((mission) => (
        <Card
          key={mission.id}
          elevation="md"
          className="cursor-pointer hover:shadow-lg transition-shadow duration-fast"
          onClick={() => handleStartMission(mission)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-text-primary font-semibold">{mission.title}</h2>
              <p className="text-text-secondary text-sm mt-1">{mission.description}</p>
            </div>
            {isCompleted(mission.id) && (
              <Badge variant="success">Abgeschlossen</Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

export default StartScreen;
