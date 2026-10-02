# ADR-004: KI-gestützte Entwicklung

## Status

Akzeptiert

## Kontext

Dieses Projekt verfolgt zwei Ziele: den Bau eines funktionsfähigen Prototyps und die Evaluation eines KI-gestützten Entwicklungsworkflows (Vibe Coding) mit Kiro im Rahmen einer Projektarbeit.

## Entscheidung

Kiro wird als primärer KI-Entwicklungsassistent während des gesamten Projekts eingesetzt. Der KI-gestützte Workflow wird dokumentiert, einschließlich Prompts, Entscheidungen und Ergebnisse.

## Konsequenzen

- Der Entwicklungsprozess ist Teil des Forschungsergebnisses
- Prompts und Entscheidungen müssen für die Projektarbeit dokumentiert werden
- Die Projektstruktur muss KI-Tooling unterstützen (klare Trennung, Steering-Dateien)
- Die Entwicklungsgeschwindigkeit hängt teilweise vom KI-Token-Budget ab
- Reproduzierbarkeit und Transparenz des Prozesses sind wichtig

| Werkzeug   | Zweck                     | Begründung                                                |
| ---------- | ------------------------- | --------------------------------------------------------- |
| Kiro       | Agentische Entwicklung    | Zentrales Entwicklungswerkzeug                            |
| GitHub MCP | Versionsverwaltung        | Zugriff auf Repository und Entwicklungsprozess            |
| Git        | Versionskontrolle         | Nachvollziehbarkeit                                       |
| ChatGPT    | Methodische Unterstützung | Reflexion, Agentendesign, wissenschaftliche Dokumentation |
