# ADR-001: Frontend Only

## Status

Accepted

## Context

The project is a university research prototype with limited development time and budget. A backend would add complexity in hosting, authentication, and deployment without providing clear value for the research goal.

## Decision

The application will be implemented as a frontend-only single-page application with no backend or server-side logic.

## Consequences

- Simple deployment via GitHub Pages
- No user accounts or centralized data collection
- All data stays in the user's browser
- No need for server infrastructure or maintenance
- Limits future features like shared leaderboards or admin dashboards (acceptable for MVP)
