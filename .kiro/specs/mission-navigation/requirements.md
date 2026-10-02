# Requirements Document

## Introduction

Dieses Dokument spezifiziert das Screen-Navigations- und Missionsablaufsystem für die gamifizierte IT-Security Awareness Anwendung. Das System steuert den vollständigen Spielfluss vom Startbildschirm über Missionsbriefing und aktives Spielen einzelner Szenarien bis zum Debriefing mit Ergebnisübersicht.

Die Navigation basiert auf dem bestehenden GameState (Phase und Missionsstatus) und verzichtet bewusst auf URL-basiertes Routing (react-router). Stattdessen wird der angezeigte Screen direkt aus dem aktuellen Spielzustand abgeleitet. Die Screens nutzen die AppShell (Header, MainContent, StatusBar) als Rahmen und die definierten UI-Komponenten (Button, Card, Badge, ProgressBar) für konsistente Darstellung.

**Scope:** Screen-Navigation, StartScreen, MissionBriefing, MissionPlaying, MissionDebriefing, Übergangslogik
**Nicht im Scope:** URL-Routing (react-router), gleichzeitige Mehrfach-Missionen, Missionsinhalte/Daten-Erstellung, Audio/visuelle Effekte, Einstellungs-Screen

## Glossary

- **Screen_Navigator**: Logik-Komponente, die basierend auf GameState-Werten (phase, missionStatus) den aktuell anzuzeigenden Screen bestimmt
- **Start_Screen**: Screen zur Missionsauswahl mit Spielerfortschritt-Anzeige und Möglichkeit eine Mission zu starten
- **Mission_Briefing_Screen**: Screen zur Einführung einer ausgewählten Mission mit Titel, Beschreibung und Szenarioanzahl im Agenten-Dossier-Stil
- **Mission_Playing_Screen**: Screen zur Durchführung einer Mission, in dem der Spieler Szenarien durchläuft und Entscheidungen trifft
- **Mission_Debriefing_Screen**: Screen zur Ergebnisdarstellung nach Abschluss einer Mission mit Score, Szenario-Zusammenfassung und Achievements
- **Game_State**: Zentraler Spielzustand bereitgestellt durch den Game_State_Provider mit Phase, Score, aktuellem Szenario und Antworten
- **Mission_Phase**: Aktuelle Phase einer Mission: "briefing", "playing" oder "debriefing"
- **Mission_Status**: Status einer Mission: "not-started", "in-progress" oder "completed"
- **AppShell_Component**: Übergeordnete Layout-Komponente mit Header, MainContent und optionaler StatusBar
- **Scenario_Feedback**: Visuelles Feedback nach einer Entscheidung, das anzeigt ob die gewählte Antwort optimal oder suboptimal war

## Requirements

### Requirement 1: Screen-Navigation basierend auf GameState

**User Story:** Als Entwickler möchte ich eine zentrale Navigationslogik, die den angezeigten Screen aus dem GameState ableitet, damit die Screen-Wechsel konsistent und vorhersagbar funktionieren ohne separaten Routing-State.

#### Acceptance Criteria

1. WHEN the Game_State missionStatus is "not-started", THE Screen_Navigator SHALL display the Start_Screen
2. WHEN the Game_State phase is "briefing" AND missionStatus is "in-progress", THE Screen_Navigator SHALL display the Mission_Briefing_Screen
3. WHEN the Game_State phase is "playing" AND missionStatus is "in-progress", THE Screen_Navigator SHALL display the Mission_Playing_Screen
4. WHEN the Game_State phase is "debriefing" AND missionStatus is "completed", THE Screen_Navigator SHALL display the Mission_Debriefing_Screen
5. THE Screen_Navigator SHALL derive the active screen exclusively from Game_State values without maintaining separate navigation state
6. THE Screen_Navigator SHALL render all screens within the AppShell_Component using the MainContent area
7. WHEN the Game_State phase is "playing", THE Screen_Navigator SHALL pass showStatusBar as true to the AppShell_Component to display mission progress

### Requirement 2: StartScreen mit Missionsauswahl

**User Story:** Als Spieler möchte ich auf dem Startbildschirm verfügbare Missionen sehen und eine auswählen können, damit ich gezielt eine Lerneinheit starten kann.

#### Acceptance Criteria

1. THE Start_Screen SHALL display a list of available missions as Card_Component elements showing each mission title and description
2. THE Start_Screen SHALL display the player total score from Player_Progress data
3. THE Start_Screen SHALL display the number of completed missions from Player_Progress data
4. WHEN the player clicks a mission Card_Component, THE Start_Screen SHALL dispatch a "START_MISSION" action with the selected Mission data as payload
5. THE Start_Screen SHALL indicate previously completed missions with a Badge_Component showing a "completed" status
6. THE Start_Screen SHALL reside in the src/features/menu/ directory as a TypeScript React component
7. THE Start_Screen SHALL use the useGameState hook to access Game_State and dispatch function

### Requirement 3: MissionBriefing-Screen

**User Story:** Als Spieler möchte ich vor Beginn einer Mission ein Briefing im Agenten-Stil lesen, damit ich den Kontext und das Ziel der Mission verstehe bevor ich Entscheidungen treffe.

#### Acceptance Criteria

1. THE Mission_Briefing_Screen SHALL display the current mission title in a prominent heading element
2. THE Mission_Briefing_Screen SHALL display the current mission description text as a briefing paragraph
3. THE Mission_Briefing_Screen SHALL display the total number of scenarios contained in the current mission
4. THE Mission_Briefing_Screen SHALL present the briefing content within a Card_Component styled with a "CLASSIFIED" header text to create an agent dossier aesthetic
5. THE Mission_Briefing_Screen SHALL render a Button_Component labeled "Mission beginnen" that dispatches a "BEGIN_PLAYING" action when clicked
6. THE Mission_Briefing_Screen SHALL use the useGameState hook to read the currentMission data from Game_State
7. THE Mission_Briefing_Screen SHALL reside in the src/features/game/ directory as a TypeScript React component

### Requirement 4: MissionPlaying-Screen — Szenario-Darstellung

**User Story:** Als Spieler möchte ich das aktuelle Szenario mit Kontext und Auswahlmöglichkeiten sehen, damit ich eine informierte Entscheidung treffen kann.

#### Acceptance Criteria

1. THE Mission_Playing_Screen SHALL display the context text of the current scenario based on the currentScenarioIndex from Game_State
2. THE Mission_Playing_Screen SHALL render all available choices for the current scenario as clickable Card_Component or Button_Component elements
3. THE Mission_Playing_Screen SHALL display each choice text as the label on the respective interactive element
4. THE Mission_Playing_Screen SHALL display a progress indicator showing the current scenario number relative to the total scenario count (e.g. "Szenario 2 von 5")
5. THE Mission_Playing_Screen SHALL pass the current progress percentage to the StatusBar_Component via AppShell props
6. THE Mission_Playing_Screen SHALL use the useGameState hook to access currentMission, currentScenarioIndex, and dispatch from Game_State
7. THE Mission_Playing_Screen SHALL reside in the src/features/game/ directory as a TypeScript React component

### Requirement 5: MissionPlaying-Screen — Entscheidung und Feedback

**User Story:** Als Spieler möchte ich nach meiner Entscheidung sofortiges Feedback erhalten, damit ich verstehe ob meine Wahl richtig war und daraus lerne.

#### Acceptance Criteria

1. WHEN the player selects a choice, THE Mission_Playing_Screen SHALL dispatch a "SELECT_CHOICE" action with the current scenario id and selected choice id
2. WHEN a choice has been selected, THE Mission_Playing_Screen SHALL display the feedback text of the selected choice
3. WHEN a choice has been selected AND the choice isCorrect property is true, THE Mission_Playing_Screen SHALL apply a visual success indicator (accent-secondary color styling) to the Scenario_Feedback area
4. WHEN a choice has been selected AND the choice isCorrect property is false, THE Mission_Playing_Screen SHALL apply a visual warning indicator (warning or danger color styling) to the Scenario_Feedback area
5. WHEN a choice has been selected, THE Mission_Playing_Screen SHALL disable all other choice elements to prevent multiple selections per scenario
6. WHEN a choice has been selected, THE Mission_Playing_Screen SHALL display a Button_Component labeled "Weiter" to advance to the next scenario
7. WHEN the player clicks the "Weiter" button, THE Mission_Playing_Screen SHALL dispatch a "NEXT_SCENARIO" action

### Requirement 6: MissionDebriefing-Screen

**User Story:** Als Spieler möchte ich nach Abschluss einer Mission eine Zusammenfassung meiner Ergebnisse sehen, damit ich meinen Lernerfolg einschätzen und mich verbessern kann.

#### Acceptance Criteria

1. THE Mission_Debriefing_Screen SHALL display the achieved score and the maximum possible score for the completed mission
2. THE Mission_Debriefing_Screen SHALL display a per-scenario summary list showing for each scenario whether the player chose the correct or an incorrect answer
3. THE Mission_Debriefing_Screen SHALL indicate correct answers with a Badge_Component using the "success" variant
4. THE Mission_Debriefing_Screen SHALL indicate incorrect answers with a Badge_Component using the "danger" variant
5. WHEN achievements have been unlocked during the mission, THE Mission_Debriefing_Screen SHALL display the unlocked achievement titles
6. THE Mission_Debriefing_Screen SHALL render a Button_Component labeled "Zurück zum Start" that dispatches a "RESET_GAME" action when clicked
7. THE Mission_Debriefing_Screen SHALL use the useGameState hook to access score, answers, and currentMission from Game_State
8. THE Mission_Debriefing_Screen SHALL reside in the src/features/results/ directory as a TypeScript React component

### Requirement 7: StatusBar-Integration während Playing-Phase

**User Story:** Als Spieler möchte ich während des aktiven Spielens meinen Fortschritt in der Statusleiste sehen, damit ich jederzeit weiß wie weit ich in der Mission bin.

#### Acceptance Criteria

1. WHEN the Game_State phase is "playing", THE Screen_Navigator SHALL configure the AppShell_Component to show the StatusBar_Component
2. THE Screen_Navigator SHALL pass the current progress percentage calculated as (currentScenarioIndex / total scenarios) multiplied by 100 to the StatusBar_Component
3. THE Screen_Navigator SHALL pass a descriptive label in the format "Szenario X von Y" to the StatusBar_Component
4. WHEN the Game_State phase is not "playing", THE Screen_Navigator SHALL configure the AppShell_Component to hide the StatusBar_Component

### Requirement 8: Screen-Komponenten-Standards

**User Story:** Als Entwickler möchte ich, dass alle Screen-Komponenten einheitlichen Qualitätsstandards folgen, damit die Codebasis konsistent und wartbar bleibt.

#### Acceptance Criteria

1. THE Start_Screen, Mission_Briefing_Screen, Mission_Playing_Screen, and Mission_Debriefing_Screen SHALL each be implemented as React functional components using TypeScript
2. THE Start_Screen, Mission_Briefing_Screen, Mission_Playing_Screen, and Mission_Debriefing_Screen SHALL each export a named Props interface
3. THE Start_Screen, Mission_Briefing_Screen, Mission_Playing_Screen, and Mission_Debriefing_Screen SHALL exclusively use Tailwind utility classes for styling without separate CSS files
4. THE Start_Screen, Mission_Briefing_Screen, Mission_Playing_Screen, and Mission_Debriefing_Screen SHALL use UI components from the ui-components specification (Button_Component, Card_Component, Badge_Component, ProgressBar_Component) for consistent visual appearance
5. THE Start_Screen, Mission_Briefing_Screen, Mission_Playing_Screen, and Mission_Debriefing_Screen SHALL access Game_State exclusively through the useGameState hook
6. THE Screen_Navigator SHALL function correctly with sample mock mission data containing at least two scenarios for development and testing purposes
