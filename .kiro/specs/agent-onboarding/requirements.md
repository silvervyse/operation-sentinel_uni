# Requirements Document

## Introduction

Das Agent-Onboarding ist der erste Spielabschnitt nach Klick auf "Spiel starten" im Hauptmenü. Bevor die erste Mission beginnt, erstellt der Spieler seinen Agenten: Er wird von der Geheimdienstchefin begrüßt, vergibt einen persönlichen Decknamen und wählt einen Charakter aus vier Optionen. Die erhobenen Daten werden in einem zentralen PlayerProfile dauerhaft gespeichert und im weiteren Spielverlauf verwendet (Dialoge, Missionsbildschirme).

Scope: Dieses Dokument deckt den vierstufigen Onboarding-Flow (Begrüßung → Deckname → Charakterauswahl → Bestätigungsdialog), die PlayerProfile-Datenstruktur sowie die Integration in den bestehenden ScreenNavigator ab.

Nicht im Scope: Sprachausgabe, Session-übergreifende Persistenz (wird vorbereitet, aber nicht implementiert), Inhalte des ersten Levels.

## Glossary

- **Onboarding_Flow**: Der vierstufige Prozess (Begrüßung, Deckname, Charakterauswahl, Bestätigungsdialog), der vor der ersten Mission durchlaufen wird
- **Greeting_Screen**: Der Begrüßungsbildschirm mit Hintergrund, Geheimdienstchefin-Darstellung, Willkommensdialog und Typewriter-Effekt
- **Codename_Screen**: Der Bildschirm zur Eingabe des persönlichen Agenten-Decknamens
- **Character_Selection_Screen**: Der Bildschirm zur Auswahl eines von vier Agenten-Charakteren mit eigenem Hintergrundbild
- **Confirmation_Dialog**: Der Bestätigungsdialog nach der Charakterauswahl mit der Frage "Bist du dir sicher?"
- **Player_Profile**: Zentrale Datenstruktur, die Deckname und ausgewählten Charakter des Spielers speichert
- **Director_Character**: Die Geheimdienstchefin (Director Nova), die den Spieler begrüßt und durch das Onboarding führt
- **Agent_Character**: Einer der vier wählbaren Spielercharaktere
- **Codename_Input**: Das Texteingabefeld für den Agenten-Decknamen
- **Character_Carousel**: Die Navigationskomponente zum Durchblättern der vier Charaktere mit benutzerdefinierten Pfeilbildern
- **Dialog_System**: Der Mechanismus zum Laden und Anzeigen mehrseitiger Dialogtexte aus externen Markdown-Dateien, wobei Absätze (getrennt durch Leerzeilen) als einzelne Seiten dargestellt werden
- **Profile_Service**: Modul zur Speicherung und zum Laden des PlayerProfiles im localStorage
- **Typewriter_Effect**: Animationseffekt, bei dem Text zeichenweise erscheint, begleitet von einem Tipp-Sound

## Requirements

### Requirement 1: Onboarding-Flow-Integration

**User Story:** Als neuer Agent möchte ich nach Klick auf "Spiel starten" automatisch durch den Onboarding-Prozess geführt werden, damit ich meinen Agenten erstellen kann, bevor meine erste Mission beginnt.

#### Acceptance Criteria

1. WHEN the player clicks "Neues Spiel" in the Main_Menu and no Player_Profile entry exists in localStorage, THE Onboarding_Flow SHALL be displayed instead of the Mission Briefing
2. WHEN the player clicks "Neues Spiel" in the Main_Menu and a Player_Profile entry containing a non-empty codename and a selected character identifier exists in localStorage, THE Onboarding_Flow SHALL be skipped and the game SHALL proceed directly to the Mission Briefing
3. THE Onboarding_Flow SHALL consist of exactly four sequential steps rendered in this fixed order: Greeting_Screen, Codename_Screen, Character_Selection_Screen, Confirmation_Dialog
4. WHEN the player is on the Codename_Screen, THE System SHALL enable the "Bestätigen" button only after the player has entered a codename between 1 and 20 characters in length
5. WHEN the player is on the Character_Selection_Screen, THE System SHALL display a "Mission starten" button allowing the player to proceed to the Confirmation_Dialog with the currently displayed character
6. WHEN the player confirms in the Confirmation_Dialog, THE System SHALL persist the Player_Profile (codename and selected character identifier) to localStorage and proceed to the Mission Briefing
7. THE Onboarding_Flow SHALL NOT render a "Überspringen" control on any step and SHALL NOT provide any means to advance to the Mission Briefing until the current step's completion condition is satisfied
8. IF the ScreenNavigator determines that the game state has missionStatus 'not-started' and the player has triggered "Neues Spiel" while no valid Player_Profile exists in localStorage, THEN THE ScreenNavigator SHALL render the Onboarding_Flow instead of the Mission Briefing, using the existing missionStatus-based routing logic

### Requirement 2: Begrüßungsbildschirm

**User Story:** Als neuer Rekrut möchte ich von der Geheimdienstchefin persönlich begrüßt werden, damit ich mich wie ein echter Agent fühle, der einer Spezialeinheit beitritt.

#### Acceptance Criteria

1. WHEN the Greeting_Screen is displayed, THE Greeting_Screen SHALL show a full-screen background image representing the Agency Headquarters, covering the entire viewport
2. WHEN the Greeting_Screen is displayed, THE Greeting_Screen SHALL show the Director_Character image in the neutral pose (`Geheimdienstchefin-neutral.png`) positioned on the left side of the screen, occupying no more than 40% of the viewport width
3. WHEN the Greeting_Screen is displayed, THE Greeting_Screen SHALL load the dialog text from the file `public/assets/dialogs/intro.md`, split the content into paragraphs separated by blank lines, and display one paragraph at a time in a dialog box
4. WHEN a paragraph is displayed, THE Greeting_Screen SHALL render the text using a Typewriter_Effect where characters appear one by one in sequence
5. WHILE the Typewriter_Effect is animating text for the current paragraph, THE Greeting_Screen SHALL play the typing sound from `public/assets/audio/typing.mp3` and SHALL disable the "Weiter" button preventing player interaction until the animation completes
6. WHEN the Typewriter_Effect completes for the current paragraph, THE Greeting_Screen SHALL stop the typing sound and SHALL enable the "Weiter" button for player interaction
7. WHEN the dialog box displays a paragraph that is not the final paragraph and the Typewriter_Effect has completed, THE Greeting_Screen SHALL display an enabled "Weiter" button that advances to the next paragraph
8. WHEN the dialog box displays the final paragraph of the intro dialog and the Typewriter_Effect has completed, THE Greeting_Screen SHALL display the "Weiter" button that transitions to the Codename_Screen
9. IF the Agency Headquarters background image fails to load, THEN THE Greeting_Screen SHALL display a solid dark background color using the application's background design token
10. IF the Director_Character image fails to load, THEN THE Greeting_Screen SHALL hide the character image area and display only the dialog text and "Weiter" button without layout shift
11. IF the dialog file fails to load, THEN THE Greeting_Screen SHALL display a fallback hardcoded welcome message

### Requirement 3: Deckname-Eingabe

**User Story:** Als neuer Agent möchte ich meinen persönlichen Decknamen wählen, damit ich während des gesamten Spiels mit diesem Namen angesprochen werde.

#### Acceptance Criteria

1. WHEN the Codename_Screen is displayed, THE Codename_Screen SHALL show the heading "Wie lautet Ihr Agenten-Deckname?"
2. THE Codename_Screen SHALL display a text input field for the codename entry
3. THE Codename_Input SHALL enforce a maximum character length of 20 characters, preventing further input beyond this limit
4. THE Codename_Input SHALL trim leading and trailing whitespace from the entered value before validation and storage
5. WHEN the player submits a value that, after trimming, is empty, THE Codename_Screen SHALL display a validation message indicating that a codename is required
6. WHEN the player enters a valid codename and clicks the "Bestätigen" button, THE Onboarding_Flow SHALL save the trimmed codename and transition to the Character_Selection_Screen
7. WHEN the player enters a valid codename and presses the Enter key, THE Onboarding_Flow SHALL save the trimmed codename and transition to the Character_Selection_Screen
8. THE Codename_Screen SHALL disable the "Bestätigen" button while the input field is empty or contains only whitespace
9. THE Codename_Input SHALL receive focus automatically when the Codename_Screen is displayed
10. THE Codename_Input SHALL accept letters, numbers, hyphens, and underscores, and SHALL reject input containing other special characters or emoji by displaying a validation message indicating the allowed character set

### Requirement 4: Charakterauswahl

**User Story:** Als neuer Agent möchte ich meinen Charakter aus vier Optionen auswählen, damit mein visuelles Erscheinungsbild im Spiel meiner Präferenz entspricht.

#### Acceptance Criteria

1. WHEN the Character_Selection_Screen is displayed, THE Character_Selection_Screen SHALL show the dedicated background image from `/assets/images/Charakterauswahl/Background_character.png` covering the entire viewport
2. WHEN the Character_Selection_Screen is displayed, THE Character_Selection_Screen SHALL show exactly one Agent_Character at a time from a set of four available characters
3. THE Character_Carousel SHALL display a left arrow button using the custom image `/assets/images/Pfeile/Pfeil_links.png` and a right arrow button using the custom image `/assets/images/Pfeile/Pfeil rechts.png` for navigation between characters
4. WHEN the player clicks the right arrow button, THE Character_Carousel SHALL display the next Agent_Character in the sequence within 200 milliseconds
5. WHEN the player clicks the left arrow button, THE Character_Carousel SHALL display the previous Agent_Character in the sequence within 200 milliseconds
6. WHEN the player navigates past the last character using the right arrow, THE Character_Carousel SHALL wrap around to the first character
7. WHEN the player navigates before the first character using the left arrow, THE Character_Carousel SHALL wrap around to the last character
8. THE Character_Selection_Screen SHALL display the character name below the currently visible Agent_Character, matching the name defined in the character data set
9. THE Character_Selection_Screen SHALL display a position indicator showing the current character index and total count (e.g., "2 / 4")
10. THE Character_Selection_Screen SHALL display a "Mission starten" button to proceed to the Confirmation_Dialog
11. WHEN the player clicks "Mission starten", THE Character_Selection_Screen SHALL transition to the Confirmation_Dialog with the currently displayed Agent_Character identifier
12. THE Character_Selection_Screen SHALL pre-select the first character in the data set as the initial display when the screen is loaded
13. WHEN the Character_Selection_Screen has focus, THE Character_Carousel SHALL allow navigation via left arrow key and right arrow key with the same wrap-around behavior as the button navigation

### Requirement 5: Bestätigungsdialog

**User Story:** Als neuer Agent möchte ich meine Auswahl bestätigen, bevor mein Profil gespeichert wird, damit ich bei einer Fehlauswahl noch zurückkehren kann.

#### Acceptance Criteria

1. WHEN the player clicks "Mission starten" on the Character_Selection_Screen, THE Confirmation_Dialog SHALL be displayed with the question "Bist du dir sicher?"
2. THE Confirmation_Dialog SHALL display a confirm button labeled "Speichern und Mission starten" and a cancel button labeled "Zurück"
3. WHEN the player clicks "Speichern und Mission starten" in the Confirmation_Dialog, THE Onboarding_Flow SHALL save the complete Player_Profile (codename and selected character identifier) via the Profile_Service saveProfile function and proceed to the Mission Briefing
4. WHEN the player clicks "Zurück" in the Confirmation_Dialog, THE Onboarding_Flow SHALL return to the Character_Selection_Screen, retaining the previously selected character
5. WHILE the Onboarding_Flow is performing the save-and-transition sequence after confirmation, THE Confirmation_Dialog SHALL disable the "Speichern und Mission starten" button to prevent duplicate submissions
6. IF the localStorage write operation fails during profile persistence, THEN THE Confirmation_Dialog SHALL display an error message indicating that the profile could not be saved, retain the previously entered codename and selected character in memory, and display a "Erneut versuchen" button that re-attempts the save operation without requiring the player to re-enter data

### Requirement 6: PlayerProfile-Datenstruktur

**User Story:** Als Entwickler möchte ich ein zentrales, erweiterbares PlayerProfile haben, damit Spielerdaten konsistent gespeichert und im gesamten Spiel verwendet werden können.

#### Acceptance Criteria

1. THE Player_Profile type SHALL define a codename property of type string containing the player's chosen agent name
2. THE Player_Profile type SHALL define a selectedCharacter property of type AgentCharacterId containing the identifier of the chosen Agent_Character, where AgentCharacterId is defined as the union type 'alpha' | 'beta' | 'charlie' | 'delta'
3. THE Player_Profile type SHALL be designed as a TypeScript interface using optional properties for future extensions (score, reputation, mission progress, inventory, achievements) so that adding new optional properties does not require changes to existing code that consumes the interface
4. THE Player_Profile type SHALL be exported from the src/types/ directory as a named TypeScript interface
5. THE Player_Profile SHALL validate that codename is a non-empty, trimmed string with a minimum length of 1 character and a maximum length of 20 characters after trimming, rejecting strings that consist solely of whitespace
6. THE Player_Profile SHALL validate that selectedCharacter matches exactly one of the defined Agent_Character identifier literals
7. IF codename or selectedCharacter validation fails, THEN THE System SHALL reject the profile creation and provide an indication of which field failed validation and why, without persisting invalid data to localStorage

### Requirement 7: PlayerProfile-Persistenz

**User Story:** Als Spieler möchte ich, dass mein Deckname und Charakter dauerhaft gespeichert werden, damit ich bei jedem Spielstart als mein Agent erkannt werde.

#### Acceptance Criteria

1. THE Profile_Service SHALL provide a saveProfile function that serializes a Player_Profile object to JSON using JSON.stringify and stores it in localStorage under the key "it-security-player-profile"
2. THE Profile_Service SHALL provide a loadProfile function that reads from localStorage under the key "it-security-player-profile" and deserializes the JSON string using JSON.parse into a Player_Profile object
3. WHEN the loadProfile function finds no entry under the storage key in localStorage, THE Profile_Service SHALL return null to indicate that no profile exists
4. WHEN the loadProfile function encounters data that fails JSON parsing OR does not satisfy the Player_Profile validation rules (non-empty codename of at most 20 characters, selectedCharacter matching one of the four defined Agent_Character identifiers), THE Profile_Service SHALL return null and remove the invalid entry from localStorage
5. THE Profile_Service SHALL provide a hasProfile function that returns true if loadProfile would return a non-null Player_Profile and false otherwise
6. FOR ALL valid Player_Profile objects, serializing via saveProfile and then deserializing via loadProfile SHALL produce a Player_Profile object with identical property values verified by deep equality of codename and selectedCharacter
7. IF localStorage is unavailable or a write operation throws an exception, THEN THE Profile_Service saveProfile function SHALL throw the error to the caller without silently failing
8. IF localStorage is unavailable or a read operation throws an exception, THEN THE Profile_Service loadProfile function SHALL return null
9. THE Profile_Service SHALL reside in the src/services/ directory and export named functions

### Requirement 8: Spielstart nach Onboarding

**User Story:** Als Agent möchte ich nach Bestätigung meiner Auswahl direkt meine erste Mission starten, damit der Spielfluss nicht unterbrochen wird.

#### Acceptance Criteria

1. WHEN the player confirms in the Confirmation_Dialog by clicking "Speichern und Mission starten", THE Onboarding_Flow SHALL persist the complete Player_Profile (codename and selectedCharacter) via the Profile_Service saveProfile function
2. WHEN the Player_Profile is successfully persisted, THE Onboarding_Flow SHALL dispatch the START_MISSION action with the first available mission from the mission data source, resulting in missionStatus "in-progress" and phase "briefing"
3. IF the localStorage write operation fails during profile persistence, THEN THE Confirmation_Dialog SHALL display an error message indicating that the profile could not be saved, retain the previously entered codename and selected character in memory, and display a "Erneut versuchen" button that re-attempts the save operation without requiring the player to re-enter data

### Requirement 9: Verwendung des PlayerProfiles im Spiel

**User Story:** Als Agent möchte ich mit meinem Decknamen angesprochen werden und meinen Charakter sehen, damit sich das Spiel persönlich anfühlt.

#### Acceptance Criteria

1. THE Player_Profile SHALL be accessible to all game components through a dedicated React Context that provides the loaded profile object via a custom hook
2. WHEN a dialog text contains the placeholder token `{{codename}}`, THE rendering component SHALL replace that token with the stored codename from the Player_Profile before displaying the text to the player
3. WHEN the application starts and a valid Player_Profile exists in localStorage, THE application SHALL load the Player_Profile into the React Context state and complete this loading before rendering any game screen components
4. IF the application starts and no valid Player_Profile exists in localStorage, THEN THE application SHALL not render game components that depend on the Player_Profile and SHALL redirect the player to the Onboarding_Flow
5. WHEN a game screen that displays the player character is rendered, THE rendering component SHALL display the avatar image corresponding to the selectedCharacter identifier stored in the Player_Profile
6. WHILE the Player_Profile is being loaded from localStorage, THE application SHALL display a loading indicator and SHALL NOT render game components that depend on profile data

### Requirement 10: Audio im Onboarding

**User Story:** Als Spieler möchte ich eine konsistente Audio-Erfahrung während des Onboardings haben, damit die Atmosphäre nahtlos zum Hauptmenü passt.

#### Acceptance Criteria

1. WHILE the Onboarding_Flow is active, THE application SHALL continue playing the main menu background music (`public/assets/audio/mainmenu.mp3`) without interruption or restart
2. THE Onboarding_Flow SHALL NOT introduce any additional background music tracks beyond the main menu music
3. WHILE the Typewriter_Effect is animating text on the Greeting_Screen, THE Greeting_Screen SHALL play the typing sound (`public/assets/audio/typing.mp3`) and SHALL stop the typing sound when the animation completes
4. WHEN the player hovers over any clickable element during the Onboarding_Flow, THE application SHALL play the hover sound (`public/assets/audio/Hover.mp3`) using the existing application-wide sound system
5. WHEN the player clicks any clickable element during the Onboarding_Flow, THE application SHALL play the click sound (`public/assets/audio/Click.mp3`) using the existing application-wide sound system

### Requirement 11: Assets und Ressourcen

**User Story:** Als Entwickler möchte ich klar definiert haben, welche Assets das Onboarding benötigt, damit diese korrekt eingebunden werden können.

#### Acceptance Criteria

1. THE Greeting_Screen SHALL load the background image from the path `public/assets/images/Intro/Background.png`
2. THE Greeting_Screen SHALL load the Director_Character image from the path `public/assets/images/Direktor Nova/Geheimdienstchefin-neutral.png` as a transparent PNG; Director Nova has multiple pose variants in the same folder (neutral, freundlich, lobend, skeptisch) for use in different dialog contexts
3. THE Character_Selection_Screen SHALL load the background image from the path `public/assets/images/Charakterauswahl/Background_character.png`
4. THE Character_Selection_Screen SHALL load Agent_Character images as transparent PNGs from per-character directories under public/assets/images/Charaktere/{CharacterName}/{CharacterName}_charakterauswahl.png, where {CharacterName} is one of Alpha, Beta, Charlie, or Delta; additional pose images will be added to each character directory in the future
5. THE Character_Carousel SHALL render the left arrow button using the custom image from `/assets/images/Pfeile/Pfeil_links.png` and the right arrow button using the custom image from `/assets/images/Pfeile/Pfeil rechts.png`
6. THE Character_Selection_Screen SHALL resolve Agent_Character images by combining a basePath (public/assets/images/Charaktere/{CharacterName}/) with a pose-specific filename convention, so that future poses can be loaded by appending the pose filename to the same basePath
7. IF any Agent_Character image fails to load, THEN THE Character_Selection_Screen SHALL display a solid-colored placeholder shape in place of the image and continue to display the character name, keeping carousel navigation functional
8. IF the Director_Character image or the background image fails to load, THEN THE respective screen SHALL apply the fallback behavior defined in Requirement 2 (solid dark background or hidden character area)
9. THE Codename_Input SHALL reuse the existing styled input component from the application's shared component library or apply the same Tailwind CSS classes used by other text inputs in the application
10. THE dialog text for the Greeting_Screen SHALL be loaded from `public/assets/dialogs/intro.md` at runtime, enabling content changes without code modifications
11. THE Greeting_Screen SHALL load the typing sound from `public/assets/audio/typing.mp3` for use with the Typewriter_Effect

### Requirement 12: Komponentenarchitektur

**User Story:** Als Entwickler möchte ich eine klare, wartbare Komponentenstruktur für das Onboarding haben, damit der Code leicht erweiterbar und testbar bleibt.

#### Acceptance Criteria

1. THE Onboarding_Flow SHALL be implemented as a feature module within src/features/onboarding/ containing an index file that exports the root OnboardingFlow component and all step components required by this module
2. THE Onboarding_Flow SHALL consist of separate component files for each step: GreetingScreen, CodenameScreen, CharacterSelectionScreen, and ConfirmationDialog, each exported as a named React component from its own .tsx file
3. THE Onboarding_Flow SHALL manage the current step internally using local component state (useState or useReducer within the OnboardingFlow component) and SHALL NOT dispatch any GameAction types or read from the GameContext for step transitions between GreetingScreen, CodenameScreen, CharacterSelectionScreen, and ConfirmationDialog
4. THE Profile_Service SHALL be implemented as a standalone service in src/services/profile-service.ts that exposes functions to save and load a Player_Profile via localStorage, and SHALL NOT import from src/features/onboarding/
5. THE Player_Profile type definition SHALL reside in src/types/ alongside the existing game type definitions and SHALL be importable by both the Profile_Service and the Onboarding_Flow without circular dependencies
6. WHEN the onboarding is not yet completed (no Player_Profile exists in localStorage), THE ScreenNavigator SHALL render the Onboarding_Flow component instead of the MainMenu
7. WHEN the Onboarding_Flow completes its final step (ConfirmationDialog with confirmed save), THE Onboarding_Flow SHALL invoke the Profile_Service to persist the Player_Profile and then transition control back to the ScreenNavigator which SHALL render the MainMenu
8. THE ScreenNavigator SHALL integrate the Onboarding_Flow without modifying the existing GameAction union type, using only an addition of an onboarding-related value to the MissionStatus type or a separate localStorage check to determine whether to display the onboarding
