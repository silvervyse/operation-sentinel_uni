# Session 003c

## Datum

09.07.2026

## Dauer

ca. 7 Stunden (13:25–19:58)

## Ziel der Session

Fertigstellung von Mission 1: Password-Creation-Level, Checkpoint-System, Quiz-System und Gesamtorchestrierung des Missionsflusses.

## Bearbeitete Aufgaben

### MissionPasswordCreation

- 5 Dateien verschlüsseln mit steigender Schwierigkeit
- Passwort-Analyzer zur Bewertung der erstellten Passwörter
- Direktorin-Dialoge als narratives Element
- Einführung des Passphrase-Konzepts
- Passwortmanager-Dialog als Abschluss

### Checkpoint-Service

- Speicherpunkte innerhalb der Mission
- Fortsetzen an der letzten Position
- Wiederholung mit verschiedenen Einstiegspunkten
- Mission-Restart-Flow

### Mission1Flow Controller

- Orchestrierung: Tutorial → Laptops → Password-Creation → Quiz
- Steuerung der Übergänge zwischen den Abschnitten
- Integration mit Checkpoint-Service

### Abschlussquiz

- 10 Fragen + 1 Bonusfrage zur Passwortsicherheit
- Timer-Mechanik (3 Minuten)
- Direktorin-Intro vor dem Quiz
- Ergebnisansicht mit Auswertung pro Frage
- quiz-data.ts mit allen Fragen

## Wichtige Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Checkpoint-System | Ermöglicht Unterbrechung und Wiederaufnahme ohne Fortschrittsverlust. Wichtig für den Unternehmenskontext. |
| Mission1Flow als Controller | Trennung von Content-Komponenten und Flow-Steuerung. Wartbar und erweiterbar für zukünftige Missionen. |
| Passphrase-Konzept | Geht über typische "verwende Sonderzeichen"-Schulungen hinaus. Vermittelt moderne Passwort-Strategien. |
| Passwort-Analyzer als Spielmechanik | Echtzeit-Feedback bei eigener Erstellung. Aktives Lernen statt passives Konsumieren. |
| Datengetriebene Quiz-Fragen | quiz-data.ts enthält alle Fragen zentral. Leicht erweiterbar und wartbar. |
| Timer im Quiz | Erzeugt Spannung und realitätsnahe Prüfungssituation. |

## AI-Unterstützung

### Wo konnte Kiro selbstständig arbeiten?

- Generierung der Quiz-Fragen und -Logik
- UI-Komponenten für Passwort-Analyzer
- Checkpoint-Service-Implementierung
- Mission1Flow-Controller-Struktur
- Ergebnisansicht mit Auswertung

### Wo musste manuell eingegriffen werden?

- Inhaltliche Gestaltung der Direktorin-Dialoge
- Fachliche Korrektheit der Quiz-Fragen zur Passwortsicherheit
- Feinabstimmung der Schwierigkeitsgrade beim Verschlüsseln
- Definition der Checkpoint-Positionen
- Reihenfolge und Übergänge im Mission-Flow

## Erkenntnisse

- **Produktive Session durch klare Struktur**: Aufteilung in drei abgegrenzte Features ermöglichte effizientes Arbeiten
- **Mission1Flow als Orchestrator ist ein gutes Pattern**: Trennung von Content und Flow macht das System wartbar
- **Datengetriebene Inhalte bewähren sich erneut**: quiz-data.ts und Passwort-Konfigurationen leicht anpassbar
- **Passphrase-Ansatz didaktisch wertvoll**: Geht über Standard-Schulungen hinaus
- **Direktorin als narratives Element**: Gibt Kontext und Motivation, macht Lernen weniger trocken
- **Hohe Entwicklungsgeschwindigkeit mit AI**: Drei komplexe Features an einem Tag ohne AI kaum realistisch

## Bewertung

| Kriterium | Bewertung (1–5) | Kommentar |
|-----------|-----------------|-----------|
| Unterstützung durch Kiro | 5 | Drei komplexe Features in einer Session |
| Qualität der Ergebnisse | 4 | Gute Strukturierung, datengetrieben |
| Manuelle Nacharbeit | 3 | Inhaltliche Prüfung der Fragen und Dialoge nötig |
| Zeitersparnis | 5 | Ohne AI wäre dieser Umfang an einem Tag nicht möglich |

## Offene Punkte

- Unit-Tests für Quiz-Auswertung und Checkpoint-Service fehlen
- Badge-Vergabe nach Missionsabschluss noch nicht implementiert
- Audio/Sound-Integration für Mission 1 noch offen

## Nächste Schritte

- Gesamttest des Mission-1-Flows
- Badge-System und Belohnung nach Abschluss
- Bugfixes und Feinschliff
