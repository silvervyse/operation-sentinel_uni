# Requirements Document

## Introduction

Dieses Dokument spezifiziert das Application Layout für die gamifizierte IT-Security Awareness Anwendung. Das Layout ersetzt die bestehende einfache `Layout.tsx`-Wrapper-Komponente durch eine vollständige Anwendungsstruktur (Application Shell) mit Header, scrollbarem Hauptinhalt und optionaler Statusleiste.

Das Layout folgt dem visuellen Stil einer Agenten-Missionszentrale mit dunklem Hintergrund, dezenten Trennlinien und subtilen Glow-Effekten. Es ist mobile-first konzipiert (320px – 1440px) und verwendet ausschließlich Design Tokens und Tailwind Utility-Klassen.

**Scope:** AppShell, Header, MainContent, StatusBar
**Nicht im Scope:** Sidebar-Navigation, Routing-Logik, Settings-Modal, spielspezifische Screens

## Glossary

- **AppShell_Component**: Übergeordnete Wrapper-Komponente, die die gesamte Seitenstruktur (Header, MainContent, StatusBar) zusammenfasst und als flexibles Fullscreen-Layout rendert
- **Header_Component**: Fixierter Kopfbereich der Anwendung mit App-Branding, Status-Indikatoren und Agenten-thematischem Styling
- **MainContent_Component**: Scrollbarer Hauptinhaltsbereich mit zentriertem Container und begrenzter Maximalbreite
- **StatusBar_Component**: Optionale Fußleiste am unteren Bildschirmrand, die Missions-Fortschritt oder Spielerstatistiken anzeigt
- **Design_Tokens**: Die im Design System definierten CSS Custom Properties (Farben, Spacing, Border-Radius, Schatten, Animationen)
- **Viewport**: Der sichtbare Bereich des Browserfensters
- **Landmark**: Semantisches HTML5-Element (header, main, footer), das die Seitenstruktur für assistive Technologien definiert

## Requirements

### Requirement 1: AppShell-Komponente

**User Story:** Als Entwickler möchte ich eine AppShell-Komponente als übergeordneten Seiten-Wrapper, damit alle Screens der Anwendung eine einheitliche Struktur mit Header, Inhalt und optionaler Statusleiste erhalten.

#### Acceptance Criteria

1. THE AppShell_Component SHALL render as a flex container with column direction that occupies the full viewport height (100vh)
2. THE AppShell_Component SHALL render the Header_Component as the first child element
3. THE AppShell_Component SHALL render the MainContent_Component as the second child element containing the passed children
4. WHEN the showStatusBar prop is true, THE AppShell_Component SHALL render the StatusBar_Component as the last child element
5. WHEN the showStatusBar prop is false or not provided, THE AppShell_Component SHALL not render the StatusBar_Component
6. THE AppShell_Component SHALL apply bg-primary as the background color
7. THE AppShell_Component SHALL accept a children prop of type ReactNode for flexible content injection into MainContent_Component
8. THE AppShell_Component SHALL export a typed AppShellProps interface including children, showStatusBar, statusBarProps, and headerProps

### Requirement 2: Header-Komponente

**User Story:** Als Spieler möchte ich einen stets sichtbaren Header mit App-Branding und meinem aktuellen Status sehen, damit ich mich in der Agenten-Missionszentrale orientieren kann.

#### Acceptance Criteria

1. THE Header_Component SHALL render as a `<header>` HTML landmark element with a fixed height that does not scroll with the page content
2. THE Header_Component SHALL display the application title text within the header area
3. THE Header_Component SHALL apply bg-secondary as the background color
4. THE Header_Component SHALL render a bottom border with accent-primary color at 20% opacity to create a subtle glow separator effect
5. THE Header_Component SHALL apply horizontal padding using spacing-4 on mobile and spacing-6 on viewports wider than 768px
6. THE Header_Component SHALL vertically center its content using flexbox alignment
7. THE Header_Component SHALL arrange its children in a row with the title on the left side and status indicators on the right side
8. WHEN a score prop is provided, THE Header_Component SHALL display the current score value in the status area on the right side
9. WHEN a missionBadge prop is provided, THE Header_Component SHALL display the mission badge content in the status area
10. THE Header_Component SHALL export a typed HeaderProps interface including title, score, and missionBadge props

### Requirement 3: MainContent-Komponente

**User Story:** Als Entwickler möchte ich einen scrollbaren Hauptinhaltsbereich mit zentriertem Container, damit Spielinhalte konsistent dargestellt werden und der Content bei langen Seiten scrollbar bleibt.

#### Acceptance Criteria

1. THE MainContent_Component SHALL render as a `<main>` HTML landmark element
2. THE MainContent_Component SHALL expand to fill all remaining vertical space between the Header_Component and the StatusBar_Component (or the viewport bottom if no StatusBar is present)
3. THE MainContent_Component SHALL enable vertical scrolling when content exceeds the available height
4. THE MainContent_Component SHALL render an inner container with a maximum width of 600px (using the --max-width design token) centered horizontally
5. THE MainContent_Component SHALL apply vertical padding of spacing-4 and horizontal padding of spacing-4 on mobile viewports
6. WHEN the viewport width exceeds 768px, THE MainContent_Component SHALL apply horizontal padding of spacing-6
7. THE MainContent_Component SHALL render children content within the centered container without imposing additional layout constraints
8. THE MainContent_Component SHALL export a typed MainContentProps interface including children and an optional className prop

### Requirement 4: StatusBar-Komponente

**User Story:** Als Spieler möchte ich während einer aktiven Mission meinen Fortschritt am unteren Bildschirmrand sehen, damit ich jederzeit weiß, wie weit ich in der Mission fortgeschritten bin.

#### Acceptance Criteria

1. THE StatusBar_Component SHALL render as a `<footer>` HTML landmark element with a fixed height at the bottom of the viewport
2. THE StatusBar_Component SHALL apply bg-secondary as the background color
3. THE StatusBar_Component SHALL render a top border with accent-primary color at 20% opacity to create a subtle glow separator effect consistent with the Header_Component
4. THE StatusBar_Component SHALL apply horizontal padding using spacing-4 on mobile and spacing-6 on viewports wider than 768px
5. THE StatusBar_Component SHALL vertically center its content using flexbox alignment
6. WHEN a progress prop is provided, THE StatusBar_Component SHALL display a progress indicator showing the current mission progress value
7. WHEN a label prop is provided, THE StatusBar_Component SHALL display the label text alongside the progress indicator
8. THE StatusBar_Component SHALL apply an entry animation using opacity transition with duration-normal timing when first rendered
9. THE StatusBar_Component SHALL export a typed StatusBarProps interface including progress, label, and an optional className prop

### Requirement 5: Responsive Verhalten

**User Story:** Als Spieler möchte ich die Anwendung auf verschiedenen Geräten (Smartphone, Tablet, Desktop) komfortabel nutzen, damit ich unabhängig vom Gerät IT-Security-Missionen absolvieren kann.

#### Acceptance Criteria

1. THE AppShell_Component SHALL render a single-column stacked layout on all viewport widths from 320px to 1440px
2. WHEN the viewport width is less than 768px, THE Header_Component and MainContent_Component SHALL apply compact padding using spacing-4
3. WHEN the viewport width is 768px or greater, THE Header_Component and MainContent_Component SHALL apply expanded padding using spacing-6
4. THE MainContent_Component SHALL constrain the inner content container to a maximum width of 600px on all viewport sizes
5. THE AppShell_Component SHALL not render a sidebar navigation element on any viewport width

### Requirement 6: Zugänglichkeit und Semantik

**User Story:** Als Entwickler möchte ich, dass das Layout semantisch korrekte HTML-Landmarks verwendet, damit Screenreader-Nutzer die Seitenstruktur navigieren können.

#### Acceptance Criteria

1. THE Header_Component SHALL use the `<header>` HTML element to mark the page header landmark
2. THE MainContent_Component SHALL use the `<main>` HTML element to mark the primary content landmark
3. THE StatusBar_Component SHALL use the `<footer>` HTML element to mark the page footer landmark
4. THE AppShell_Component SHALL ensure that exactly one `<main>` landmark exists in the rendered page structure
5. WHEN keyboard focus moves to an interactive element within the layout, THE AppShell_Component SHALL not trap or interfere with the natural tab order

### Requirement 7: Allgemeine Komponentenstandards

**User Story:** Als Entwickler möchte ich, dass alle Layout-Komponenten einheitliche Qualitätsstandards erfüllen, damit die Codebasis wartbar und konsistent bleibt.

#### Acceptance Criteria

1. THE AppShell_Component, Header_Component, MainContent_Component, and StatusBar_Component SHALL each be implemented as React functional components using TypeScript
2. THE AppShell_Component, Header_Component, MainContent_Component, and StatusBar_Component SHALL each export a named Props interface
3. THE AppShell_Component, Header_Component, MainContent_Component, and StatusBar_Component SHALL exclusively use Tailwind utility classes for styling without separate CSS files
4. THE AppShell_Component, Header_Component, MainContent_Component, and StatusBar_Component SHALL reference only Design_Tokens defined in the Design System (bg-primary, bg-secondary, accent-primary, spacing-4, spacing-6, duration-normal, --max-width)
5. THE AppShell_Component, Header_Component, MainContent_Component, and StatusBar_Component SHALL each reside in the src/components/ directory as individual .tsx files
6. WHEN the user has enabled prefers-reduced-motion, THE StatusBar_Component SHALL skip the entry animation by applying zero duration
