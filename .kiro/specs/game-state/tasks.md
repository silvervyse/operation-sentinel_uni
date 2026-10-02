# Implementation Plan: Game State

## Overview

Implementierung des Game State Fundaments für die gamifizierte IT-Security Awareness Anwendung. Die Umsetzung erfolgt inkrementell: Zuerst TypeScript-Typen, dann pure Logik-Funktionen (Score Calculator, Persistence Service), dann State Management (Reducer + Context Provider), und abschließend Property-Based Tests für jede Komponente.

## Tasks

- [ ] 1. TypeScript-Typdefinitionen erstellen
  - [ ] 1.1 Create `src/types/game.types.ts` with all game state type definitions
    - Create the `src/types/` directory if it does not exist
    - Define and export `Choice` interface with id, text, points, feedback, isCorrect (all readonly)
    - Define and export `Scenario` interface with id, context, choices (readonly array), correctChoiceId (all readonly)
    - Define and export `Mission` interface with id, title, description, scenarios (readonly array), category (all readonly)
    - Define and export `MissionPhase` type as literal union: 'briefing' | 'playing' | 'debriefing'
    - Define and export `MissionStatus` type as literal union: 'not-started' | 'in-progress' | 'completed'
    - Define and export `Answer` interface with scenarioId, choiceId (all readonly)
    - Define and export `GameState` interface with currentMission, currentScenarioIndex, score, answers, phase, missionStatus (all readonly)
    - Define and export `CompletedMission` interface with missionId, score, completedAt (all readonly)
    - Define and export `PlayerProgress` interface with completedMissions, totalScore, unlockedAchievements, lastPlayedAt (all readonly)
    - Define and export `Achievement` interface with id, title, description, condition, icon (all readonly)
    - Define and export `GameAction` discriminated union type with START_MISSION, BEGIN_PLAYING, SELECT_CHOICE, NEXT_SCENARIO, RESET_GAME
    - _Requirements: 1.1–1.6, 2.1–2.10, 3.1–3.7, 4.1–4.10_

- [ ] 2. Score Calculator implementieren
  - [ ] 2.1 Create `src/services/score-calculator.ts` with the `calculateScore` pure function
    - Implement `calculateScore(answers: readonly Answer[], mission: Mission): number`
    - Sum points of selected choices by looking up each answer's scenarioId and choiceId
    - Return 0 for unknown scenario IDs or choice IDs (graceful degradation)
    - Export as named function
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 2.2 Write property tests for Score Calculator (`src/services/__tests__/score-calculator.property.test.ts`)
    - **Property 2: Score equals sum of selected choice points**
    - **Property 3: Invalid choice ID contributes zero points**
    - **Validates: Requirements 6.1, 6.2, 6.3**
    - Create fast-check arbitraries: `arbitraryChoice()`, `arbitraryScenario()`, `arbitraryMission()`, `arbitraryAnswer(mission)`
    - Use `numRuns: 100` configuration

- [ ] 3. Persistence Service implementieren
  - [ ] 3.1 Create `src/services/persistence-service.ts` with save/load functions
    - Implement `createDefaultProgress(): PlayerProgress` helper
    - Implement `isValidPlayerProgress(data: unknown): data is PlayerProgress` runtime validator
    - Validate all fields: completedMissions array entries, totalScore number, unlockedAchievements string array, lastPlayedAt string
    - Implement `saveProgress(progress: PlayerProgress): void` using JSON.stringify + localStorage.setItem
    - Implement `loadProgress(): PlayerProgress` using localStorage.getItem + JSON.parse with validation
    - Return default progress on missing data, invalid JSON, or schema mismatch
    - Use storage key `'it-security-game-progress'`
    - Export `saveProgress` and `loadProgress` as named functions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4_

  - [ ]* 3.2 Write property tests for Persistence Service (`src/services/__tests__/persistence-service.property.test.ts`)
    - **Property 1: Serialization Round-Trip**
    - **Property 7: Invalid localStorage data yields default progress**
    - **Validates: Requirements 8.1, 8.2, 8.4, 7.3, 7.4**
    - Create fast-check arbitrary: `arbitraryPlayerProgress()`
    - Mock localStorage for test isolation
    - Use `numRuns: 100` configuration

- [ ] 4. Checkpoint - Build-Verifizierung
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` to verify TypeScript compilation
  - Run `npx vitest --run` to verify all property tests pass

- [ ] 5. Game Reducer und Context Provider implementieren
  - [ ] 5.1 Implement `gameReducer` pure function in `src/hooks/use-game-state.tsx`
    - Import types from `src/types/game.types.ts` and `calculateScore` from score-calculator
    - Export `DEFAULT_GAME_STATE` constant with initial values
    - Implement `gameReducer(state: GameState, action: GameAction): GameState`
    - Handle START_MISSION: reset all fields, set mission from payload, phase to 'briefing', status to 'in-progress'
    - Handle BEGIN_PLAYING: set phase to 'playing'
    - Handle SELECT_CHOICE: append answer, recalculate score via calculateScore
    - Handle NEXT_SCENARIO: increment index or transition to debriefing if last scenario
    - Handle RESET_GAME: return DEFAULT_GAME_STATE
    - Return current state for unknown action types
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ] 5.2 Implement `GameProvider` and `useGameState` hook in `src/hooks/use-game-state.tsx`
    - Create `GameContext` with `createContext<GameContextValue | null>(null)`
    - Implement `GameProvider` component using `useReducer(gameReducer, DEFAULT_GAME_STATE)`
    - Add `useEffect` that calls `saveProgress` when `missionStatus` transitions to 'completed'
    - Implement `useGameState()` hook that throws if used outside provider
    - Export `GameProvider`, `useGameState`, `gameReducer`, and `DEFAULT_GAME_STATE`
    - _Requirements: 5.1, 5.10, 7.5_

  - [ ]* 5.3 Write property tests for Game Reducer (`src/hooks/__tests__/game-reducer.property.test.ts`)
    - **Property 4: START_MISSION resets to mission state**
    - **Property 5: NEXT_SCENARIO advances index or transitions to debriefing**
    - **Property 6: RESET_GAME returns default state**
    - **Property 8: SELECT_CHOICE appends answer and updates score**
    - **Validates: Requirements 5.3, 5.5, 5.6, 5.7, 5.8**
    - Create fast-check arbitraries: `arbitraryGameState(mission)`, reuse mission/scenario/choice generators
    - Use `numRuns: 100` configuration

- [ ] 6. Final Checkpoint - Vollständige Verifizierung
  - Ensure all tests pass, ask the user if questions arise.
  - Run `npm run build` to verify full TypeScript compilation with all modules
  - Run `npx vitest --run` to verify all property tests pass
  - Verify exports are correctly wired (types → services → hooks)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- vitest and fast-check are assumed to be already installed (from ui-components spec)
- The `src/types/` directory may not exist yet and will be created in task 1.1
- All type properties use `readonly` to enforce immutability at compile time

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2"] },
    { "id": 5, "tasks": ["5.3"] }
  ]
}
```
