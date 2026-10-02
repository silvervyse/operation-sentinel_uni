# Implementation Plan: Agent Onboarding

## Overview

Das Agent-Onboarding wird als neues Feature-Modul unter `src/features/onboarding/` implementiert. Der vierstufige Flow (Begrüßung → Deckname → Charakterauswahl → Bestätigungsdialog) wird lokal verwaltet und in den bestehenden `ScreenNavigator` integriert. Ein neuer `ProfileService` unter `src/services/profile-service.ts` übernimmt Validierung und localStorage-Persistenz. Ein `DialogService` unter `src/services/dialog-service.ts` lädt mehrseitige Dialog-Texte aus externen Markdown-Dateien. Ein `PlayerProfileProvider`-Context stellt das Profil app-weit bereit und wird in `App.tsx` über dem `GameProvider` eingehängt.

## Tasks

- [x] 1. PlayerProfile-Typen und Charakter-Datensatz erstellen
  - [x] 1.1 Erstelle `PlayerProfile`-Type unter `src/types/player-profile.types.ts`
    - Definiere `AgentCharacterId` als Union-Type: `'alpha' | 'beta' | 'charlie' | 'delta'`
    - Definiere `PlayerProfile`-Interface mit `readonly codename: string` und `readonly selectedCharacter: AgentCharacterId`
    - Füge optionale Erweiterungsfelder als Kommentar hinzu (score, reputation, inventory, achievements)
    - Exportiere beide Typen als named exports
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 1.2 Erstelle Charakter-Datensatz unter `src/features/onboarding/characters.ts`
    - Definiere `AgentCharacter`-Interface mit `id: AgentCharacterId`, `name: string`, `basePath: string`
    - Definiere `CharacterPose`-Type: `'charakterauswahl' | 'dialog' | 'mission'`
    - Implementiere `getCharacterImagePath(id: AgentCharacterId, pose: CharacterPose): string` Helper-Funktion
    - Erstelle `AGENT_CHARACTERS` als readonly Array mit 4 Einträgen (alpha, beta, charlie, delta) mit basePath `/assets/images/Charaktere/{Name}`
    - Exportiere Interface, Type, Helper-Funktion und Konstante
    - _Requirements: 4.1, 4.12, 9.5, 11.4, 11.6_

  - [x] 1.3 Erstelle Director Nova Pose-System unter `src/features/onboarding/director.ts`
    - Definiere `DirectorPose` Type: `'neutral' | 'freundlich' | 'lobend' | 'skeptisch'`
    - Implementiere `getDirectorImagePath(pose: DirectorPose): string` Helper (beachte Namenskonvention: neutral mit Bindestrich, andere mit Unterstrich)
    - Exportiere `GREETING_POSE: DirectorPose = 'neutral'` Konstante (neutrale Pose für Erstbegrüßung)
    - _Requirements: 2.2, 11.2_

- [x] 2. ProfileService implementieren
  - [x] 2.1 Erstelle `src/services/profile-service.ts` mit Validierungslogik
    - Implementiere `CODENAME_PATTERN` Regex: `/^[a-zA-Z0-9äöüÄÖÜß\-_]+$/`
    - Implementiere `VALID_CHARACTERS` Array: `['alpha', 'beta', 'charlie', 'delta']` und `MAX_CODENAME_LENGTH = 20`
    - Implementiere `ValidationResult`-Interface mit `valid: boolean` und `errors`-Array
    - Implementiere `validateProfile(profile: unknown): ValidationResult` Funktion
    - Validierung prüft: codename non-empty nach Trim, max 20 Zeichen, nur erlaubte Zeichen, selectedCharacter ist gültiger Identifier
    - Implementiere `validateCodename(codename: string): ValidationResult` als separate Hilfsfunktion für UI-Validierung
    - _Requirements: 6.5, 6.6, 6.7_

  - [x] 2.2 Implementiere Persistenz-Funktionen in `src/services/profile-service.ts`
    - localStorage-Key: `"it-security-player-profile"`
    - Implementiere `saveProfile(profile: PlayerProfile): void` – validiert, serialisiert mit JSON.stringify, wirft bei localStorage-Fehler
    - Implementiere `loadProfile(): PlayerProfile | null` – liest aus localStorage, parsed JSON, validiert, gibt null bei Fehler zurück, entfernt ungültige Einträge
    - Implementiere `hasProfile(): boolean` – gibt true zurück wenn `loadProfile()` non-null
    - Error-Handling: Write-Fehler werden geworfen (Req 7.7), Read-Fehler geben null zurück (Req 7.8)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.7, 7.8, 7.9_

  - [ ]* 2.3 Schreibe Property-Test: Codename-Validierung (Property 1)
    - **Property 1: Codename-Validierung akzeptiert genau gültige Eingaben**
    - **Validates: Requirements 1.4, 3.3, 3.4, 3.5, 3.8, 3.10**
    - Generiere beliebige Strings (0–50 Zeichen, mit/ohne Sonderzeichen/Whitespace)
    - Verifiziere: Validierung akzeptiert genau dann, wenn getrimmt 1–20 Zeichen UND nur erlaubte Zeichen

  - [ ]* 2.4 Schreibe Property-Test: PlayerProfile-Validierung (Property 4)
    - **Property 4: PlayerProfile-Validierung**
    - **Validates: Requirements 6.5, 6.6, 6.7**
    - Generiere beliebige Objekte mit zufälligen String-Feldern
    - Verifiziere: Akzeptiert genau dann wenn codename gültig UND selectedCharacter einer der 4 Identifier ist

  - [ ]* 2.5 Schreibe Property-Test: Persistenz Round-Trip (Property 5)
    - **Property 5: Profile-Persistenz Round-Trip**
    - **Validates: Requirements 7.1, 7.2, 7.6**
    - Generiere zufällige gültige PlayerProfiles
    - Verifiziere: `saveProfile(p)` gefolgt von `loadProfile()` ergibt identisches Profil (deep equality)

  - [ ]* 2.6 Schreibe Property-Test: Ungültige Daten werden abgelehnt (Property 6)
    - **Property 6: Ungültige Daten werden abgelehnt**
    - **Validates: Requirements 7.4**
    - Generiere ungültige JSON-Strings und Objekte, schreibe direkt in localStorage
    - Verifiziere: `loadProfile()` gibt null zurück und entfernt den Eintrag

  - [ ]* 2.7 Schreibe Property-Test: hasProfile-Konsistenz (Property 7)
    - **Property 7: hasProfile-Konsistenz**
    - **Validates: Requirements 7.5**
    - Generiere zufällige localStorage-Zustände (leer, gültig, ungültig)
    - Verifiziere: `hasProfile()` gibt true genau dann wenn `loadProfile()` non-null ist

- [x] 3. Checkpoint - ProfileService und Typen verifizieren
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. DialogService implementieren
  - [x] 4.1 Erstelle `src/services/dialog-service.ts`
    - Implementiere `loadDialog(path: string): Promise<string[]>` Funktion
    - Fetch-basiert: lädt Markdown-Datei zur Laufzeit via `fetch(path)`
    - Splittet Markdown-Inhalt an Leerzeilen (`\n\s*\n`) in Absätze
    - Trimmt jeden Absatz und filtert leere Absätze
    - Wirft Error bei fehlgeschlagenem Fetch (`response.ok === false`)
    - _Requirements: 2.3, 11.10_

  - [ ]* 4.2 Schreibe Property-Test: Dialog-Splitting (Property 9)
    - **Property 9: Dialog-Splitting produziert nicht-leere Absätze**
    - **Validates: Requirements 2.3**
    - Generiere zufällige mehrzeilige Texte mit variierenden Leerzeilen-Separatoren
    - Verifiziere: Jeder Eintrag im Ergebnis-Array ist ein nicht-leerer, getrimmter String

- [x] 5. PlayerProfileProvider und Hook implementieren
  - [x] 5.1 Erstelle `src/hooks/use-player-profile.tsx` mit Context und Hook
    - Definiere `PlayerProfileContextValue`-Interface: `profile: PlayerProfile | null`, `isLoading: boolean`, `setProfile: (profile: PlayerProfile) => void`
    - Erstelle React Context mit `createContext`
    - Implementiere `PlayerProfileProvider`-Komponente: lädt Profil bei Mount via `loadProfile()`, setzt `isLoading` State
    - Implementiere `usePlayerProfile()`-Hook mit Context-Konsumierung und Error bei fehlendem Provider
    - `setProfile()` aktualisiert den Context-State nach erfolgreichem Save
    - _Requirements: 9.1, 9.3, 9.4, 9.6_

- [x] 6. TypewriterText und GreetingScreen implementieren
  - [x] 6.1 Erstelle `src/features/onboarding/TypewriterText.tsx`
    - Props: `text: string`, `speed?: number` (default 30–50ms), `soundSrc?: string` (default: `/assets/audio/typing.mp3`), `onComplete: () => void`
    - Rendert `text` Zeichen für Zeichen mit konfigurierbarer Geschwindigkeit
    - Erstellt HTML `Audio`-Element für `soundSrc` im Loop-Modus
    - Startet Audio-Playback bei Animationsbeginn (loop für kontinuierliches Tippen)
    - Stoppt Audio und ruft `onComplete()` auf, wenn alle Zeichen angezeigt
    - Cleanup: Stoppt Sound und Timer bei Unmount oder Text-Wechsel
    - Graceful Degradation: Wenn Audio-Datei nicht geladen werden kann, läuft Animation ohne Sound weiter
    - _Requirements: 2.4, 2.5, 2.6, 10.3, 11.11_

  - [x] 6.2 Erstelle `src/features/onboarding/GreetingScreen.tsx`
    - Props: `onContinue: () => void`
    - Fullscreen-Hintergrundbild: `/assets/images/Intro/Background.png` mit `object-fit: cover`
    - Director Nova-Bild via `getDirectorImagePath(GREETING_POSE)` → verwendet `'neutral'` Pose (`/assets/images/Direktor Nova/Geheimdienstchefin-neutral.png`), links, max 40% Viewport-Breite
    - Dialog-Text wird bei Mount via `loadDialog('/assets/dialogs/intro.md')` geladen
    - Mehrseitiger Dialog: zeigt einen Absatz pro Seite via `TypewriterText`-Komponente (Typewriter-Effekt)
    - **"Weiter"-Button ist disabled während TypewriterText animiert** (`isTyping === true`)
    - Nach Abschluss der Animation: Button wird enabled, Sound stoppt
    - "Weiter" navigiert zum nächsten Absatz (TypewriterText startet neu)
    - Beim letzten Absatz: "Weiter" ruft `onContinue()` auf → Transition zu CodenameScreen
    - Fallback: hardcodierte Willkommensnachricht bei Dialog-Ladefehler
    - Fallback: Solid dark background bei Hintergrundbild-Fehler
    - Fallback: Charakter-Bereich versteckt bei Director-Bild-Fehler, kein Layout-Shift
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 11.1, 11.2, 11.10, 11.11_

- [x] 7. CodenameScreen implementieren
  - [x] 7.1 Erstelle `src/features/onboarding/CodenameScreen.tsx`
    - Props: `onSubmit: (codename: string) => void`, `initialValue?: string`
    - Heading: "Wie lautet Ihr Agenten-Deckname?"
    - Text-Input mit `maxLength=20`, Auto-Focus bei Mount
    - Validierung mit `validateCodename()` aus ProfileService: erlaubte Zeichen `[a-zA-Z0-9äöüÄÖÜß\-_]`
    - Trimming vor Validierung und Übermittlung
    - "Bestätigen"-Button disabled bei leerem/ungültigem Input
    - Enter-Taste als Alternative zur Button-Bestätigung
    - Validierungsnachrichten bei: leerem Input, ungültigen Zeichen
    - Input-Styling konsistent mit bestehenden Tailwind-Klassen im Projekt
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 11.9_

- [x] 8. CharacterSelectionScreen und Carousel implementieren
  - [x] 8.1 Erstelle `src/features/onboarding/CharacterCarousel.tsx`
    - Props: `characters: AgentCharacter[]`, `currentIndex: number`, `onNavigate: (direction: 'prev' | 'next') => void`
    - Rendert aktuellen Charakter (Bild + Name)
    - **Benutzerdefinierte Pfeilbilder** (NICHT lucide-react ChevronLeft/ChevronRight):
      - Links: `<img src="/assets/images/Pfeile/Pfeil_links.png" alt="Vorheriger Charakter" />`
      - Rechts: `<img src="/assets/images/Pfeile/Pfeil rechts.png" alt="Nächster Charakter" />` (Leerzeichen im Dateinamen beachten!)
    - Pfeil-Buttons als klickbare Container (`<button>`) um die `<img>`-Elemente
    - **Fallback bei Pfeilbild-Ladefehler**: Text-Pfeile (← / →) anstelle der Bilder anzeigen
    - Keyboard-Event-Handling: ArrowLeft/ArrowRight
    - Charakter-Bild-Fallback: farbiger Platzhalter bei Ladefehler, Carousel bleibt funktional
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 11.5, 11.7_

  - [x] 8.2 Erstelle `src/features/onboarding/CharacterSelectionScreen.tsx`
    - Props: `onSelect: (characterId: AgentCharacterId) => void`, `initialCharacter?: AgentCharacterId`
    - **Eigenes Hintergrundbild**: `/assets/images/Charakterauswahl/Background_character.png` (fullscreen, `object-fit: cover`)
    - Integriert CharacterCarousel mit `AGENT_CHARACTERS`
    - Wrap-Around Navigation: `(currentIndex + delta + 4) % 4`
    - Position-Indikator: "2 / 4"
    - "Mission starten"-Button → ruft `onSelect(currentCharacterId)` auf (kein direktes Speichern in dieser Komponente)
    - Pre-selects ersten Charakter (Index 0) bei Mount, oder `initialCharacter` bei Rückkehr aus ConfirmationDialog
    - Keyboard-Navigation via ArrowLeft/ArrowRight mit Wrap-Around
    - Fallback: Solid dark background bei Hintergrundbild-Ladefehler
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 4.13, 11.3_

  - [ ]* 8.3 Schreibe Property-Test: Carousel-Navigation mit Wrap-Around (Property 2)
    - **Property 2: Carousel-Navigation mit Wrap-Around**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.13**
    - Generiere beliebigen Index (0–3) × Richtung (left/right) × Anzahl Navigationen
    - Verifiziere: Ergebnis-Index = `(currentIndex + delta + 4) % 4`

  - [ ]* 8.4 Schreibe Property-Test: Charakter-Metadaten-Konsistenz (Property 3)
    - **Property 3: Charakter-Metadaten-Konsistenz**
    - **Validates: Requirements 4.8, 4.9**
    - Generiere beliebigen Index (0–3)
    - Verifiziere: Name = `AGENT_CHARACTERS[index].name`, Position = `"${index + 1} / 4"`

- [x] 9. ConfirmationDialog implementieren
  - [x] 9.1 Erstelle `src/features/onboarding/ConfirmationDialog.tsx`
    - Props: `codename: string`, `selectedCharacter: AgentCharacterId`, `onConfirm: () => void`, `onCancel: () => void`, `isSaving?: boolean`, `saveError?: string | null`, `onRetry?: () => void`
    - Zeigt die Frage: "Bist du dir sicher?"
    - **"Speichern und Mission starten"** (Primary Button): Löst `onConfirm()` aus → Save + Transition
    - **"Zurück"** (Secondary Button): Löst `onCancel()` aus → Rückkehr zu CharacterSelectionScreen
    - Während Save (`isSaving === true`): "Speichern und Mission starten"-Button ist disabled
    - Bei Save-Fehler (`saveError`): Fehlermeldung wird angezeigt + "Erneut versuchen"-Button (`onRetry`)
    - Eingegebene Daten bleiben im OnboardingFlow-State erhalten (kein Re-Enter nötig)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 10. Checkpoint - Einzelkomponenten verifizieren
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. OnboardingFlow-Container und Wiring
  - [x] 11.1 Erstelle `src/features/onboarding/OnboardingFlow.tsx`
    - Props: `onComplete: () => void`
    - Lokaler State: `currentStep: OnboardingStep` (4 Steps), `codename: string`, `selectedCharacter: AgentCharacterId | null`
    - `OnboardingStep` = `'greeting' | 'codename' | 'character-selection' | 'confirmation'`
    - **Step-Transitions (4 Steps)**: greeting → codename → character-selection → confirmation (kein Skip, kein Zurück außer Confirmation→CharacterSelection)
    - Rendert GreetingScreen, CodenameScreen, CharacterSelectionScreen oder ConfirmationDialog basierend auf `currentStep`
    - CharacterSelectionScreen: `onSelect(characterId)` speichert `selectedCharacter` im State und transitioniert zu `'confirmation'`
    - ConfirmationDialog: `onConfirm` → ruft `saveProfile({codename, selectedCharacter})`, aktualisiert PlayerProfileProvider via `setProfile()`, ruft `onComplete()`
    - ConfirmationDialog: `onCancel` → setzt `currentStep` zurück auf `'character-selection'` (behält `selectedCharacter` bei)
    - Error-Handling: Bei Save-Fehler zeigt ConfirmationDialog den Error-State mit "Erneut versuchen"-Button, behält Daten in Memory
    - Button-Disable: "Speichern und Mission starten" disabled während Save-Operation (`isSaving` State)
    - _Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2_

  - [x] 11.2 Erstelle `src/features/onboarding/index.ts` als Feature-Export
    - Re-exportiere `OnboardingFlow` als Default und Named Export
    - Re-exportiere Step-Komponenten für Testing-Zwecke
    - _Requirements: 12.1_

- [x] 12. Integration in App und ScreenNavigator
  - [x] 12.1 Integriere `PlayerProfileProvider` in `src/App.tsx`
    - Importiere `PlayerProfileProvider` aus `src/hooks/use-player-profile`
    - Wrapp den `GameProvider` mit `PlayerProfileProvider` (Profile-Context ist outer)
    - _Requirements: 9.1, 9.3_

  - [x] 12.2 Aktualisiere `src/features/game/ScreenNavigator.tsx` für Onboarding-Integration
    - Importiere `OnboardingFlow` und `usePlayerProfile`
    - Vor dem MainMenu-Rendering: prüfe `hasProfile()` via `usePlayerProfile()`
    - Wenn `isLoading`: zeige Loading-Indicator
    - Wenn kein Profil existiert und `missionStatus === 'not-started'`: rendere `OnboardingFlow`
    - `onComplete`-Callback: aktualisiert Context, ScreenNavigator rendert MainMenu
    - Bestehende Routing-Logik (in-progress, completed) bleibt unverändert
    - _Requirements: 1.1, 1.2, 1.8, 9.4, 9.6, 12.6, 12.7, 12.8_

- [x] 13. Template-Ersetzung für Codename
  - [x] 13.1 Erstelle Utility-Funktion `replaceCodename` in `src/utils/template-utils.ts`
    - Implementiere: ersetzt alle `{{codename}}`-Vorkommen durch den tatsächlichen Codename-Wert
    - Keine anderen Template-Tokens werden verändert
    - Exportiere als named export
    - _Requirements: 9.2_

  - [ ]* 13.2 Schreibe Property-Test: Codename-Template-Ersetzung (Property 8)
    - **Property 8: Codename-Template-Ersetzung**
    - **Validates: Requirements 9.2**
    - Generiere zufällige Strings mit/ohne `{{codename}}`-Placeholder × zufällige Codenames
    - Verifiziere: Alle `{{codename}}`-Vorkommen ersetzt, kein anderer Inhalt verändert

- [x] 14. Finaler Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Der `ProfileService` importiert NICHT aus `src/features/onboarding/` (keine zirkulären Abhängigkeiten)
- Die bestehende `GameAction` Union-Type wird NICHT verändert – Onboarding nutzt nur localStorage-Check
- Asset-Pfade sind relativ zu `public/` (`/assets/images/Charaktere/{Name}/...` für Charaktere, `/assets/images/Intro/...` für Hintergrund)
- Charakter-Bilder liegen in per-Charakter-Ordnern unter `public/assets/images/Charaktere/Alpha/`, `Beta/`, `Charlie/`, `Delta/` mit Pose-basierter Dateinamenskonvention
- Director Nova Bilder liegen unter `public/assets/images/Direktor Nova/` mit Pose-Varianten (neutral, freundlich, lobend, skeptisch); **Begrüßungsbildschirm verwendet `neutral`-Pose**
- Dialog-Texte werden zur Laufzeit aus `public/assets/dialogs/` geladen (fetch-basiert, kein statischer Import)
- `fast-check` wird als Property-Test-Library mit Vitest verwendet
- **Audio**: Die Hauptmenü-Musik (`mainmenu.mp3`) läuft während des gesamten Onboardings weiter – das Onboarding startet/stoppt sie nicht. Der Typewriter-Sound (`typing.mp3`) wird lokal in der `TypewriterText`-Komponente über ein HTML Audio-Element im Loop-Modus gesteuert (play bei Animationsstart, stop bei Abschluss/Unmount).
- **Pfeilbilder im Carousel**: Benutzerdefinierte Bilder aus `/assets/images/Pfeile/Pfeil_links.png` und `/assets/images/Pfeile/Pfeil rechts.png` (Leerzeichen im rechten Dateinamen beachten!). Bei Ladefehler: Fallback auf Text-Pfeile (← / →).
- **CharacterSelectionScreen**: Handelt kein Speichern – ruft nur `onSelect(characterId)` auf, was im OnboardingFlow den `selectedCharacter` State setzt und zum ConfirmationDialog transitioniert.
- **ConfirmationDialog**: Neuer vierter Step – zeigt "Bist du dir sicher?" mit Confirm/Cancel-Buttons. Speichern + Fehlerbehandlung wird vom OnboardingFlow über Props gesteuert.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2"] },
    { "id": 3, "tasks": ["2.3", "2.4", "2.5", "2.6", "2.7"] },
    { "id": 4, "tasks": ["4.1", "5.1"] },
    { "id": 5, "tasks": ["4.2", "6.1", "13.1"] },
    { "id": 6, "tasks": ["6.2", "7.1"] },
    { "id": 7, "tasks": ["8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3", "8.4"] },
    { "id": 9, "tasks": ["9.1"] },
    { "id": 10, "tasks": ["11.1", "13.2"] },
    { "id": 11, "tasks": ["11.2"] },
    { "id": 12, "tasks": ["12.1"] },
    { "id": 13, "tasks": ["12.2"] }
  ]
}
```
