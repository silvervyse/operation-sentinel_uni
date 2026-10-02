// === Basis-Typen ===

export interface Choice {
  readonly id: string;
  readonly text: string;
  readonly points: number;
  readonly feedback: string;
  readonly isCorrect: boolean;
}

export interface Scenario {
  readonly id: string;
  readonly context: string;
  readonly choices: readonly Choice[];
  readonly correctChoiceId: string;
}

export interface Mission {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly scenarios: readonly Scenario[];
  readonly category: string;
}

// === State-Typen ===

export type MissionPhase = 'briefing' | 'tutorial' | 'playing' | 'debriefing';
export type MissionStatus = 'not-started' | 'in-progress' | 'completed';

export interface Answer {
  readonly scenarioId: string;
  readonly choiceId: string;
}

export interface GameState {
  readonly currentMission: Mission | null;
  readonly currentScenarioIndex: number;
  readonly score: number;
  readonly answers: readonly Answer[];
  readonly phase: MissionPhase;
  readonly missionStatus: MissionStatus;
}

// === Fortschritt-Typen ===

export interface CompletedMission {
  readonly missionId: string;
  readonly score: number;
  readonly completedAt: string;
}

export interface PlayerProgress {
  readonly completedMissions: readonly CompletedMission[];
  readonly totalScore: number;
  readonly unlockedAchievements: readonly string[];
  readonly lastPlayedAt: string;
}

export interface Achievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly condition: string;
  readonly icon: string;
}

// === Action-Typen ===

export type GameAction =
  | { type: 'START_MISSION'; payload: Mission }
  | { type: 'BEGIN_TUTORIAL' }
  | { type: 'BEGIN_PLAYING' }
  | { type: 'SELECT_CHOICE'; payload: { scenarioId: string; choiceId: string } }
  | { type: 'NEXT_SCENARIO' }
  | { type: 'RESET_GAME' };
