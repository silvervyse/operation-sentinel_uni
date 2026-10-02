# Steering: Dependency & Implementation Rules

## General Principle

Work in small, understandable steps. Do not implement large, complex changes all at once.

Before making major architectural or dependency changes, explain briefly:

* what you are changing
* why it is needed
* which files are affected

## Package Installation

If required libraries are missing, you may install them yourself.

Only install packages that are actually needed for the current implementation step.

Prefer established, well-maintained open-source libraries.

For this project, preferred libraries are:

* shadcn/ui for reusable UI components
* lucide-react for icons
* motion for animations
* Tailwind CSS for styling

Do not add unnecessary UI frameworks or duplicate libraries.

## After Installing Packages

After each installation or configuration change:

* verify that the project still starts
* run a build or type check if available
* fix resulting errors before continuing

Document newly added dependencies briefly:

* package name
* purpose
* where it is used

## Implementation Style

Build the game foundation before implementing full gameplay.

Prioritize:

1. clean project structure
2. reusable components
3. maintainable game state
4. data-driven missions
5. simple placeholder assets

Do not focus on visual polish too early.

Use placeholders for images, sounds and animations where possible.

## Architecture Rules

The game should support multiple future missions, for example:

* secure passwords
* phishing
* social engineering
* USB security
* multi-factor authentication

Mission content should be data-driven where possible.

Avoid hardcoding mission-specific logic directly into global components.

Keep reusable UI components separate from mission-specific components.

## Design Direction

The visual style should feel like:

* secret agent mission
* cyber security
* mission control
* hacker terminal
* modern dark interface

Avoid:

* boring office-training look
* corporate e-learning style
* childish comic style
* pixel art

## Quality Rules

Use TypeScript types for important data structures.

Keep components small and readable.

Avoid overengineering.

Prefer simple, working implementations over complex abstractions.

After each meaningful step, summarize:

* what was implemented
* what was changed
* how to test it
* what the next recommended step is
