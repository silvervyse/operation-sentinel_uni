# Requirements Document

## Einführung

Dieses Dokument spezifiziert die wiederverwendbaren Basis-UI-Komponenten für die gamifizierte IT-Security Awareness Anwendung. Die Komponenten bauen auf dem bestehenden Design System (Tailwind CSS v4, Design Tokens, Dark Cyber/Agent Theme) auf und stellen eine konsistente, zugängliche Komponentenbibliothek bereit.

Die Komponenten dienen als Bausteine für alle weiteren Feature-Screens (Levels, Ergebnisse, Navigation) und folgen dem visuellen Stil eines Geheimagenten-/Cyber-Security-Interfaces.

**Scope:** Button, Card, Badge, ProgressBar, IconWrapper
**Nicht im Scope:** Game-spezifische Komponenten, Layout, Navigation, Formulare

## Glossar

- **Button_Component**: Wiederverwendbare interaktive Schaltfläche mit Varianten (primary, secondary, ghost), Größen (sm, md, lg) und optionalem Lade- sowie Icon-Zustand
- **Card_Component**: Container-Komponente für inhaltliche Blöcke mit unterschiedlichen Elevationsstufen (shadow-sm, shadow-md, shadow-lg)
- **Badge_Component**: Kleine Status-Anzeige oder Label-Komponente zur Kennzeichnung von Zuständen (z.B. "Completed", "Locked", "New")
- **ProgressBar_Component**: Visuelle Fortschrittsanzeige als horizontaler Balken mit prozentualem Füllstand
- **IconWrapper_Component**: Wrapper-Komponente für lucide-react Icons zur konsistenten Größen- und Farbgebung
- **Design_Tokens**: Die im Design System definierten CSS Custom Properties (Farben, Spacing, Border-Radius, Schatten, Animationen)
- **Variant**: Visuelle Ausprägung einer Komponente (z.B. primary, secondary, ghost für Buttons)
- **Elevation**: Visuelle Tiefenwirkung eines Elements durch Schatten-Tokens (sm, md, lg)
- **WCAG_AA**: Web Content Accessibility Guidelines Level AA — Mindeststandard für barrierefreie Webinhalte

## Requirements

### Requirement 1: Button-Komponente

**User Story:** Als Entwickler möchte ich eine wiederverwendbare Button-Komponente mit verschiedenen Varianten und Größen, damit ich konsistente interaktive Elemente in der gesamten Anwendung einsetzen kann.

#### Acceptance Criteria

1. THE Button_Component SHALL render as a `<button>` HTML element with the appropriate variant styling applied via Tailwind utility classes
2. WHEN the variant prop is set to "primary", THE Button_Component SHALL apply the accent-primary background color with bg-primary text color
3. WHEN the variant prop is set to "secondary", THE Button_Component SHALL apply a transparent background with a visible border using accent-primary color
4. WHEN the variant prop is set to "ghost", THE Button_Component SHALL apply a transparent background with no border and text-secondary color
5. WHEN the size prop is set to "sm", THE Button_Component SHALL apply reduced padding (px-3 py-1) and smaller font size (text-sm)
6. WHEN the size prop is set to "md", THE Button_Component SHALL apply default padding (px-4 py-2) and base font size (text-base)
7. WHEN the size prop is set to "lg", THE Button_Component SHALL apply increased padding (px-6 py-3) and larger font size (text-lg)
8. WHEN the loading prop is true, THE Button_Component SHALL display a loading spinner indicator and disable pointer events
9. WHEN the disabled prop is true, THE Button_Component SHALL reduce opacity to 50% and disable pointer events
10. WHEN an icon prop is provided, THE Button_Component SHALL render the icon element alongside the button label with consistent spacing
11. THE Button_Component SHALL display a visible focus indicator using focus-visible outline with accent-primary color and 2px offset
12. WHEN the user hovers over the Button_Component, THE Button_Component SHALL apply a hover state transition with duration-fast timing
13. THE Button_Component SHALL export a typed ButtonProps interface including variant, size, loading, disabled, icon, and children props

### Requirement 2: Card-Komponente

**User Story:** Als Entwickler möchte ich eine Card-Komponente mit verschiedenen Elevationsstufen, damit ich Inhaltsblöcke visuell gruppieren und hervorheben kann.

#### Acceptance Criteria

1. THE Card_Component SHALL render as a `<div>` element with bg-secondary background color, rounded-lg border radius, and padding of spacing-4
2. WHEN the elevation prop is set to "sm", THE Card_Component SHALL apply the shadow-sm token
3. WHEN the elevation prop is set to "md", THE Card_Component SHALL apply the shadow-md token
4. WHEN the elevation prop is set to "lg", THE Card_Component SHALL apply the shadow-lg token
5. WHEN no elevation prop is provided, THE Card_Component SHALL default to the "md" elevation
6. THE Card_Component SHALL render children content within the container without imposing internal layout constraints
7. THE Card_Component SHALL accept an optional className prop to allow additional Tailwind utility classes to be applied
8. THE Card_Component SHALL export a typed CardProps interface including elevation, className, and children props

### Requirement 3: Badge-Komponente

**User Story:** Als Entwickler möchte ich eine Badge-Komponente für Status-Anzeigen, damit ich Spielzustände wie "Completed", "Locked" oder "New" visuell kennzeichnen kann.

#### Acceptance Criteria

1. THE Badge_Component SHALL render as an inline `<span>` element with rounded-full border radius, small padding (px-2 py-0.5), and text-xs font size
2. WHEN the variant prop is set to "success", THE Badge_Component SHALL apply the accent-secondary color as background with reduced opacity
3. WHEN the variant prop is set to "warning", THE Badge_Component SHALL apply the warning color as background with reduced opacity
4. WHEN the variant prop is set to "danger", THE Badge_Component SHALL apply the danger color as background with reduced opacity
5. WHEN the variant prop is set to "info", THE Badge_Component SHALL apply the accent-primary color as background with reduced opacity
6. WHEN the variant prop is set to "neutral", THE Badge_Component SHALL apply the bg-tertiary color as background
7. THE Badge_Component SHALL render children text content as the label
8. THE Badge_Component SHALL export a typed BadgeProps interface including variant and children props

### Requirement 4: ProgressBar-Komponente

**User Story:** Als Entwickler möchte ich eine ProgressBar-Komponente, damit ich den Fortschritt von Missionen und Scores visuell darstellen kann.

#### Acceptance Criteria

1. THE ProgressBar_Component SHALL render a container `<div>` with bg-tertiary background, rounded-full border radius, and a fixed height
2. THE ProgressBar_Component SHALL render an inner fill `<div>` whose width percentage corresponds to the value prop
3. WHEN the value prop is provided, THE ProgressBar_Component SHALL clamp the displayed width between 0% and 100%
4. THE ProgressBar_Component SHALL apply the accent-primary color as the fill bar background by default
5. WHEN the color prop is provided, THE ProgressBar_Component SHALL use the specified color token for the fill bar background
6. THE ProgressBar_Component SHALL apply a transition animation with duration-normal timing to width changes of the fill bar
7. THE ProgressBar_Component SHALL set role="progressbar", aria-valuenow, aria-valuemin of 0, and aria-valuemax of 100 on the container element
8. WHEN the size prop is set to "sm", THE ProgressBar_Component SHALL render with a height of 4px
9. WHEN the size prop is set to "md", THE ProgressBar_Component SHALL render with a height of 8px
10. WHEN the size prop is set to "lg", THE ProgressBar_Component SHALL render with a height of 12px
11. THE ProgressBar_Component SHALL export a typed ProgressBarProps interface including value, color, size, and className props

### Requirement 5: IconWrapper-Komponente

**User Story:** Als Entwickler möchte ich eine IconWrapper-Komponente, damit ich lucide-react Icons konsistent in Größe und Farbe in der Anwendung verwenden kann.

#### Acceptance Criteria

1. THE IconWrapper_Component SHALL render a lucide-react icon component passed via the icon prop
2. WHEN the size prop is set to "sm", THE IconWrapper_Component SHALL apply a 16px dimension to the icon
3. WHEN the size prop is set to "md", THE IconWrapper_Component SHALL apply a 20px dimension to the icon
4. WHEN the size prop is set to "lg", THE IconWrapper_Component SHALL apply a 24px dimension to the icon
5. WHEN no size prop is provided, THE IconWrapper_Component SHALL default to the "md" size of 20px
6. WHEN a color prop is provided, THE IconWrapper_Component SHALL apply the specified color to the icon stroke
7. WHEN no color prop is provided, THE IconWrapper_Component SHALL inherit the current text color via "currentColor"
8. THE IconWrapper_Component SHALL set aria-hidden="true" on the icon element by default for decorative icons
9. WHEN an ariaLabel prop is provided, THE IconWrapper_Component SHALL set role="img" and aria-label on the wrapping element instead of aria-hidden
10. THE IconWrapper_Component SHALL export a typed IconWrapperProps interface including icon, size, color, ariaLabel, and className props

### Requirement 6: Allgemeine Komponentenstandards

**User Story:** Als Entwickler möchte ich, dass alle UI-Komponenten einheitliche Qualitätsstandards erfüllen, damit die Codebasis wartbar und zugänglich bleibt.

#### Acceptance Criteria

1. THE Button_Component, Card_Component, Badge_Component, ProgressBar_Component, and IconWrapper_Component SHALL each be implemented as React functional components using TypeScript
2. THE Button_Component, Card_Component, Badge_Component, ProgressBar_Component, and IconWrapper_Component SHALL each export a named Props interface
3. THE Button_Component, Card_Component, Badge_Component, ProgressBar_Component, and IconWrapper_Component SHALL exclusively use Tailwind utility classes for styling without separate CSS files
4. THE Button_Component, Card_Component, Badge_Component, ProgressBar_Component, and IconWrapper_Component SHALL reference only Design_Tokens defined in the Design System (bg-secondary, bg-tertiary, accent-primary, accent-secondary, warning, danger, shadow-sm, shadow-md, shadow-lg, rounded-md, rounded-lg, rounded-full)
5. THE Button_Component, Card_Component, Badge_Component, ProgressBar_Component, and IconWrapper_Component SHALL each reside in the src/components/ directory as individual .tsx files
6. WHEN interactive elements receive keyboard focus, THE Button_Component SHALL display a visible focus-visible indicator meeting WCAG_AA contrast requirements
7. THE Button_Component and ProgressBar_Component SHALL include appropriate ARIA attributes for screen reader accessibility
