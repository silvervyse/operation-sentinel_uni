# Design: Application Shell

## Architekturübersicht

Die Application Shell verwendet ein einfaches State-basiertes Screen-Management in der Hauptkomponente `App.tsx`. Es gibt keinen Router – der aktuelle Screen wird über einen React State gesteuert.

```text
┌──────────────────────────────────┐
│            App.tsx               │
│   ┌───────────────────────┐     │
│   │  currentScreen State  │     │
│   └───────────┬───────────┘     │
│               │                 │
│   ┌───────────▼───────────┐     │
│   │   Screen Rendering    │     │
│   │                       │     │
│   │  "start" → StartScreen│     │
│   │  "level" → LevelPlaceholder│
│   └───────────────────────┘     │
└──────────────────────────────────┘
```

---

## Screen-Typen

```typescript
type Screen = 'start' | 'level';
```

Der State `currentScreen` bestimmt, welche Komponente gerendert wird. Neue Screens können später einfach durch Erweiterung des Union-Types hinzugefügt werden.

---

## Komponentenstruktur

```text
src/
├── components/
│   └── Layout.tsx              // Basis-Layout-Wrapper (zentrierter Container)
│
├── features/
│   └── menu/
│       ├── StartScreen.tsx     // Startbildschirm mit Titel + Button
│       └── LevelPlaceholder.tsx // Platzhalter für Level 1
│
├── App.tsx                     // Screen-Management via State
├── App.css                     // Globale App-Styles
├── index.css                   // CSS Reset und Basis-Styles
└── main.tsx                    // React Entry Point
```

---

## Komponenten-Design

### App.tsx

- Verwaltet `currentScreen` State
- Rendert die entsprechende Screen-Komponente
- Übergibt eine `onNavigate`-Callback-Funktion an die Screens

### Layout.tsx

- Einfacher Wrapper mit zentriertem Container
- Responsive max-width
- Rendert `children`

### StartScreen.tsx

- Props: `onStart: () => void`
- Zeigt Titel, Beschreibungstext und Startbutton
- Ruft `onStart` beim Klick auf den Button auf

### LevelPlaceholder.tsx

- Props: `onBack: () => void`
- Zeigt Platzhaltertext für Level 1
- Enthält "Zurück"-Button

---

## Styling-Ansatz

- Reines CSS ohne Framework
- CSS-Variablen für Farben und Abstände (Wiederverwendbarkeit)
- Mobile-first responsive Design
- Einfache, gut lesbare Styles
- Keine CSS-Module oder Preprocessors (KISS)

### CSS-Variablen (Auszug)

```css
:root {
  --color-primary: #1a73e8;
  --color-background: #f5f5f5;
  --color-text: #333333;
  --max-width: 600px;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

---

## Responsive Breakpoints

- Mobil: ab 320px (Basisstil, mobile-first)
- Tablet: ab 768px (optionale Anpassungen)
- Desktop: ab 1024px (max-width begrenzt den Container)

---

## Accessibility

- Semantische HTML-Elemente (`<main>`, `<h1>`, `<button>`)
- Buttons mit klarem, beschreibendem Text
- Ausreichend Farbkontrast (WCAG AA)
- Fokus-Styles für Tastaturnavigation

---

## Erweiterbarkeit

Das Design erlaubt einfache Erweiterung:

- Neue Screens: Union-Type erweitern, Komponente erstellen, in App.tsx einbinden
- Layout-Änderungen: Zentraler Layout-Wrapper
- Späterer Router: Der State kann durch einen Router ersetzt werden, ohne die Screen-Komponenten zu ändern
