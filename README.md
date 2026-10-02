# Gamification IT Security Awareness

Ein browserbasiertes Serious Game zur Förderung der IT-Security-Awareness, entwickelt im Rahmen einer wissenschaftlichen Projektarbeit.

## Projektziel

Ziel des Projekts ist die prototypische Entwicklung einer gamifizierten Lernanwendung, die Mitarbeitende spielerisch für typische IT-Sicherheitsrisiken sensibilisiert.

Gleichzeitig untersucht das Projekt den Einsatz von **AI-assisted Vibe Coding** mit **Kiro** im Softwareentwicklungsprozess.

## Technologie

* React
* TypeScript
* Vite
* Kiro
* Git & GitHub
* GitHub Pages (Deployment)

## Projektstruktur

```text
.
├── .kiro/                 # Steering, Agenten und Kiro-Spezifikationen
├── docs/                  # Projektdokumentation
├── public/                # Statische Dateien
├── src/                   # Quellcode
└── README.md
```

## Entwicklungsprozess

Die Entwicklung erfolgt iterativ anhand einzelner Features.

Jedes Feature durchläuft folgenden Ablauf:

1. Fachliches Konzept
2. Kiro-Spezifikation
3. Implementierung
4. Code Review
5. Entwicklungsdokumentation
6. Pull Request
7. Merge nach `main`

## Dokumentation

Das Repository enthält neben dem Quellcode eine umfangreiche Projektdokumentation.

* `docs/concept/` – Spielkonzept und Lernziele
* `docs/adr/` – Projekt- und Architekturentscheidungen
* `docs/development-log/` – Dokumentation der Entwicklungssitzungen
* `docs/reviews/` – Code Reviews
* `docs/research/` – Forschungserkenntnisse
* `docs/prompts/` – Verwendete KI-Prompts

## Entwicklungsumgebung

Projekt starten:

```bash
npm install
npm run dev
```

Produktions-Build:

```bash
npm run build
```

## Lizenz

Dieses Repository wurde im Rahmen einer wissenschaftlichen Projektarbeit erstellt.
