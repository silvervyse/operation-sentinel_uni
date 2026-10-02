# Session 003b

## Datum

08.07.2026

## Dauer

ca. 3–4 Stunden

## Ziel der Session

Implementierung des kompletten Laptop-Hacking-Systems als erster spielbarer Teil von Mission 1.

## Bearbeitete Aufgaben

- **MissionTutorial**: Einführungssequenz für die Laptop-Untersuchung
- **MissionLaptopLevel**: Hauptkomponente für das Laptop-Hacking-Gameplay
- **laptop-level-config.ts**: Konfigurationsdatei mit 5 Laptops (datengetrieben)
- **Passwort-Knack-Mechanik**: Spieler müssen unsichere Passwörter auf den Laptops erraten/knacken
- **Hintergründe**: Visuelle Hintergründe für die Laptop-Szenen
- **Post-its mit Hinweisen**: Hinweise auf den Laptops als Post-it-Notizen dargestellt
- **Fortschrittsanzeige**: Anzeige des aktuellen Fortschritts innerhalb des Levels

## Wichtige Entscheidungen

| Entscheidung | Begründung |
|---|---|
| Datengetriebene Level-Konfiguration | Die 5 Laptops werden über eine zentrale Konfigurationsdatei definiert. Ermöglicht einfaches Erweitern ohne Code-Änderungen. |
| Post-it-Hinweissystem | Verbindet Spielmechanik (Hinweise finden) mit realistischem Szenario (unsichere Passwörter auf Zetteln). |
| 5 Laptops mit steigender Schwierigkeit | Passwörter werden progressiv schwieriger, was den Lerneffekt stufenweise aufbaut. |
| Passwort-Knack-Mechanik als Kernspiel | Der Spieler lernt durch das Knacken, warum bestimmte Passwörter unsicher sind. |

## AI-Unterstützung

### Wo konnte Kiro selbstständig arbeiten?

- Erstellung der Komponentenstruktur (MissionTutorial, MissionLaptopLevel)
- Generierung der laptop-level-config mit 5 Laptops
- UI für Post-its, Fortschrittsanzeige und Hintergründe
- Passwort-Eingabe-Mechanik

### Wo musste manuell eingegriffen werden?

- Inhaltliche Gestaltung der Passwörter und Hinweise
- Abstimmung der Schwierigkeitsgrade
- Spielfluss und Übergänge zwischen den Laptops

## Erkenntnisse

- Datengetriebener Ansatz bewährt sich: Trennung von Level-Konfiguration und Darstellungslogik macht das System erweiterbar
- Post-it als Hinweissystem ist eine kreative Lösung, die Spielmechanik und realistisches Szenario verbindet
- Große Features in einem Commit funktionieren mit AI-Unterstützung, atomare Commits wären aber besser nachvollziehbar

## Bewertung

| Kriterium | Bewertung (1–5) | Kommentar |
|-----------|-----------------|-----------|
| Unterstützung durch Kiro | 5 | Komplettes Feature-Set in einer Session generiert |
| Qualität der Ergebnisse | 4 | Funktionierendes Laptop-Hacking-System |
| Manuelle Nacharbeit | 2 | Hauptsächlich inhaltliche Anpassungen |
| Zeitersparnis | 4 | Hohe Zeitersparnis durch vollständige Feature-Generierung |

## Nächste Schritte

- Checkpoint-System implementieren
- Zweiten Teil von Mission 1 entwickeln (Passwort-Erstellung)
- Missionsflow definieren (Tutorial → Laptops → nächster Abschnitt)
