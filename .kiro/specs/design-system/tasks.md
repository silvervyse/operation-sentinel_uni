# Implementation Plan: Design System

## Overview

Dieses Implementierungsplan etabliert das Design System für die gamifizierte IT-Security Awareness Anwendung. Die Umsetzung erfolgt in inkrementellen Schritten: zuerst die Infrastruktur (Tailwind CSS v4 + Vite Plugin), dann die Design Tokens, anschließend die Migration bestehender Komponenten und zuletzt die Validierungstests.

## Tasks

- [x] 1. Tailwind CSS v4 Installation und Vite-Konfiguration
  - [x] 1.1 Install Tailwind CSS v4 und @tailwindcss/vite Plugin
    - Installiere `tailwindcss` und `@tailwindcss/vite` als devDependencies via npm
    - Führe aus: `npm install -D tailwindcss @tailwindcss/vite`
    - _Requirements: 5.8_

  - [x] 1.2 Konfiguriere vite.config.ts mit dem Tailwind Vite Plugin
    - Importiere `tailwindcss` aus `@tailwindcss/vite`
    - Registriere `tailwindcss()` als Plugin VOR `react()` in der plugins-Liste
    - Ergebnis siehe Design-Dokument Abschnitt "vite.config.ts"
    - _Requirements: 5.6, 5.9_

- [x] 2. Design Tokens und CSS-Konfiguration
  - [x] 2.1 Ersetze src/index.css mit dem vollständigen Design Token System
    - Ersetze den gesamten Inhalt von `src/index.css` mit der neuen Token-Datei
    - Beinhaltet: `@import "tailwindcss"`, `:root` CSS Custom Properties (Farben, Typografie, Spacing, Border-Radius, Schatten, Animationen, Layout)
    - Beinhaltet: `@media (prefers-reduced-motion: reduce)` Block der alle Dauern auf 0ms setzt
    - Beinhaltet: `@theme` Block mit vollständigem Tailwind Token-Mapping
    - Beinhaltet: `@custom-variant dark (&:where(.dark, .dark *))` Direktive
    - Beinhaltet: Base Styles (CSS Reset, html, body, h1-h3, button)
    - Exakte Inhalte siehe Design-Dokument Abschnitt "index.css — Design Token Datei"
    - _Requirements: 1.1–1.10, 2.1–2.7, 3.1–3.3, 4.1–4.4, 5.1–5.5, 6.1–6.3, 7.1–7.5, 8.1–8.2_

  - [ ]* 2.2 Write property test: Farbkontrast erfüllt WCAG AA
    - **Property 1: Farbkontrast erfüllt WCAG AA**
    - Implementiere eine Hilfsfunktion `calculateContrastRatio(fg: string, bg: string): number`
    - Teste: text-primary (#f0f4f8) auf bg-primary (#0a0e1a) ≥ 4.5:1
    - Teste: text-secondary (#94a3b8) auf bg-primary (#0a0e1a) ≥ 3:1
    - Teste: accent-primary (#00d4ff) auf bg-primary (#0a0e1a) ≥ 4.5:1
    - **Validates: Requirements 1.8, 1.9**

  - [ ]* 2.3 Write property test: Hintergrundfarben-HSL innerhalb spezifizierter Bereiche
    - **Property 2: Hintergrundfarben-HSL innerhalb spezifizierter Bereiche**
    - Implementiere eine Hilfsfunktion `hexToHsl(hex: string): { h: number, s: number, l: number }`
    - Teste: bg-primary (#0a0e1a) → L < 10%, H: 200°–240°
    - Teste: bg-secondary (#131828) → L: 10%–18%, H: 200°–240°
    - Teste: bg-tertiary (#1c2333) → L: 15%–25%, H: 200°–240°
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 2.4 Write property test: Spacing-Tokens sind Vielfache der 4px-Basiseinheit
    - **Property 3: Spacing-Tokens sind Vielfache der 4px-Basiseinheit**
    - Teste alle 8 Spacing-Werte (4, 8, 12, 16, 24, 32, 48, 64) auf Teilbarkeit durch 4
    - **Validates: Requirements 3.1, 3.2**

- [x] 3. Checkpoint - Build-Verifikation
  - Stelle sicher, dass `npm run build` fehlerfrei durchläuft. Frage den User bei Problemen.

- [x] 4. HTML und Font-Konfiguration
  - [x] 4.1 Aktualisiere index.html mit Dark-Mode-Klasse und Google Fonts
    - Setze `lang="de"` und `class="dark"` auf das `<html>` Element
    - Füge `<meta name="color-scheme" content="dark" />` hinzu
    - Füge Google Fonts Preconnect-Links und Font-Stylesheet-Link hinzu (Inter 400/500/700 + JetBrains Mono 400/500)
    - Aktualisiere den `<title>` zu "IT Security Awareness"
    - Exakte Inhalte siehe Design-Dokument Abschnitt "index.html"
    - _Requirements: 6.1, 6.3, 2.1, 2.2_

- [x] 5. Komponenten-Migration zu Tailwind Utility Classes
  - [x] 5.1 Migriere App.tsx zu Tailwind Utility Classes
    - Entferne `import './App.css'`
    - Ersetze `className="app"` mit Tailwind Utilities: `min-h-screen flex flex-col items-center`
    - _Requirements: 8.5_

  - [x] 5.2 Migriere Layout.tsx zu Tailwind Utility Classes
    - Ersetze `className="layout"` mit: `w-full max-w-[var(--max-width)] mx-auto p-4 md:p-6`
    - _Requirements: 8.3, 8.5_

  - [x] 5.3 Migriere StartScreen.tsx zu Tailwind Utility Classes
    - Ersetze CSS-Klassen mit Tailwind Utilities gemäß Design-Dokument
    - Container: `flex flex-col items-center justify-center text-center min-h-[80vh] gap-6`
    - Heading: `text-2xl md:text-[var(--text-2xl)] font-bold text-text-primary`
    - Description: `text-text-secondary max-w-[400px] leading-relaxed`
    - Button: `bg-accent-primary text-bg-primary border-none px-6 py-2 rounded-md text-base font-medium transition-colors duration-normal hover:bg-accent-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary`
    - _Requirements: 8.4, 8.5_

  - [x] 5.4 Migriere LevelPlaceholder.tsx zu Tailwind Utility Classes
    - Ersetze CSS-Klassen mit Tailwind Utilities analog zu StartScreen
    - Container: `flex flex-col items-center justify-center text-center min-h-[80vh] gap-6`
    - Heading: `text-2xl font-bold text-text-primary`
    - Text: `text-text-secondary max-w-[400px] leading-relaxed`
    - Button (secondary): `bg-transparent text-accent-primary border-2 border-accent-primary px-6 py-2 rounded-md text-base font-medium transition-colors duration-normal hover:bg-accent-primary hover:text-bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary`
    - _Requirements: 8.4, 8.5_

  - [x] 5.5 Leere oder entferne App.css
    - Da alle Styles nun über Tailwind Utilities oder die Design Tokens in index.css abgedeckt sind, leere den Inhalt von `src/App.css` (Datei behalten falls von Vite erwartet, aber Inhalt entfernen)
    - _Requirements: 8.4, 8.5_

- [x] 6. Checkpoint - Vollständige Build- und Migrationsverifikation
  - Stelle sicher, dass `npm run build` fehlerfrei durchläuft.
  - Überprüfe, dass keine Referenzen zu alten CSS-Variablen (--color-primary, --color-background, --color-text, --color-text-light, --spacing-sm, --spacing-md, --spacing-lg) mehr existieren.
  - Frage den User bei Problemen.

- [x] 7. Token-Validierungstests
  - [x] 7.1 Installiere Vitest als Test-Framework
    - Installiere `vitest` als devDependency: `npm install -D vitest`
    - Füge ein `"test": "vitest --run"` Script zu package.json hinzu
    - _Requirements: Testing Strategy_

  - [x] 7.2 Erstelle Design-Token-Validierungstests
    - Erstelle Datei `src/__tests__/design-tokens.test.ts`
    - Implementiere Hilfsfunktionen: `hexToHsl()` und `calculateContrastRatio()` (mit Relative Luminance nach WCAG 2.1)
    - Schreibe Tests für Farbkontrast (Property 1)
    - Schreibe Tests für HSL-Bereiche der Hintergrundfarben (Property 2)
    - Schreibe Tests für Spacing 4px-Basiseinheit (Property 3)
    - Schreibe Tests für Vollständigkeit aller Token-Definitionen (Property 4)
    - Schreibe Tests für Reduced-Motion-Override-Erwartung (Property 5)
    - Schreibe Tests für Dark-Klasse-Existenz in index.html (Property 6)
    - _Requirements: 1.8, 1.9, 1.1–1.3, 3.1–3.2, 7.5, 6.1_

  - [ ]* 7.3 Write property test: Alle CSS Custom Properties in :root definiert
    - **Property 4: Alle CSS Custom Properties in :root definiert**
    - Parse `src/index.css` und verifiziere, dass alle erwarteten Token-Namen im `:root` Block definiert sind
    - Token-Liste: alle --color-*, --font-*, --text-*, --spacing-*, --radius-*, --shadow-*, --duration-*, --ease-*, --leading-*, --max-width
    - **Validates: Requirements 1.10, 2.7, 3.3, 4.4, 7.3**

  - [ ]* 7.4 Write property test: Reduced Motion setzt alle Dauern auf 0ms
    - **Property 5: Reduced Motion setzt alle Dauern auf 0ms**
    - Parse `src/index.css` und verifiziere, dass im `@media (prefers-reduced-motion: reduce)` Block alle drei Duration-Tokens auf 0ms gesetzt werden
    - **Validates: Requirements 7.5**

  - [ ]* 7.5 Write property test: Dark-Klasse auf html-Element
    - **Property 6: Dark-Klasse auf html-Element vorhanden**
    - Parse `index.html` und verifiziere, dass das `<html>` Element die Klasse `dark` enthält
    - **Validates: Requirements 6.1**

- [x] 8. Final Checkpoint - Alle Tests und Build bestätigen
  - Stelle sicher, dass `npm run build` fehlerfrei durchläuft.
  - Stelle sicher, dass `npm test` fehlerfrei durchläuft.
  - Frage den User bei Problemen.

## Notes

- Tasks mit `*` sind optional und können für ein schnelleres MVP übersprungen werden
- Jeder Task referenziert spezifische Requirements für Nachvollziehbarkeit
- Checkpoints sichern inkrementelle Validierung
- Die Design-Dokument-Abweichung von den Requirements (kein tailwind.config.ts, kein postcss.config.js) ist beabsichtigt — Tailwind v4 nutzt einen CSS-first Ansatz
- Property Tests validieren universelle Korrektheitseigenschaften der Token-Werte
- Unit Tests in Task 7.2 decken die gleichen Properties ab wie die optionalen Property-Test-Tasks — sie sind komplementär

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["2.1", "4.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "5.1", "5.2", "5.3", "5.4"] },
    { "id": 4, "tasks": ["5.5"] },
    { "id": 5, "tasks": ["7.1"] },
    { "id": 6, "tasks": ["7.2", "7.3", "7.4", "7.5"] }
  ]
}
```
