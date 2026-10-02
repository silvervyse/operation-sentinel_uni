# Implementation Plan: Application Layout

## Overview

Schrittweise Implementierung der Application Shell (AppShell) mit Header, MainContent und StatusBar. Die Komponenten werden einzeln erstellt, dann zusammengesetzt und abschließend in App.tsx integriert. Die alte Layout.tsx wird durch den neuen AppShell ersetzt.

## Tasks

- [ ] 1. Design Token Erweiterung für Animation
  - [ ] 1.1 animate-fade-in Keyframe zu index.css hinzufügen
    - `@keyframes fade-in` Block definieren (from opacity:0, to opacity:1)
    - Im `@theme` Block `--animate-fade-in: fade-in var(--duration-normal) var(--ease-out)` registrieren
    - Sicherstellen, dass `prefers-reduced-motion` über den bestehenden `--duration-normal: 0ms` Override greift
    - _Requirements: 4.8, 7.6_

- [ ] 2. Header-Komponente erstellen
  - [ ] 2.1 Header.tsx in src/components/ implementieren
    - Neue Datei `src/components/Header.tsx` erstellen
    - `HeaderProps` Interface exportieren mit `title?`, `score?`, `missionBadge?` Props
    - `<header>` Landmark-Element mit `flex items-center justify-between` Layout
    - Feste Höhe `h-14`, `shrink-0`, `bg-bg-secondary`
    - Bottom-Border: `border-b border-accent-primary/20` für Glow-Separator
    - Responsive Padding: `px-4 md:px-6`
    - Titel links (`h1`, `truncate`), Status-Bereich rechts (Score + Badge)
    - Default-Titel: 'IT Security Awareness'
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ] 3. MainContent-Komponente erstellen
  - [ ] 3.1 MainContent.tsx in src/components/ implementieren
    - Neue Datei `src/components/MainContent.tsx` erstellen
    - `MainContentProps` Interface exportieren mit `children` und optionalem `className` Prop
    - `<main>` Landmark-Element mit `flex-1 overflow-y-auto`
    - Innerer Container: `max-w-[var(--max-width)] mx-auto px-4 md:px-6 py-4`
    - Children werden im inneren Container gerendert
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 4. StatusBar-Komponente erstellen
  - [ ] 4.1 StatusBar.tsx in src/components/ implementieren
    - Neue Datei `src/components/StatusBar.tsx` erstellen
    - `StatusBarProps` Interface exportieren mit `progress?`, `label?`, `className?` Props
    - `<footer>` Landmark-Element mit `flex items-center h-12 shrink-0 bg-bg-secondary`
    - Top-Border: `border-t border-accent-primary/20` für Glow-Separator
    - Responsive Padding: `px-4 md:px-6`
    - Entry-Animation: `animate-fade-in` Klasse
    - Innerer Container: `max-w-[var(--max-width)] mx-auto` mit Label + ProgressBar
    - ProgressBar-Komponente aus ui-components importieren und mit `value={progress} size="sm"` verwenden
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_

- [ ] 5. AppShell-Komponente erstellen
  - [ ] 5.1 AppShell.tsx in src/components/ implementieren
    - Neue Datei `src/components/AppShell.tsx` erstellen
    - `AppShellProps`, `HeaderConfig`, `StatusBarConfig` Interfaces exportieren
    - Flex-Container: `flex flex-col h-screen bg-bg-primary`
    - Header als erstes Kind, MainContent als zweites, StatusBar bedingt als letztes
    - `showStatusBar` Prop steuert Sichtbarkeit (default: false)
    - `headerProps` und `statusBarProps` an Kinder durchreichen
    - `children` an MainContent weiterleiten
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 6. Checkpoint - Komponenten-Build prüfen
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. App.tsx Migration und Layout-Entfernung
  - [ ] 7.1 App.tsx von Layout auf AppShell umstellen
    - Import von `Layout` durch Import von `AppShell` ersetzen
    - `<Layout>` Wrapper durch `<AppShell>` mit passenden Props ersetzen
    - `headerProps={{ title: 'IT Security Awareness' }}` setzen
    - `showStatusBar` und `statusBarProps` vorerst weglassen (false als Default)
    - Wrapper-`<div className="app">` entfernen (AppShell übernimmt Fullscreen-Layout)
    - `App.css` Import kann entfernt werden falls dort nur Layout-Styles waren
    - _Requirements: 1.1, 1.2, 1.3, 5.1_

  - [ ] 7.2 Alte Layout.tsx als deprecated markieren oder entfernen
    - `src/components/Layout.tsx` entfernen (wird durch AppShell vollständig ersetzt)
    - Sicherstellen, dass kein anderer Import auf Layout.tsx verweist
    - _Requirements: 1.1_

- [ ] 8. Property-Based Tests
  - [ ]* 8.1 Property-Test: Children pass-through in MainContent Container
    - **Property 1: Children pass-through in MainContent Container**
    - **Validates: Requirements 1.3, 3.7**
    - Test-Datei `src/components/__tests__/AppShell.test.tsx` erstellen
    - Mit fast-check beliebige Strings generieren und prüfen, dass sie im `<main>` Element erscheinen
    - Min. 100 Iterationen

  - [ ]* 8.2 Property-Test: Header renders provided title and score
    - **Property 2: Header renders provided title and score**
    - **Validates: Requirements 2.2, 2.8**
    - Test-Datei `src/components/__tests__/Header.test.tsx` erstellen
    - Mit fast-check beliebige title-Strings und score-Zahlen generieren, prüfen dass beide im `<header>` erscheinen
    - Min. 100 Iterationen

  - [ ]* 8.3 Property-Test: StatusBar reflects progress value and label
    - **Property 3: StatusBar reflects progress value and label**
    - **Validates: Requirements 4.6, 4.7**
    - Test-Datei `src/components/__tests__/StatusBar.test.tsx` erstellen
    - Mit fast-check progress (0–100) und label-Strings generieren, prüfen dass label-Text und aria-valuenow korrekt sind
    - Min. 100 Iterationen

  - [ ]* 8.4 Property-Test: Single main landmark invariant
    - **Property 4: Single main landmark invariant**
    - **Validates: Requirements 6.4**
    - In AppShell.test.tsx prüfen, dass für beliebige showStatusBar + children-Kombinationen genau ein `<main>` existiert
    - Min. 100 Iterationen

- [ ] 9. Unit-Tests
  - [ ]* 9.1 Unit-Tests für Header, MainContent, StatusBar, AppShell
    - Landmark-Elemente prüfen (header, main, footer)
    - Responsive CSS-Klassen prüfen (px-4, md:px-6)
    - Conditional Rendering der StatusBar prüfen
    - Glow-Border-Klassen prüfen (border-accent-primary/20)
    - Animation-Klasse auf StatusBar prüfen (animate-fade-in)
    - Default-Titel 'IT Security Awareness' prüfen
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 10. Final Checkpoint - Build und Tests bestätigen
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks mit `*` sind optional und können für ein schnelleres MVP übersprungen werden
- Jeder Task referenziert spezifische Requirements für Nachvollziehbarkeit
- Die ProgressBar-Komponente wird aus dem ui-components Spec erwartet — falls noch nicht implementiert, muss dieser Spec zuerst abgeschlossen werden
- Design Tokens (bg-primary, bg-secondary, accent-primary, spacing-4, spacing-6, duration-normal, --max-width) müssen aus dem Design System Spec verfügbar sein
- Checkpoints dienen der inkrementellen Validierung
- Property-Tests validieren universelle Korrektheitseigenschaften über viele Eingaben
- Unit-Tests validieren spezifische Beispiele und Randfälle

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "3.1", "4.1"] },
    { "id": 2, "tasks": ["5.1"] },
    { "id": 3, "tasks": ["7.1"] },
    { "id": 4, "tasks": ["7.2"] },
    { "id": 5, "tasks": ["8.1", "8.2", "8.3", "8.4", "9.1"] }
  ]
}
```
