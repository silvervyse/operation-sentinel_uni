# Implementation Plan: Main Menu

## Overview

Das Hauptmenü wird als neuer Feature-Screen implementiert, der den bestehenden `StartScreen` ersetzt. Die Implementierung folgt der im Design definierten Komponentenarchitektur: `MainMenu.tsx` als Container, `TitleAnimation.tsx` für den Glitch-Effekt, `LockedMenuItem.tsx` für gesperrte Menüpunkte und `useAudio.ts` als wiederverwendbarer Audio-Hook. Die Integration erfolgt über den bestehenden `ScreenNavigator`.

## Tasks

- [x] 1. Audio-Hook und Menü-Datenmodell erstellen
  - [x] 1.1 Erstelle den `useAudio`-Hook unter `src/hooks/useAudio.ts`
    - Implementiere das `UseAudioOptions`-Interface und `UseAudioReturn`-Interface gemäß Design
    - Erstelle HTMLAudioElement-Instanzen für Musik, Hover- und Click-Sound
    - Musik: `loop=true`, `volume=0.3` (Standard)
    - UI-Sounds: `volume=0.2` (Standard)
    - Implementiere `startMusic()` mit Autoplay-Fallback (Promise-Rejection fangen, Event-Listener auf erste User-Interaktion)
    - Implementiere `stopMusic(fadeMs)` mit Intervall-basiertem Volume-Fade über `fadeMs` (default 500ms)
    - Implementiere `playHover()`: Stoppt vorherigen Hover-Sound, setzt `currentTime=0`, spielt neu ab
    - Implementiere `playClick()`: Spielt Click-Sound ab
    - Implementiere `playLockedClick()`: Spielt Locked-Click-Sound (`clicknotpossible.mp3`) ab für gesperrte Menüpunkte
    - Implementiere Cleanup bei Unmount via `useEffect` Return
    - Fehlerbehandlung: `onerror` auf Audio-Elementen schluckt Fehler still (kein UI-Fehler)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 11.3, 11.4, 11.5, 11.6, 11.8_

  - [x] 1.2 Erstelle die Menü-Konfigurationsdaten unter `src/features/menu/menu-config.ts`
    - Definiere `MenuItemConfig`-Interface mit `id`, `label`, `type`, `icon`, `hintMessage`
    - Erstelle `MENU_ITEMS`-Array mit den 3 Einträgen: "Neues Spiel" (active, Play-Icon), "Missionen" (locked, Lock-Icon), "Agentenakte" (locked, Lock-Icon)
    - Hint-Messages: max. 120 Zeichen, im Stil der Spielwelt formuliert
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2_

- [x] 2. TitleAnimation-Komponente implementieren
  - [x] 2.1 Erstelle `TitleAnimation.tsx` unter `src/features/menu/TitleAnimation.tsx`
    - Implementiere `TitleAnimationProps`-Interface: `title`, `subtitle`, `duration?`, `onComplete?`, `skipAnimation?`
    - SessionStorage-Key: `'main-menu-title-animation-played'`
    - Prüfe beim Mount ob Animation bereits gespielt hat (sessionStorage Flag)
    - Implementiere Glitch/Scan-Effekt via CSS keyframes (max. 3 Sekunden Dauer)
    - Nach Abschluss: Setze sessionStorage-Flag auf `"true"`, rufe `onComplete` auf
    - Klick-Handler: Springt innerhalb 300ms zum finalen statischen Zustand
    - Titel "OPERATION SENTINEL" als styled Text mit futuristischer Display-Font (Orbitron)
    - Untertitel "Cyber Intelligence Unit" darunter
    - Fallback bei sessionStorage-Fehler: Animation spielt bei jedem Besuch (try/catch)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 10.5, 10.6_

  - [ ]* 2.2 Schreibe Unit-Tests für TitleAnimation
    - Test: Animation spielt bei erstem Besuch (sessionStorage leer)
    - Test: Animation wird übersprungen bei Revisit (sessionStorage Flag vorhanden)
    - Test: Klick während Animation springt zum finalen Zustand
    - Test: `onComplete` Callback wird aufgerufen nach Animationsende
    - Test: `skipAnimation=true` zeigt direkt statischen Zustand
    - _Requirements: 3.1, 3.4, 3.5, 3.6_

- [x] 3. LockedMenuItem-Komponente implementieren
  - [x] 3.1 Erstelle `LockedMenuItem.tsx` unter `src/features/menu/LockedMenuItem.tsx`
    - Implementiere `LockedMenuItemProps`-Interface: `label`, `onClick`, `onHover?`
    - Rendere Lock-Icon (lucide-react) links vom Label-Text
    - Styling: `opacity-50`, kein Cyan-Glow, `cursor: not-allowed`
    - Accessibility: `aria-disabled="true"`, `tabIndex={0}`
    - Keyboard: Enter/Space löst KEINE Navigation aus (nur `onClick` für Hint)
    - Hover-State: leichte Helligkeitszunahme (brightness), kein Glow
    - Hover-Event ruft `onHover` Callback auf (für Sound)
    - _Requirements: 4.3, 4.4, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 3.2 Schreibe Unit-Tests für LockedMenuItem
    - Test: Rendert Lock-Icon und Label korrekt
    - Test: `aria-disabled="true"` ist gesetzt
    - Test: Klick ruft `onClick` auf (ohne Navigation)
    - Test: Element ist per Tastatur fokussierbar
    - Test: Enter/Space löst keine Navigation aus
    - _Requirements: 5.2, 5.3, 5.5, 5.6_

- [x] 4. Checkpoint - Basiskomponenten verifizieren
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. MainMenu-Komponente implementieren
  - [x] 5.1 Erstelle `MainMenu.tsx` unter `src/features/menu/MainMenu.tsx`
    - Implementiere als Haupt-Screen-Komponente (ersetzt StartScreen)
    - Hintergrundbild aus `/assets/images/Mainmenu.png` als Vollbild-Hintergrund (`object-fit: cover`)
    - Background-Overlay: dunkler semi-transparenter Gradient (opacity 0.4–0.7)
    - Fallback bei Bild-Ladefehler: dunkle Hintergrundfarbe (`bg-bg-primary`)
    - Logo aus `/assets/images/Logo.png` oben zentriert, max-width 30–50% viewport-width
    - Logo alt-Text mit Spielname, `onError` versteckt Element
    - Integriere TitleAnimation-Komponente mit "OPERATION SENTINEL" und "Cyber Intelligence Unit"
    - Integriere bestehenden Button (variant="primary", size="lg") für "Neues Spiel" mit Play-Icon
    - Integriere LockedMenuItem für "Missionen" und "Agentenakte"
    - Hint-Logik: Lokaler State `visibleHint`/`hintTarget`, Auto-Dismiss nach 4s, Klick außerhalb dismissed, nur 1 Hint gleichzeitig
    - Version-Display: Versionsnummer unten links, font-size ≤12px, reduzierte Opacity
    - Verwende `useAudio` für Hintergrundmusik und UI-Sounds
    - Musik startet bei Mount, Fade-Out bei Unmount (500ms)
    - Hover/Click-Sounds auf allen Menüpunkten
    - "Neues Spiel" dispatcht `START_MISSION` via `useGameState`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 4.1, 4.2, 4.5, 4.6, 4.7, 4.8, 4.9, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 10.1, 10.3, 10.4, 11.1, 11.2, 11.6, 11.7_

  - [x] 5.2 Implementiere responsives Layout in MainMenu
    - Vertikale Anordnung: Logo → Titel → Subtitle → Menüpunkte → Version
    - Mindestabstand 24px zwischen Element-Gruppen
    - Content zentriert, max-width 800px
    - Desktop-first: min. unterstützte Breite 1024px
    - Unter 1024px: relative Units für Font-Sizes und Spacing, min. Klickziel 44x44px
    - Viewport-Höhe ≥768px: Vollbild ohne Scrolling
    - Viewport-Höhe <700px: vertikales Scrolling aktivieren
    - Kein horizontaler Scrollbar bei jeder unterstützten Auflösung
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. Integration in ScreenNavigator
  - [x] 6.1 Aktualisiere `ScreenNavigator.tsx` um MainMenu statt StartScreen zu rendern
    - Importiere `MainMenu` statt `StartScreen`
    - Rendere `MainMenu` wenn `missionStatus === 'not-started'`
    - Behalte Fallback-Verhalten bei
    - _Requirements: 10.1, 10.2_

  - [ ]* 6.2 Schreibe Integrationstest für ScreenNavigator → MainMenu
    - Test: ScreenNavigator rendert MainMenu bei `missionStatus='not-started'`
    - Test: "Neues Spiel" Klick führt zu Missions-Briefing (State-Wechsel)
    - _Requirements: 10.1, 10.2_

- [x] 7. Checkpoint - Feature vollständig integriert
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. MainMenu Unit-Tests und Property-Tests
  - [ ]* 8.1 Schreibe Unit-Tests für MainMenu
    - Test: Rendert alle 3 Menüpunkte in korrekter Reihenfolge
    - Test: "Neues Spiel" nutzt Button mit variant="primary"
    - Test: Locked Items haben `aria-disabled="true"`
    - Test: Locked Items zeigen Lock-Icon
    - Test: Klick auf "Neues Spiel" dispatcht Action
    - Test: Klick auf Locked Item zeigt Hint
    - Test: Klick außerhalb dismissed Hint
    - Test: Hint auto-dismiss nach 4s (fake timers)
    - Test: Bild-Fehler zeigt Fallback-Hintergrund
    - Test: Logo-Fehler versteckt Element
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 1.5, 11.6, 11.7_

  - [ ]* 8.2 Schreibe Property-Test: Hint-Nachricht überschreitet nie 120 Zeichen
    - **Property 1: Hint message length constraint**
    - **Validates: Requirements 4.6**
    - Generiere zufällige `MenuItemConfig`-Objekte mit `type='locked'` und `hintMessage`
    - Verifiziere: `hintMessage.length <= 120` für alle generierten Konfigurationen
    - Minimum 100 Iterationen

  - [ ]* 8.3 Schreibe Property-Test: Maximal ein Hint gleichzeitig sichtbar
    - **Property 2: Single hint visibility invariant**
    - **Validates: Requirements 4.9**
    - Generiere zufällige Sequenzen von Klicks auf locked Items
    - Nach jeder Sequenz: Verifiziere dass höchstens 1 Hint-Element im DOM sichtbar ist
    - Minimum 100 Iterationen

- [x] 9. Finaler Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Die bestehende `StartScreen.tsx` wird durch die Integration in Task 6.1 funktional ersetzt, kann aber als Referenz beibehalten werden
- Orbitron-Font muss über Google Fonts oder lokale Datei eingebunden werden (in Task 2.1)
- Asset-Pfade sind relativ zu `public/` (`/assets/images/...`, `/assets/audio/...`)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2"] },
    { "id": 3, "tasks": ["5.1"] },
    { "id": 4, "tasks": ["5.2"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["6.2", "8.1"] },
    { "id": 7, "tasks": ["8.2", "8.3"] }
  ]
}
```
