import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { GameState, GameAction } from '../types/game.types';
import { calculateScore } from '../services/score-calculator';
import { saveProgress, loadProgress } from '../services/persistence-service';

// === Default State ===

export const DEFAULT_GAME_STATE: GameState = {
  currentMission: null,
  currentScenarioIndex: 0,
  score: 0,
  answers: [],
  phase: 'briefing',
  missionStatus: 'not-started',
};

// === Pure Reducer ===

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_MISSION':
      return {
        currentMission: action.payload,
        currentScenarioIndex: 0,
        score: 0,
        answers: [],
        phase: 'tutorial',
        missionStatus: 'in-progress',
      };

    case 'BEGIN_TUTORIAL':
      return { ...state, phase: 'tutorial' };

    case 'BEGIN_PLAYING':
      return { ...state, phase: 'playing' };

    case 'SELECT_CHOICE': {
      const { scenarioId, choiceId } = action.payload;
      const newAnswers = [...state.answers, { scenarioId, choiceId }];
      const newScore = state.currentMission
        ? calculateScore(newAnswers, state.currentMission)
        : state.score;
      return { ...state, answers: newAnswers, score: newScore };
    }

    case 'NEXT_SCENARIO': {
      const nextIndex = state.currentScenarioIndex + 1;
      const totalScenarios = state.currentMission?.scenarios.length ?? 0;

      if (nextIndex >= totalScenarios) {
        return { ...state, currentScenarioIndex: nextIndex, phase: 'debriefing', missionStatus: 'completed' };
      }
      return { ...state, currentScenarioIndex: nextIndex };
    }

    case 'RESET_GAME':
      return DEFAULT_GAME_STATE;

    default:
      return state;
  }
}

// === Context ===

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

// === Provider ===

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, DEFAULT_GAME_STATE);

  // Persist progress when mission completes
  useEffect(() => {
    if (state.missionStatus === 'completed' && state.currentMission) {
      const existing = loadProgress();
      const updatedProgress = {
        completedMissions: [
          ...existing.completedMissions,
          {
            missionId: state.currentMission.id,
            score: state.score,
            completedAt: new Date().toISOString(),
          },
        ],
        totalScore: existing.totalScore + state.score,
        unlockedAchievements: existing.unlockedAchievements,
        lastPlayedAt: new Date().toISOString(),
      };
      saveProgress(updatedProgress);
    }
  }, [state.missionStatus, state.currentMission, state.score]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// === Hook ===

export function useGameState(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameProvider');
  }
  return context;
}
