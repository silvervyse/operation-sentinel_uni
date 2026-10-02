# Structure Steering

## Purpose

This repository separates application code, documentation and Kiro configuration to keep the project maintainable and easy to navigate.

---

## Repository Structure

```text
/
├── .kiro/
│   ├── agents/
│   ├── hooks/
│   ├── specs/
│   └── steering/
│
├── docs/
│   ├── architecture/
│   ├── concept/
│   ├── decisions/
│   ├── prompts/
│   ├── research/
│   ├── reviews/
│   └── screenshots/
│
├── public/
├── src/
│
├── .gitignore
├── package.json
└── README.md
```

---

## Application Structure

The React application follows this structure:

```text
src/
├── assets/
├── components/
├── features/
│   ├── game/
│   ├── menu/
│   └── results/
├── hooks/
├── services/
├── types/
├── utils/
│
├── App.tsx
├── App.css
├── main.tsx
└── index.css
```

---

## Folder Responsibilities

### `.kiro/`

Contains all AI-related project configuration.

- **agents/** → Custom AI agents for specialized tasks
- **steering/** → Project knowledge and development guidelines
- **specs/** → Feature specifications created by Kiro
- **hooks/** → Optional automation hooks

### `docs/`

Contains all project documentation.

- **architecture/** → Technical architecture documentation
- **concept/** → Game design and learning concept
- **decisions/** → Architecture Decision Records (ADRs)
- **prompts/** → Important prompts used during development
- **research/** → Development session logs and research findings
- **reviews/** → Code review reports
- **screenshots/** → Images for README and documentation

### `src/`

Contains the complete application source code.

### `public/`

Contains static assets such as images, icons and fonts.

---

## Architecture Decision Records (ADR)

Grundlegende technische, methodische und fachliche Entscheidungen werden als einzelne Architecture Decision Records (ADR) dokumentiert.

Speicherort:

```text
docs/decisions/
```

Namensschema:

```text
ADR-001-frontend-only.md
ADR-002-local-storage.md
ADR-003-technology-stack.md
...
```

Vor jeder Implementierung sollen bestehende ADRs berücksichtigt werden.

Falls eine neue grundlegende Entscheidung getroffen wird, ist ein neuer ADR zu erstellen.

Bestehende ADRs werden nicht überschrieben. Änderungen werden durch einen neuen ADR dokumentiert, der auf den vorherigen verweist.

---

## General Principles

- Keep documentation separate from source code.
- Keep game logic independent from UI components.
- Organize files by responsibility.
- Prefer small, understandable modules over large files.
- Keep the repository suitable for GitHub Pages deployment.
