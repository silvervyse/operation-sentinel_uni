# Implementation Plan: UI Components

## Overview

Implementierung der fünf Basis-UI-Komponenten (Button, Card, Badge, ProgressBar, IconWrapper) als React/TypeScript Functional Components mit Tailwind CSS Styling. Die Implementierung erfolgt inkrementell: zuerst Abhängigkeiten und Test-Infrastruktur, dann Komponenten einzeln von einfach zu komplex, jeweils mit Property-Based Tests.

## Tasks

- [ ] 1. Abhängigkeiten installieren und Test-Infrastruktur einrichten
  - [ ] 1.1 Neue Abhängigkeiten installieren
    - `lucide-react` als Produktionsabhängigkeit installieren
    - `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `fast-check` als Dev-Abhängigkeiten installieren
    - `test`-Script in package.json hinzufügen: `"test": "vitest --run"`
    - _Requirements: 6.1, 5.1_

  - [ ] 1.2 Vitest mit jsdom-Umgebung konfigurieren
    - `vite.config.ts` erweitern: `test`-Block mit `globals: true`, `environment: 'jsdom'`, `setupFiles: ['./src/test-setup.ts']`
    - `/// <reference types="vitest" />` am Dateianfang hinzufügen
    - Neue Datei `src/test-setup.ts` erstellen mit Import von `@testing-library/jest-dom`
    - `tsconfig.json` prüfen und ggf. `types: ["vitest/globals"]` in compilerOptions hinzufügen
    - _Requirements: 6.1_

- [ ] 2. Checkpoint - Build und Test-Setup verifizieren
  - Sicherstellen, dass `npm run build` und `npm run test` ohne Fehler durchlaufen (leere Test-Suite ist OK). Bei Fragen den User fragen.

- [ ] 3. IconWrapper-Komponente implementieren
  - [ ] 3.1 IconWrapper-Komponente erstellen
    - Neue Datei `src/components/IconWrapper.tsx` erstellen
    - `IconWrapperProps` Interface exportieren mit: `icon` (LucideIcon), `size` ('sm' | 'md' | 'lg'), `color` (string), `ariaLabel` (string), `className` (string)
    - Size-Mapping implementieren: sm→16, md→20, lg→24
    - Default-Werte: size='md', color='currentColor'
    - Conditional Rendering: wenn `ariaLabel` vorhanden → `<span role="img" aria-label>` Wrapper; sonst `aria-hidden="true"` direkt auf Icon
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 6.1, 6.2, 6.3, 6.5_

  - [ ]* 3.2 Property-Test für IconWrapper-Größen schreiben
    - Neue Datei `src/components/__tests__/IconWrapper.test.tsx` erstellen
    - **Property 7: IconWrapper-Größe bestimmt korrektes Pixel-Maß**
    - Für jeden Size-Wert prüfen, dass das korrekte Pixel-Maß (16/20/24) an die Icon-Komponente übergeben wird
    - Unit-Tests für: Default-Größe, ariaLabel-Verhalten (role="img"), aria-hidden bei dekorativen Icons, color-Prop Durchreichung
    - **Validates: Requirements 5.2, 5.3, 5.4**

- [ ] 4. Badge-Komponente implementieren
  - [ ] 4.1 Badge-Komponente erstellen
    - Neue Datei `src/components/Badge.tsx` erstellen
    - `BadgeProps` Interface exportieren mit: `variant` ('success' | 'warning' | 'danger' | 'info' | 'neutral'), `children` (ReactNode)
    - Varianten-Mapping: success→accent-secondary/20, warning→warning/20, danger→danger/20, info→accent-primary/20, neutral→bg-tertiary
    - Default variant='neutral'
    - Render als `<span>` mit `inline-block rounded-full px-2 py-0.5 text-xs font-medium`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 6.1, 6.2, 6.3, 6.5_

  - [ ]* 4.2 Property-Test für Badge-Varianten schreiben
    - Neue Datei `src/components/__tests__/Badge.test.tsx` erstellen
    - **Property 4: Badge-Variante bestimmt korrekte Farb-Klassen**
    - Für jeden Varianten-Wert prüfen, dass die korrekten Hintergrund- und Textfarb-Klassen im DOM vorhanden sind
    - Unit-Tests für: Default-Variante, children-Rendering
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.6**

- [ ] 5. Card-Komponente implementieren
  - [ ] 5.1 Card-Komponente erstellen
    - Neue Datei `src/components/Card.tsx` erstellen
    - `CardProps` Interface exportieren (extends HTMLAttributes<HTMLDivElement>): `elevation` ('sm' | 'md' | 'lg'), `className` (string), `children` (ReactNode)
    - Elevation-Mapping: sm→shadow-sm, md→shadow-md, lg→shadow-lg
    - Default elevation='md'
    - Render als `<div>` mit `bg-bg-secondary rounded-lg p-4` + elevation shadow + className
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 6.1, 6.2, 6.3, 6.5_

  - [ ]* 5.2 Property-Test für Card-Elevation schreiben
    - Neue Datei `src/components/__tests__/Card.test.tsx` erstellen
    - **Property 3: Card-Elevation bestimmt korrekten Schatten**
    - Für jeden Elevation-Wert prüfen, dass die korrekte Shadow-Klasse vorhanden ist und keine andere Shadow-Klasse
    - Unit-Tests für: Default-Elevation, children-Rendering, className Pass-Through
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 6. ProgressBar-Komponente implementieren
  - [ ] 6.1 ProgressBar-Komponente erstellen
    - Neue Datei `src/components/ProgressBar.tsx` erstellen
    - `ProgressBarProps` Interface exportieren: `value` (number), `color` (string), `size` ('sm' | 'md' | 'lg'), `className` (string)
    - Value-Clamping: `Math.max(0, Math.min(100, value))`, NaN-Fallback auf 0
    - Size-Mapping: sm→h-1, md→h-2, lg→h-3
    - Default: color='bg-accent-primary', size='md'
    - ARIA-Attribute: `role="progressbar"`, `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`
    - Fill-Bar Width via inline style: `width: ${clampedValue}%`
    - Transition: `transition-[width] duration-normal`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 6.1, 6.2, 6.3, 6.5, 6.7_

  - [ ]* 6.2 Property-Tests für ProgressBar schreiben
    - Neue Datei `src/components/__tests__/ProgressBar.test.tsx` erstellen
    - **Property 5: ProgressBar-Wert wird korrekt auf 0–100% geklemmt**
    - Für beliebige numerische Werte (inkl. negativ, >100) prüfen, dass width = clamp(0, value, 100)% und aria-valuenow korrekt
    - **Property 6: ProgressBar-Größe bestimmt korrekte Höhe**
    - Für jeden Size-Wert prüfen, dass die korrekte Höhen-Klasse (h-1, h-2, h-3) vorhanden ist
    - Unit-Tests für: Default-Werte, custom color, className Pass-Through
    - **Validates: Requirements 4.2, 4.3, 4.7, 4.8, 4.9, 4.10**

- [ ] 7. Checkpoint - Alle bisherigen Tests müssen grün sein
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Button-Komponente implementieren
  - [ ] 8.1 Button-Komponente erstellen
    - Neue Datei `src/components/Button.tsx` erstellen
    - `ButtonProps` Interface exportieren (extends Omit<ButtonHTMLAttributes, 'disabled'>): `variant` ('primary' | 'secondary' | 'ghost'), `size` ('sm' | 'md' | 'lg'), `loading` (boolean), `disabled` (boolean), `icon` (LucideIcon), `children` (ReactNode)
    - Varianten-Mapping: primary→bg-accent-primary text-bg-primary, secondary→transparent border border-accent-primary, ghost→transparent text-text-secondary
    - Size-Mapping: sm→px-3 py-1 text-sm, md→px-4 py-2 text-base, lg→px-6 py-3 text-lg
    - Disabled/Loading: opacity-50 pointer-events-none, `aria-busy={loading}`
    - Icon-Rendering: nutzt IconWrapper intern oder rendert Icon direkt mit size-abhängigem Pixel-Wert
    - Loading-Spinner: `<span>` mit `animate-spin` Tailwind-Klasse
    - Focus: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary`
    - Hover-Transition: `transition-colors duration-fast`
    - Default: variant='primary', size='md'
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11, 1.12, 1.13, 6.1, 6.2, 6.3, 6.5, 6.6, 6.7_

  - [ ]* 8.2 Property-Tests für Button schreiben
    - Neue Datei `src/components/__tests__/Button.test.tsx` erstellen
    - **Property 1: Button-Variante bestimmt korrekte Styling-Klassen**
    - Für jeden Varianten-Wert prüfen, dass die korrekten Tailwind-Klassen (bg, border, text) vorhanden sind und keine Klassen anderer Varianten
    - **Property 2: Button-Größe bestimmt korrekte Padding- und Font-Klassen**
    - Für jeden Size-Wert prüfen, dass die korrekten Padding- und Font-Size-Klassen vorhanden sind
    - Unit-Tests für: loading-State (Spinner sichtbar, Button disabled), disabled-State (opacity-50), icon-Rendering, focus-visible Klassen, className Pass-Through, children-Rendering
    - **Validates: Requirements 1.2, 1.3, 1.4, 1.5, 1.6, 1.7**

- [ ] 9. Final Checkpoint - Gesamtverifikation
  - Sicherstellen, dass `npm run build` und `npm run test` erfolgreich durchlaufen. Alle Property-Tests und Unit-Tests müssen grün sein. Bei Fragen den User fragen.

## Notes

- Tasks mit `*` sind optional und können für schnellere MVP-Erstellung übersprungen werden
- Jede Task referenziert spezifische Requirements für Nachverfolgbarkeit
- Checkpoints stellen sicher, dass der Build jederzeit funktioniert
- Property-Tests validieren universelle Korrektheitseigenschaften aus dem Design-Dokument
- Unit-Tests validieren spezifische Beispiele und Randfälle
- Das Design System (Tailwind-Konfiguration, Design Tokens) wird als bereits implementiert vorausgesetzt
- Die Komponenten-Reihenfolge folgt der Abhängigkeitshierarchie: IconWrapper zuerst (keine Abhängigkeiten), Button zuletzt (nutzt optional IconWrapper)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["3.1", "4.1", "5.1", "6.1"] },
    { "id": 3, "tasks": ["3.2", "4.2", "5.2", "6.2"] },
    { "id": 4, "tasks": ["8.1"] },
    { "id": 5, "tasks": ["8.2"] }
  ]
}
```
