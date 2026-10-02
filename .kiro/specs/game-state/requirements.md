# Requirements Document

## Einführung

Dieses Dokument spezifiziert die TypeScript-Typen, Zustandsstruktur und Persistenzlogik für den Game State der gamifizierten IT-Security Awareness Anwendung. Der Game State bildet das Fundament für alle spielrelevanten Daten: Missionen, Szenarien, Entscheidungen, Punktestand und Fortschritt.

Die Architektur trennt konsequent Spieldaten (Typen), Spiellogik (Reducer/Services) und UI-Komponenten. Der Zustand wird über React Context + useReducer verwaltet und bei Meilsteinen automatisch im localStorage persistiert.

**Scope:** TypeScript-Typdefinitionen, State Management (Context + Reducer), localStorage-Persistenz
**Nicht im Scope:** UI-Komponenten, Missionsinhalt/Daten, Routing/Navigation, visuelle Darstellung

## Glossar

- **Game_State_Provider**: React Context Provider, der den aktuellen Spielzustand und Dispatch-Funktion an die Komponentenhierarchie bereitstellt
- **Game_Reducer**: Pure Reducer-Funktion, die Game-State-Aktionen verarbeitet und einen neuen Zustandswert zurückgibt
- **Mission**: Datenstruktur, die eine spielbare Lerneinheit beschreibt (z.B. Phishing-Level), bestehend aus Metadaten und einer geordneten Liste von Szenarien
- **Scenario**: Einzelne Entscheidungssituation innerhalb einer Mission mit Kontexttext und Auswahlmöglichkeiten
- **Choice**: Eine Antwortmöglichkeit innerhalb eines Szenarios mit Punktwert und Feedback-Text
- **Player_Progress**: Langfristige Fortschrittsdaten eines Spielers über alle Missionen hinweg (Gesamtpunktzahl, abgeschlossene Missionen, Achievements)
- **Achievement**: Freischaltbare Auszeichnung, die bei Erreichen bestimmter Bedingungen vergeben wird
- **Mission_Phase**: Zustandsphase einer aktiven Mission: briefing (Einführung), playing (Szenarien durchspielen) oder debriefing (Zusammenfassung)
- **Persistence_Service**: Modul für typsichere Serialisierung und Deserialisierung von Spielfortschrittsdaten in den localStorage
- **Score_Calculator**: Pure Funktion zur Berechnung von Punktzahlen basierend auf Spielerentscheidungen

## Requirements

### Requirement 1: Mission-Typdefinition

**User Story:** Als Entwickler möchte ich eine typsichere Mission-Datenstruktur, damit ich neue Missionen datengetrieben hinzufügen kann, ohne die Spiellogik anpassen zu müssen.

#### Acceptance Criteria

1. THE Mission type SHALL define an id property of type string that uniquely identifies each mission
2. THE Mission type SHALL define a title property of type string for the mission display name
3. THE Mission type SHALL define a description property of type string for the mission summary text
4. THE Mission type SHALL define a scenarios property as an ordered array of Scenario objects
5. THE Mission type SHALL define a category property of type string to classify the mission topic (e.g. "phishing", "social-engineering", "passwords")
6. THE Mission type SHALL be exported from the src/types/ directory as a named TypeScript interface

### Requirement 2: Scenario- und Choice-Typdefinitionen

**User Story:** Als Entwickler möchte ich typsichere Strukturen für Szenarien und Auswahlmöglichkeiten, damit die Missionsinhalte validierbar und erweiterbar bleiben.

#### Acceptance Criteria

1. THE Scenario type SHALL define an id property of type string that uniquely identifies each scenario within a mission
2. THE Scenario type SHALL define a context property of type string describing the situation presented to the player
3. THE Scenario type SHALL define a choices property as an array of Choice objects with a minimum length of two
4. THE Scenario type SHALL define a correctChoiceId property of type string referencing the id of the optimal choice
5. THE Choice type SHALL define an id property of type string that uniquely identifies each choice within a scenario
6. THE Choice type SHALL define a text property of type string for the choice display label
7. THE Choice type SHALL define a points property of type number representing the score value awarded when selected
8. THE Choice type SHALL define a feedback property of type string providing an explanation shown after selection
9. THE Choice type SHALL define an isCorrect property of type boolean indicating whether the choice is the optimal answer
10. THE Scenario type and Choice type SHALL be exported from the src/types/ directory as named TypeScript interfaces

### Requirement 3: GameState-Typdefinition

**User Story:** Als Entwickler möchte ich eine zentrale GameState-Struktur, damit der aktuelle Spielzustand innerhalb einer Mission vollständig abgebildet und nachvollziehbar ist.

#### Acceptance Criteria

1. THE GameState type SHALL define a currentMission property of type Mission or null representing the active mission
2. THE GameState type SHALL define a currentScenarioIndex property of type number indicating the active scenario position within the mission
3. THE GameState type SHALL define a score property of type number representing the accumulated points in the current mission
4. THE GameState type SHALL define an answers property as an array of objects recording each scenario id and the selected choice id
5. THE GameState type SHALL define a phase property of type Mission_Phase restricted to the literal values "briefing", "playing", or "debriefing"
6. THE GameState type SHALL define a missionStatus property restricted to the literal values "not-started", "in-progress", or "completed"
7. THE GameState type SHALL be exported from the src/types/ directory as a named TypeScript interface

### Requirement 4: PlayerProgress- und Achievement-Typdefinitionen

**User Story:** Als Entwickler möchte ich den langfristigen Spielerfortschritt und Achievements typsicher modellieren, damit der Fortschritt über mehrere Missionen hinweg nachverfolgt werden kann.

#### Acceptance Criteria

1. THE Player_Progress type SHALL define a completedMissions property as an array of objects containing mission id, score achieved, and completion timestamp
2. THE Player_Progress type SHALL define a totalScore property of type number representing the cumulative score across all missions
3. THE Player_Progress type SHALL define an unlockedAchievements property as an array of achievement id strings
4. THE Player_Progress type SHALL define a lastPlayedAt property of type string in ISO 8601 format representing the last activity timestamp
5. THE Achievement type SHALL define an id property of type string that uniquely identifies each achievement
6. THE Achievement type SHALL define a title property of type string for the achievement display name
7. THE Achievement type SHALL define a description property of type string explaining how to earn the achievement
8. THE Achievement type SHALL define a condition property of type string describing the unlock criteria in a machine-evaluable format
9. THE Achievement type SHALL define an icon property of type string referencing an icon identifier
10. THE Player_Progress type and Achievement type SHALL be exported from the src/types/ directory as named TypeScript interfaces

### Requirement 5: State Management mit Context und Reducer

**User Story:** Als Entwickler möchte ich den Spielzustand über React Context und useReducer verwalten, damit alle Komponenten auf den aktuellen Zustand zugreifen können, ohne externe State-Management-Bibliotheken einzusetzen.

#### Acceptance Criteria

1. THE Game_State_Provider SHALL expose the current GameState and a dispatch function to all descendant components via React Context
2. THE Game_State_Provider SHALL initialize the GameState with a default state where currentMission is null, score is 0, currentScenarioIndex is 0, answers is an empty array, phase is "briefing", and missionStatus is "not-started"
3. WHEN a "START_MISSION" action is dispatched with a Mission payload, THE Game_Reducer SHALL set currentMission to the provided mission, reset score to 0, reset currentScenarioIndex to 0, clear the answers array, set phase to "briefing", and set missionStatus to "in-progress"
4. WHEN a "BEGIN_PLAYING" action is dispatched, THE Game_Reducer SHALL set phase to "playing"
5. WHEN a "SELECT_CHOICE" action is dispatched with a scenario id and choice id, THE Game_Reducer SHALL append the answer to the answers array and add the corresponding choice points to the score
6. WHEN a "NEXT_SCENARIO" action is dispatched, THE Game_Reducer SHALL increment currentScenarioIndex by 1
7. WHEN a "NEXT_SCENARIO" action is dispatched AND the currentScenarioIndex reaches the total number of scenarios, THE Game_Reducer SHALL set phase to "debriefing" and set missionStatus to "completed"
8. WHEN a "RESET_GAME" action is dispatched, THE Game_Reducer SHALL return the default initial state
9. THE Game_Reducer SHALL be implemented as a pure function without side effects
10. THE Game_State_Provider SHALL reside in the src/hooks/ or src/services/ directory

### Requirement 6: Score-Berechnung

**User Story:** Als Entwickler möchte ich eine pure Funktion zur Score-Berechnung, damit die Punktelogik unabhängig testbar und erweiterbar bleibt.

#### Acceptance Criteria

1. THE Score_Calculator SHALL accept an array of answers (scenario id and selected choice id) and the corresponding Mission data and return the total score as a number
2. THE Score_Calculator SHALL calculate the score by summing the points values of all selected choices
3. WHEN a choice id in the answers does not exist in the mission data, THE Score_Calculator SHALL treat the points value as 0 for that answer
4. THE Score_Calculator SHALL be implemented as a pure function without side effects
5. THE Score_Calculator SHALL reside in the src/services/ directory and be exported as a named function

### Requirement 7: localStorage-Persistenz

**User Story:** Als Entwickler möchte ich den Spielerfortschritt typsicher im localStorage speichern und laden, damit der Fortschritt über Browser-Sessions hinweg erhalten bleibt.

#### Acceptance Criteria

1. THE Persistence_Service SHALL provide a saveProgress function that serializes a Player_Progress object to JSON and stores it in localStorage under a defined key
2. THE Persistence_Service SHALL provide a loadProgress function that reads from localStorage and deserializes the JSON string into a Player_Progress object
3. WHEN the loadProgress function encounters invalid or missing data in localStorage, THE Persistence_Service SHALL return a default Player_Progress object with empty completedMissions, totalScore of 0, empty unlockedAchievements, and lastPlayedAt set to the current timestamp
4. WHEN the loadProgress function encounters data that does not match the Player_Progress structure, THE Persistence_Service SHALL discard the invalid data and return the default Player_Progress object
5. WHEN a mission is completed, THE Game_State_Provider SHALL invoke the saveProgress function to persist the updated Player_Progress automatically
6. THE Persistence_Service SHALL validate the loaded data structure against the Player_Progress type at runtime before returning the result
7. THE Persistence_Service SHALL reside in the src/services/ directory and export named functions

### Requirement 8: Serialisierung und Deserialisierung (Round-Trip)

**User Story:** Als Entwickler möchte ich sicherstellen, dass die Serialisierung und Deserialisierung von Spielfortschrittsdaten verlustfrei ist, damit keine Daten beim Speichern oder Laden verloren gehen.

#### Acceptance Criteria

1. FOR ALL valid Player_Progress objects, serializing via saveProgress and then deserializing via loadProgress SHALL produce an equivalent Player_Progress object (round-trip property)
2. THE Persistence_Service SHALL serialize all Player_Progress properties including completedMissions array, totalScore, unlockedAchievements array, and lastPlayedAt string without data loss
3. THE Persistence_Service SHALL use JSON.stringify for serialization and JSON.parse for deserialization
4. WHEN the serialized JSON string is a valid Player_Progress representation, THE Persistence_Service SHALL reconstruct all nested objects and arrays with their original types and values
