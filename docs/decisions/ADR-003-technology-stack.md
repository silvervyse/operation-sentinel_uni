# ADR-003: Technology Stack

## Status

Accepted

## Context

The prototype needs a modern, lightweight frontend stack that is well-supported by AI coding tools and suitable for static deployment.

## Decision

Use the following technology stack:

- **React** – Component-based UI library
- **TypeScript** – Type safety and better developer experience
- **Vite** – Fast build tool with minimal configuration
- **GitHub Pages** – Static hosting

## Consequences

- Widely known stack with strong AI tooling support
- Fast development feedback loop with Vite's hot module replacement
- TypeScript catches errors early and improves code documentation
- No vendor lock-in for hosting
- Minimal configuration required to get started
