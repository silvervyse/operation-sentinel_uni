# Implementation Plan: Mission Navigation

## Overview

Implementierung des Screen-Navigations- und Missionsablaufsystems. Der ScreenNavigator leitet den aktiven Screen deterministisch aus dem GameState ab. Alle Screens (StartScreen, MissionBriefing, MissionPlaying, MissionDebriefing) werden als React-Funktionskomponenten mit TypeScript und Tailwind CSS erstellt. Mock-Missionsdaten treiben die Entwicklung.

## Tasks

- [ ] 1. Mock-Missionsdaten erstellen
  - [ ] 1.1 Create `src/data/missions.ts` with phishing mission data
    - Define the `MISSIONS` array with one phishing mission containing 3 scenarios
    - Each scenario has context, choices with points/feedback/isCorrect, and correctChoiceId
    - Import `Mission` type from `src/types/game.types`
    - Export as `readonly` constant for immutability
    - _Requirements: 8.6_

- [ ] 2. ScreenNavigator implementieren
  - [ ] 2.1 Create `src/features/game/ScreenNavigator.tsx`
    - Implement the deterministic mapping: (missionStatus, phase) → Screen
    - Use `useGameState` hook for state access
    - Calculate showStatusBar, progressPercent, and progressLabel
    - Render selected screen inside `AppShell` component with statusBarProps
    - Add `data-testid="screen-navigator"` for testing
    - Fallback to StartScreen for invalid state combinations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 7.1, 7.2, 7.3, 7.4_

- [ ] 3. StartScreen ersetzen
  - [ ] 3.1 Replace `src/features/menu/StartScreen.tsx` with mission selection screen
    - Remove old props-based implementation
    - Use `useGameState` hook for state and dispatch
    - Import `MISSIONS` from `src/data/missions.ts`
    - Display player total score and completed missions count
    - Render each mission as a `Card` component with title and description
    - Dispatch `START_MISSION` action with mission payload on card click
    - Show `Badge` with "success" variant for completed missions
    - Add `data-testid="start-screen"` for testing
    - Export named `StartScreenProps` interface
    - Use Tailwind utility classes exclusively
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 4. MissionBriefing erstellen
  - [ ] 4.1 Create `src/features/game/MissionBriefing.tsx`
    - Use `useGameState` hook to read `currentMission`
    - Render "CLASSIFIED" header text in agent-dossier styled Card
    - Display mission title in prominent heading, description as paragraph
    - Show scenario count via Badge
    - Render "Mission beginnen" Button that dispatches `BEGIN_PLAYING`
    - Add `data-testid="mission-briefing"` for testing
    - Export named `MissionBriefingProps` interface
    - Guard: return null if currentMission is null
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 5. MissionPlaying erstellen
  - [ ] 5.1 Create `src/features/game/MissionPlaying.tsx` — scenario display and choices
    - Use `useGameState` hook for currentMission, currentScenarioIndex, dispatch
    - Display scenario context text from current scenario
    - Render all choices as clickable elements with choice text
    - Display progress indicator "Szenario X von Y"
    - Add `data-testid="mission-playing"` for testing
    - Export named `MissionPlayingProps` interface
    - Guard: return null if currentMission or scenario is null
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.7, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 5.2 Add choice selection, feedback, and navigation logic to MissionPlaying
    - Manage local `selectedChoiceId` state via useState
    - On choice click: dispatch `SELECT_CHOICE` with scenarioId and choiceId
    - After selection: display feedback text of selected choice
    - Apply accent-secondary styling for correct, warning/danger for incorrect
    - Disable all other choices after selection
    - Show "Weiter" Button that dispatches `NEXT_SCENARIO` and resets selectedChoiceId
    - Prevent double-click via guard on selectedChoiceId
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 6. MissionDebriefing erstellen
  - [ ] 6.1 Create `src/features/results/MissionDebriefing.tsx`
    - Use `useGameState` hook to access score, answers, currentMission
    - Display achieved score and maximum possible score
    - Render per-scenario summary list with Badge "success"/"danger" variants
    - Show unlocked achievement titles if any
    - Render "Zurück zum Start" Button that dispatches `RESET_GAME`
    - Add `data-testid="mission-debriefing"` for testing
    - Export named `MissionDebriefingProps` interface
    - Guard: return null if currentMission is null
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7. Checkpoint - Alle Screens funktional
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. App-Integration und Aufräumen
  - [ ] 8.1 Refactor `src/App.tsx` to use GameProvider + ScreenNavigator
    - Remove old state-based navigation (useState, handleStart, handleBack)
    - Remove imports of old StartScreen and LevelPlaceholder
    - Wrap application in `GameProvider`
    - Render `ScreenNavigator` as the single child
    - Remove unused `App.css` import if no longer needed
    - _Requirements: 1.6, 8.5_

  - [ ] 8.2 Delete `src/features/menu/LevelPlaceholder.tsx`
    - Remove the file as it is replaced by the mission flow screens
    - _Requirements: N/A (cleanup)_

- [ ] 9. Property-Based Tests
  - [ ]* 9.1 Write property test for ScreenNavigator deterministic mapping
    - **Property 1: Screen-State Deterministic Mapping**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
    - Create `src/features/game/__tests__/ScreenNavigator.test.tsx`
    - Generate arbitrary valid GameStates via fast-check
    - Assert correct screen rendered for each (missionStatus, phase) combination

  - [ ]* 9.2 Write property test for StatusBar visibility
    - **Property 2: StatusBar Visibility Tied to Playing Phase**
    - **Validates: Requirements 1.7, 7.1, 7.4**
    - Assert showStatusBar is true only when phase === "playing"

  - [ ]* 9.3 Write property test for progress percentage calculation
    - **Property 3: Progress Percentage Calculation**
    - **Validates: Requirements 4.5, 7.2**
    - For any mission with N scenarios and index I, progress = (I / N) * 100

  - [ ]* 9.4 Write property test for progress label format
    - **Property 4: Progress Label Format**
    - **Validates: Requirements 4.4, 7.3**
    - Assert label is exactly `"Szenario ${I + 1} von ${N}"`

  - [ ]* 9.5 Write property test for StartScreen rendering all missions
    - **Property 5: StartScreen Renders All Missions**
    - **Validates: Requirements 2.1**
    - Create `src/features/menu/__tests__/StartScreen.test.tsx`
    - For any non-empty mission array, all titles and descriptions are rendered

  - [ ]* 9.6 Write property test for completed mission badge
    - **Property 6: Completed Mission Badge Matches Progress**
    - **Validates: Requirements 2.5**
    - Badge rendered only for missions in completedMissions list

  - [ ]* 9.7 Write property test for MissionBriefing data display
    - **Property 7: MissionBriefing Displays Mission Data**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Create `src/features/game/__tests__/MissionBriefing.test.tsx`
    - For any mission, title, description, and scenario count are rendered

  - [ ]* 9.8 Write property test for MissionPlaying choice rendering
    - **Property 8: MissionPlaying Renders Current Scenario Choices**
    - **Validates: Requirements 4.1, 4.2, 4.3**
    - Create `src/features/game/__tests__/MissionPlaying.test.tsx`
    - For any scenario with K choices, exactly K interactive elements are rendered

  - [ ]* 9.9 Write property test for feedback styling
    - **Property 9: Feedback Styling Matches Correctness**
    - **Validates: Requirements 5.3, 5.4**
    - Correct choice shows accent-secondary, incorrect shows warning/danger

  - [ ]* 9.10 Write property test for debriefing badges
    - **Property 10: Debriefing Per-Scenario Badge Matches Correctness**
    - **Validates: Requirements 6.2, 6.3, 6.4**
    - Create `src/features/results/__tests__/MissionDebriefing.test.tsx`
    - Each scenario badge variant matches answer correctness

- [ ] 10. Final checkpoint - Build-Verifikation
  - Ensure all tests pass and project builds without errors, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All screens use `data-testid` attributes for reliable test targeting
- The implementation language is TypeScript (as specified in the design)
- No new dependencies needed — vitest, fast-check, and @testing-library/react are already available

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["5.2", "6.1"] },
    { "id": 4, "tasks": ["8.1", "8.2"] },
    { "id": 5, "tasks": ["9.1", "9.2", "9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10"] }
  ]
}
```
