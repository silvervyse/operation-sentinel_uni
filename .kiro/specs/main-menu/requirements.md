# Requirements Document

## Introduction

Das Hauptmenü (Main Menu) ist der Einstiegspunkt des Cyber Security Agent Game. Es soll den Spieler sofort in die Atmosphäre einer geheimen Cyber-Agenten-Organisation eintauchen lassen und Vorfreude auf die erste Mission wecken. Das Menü ist bewusst schlank gehalten und bildet das Fundament für alle späteren Spielbereiche.

Scope: Dieses Dokument deckt ausschließlich das Hauptmenü ab. Nicht enthalten sind: Intro-Sequenz, Agentenerstellung, Missionsübersicht, Spielstart-Logik, Story, Missionen oder Fortschrittssysteme.

## Glossary

- **Main_Menu**: Die Hauptmenü-Ansicht, die als erster Screen nach App-Start angezeigt wird
- **Title_Animation**: Eine kurze Intro-Animation (Glitch/Scan/Flicker-Effekt) für den Spieltitel, max. 2–3 Sekunden
- **Menu_Item**: Ein interaktives Element im Hauptmenü, das eine Aktion oder Navigation auslöst
- **Locked_Menu_Item**: Ein Menüelement, das gesperrt ist und dem Spieler einen Hinweis anzeigt statt zu navigieren
- **Audio_Manager**: Die Logik zur Steuerung von Hintergrundmusik und UI-Sounds im Hauptmenü
- **Game_State**: Der zentrale Anwendungszustand, der über React Context verwaltet wird
- **Background_Overlay**: Ein halbtransparentes dunkles Overlay über dem Hintergrundbild zur Verbesserung der Lesbarkeit
- **Version_Display**: Die kleine Versionsnummer-Anzeige im unteren linken Bereich

## Requirements

### Requirement 1: Hintergrundbild und Overlay

**User Story:** Als Spieler möchte ich beim Öffnen des Hauptmenüs sofort eine immersive Cyber-Agenten-Atmosphäre sehen, damit ich mich in die Spielwelt hineingezogen fühle.

#### Acceptance Criteria

1. WHEN the Main_Menu is rendered, THE Main_Menu SHALL display the background image from `assets/images/Mainmenu.png` as a full-screen background covering the entire viewport
2. THE Main_Menu SHALL render a Background_Overlay on top of the background image with a z-index stacking order of background image, then overlay, then UI content, ensuring that overlaid text achieves a minimum contrast ratio of 4.5:1 against the combined background
3. THE Background_Overlay SHALL use a dark semi-transparent gradient with an opacity between 0.4 and 0.7 so that the background illustration remains partially visible through the overlay
4. THE Main_Menu SHALL maintain the 16:9 aspect ratio of the background image using CSS object-fit cover behavior
5. IF the background image fails to load, THEN THE Main_Menu SHALL display a solid dark background color consistent with the application color theme so that the menu remains usable

### Requirement 2: Logo-Darstellung

**User Story:** Als Spieler möchte ich das offizielle Spiellogo prominent im Hauptmenü sehen, damit ich das Spiel sofort wiedererkenne.

#### Acceptance Criteria

1. WHEN the Main_Menu is rendered, THE Main_Menu SHALL display the game logo from `assets/images/Logo.png` as the first element at the top of the layout, centered horizontally
2. THE Main_Menu SHALL render the logo with a maximum width between 30% and 50% of the viewport width, preserving the original aspect ratio without distortion
3. THE Main_Menu SHALL provide an alt-text attribute on the logo image containing the game name so that screen readers can identify the logo

### Requirement 3: Spieltitel mit Intro-Animation

**User Story:** Als Spieler möchte ich beim erstmaligen Öffnen des Hauptmenüs eine hochwertige Titel-Animation sehen, damit das Spielerlebnis von Anfang an beeindruckt.

#### Acceptance Criteria

1. WHEN the Main_Menu is displayed for the first time in a browser session, THE Title_Animation SHALL play a digital intro effect (glitch, screen flicker, scan, or power-on effect) on the game title
2. THE Title_Animation SHALL complete within a maximum duration of 3 seconds
3. WHEN the Title_Animation completes, THE Main_Menu SHALL display the title in a static state with no active animations, full opacity, and no visual movement
4. THE Title_Animation SHALL play only once per browser session, where a session is defined by the lifetime of the browser's sessionStorage (cleared when the tab or browser window is closed)
5. WHEN the player navigates away from the Main_Menu and returns within the same browser session, THE Main_Menu SHALL display the title directly in its static state without replaying the Title_Animation
6. IF the player clicks or taps anywhere on the screen while the Title_Animation is playing, THEN THE Title_Animation SHALL skip to the final static state within 300 milliseconds
7. THE Main_Menu SHALL render the game title "OPERATION SENTINEL" as styled text, not as an image
8. THE Main_Menu SHALL render the subtitle "Cyber Intelligence Unit" below the game title as styled text
9. THE Main_Menu SHALL use a futuristic display font (such as Orbitron) for the game title to convey a high-tech aesthetic

### Requirement 4: Menüstruktur und Navigation

**User Story:** Als Spieler möchte ich ein klar strukturiertes Menü mit wenigen Optionen sehen, damit ich sofort weiß, wie ich das Spiel starten kann.

#### Acceptance Criteria

1. THE Main_Menu SHALL display exactly three Menu_Items in the following order: "Neues Spiel", "Missionen", "Agentenakte"
2. THE Main_Menu SHALL render "Neues Spiel" as a clickable primary button with a play icon, visually distinguished from the locked items through the primary button style (cyan accent and glow)
3. THE Main_Menu SHALL render "Missionen" as a Locked_Menu_Item with a lock icon and visually muted styling indicating a non-interactive state
4. THE Main_Menu SHALL render "Agentenakte" as a Locked_Menu_Item with a lock icon and visually muted styling indicating a non-interactive state
5. WHEN the player clicks "Neues Spiel", THE Main_Menu SHALL navigate the player to the game view (agent creation or mission briefing screen)
6. WHEN the player clicks a Locked_Menu_Item, THE Main_Menu SHALL display a hint message of no more than 120 characters near the clicked item, explaining that an agent must be created first
7. WHEN the player clicks outside the hint message area, THE Main_Menu SHALL dismiss the currently visible hint message
8. IF a hint message is visible and no dismissal interaction occurs, THEN THE Main_Menu SHALL automatically dismiss the hint message after 4 seconds
9. IF a hint message is already visible and the player clicks another Locked_Menu_Item, THEN THE Main_Menu SHALL replace the existing hint message with the new one (only one hint message visible at a time)

### Requirement 5: Gesperrte Menüelemente

**User Story:** Als Spieler möchte ich visuell erkennen können, welche Menüpunkte noch gesperrt sind, damit ich den Spielfortschritt nachvollziehen kann.

#### Acceptance Criteria

1. THE Locked_Menu_Item SHALL be visually distinct from active Menu_Items by rendering with an opacity of 0.5 and without the cyan border or glow effects used on active Menu_Items
2. THE Locked_Menu_Item SHALL display a lock icon (from lucide-react) to the left of the label text
3. WHEN the player clicks a Locked_Menu_Item, THE Locked_Menu_Item SHALL not trigger navigation and SHALL display the cursor as "not-allowed"
4. WHEN the player hovers over a Locked_Menu_Item, THE Locked_Menu_Item SHALL display a hover state limited to a slight brightness increase without glow effects, distinguishable from the active button hover
5. THE Locked_Menu_Item SHALL convey its disabled state by setting `aria-disabled="true"` on the button element so that screen readers announce the element as disabled
6. THE Locked_Menu_Item SHALL remain focusable via keyboard navigation so that screen reader users can discover the element, but SHALL not trigger navigation on Enter or Space key press

### Requirement 6: Hintergrundmusik

**User Story:** Als Spieler möchte ich beim Betreten des Hauptmenüs atmosphärische Hintergrundmusik hören, damit die Immersion sofort beginnt.

#### Acceptance Criteria

1. WHEN the Main_Menu is entered, THE Audio_Manager SHALL start playing the background music from `assets/audio/mainmenu.mp3`
2. WHILE the Main_Menu is active, THE Audio_Manager SHALL loop the background music continuously without audible gaps or clicks at the loop boundary
3. THE Audio_Manager SHALL play the background music at a default volume of 0.3 on a normalized scale of 0.0 (silent) to 1.0 (maximum)
4. WHEN the player navigates away from the Main_Menu, THE Audio_Manager SHALL fade out the background music over a duration of 500 milliseconds and then stop playback
5. IF the browser blocks autoplay, THEN THE Audio_Manager SHALL attempt playback on the first user interaction (click, tap, or key press) with the page

### Requirement 7: UI-Sounds

**User Story:** Als Spieler möchte ich akustisches Feedback bei der Menü-Interaktion erhalten, damit das Interface sich lebendig und responsiv anfühlt.

#### Acceptance Criteria

1. WHEN the player hovers over a Menu_Item or Locked_Menu_Item, THE Audio_Manager SHALL play the hover sound from `assets/audio/Hover.mp3`
2. WHEN the player clicks an active Menu_Item, THE Audio_Manager SHALL play the click sound from `assets/audio/Click.mp3`
3. WHEN the player clicks a Locked_Menu_Item, THE Audio_Manager SHALL play the locked-click sound from `assets/audio/clicknotpossible.mp3` instead of the normal click sound
4. THE Audio_Manager SHALL play UI sounds at a volume between 0.1 and 0.3 on a normalized 0.0–1.0 scale
5. WHEN the player hovers over a new Menu_Item while a hover sound is already playing, THE Audio_Manager SHALL stop the previous hover sound and play a new instance from the beginning

### Requirement 8: Layout und visuelle Hierarchie

**User Story:** Als Spieler möchte ich ein aufgeräumtes, großzügiges Layout sehen, damit das Menü wie eine professionelle Agentur-Software wirkt.

#### Acceptance Criteria

1. THE Main_Menu SHALL arrange elements in the following vertical order from top to bottom: Logo, Game Title, Subtitle, Menu Items, Version Display
2. THE Main_Menu SHALL apply a minimum spacing of 24px between each major element group (Logo, Title/Subtitle, Menu Items, Version Display) to create a visually spacious layout
3. THE Main_Menu SHALL center all content elements horizontally within the viewport and constrain the content area to a maximum width of 800px
4. THE Version_Display SHALL render the current application version number positioned fixed to the bottom-left corner of the viewport, using a font size no larger than 12px and reduced opacity compared to primary text
5. WHILE the viewport height is 768px or greater, THE Main_Menu SHALL fill the entire viewport height without requiring scrolling
6. THE Main_Menu SHALL not exceed the viewport width, preventing horizontal scrolling at any supported resolution

### Requirement 9: Responsive Verhalten

**User Story:** Als Spieler möchte ich das Hauptmenü auch in kleineren Browserfenstern korrekt angezeigt bekommen, damit das Layout nicht zerbricht.

#### Acceptance Criteria

1. WHILE the browser window is resized to any width of 1024px or greater, THE Main_Menu SHALL display all elements (Logo, Game Title, Subtitle, Menu Items, Version Display) fully visible without any element overlapping another or being clipped by the viewport edges
2. IF the viewport height is less than 700px, THEN THE Main_Menu SHALL enable vertical scrolling so that all elements remain reachable by the player
3. THE Main_Menu SHALL be designed Desktop-first with a minimum supported viewport width of 1024px, at which all elements remain fully interactive and no horizontal scrollbar appears
4. WHILE the viewport width is below 1024px, THE Main_Menu SHALL reduce font sizes and spacing using relative units so that no horizontal scrollbar appears and all Menu_Items remain clickable with a minimum target size of 44x44 pixels
5. WHILE the viewport width is at or above 1024px, THE Main_Menu SHALL NOT display a horizontal scrollbar

### Requirement 10: Komponentenarchitektur

**User Story:** Als Entwickler möchte ich eine klare Komponentenstruktur für das Hauptmenü haben, damit der Code wartbar und erweiterbar bleibt.

#### Acceptance Criteria

1. THE Main_Menu SHALL be implemented as a dedicated screen component at `src/features/menu/MainMenu.tsx`, replacing the current StartScreen as the top-level menu screen rendered by the ScreenNavigator
2. THE Main_Menu SHALL integrate into the existing ScreenNavigator routing by being rendered when `missionStatus` equals `'not-started'`, extending or reusing the existing Game_State values without introducing a separate routing mechanism
3. THE Main_Menu SHALL use the existing Button component from `src/components/Button.tsx` with variant `primary` for the "Neues Spiel" action
4. THE Main_Menu SHALL separate audio playback logic (background music loop control and UI sound-effect triggers) into a reusable hook or service under `src/hooks/` or `src/services/` that can be imported independently of the Main_Menu component
5. THE Main_Menu SHALL separate the Title_Animation into its own component file within `src/features/menu/` that accepts configuration props and renders independently of Main_Menu internal state
6. THE Main_Menu SHALL store a boolean flag in sessionStorage indicating whether the title animation has already played, and IF the flag is present and true, THEN THE Main_Menu SHALL skip the title animation on subsequent renders within the same browser session

### Requirement 11: Assets und Ressourcen

**User Story:** Als Entwickler möchte ich klar definiert haben, welche Assets das Hauptmenü verwendet, damit diese korrekt eingebunden werden.

#### Acceptance Criteria

1. THE Main_Menu SHALL load the background image from the path `assets/images/Mainmenu.png` resolved relative to the `public/` directory
2. THE Main_Menu SHALL load the logo image from the path `assets/images/Logo.png` resolved relative to the `public/` directory
3. THE Audio_Manager SHALL load the background music from the path `assets/audio/mainmenu.mp3` resolved relative to the `public/` directory
4. THE Audio_Manager SHALL load the click sound from the path `assets/audio/Click.mp3` resolved relative to the `public/` directory
5. THE Audio_Manager SHALL load the hover sound from the path `assets/audio/Hover.mp3` resolved relative to the `public/` directory
6. THE Audio_Manager SHALL load the locked-click sound from the path `assets/audio/clicknotpossible.mp3` resolved relative to the `public/` directory
6. IF the background image fails to load, THEN THE Main_Menu SHALL display the dark background color from the application theme instead, without showing a broken-image icon
7. IF the logo image fails to load, THEN THE Main_Menu SHALL hide the logo element and preserve the remaining layout without leaving visible empty space or a broken-image icon
8. IF an audio asset fails to load, THEN THE Audio_Manager SHALL skip playback of that sound and continue normal operation without displaying an error to the player
