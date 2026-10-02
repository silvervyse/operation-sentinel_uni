# ADR-006: Feature-basierte Ordnerstruktur

## Status

Accepted

## Context

Bei der Initialisierung der React-App musste entschieden werden, ob der Quellcode nach Dateityp (components/, hooks/, utils/) oder nach Feature (features/game/, features/menu/) organisiert wird.

## Decision

Der `src/`-Ordner verwendet eine feature-basierte Struktur. Gemeinsam genutzte Module (components/, hooks/, services/, types/, utils/) liegen auf oberster Ebene, während featurespezifischer Code unter `features/` gruppiert wird.

## Consequences

- Zusammengehöriger Code liegt nahe beieinander
- Features können unabhängig voneinander entwickelt und erweitert werden
- Gemeinsame Utilities bleiben zentral verfügbar
- Skaliert gut bei wachsender Anzahl von Features (z.B. weitere Level)
- Etwas mehr Ordnertiefe als eine flache Struktur
