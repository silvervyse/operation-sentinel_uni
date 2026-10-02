# ADR-002: Local Storage

## Status

Accepted

## Context

The application needs to persist user progress (scores, completed levels) between sessions. Since there is no backend, a browser-native persistence mechanism is required.

## Decision

Use the browser's localStorage API to persist game progress locally.

## Consequences

- No personal data leaves the user's device
- Progress is tied to a single browser/device
- No login or registration required
- Data can be lost if the user clears browser data
- Simple to implement with no external dependencies
- Privacy-friendly by design
