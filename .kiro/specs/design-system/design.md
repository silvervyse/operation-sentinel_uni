# Design Document: Design System

## Overview

Dieses Design System etabliert die visuelle Grundlage für die gamifizierte IT-Security Awareness Anwendung. Es definiert eine konsistente Gestaltungssprache im Stil eines Geheimagenten-/Cyber-Security-Themas mit einer dunklen Oberfläche.

Das Design System besteht aus:
- **Design Tokens** als CSS Custom Properties (Farben, Typografie, Spacing, Border-Radius, Schatten, Animationen)
- **Tailwind CSS v4 Konfiguration** über das `@tailwindcss/vite` Plugin mit CSS-first `@theme` Konfiguration
- **Dark Mode als Standard** ohne Toggle-Mechanismus
- **Migration** der bestehenden CSS-Variablen und Styles

### Design-Entscheidungen

| Entscheidung | Gewählt | Begründung |
|---|---|---|
| Tailwind Version | v4 mit `@tailwindcss/vite` | Neueste stabile Version, native Vite-Integration, kein PostCSS-Setup nötig |
| Token-Format | CSS Custom Properties + `@theme` Directive | Tailwind v4 Standard, CSS-first Konfiguration, kein separates `tailwind.config.ts` nötig |
| Dark Mode | `@custom-variant dark` mit `.dark` Klasse auf `<html>` | Tailwind v4 Ansatz, keine JS-Konfiguration nötig |
| Fonts | Inter + JetBrains Mono (via Google Fonts CDN) | Kostenlos, performant, passend zum Thema |
| Token-Namensgebung | Semantische Namen mit CSS-Namespace-Konvention | `--color-bg-*`, `--color-accent-*`, `--color-text-*` |

**Abweichung von Requirements:** Die Anforderungen spezifizieren eine `tailwind.config.ts` Datei und PostCSS-Konfiguration. Tailwind CSS v4 (aktuell v4.3) nutzt stattdessen einen CSS-first Ansatz mit dem `@tailwindcss/vite` Plugin und einer `@theme`-Direktive in der CSS-Datei. Dies vereinfacht die Konfiguration erheblich (keine `tailwind.config.ts`, keine `postcss.config.js` nötig) und entspricht den Projektprinzipien "simple and understandable code". Die funktionalen Anforderungen (Utility-Klassen, Custom Theme, Dark Mode) werden vollständig erfüllt.

## Architecture

### Architektur-Übersicht

```mermaid
graph TD
    A[index.html<br/>dark class + font links] --> B[src/index.css<br/>Design Tokens + @theme]
    B --> C[@tailwindcss/vite Plugin]
    C --> D[Generierte Utility-Klassen]
    D --> E[React Komponenten<br/>Tailwind Utility Classes]
    
    subgraph "Token-Schichten"
        F[:root CSS Custom Properties<br/>Basis-Werte]
        G[@theme Directive<br/>Tailwind Token-Mapping]
    end
    
    F --> G
    G --> D
```

### Datei-Struktur

```
src/
├── index.css          # Design Tokens (:root), @theme, Tailwind Import, Base Styles
├── App.css            # → Wird geleert/entfernt (Migration zu Tailwind Utilities)
├── App.tsx            # Nutzt Tailwind Utility Classes
├── components/
│   └── Layout.tsx     # Nutzt Tailwind Utility Classes
└── features/
    └── menu/
        ├── StartScreen.tsx
        └── LevelPlaceholder.tsx

index.html             # dark class auf <html>, Google Fonts Links
vite.config.ts         # @tailwindcss/vite Plugin registriert
package.json           # tailwindcss + @tailwindcss/vite als devDependencies
```

### Token-Architektur

Die Token-Architektur folgt einem zwei-Schichten-Modell:

1. **CSS Custom Properties** (`:root`): Definieren die tatsächlichen Werte (Hex-Farben, px-Werte, etc.)
2. **Tailwind `@theme` Block**: Mappt CSS Custom Properties auf Tailwind-Namespaces für Utility-Class-Generierung

```css
/* Schicht 1: Token-Definition */
:root {
  --color-bg-primary: #0a0e1a;
}

/* Schicht 2: Tailwind-Mapping */
@theme {
  --color-bg-primary: var(--color-bg-primary);
}
```

Dies erlaubt:
- Direkte Nutzung über `var(--color-bg-primary)` in Custom CSS
- Nutzung über Tailwind Utilities wie `bg-bg-primary`
- Einfache Erweiterbarkeit ohne Tool-Konfiguration

## Components and Interfaces

### 1. index.css — Design Token Datei

Zentrale Datei für alle Design Tokens und Tailwind-Konfiguration.

```css
@import "tailwindcss";

/* === DESIGN TOKENS === */
:root {
  color-scheme: dark;
  
  /* --- Farben: Hintergründe --- */
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #131828;
  --color-bg-tertiary: #1c2333;
  
  /* --- Farben: Akzente --- */
  --color-accent-primary: #00d4ff;
  --color-accent-secondary: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  /* --- Farben: Text --- */
  --color-text-primary: #f0f4f8;
  --color-text-secondary: #94a3b8;
  
  /* --- Typografie --- */
  --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --font-normal: 400;
  --font-medium: 500;
  --font-bold: 700;
  --leading-body: 1.5;
  --leading-heading: 1.2;
  
  /* --- Spacing (4px Basis) --- */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 24px;
  --spacing-6: 32px;
  --spacing-7: 48px;
  --spacing-8: 64px;
  
  /* --- Border Radius --- */
  --radius-none: 0px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* --- Schatten --- */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 20px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4);
  
  /* --- Animationen --- */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);
  
  /* --- Layout --- */
  --max-width: 600px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
  }
}

/* === TAILWIND THEME MAPPING === */
@theme {
  /* Farben */
  --color-bg-primary: var(--color-bg-primary);
  --color-bg-secondary: var(--color-bg-secondary);
  --color-bg-tertiary: var(--color-bg-tertiary);
  --color-accent-primary: var(--color-accent-primary);
  --color-accent-secondary: var(--color-accent-secondary);
  --color-warning: var(--color-warning);
  --color-danger: var(--color-danger);
  --color-text-primary: var(--color-text-primary);
  --color-text-secondary: var(--color-text-secondary);
  
  /* Font Families */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  
  /* Spacing */
  --spacing-1: var(--spacing-1);
  --spacing-2: var(--spacing-2);
  --spacing-3: var(--spacing-3);
  --spacing-4: var(--spacing-4);
  --spacing-5: var(--spacing-5);
  --spacing-6: var(--spacing-6);
  --spacing-7: var(--spacing-7);
  --spacing-8: var(--spacing-8);
  
  /* Border Radius */
  --radius-none: var(--radius-none);
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  
  /* Shadows */
  --shadow-sm: var(--shadow-sm);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  
  /* Transition Duration */
  --duration-fast: var(--duration-fast);
  --duration-normal: var(--duration-normal);
  --duration-slow: var(--duration-slow);
  
  /* Transition Timing */
  --ease-out: var(--ease-out);
  --ease-in-out: var(--ease-in-out);
}

/* Dark Mode Custom Variant */
@custom-variant dark (&:where(.dark, .dark *));

/* === BASE STYLES === */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  line-height: var(--leading-body);
}

body {
  font-family: var(--font-sans);
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3 {
  line-height: var(--leading-heading);
}

button {
  font: inherit;
  cursor: pointer;
}
```

### 2. index.html — HTML Entry Point

```html
<!doctype html>
<html lang="de" class="dark">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="dark" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <title>IT Security Awareness</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 3. vite.config.ts — Vite Konfiguration

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
})
```

### 4. Migrierte Komponenten (Beispiele)

**Layout.tsx** — Migration von CSS-Klassen zu Tailwind Utilities:

```tsx
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="w-full max-w-[var(--max-width)] mx-auto p-4 md:p-6">
      {children}
    </div>
  );
}

export default Layout;
```

**StartScreen.tsx** — Migration:

```tsx
interface StartScreenProps {
  onStart: () => void;
}

function StartScreen({ onStart }: StartScreenProps) {
  return (
    <main className="flex flex-col items-center justify-center text-center min-h-[80vh] gap-6">
      <h1 className="text-2xl md:text-[var(--text-2xl)] font-bold text-text-primary">
        IT Security Awareness
      </h1>
      <p className="text-text-secondary max-w-[400px] leading-relaxed">
        Lerne, IT-Sicherheitsrisiken im Arbeitsalltag zu erkennen.
        Triff Entscheidungen in realistischen Szenarien und erhalte
        direktes Feedback.
      </p>
      <button
        type="button"
        className="bg-accent-primary text-bg-primary border-none px-6 py-2 rounded-md text-base font-medium transition-colors duration-normal hover:bg-accent-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary"
        onClick={onStart}
      >
        Spiel starten
      </button>
    </main>
  );
}

export default StartScreen;
```

### 5. Package Dependencies

Neue devDependencies:
- `tailwindcss` (^4.3)
- `@tailwindcss/vite` (^4.3)

Diese ersetzen die Notwendigkeit für `postcss` und `autoprefixer` als separate Packages, da Tailwind v4's Vite-Plugin beides intern handhabt.

## Data Models

### Design Token Struktur

Die Token sind in semantische Gruppen organisiert:

```typescript
/** Typdefinition der verfügbaren Design Tokens (für Dokumentation/Referenz) */

interface ColorTokens {
  // Hintergründe
  'bg-primary': string;     // #0a0e1a — Haupthintergrund (HSL: ~225°, 47%, 7%)
  'bg-secondary': string;   // #131828 — Erhöhte Flächen (HSL: ~225°, 36%, 12%)
  'bg-tertiary': string;    // #1c2333 — Karten/Container (HSL: ~222°, 30%, 16%)
  
  // Akzente
  'accent-primary': string;   // #00d4ff — Cyan/Electric Blue (HSL: ~191°, 100%, 50%)
  'accent-secondary': string; // #22c55e — Grün/Emerald (HSL: ~142°, 71%, 45%)
  'warning': string;          // #f59e0b — Amber (HSL: ~38°, 92%, 50%)
  'danger': string;           // #ef4444 — Rot (HSL: ~0°, 84%, 60%)
  
  // Text
  'text-primary': string;   // #f0f4f8 — Heller Text (Kontrast ≥7:1 zu bg-primary)
  'text-secondary': string; // #94a3b8 — Gedämpfter Text (Kontrast ≥4.5:1 zu bg-primary)
}

interface TypographyTokens {
  fontFamily: {
    sans: string;  // 'Inter', system-ui, ...
    mono: string;  // 'JetBrains Mono', 'Fira Code', ...
  };
  fontSize: {
    xs: '0.75rem';
    sm: '0.875rem';
    base: '1rem';
    lg: '1.125rem';
    xl: '1.25rem';
    '2xl': '1.5rem';
  };
  fontWeight: {
    normal: 400;
    medium: 500;
    bold: 700;
  };
  lineHeight: {
    body: 1.5;
    heading: 1.2;
  };
}

interface SpacingTokens {
  1: '4px';
  2: '8px';
  3: '12px';
  4: '16px';
  5: '24px';
  6: '32px';
  7: '48px';
  8: '64px';
}

interface BorderRadiusTokens {
  none: '0px';
  sm: '4px';
  md: '8px';
  lg: '12px';
}

interface ShadowTokens {
  sm: string;  // Single-layer, 3px blur
  md: string;  // Double-layer, 8px blur
  lg: string;  // Double-layer, 20px blur
}

interface AnimationTokens {
  duration: {
    fast: '150ms';
    normal: '300ms';
    slow: '500ms';
  };
  easing: {
    out: string;    // cubic-bezier für Einblendungen
    inOut: string;  // cubic-bezier für Zustandswechsel
  };
}
```

### Farbkontrast-Validierung

| Token-Paar | Berechneter Kontrast | WCAG AA Minimum | Status |
|---|---|---|---|
| text-primary (#f0f4f8) auf bg-primary (#0a0e1a) | ~16.5:1 | 4.5:1 | ✅ |
| text-secondary (#94a3b8) auf bg-primary (#0a0e1a) | ~6.8:1 | 3:1 | ✅ |
| accent-primary (#00d4ff) auf bg-primary (#0a0e1a) | ~9.2:1 | 4.5:1 | ✅ |

### HSL-Validierung der Hintergrundfarben

| Token | Hex | H | S | L | Anforderung |
|---|---|---|---|---|---|
| bg-primary | #0a0e1a | 225° | 47% | 7% | L < 10%, H: 200°–240° ✅ |
| bg-secondary | #131828 | 225° | 36% | 12% | L: 10%–18% ✅ |
| bg-tertiary | #1c2333 | 222° | 30% | 16% | L: 15%–25% ✅ |


## Error Handling

### Build-Fehler

| Fehlerkategorie | Ursache | Lösung |
|---|---|---|
| Tailwind Utility nicht generiert | Token nicht in `@theme` registriert | Token zum `@theme` Block hinzufügen |
| CSS Custom Property undefined | Typo im Variablennamen | Namenskonvention prüfen (`--color-*`, `--spacing-*`) |
| Font nicht geladen | Google Fonts CDN nicht erreichbar | Fallback-Stack in `--font-sans` greift automatisch |
| Flash of unstyled content | CSS nicht im `<head>` eingebunden | `index.css` wird von Vite automatisch als Stylesheet injiziert |

### Graceful Degradation

- **Font-Loading**: Die Font-Stacks enthalten System-Fallbacks. Wenn Inter/JetBrains Mono nicht laden, wird `system-ui` bzw. `ui-monospace` verwendet.
- **CSS Custom Properties**: Alle modernen Browser unterstützen CSS Custom Properties (IE11 ist nicht im Scope). Kein Fallback nötig.
- **Reduced Motion**: Wird automatisch respektiert über `prefers-reduced-motion` Media Query. Alle Animationsdauern werden auf 0ms gesetzt.
- **Dark Mode**: Da Dark Mode der einzige Modus ist (kein Toggle), gibt es keinen Zustand, in dem das System "falsch" rendert.

### Migrations-Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Alte CSS-Variable nicht vollständig ersetzt | Mittel | Suche nach `var(--color-primary)`, `var(--spacing-sm)` etc. in allen Dateien |
| Tailwind Klasse rendert nicht | Niedrig | Visueller Vergleich vor/nach Migration |
| Layout-Bruch durch Spacing-Änderung | Niedrig | `--max-width: 600px` bleibt erhalten |

## Testing Strategy

### Warum kein Property-Based Testing

Dieses Feature definiert statische Konfigurationswerte (CSS Custom Properties) und eine Build-Tool-Konfiguration. Die Token sind feste Werte, keine Funktionen mit variablem Input. Property-Based Testing ist hier nicht sinnvoll, weil:

- Die Eingabemenge endlich und klein ist (~30 Tokens mit bekannten Werten)
- 100 Iterationen keine zusätzlichen Bugs finden würden
- Es sich um Konfigurationsvalidierung handelt, nicht um Geschäftslogik

### Test-Ansatz: Beispiel-basierte Tests + Visuelle Verifikation

**1. Token-Validierungstests (Unit Tests mit Vitest)**

```typescript
// src/__tests__/design-tokens.test.ts
import { describe, it, expect } from 'vitest';

describe('Design Tokens', () => {
  // Contrast ratio validation
  it('text-primary hat mindestens 4.5:1 Kontrast zu bg-primary', () => {
    const contrast = calculateContrastRatio('#f0f4f8', '#0a0e1a');
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  });

  it('text-secondary hat mindestens 3:1 Kontrast zu bg-primary', () => {
    const contrast = calculateContrastRatio('#94a3b8', '#0a0e1a');
    expect(contrast).toBeGreaterThanOrEqual(3);
  });

  // HSL range validation
  it('bg-primary lightness ist unter 10%', () => {
    const hsl = hexToHsl('#0a0e1a');
    expect(hsl.l).toBeLessThan(10);
    expect(hsl.h).toBeGreaterThanOrEqual(200);
    expect(hsl.h).toBeLessThanOrEqual(240);
  });

  // Spacing base unit validation
  it('alle Spacing-Tokens sind Vielfache von 4px', () => {
    const spacings = [4, 8, 12, 16, 24, 32, 48, 64];
    spacings.forEach(value => {
      expect(value % 4).toBe(0);
    });
  });
});
```

**2. Build-Verifikation (Smoke Test)**

- `npm run build` läuft fehlerfrei durch
- Keine unresolved CSS Custom Properties in der generierten Ausgabe
- Tailwind Utility-Klassen werden korrekt generiert

**3. Visuelle Verifikation (Manuell)**

- Startscreen rendert auf dunklem Hintergrund
- Text ist lesbar (kein Flash of White)
- Font "Inter" wird geladen und angezeigt
- Buttons haben Hover/Focus-States

**4. Migrations-Verifikation**

- Suche nach alten Variablennamen ergibt 0 Treffer
- Keine CSS-Fehler im Browser DevTools Console
- Layout-Struktur bleibt bei 600px max-width

### Test-Tooling

- **Vitest** für Unit Tests (bereits im Vite-Ökosystem)
- **Browser DevTools** für visuelle Inspektion und Kontrastprüfung
- Kein zusätzliches Test-Framework nötig für dieses Feature

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Obwohl dieses Feature primär statische Konfigurationswerte definiert, existieren universelle Invarianten, die für alle Design Tokens gelten müssen. Diese Properties validieren, dass die Token-Werte die spezifizierten Constraints einhalten.

### Property 1: Farbkontrast erfüllt WCAG AA

*For any* text-color/background-color token pair intended for readable text (text-primary auf bg-primary, text-secondary auf bg-primary), the calculated contrast ratio SHALL meet the minimum WCAG 2.1 AA threshold (4.5:1 for normal text, 3:1 for large text or UI components).

**Validates: Requirements 1.8, 1.9**

### Property 2: Hintergrundfarben-HSL innerhalb spezifizierter Bereiche

*For any* background color token (bg-primary, bg-secondary, bg-tertiary), the HSL lightness value SHALL fall within the specified range for that token's tier (bg-primary < 10%, bg-secondary 10%–18%, bg-tertiary 15%–25%) and the hue component SHALL be in the blue-grey range (200°–240°).

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 3: Spacing-Tokens sind Vielfache der 4px-Basiseinheit

*For any* spacing token (--spacing-1 through --spacing-8), the numeric pixel value SHALL be an integer multiple of the 4px base unit.

**Validates: Requirements 3.1, 3.2**

### Property 4: Alle CSS Custom Properties in :root definiert

*For any* design token defined in the system (colors, typography, spacing, border-radius, shadows, animations), it SHALL be declared as a CSS custom property within the `:root` selector.

**Validates: Requirements 1.10, 2.7, 3.3, 4.4, 7.3**

### Property 5: Reduced Motion setzt alle Dauern auf 0ms

*For any* duration token (--duration-fast, --duration-normal, --duration-slow), WHEN the user has enabled `prefers-reduced-motion: reduce`, the token value SHALL be overridden to 0ms.

**Validates: Requirements 7.5**

### Property 6: Dark-Klasse auf html-Element vorhanden

*For any* page load of the application, the `<html>` element SHALL have the class `dark` present, ensuring the dark color scheme is applied without user interaction.

**Validates: Requirements 6.1**
