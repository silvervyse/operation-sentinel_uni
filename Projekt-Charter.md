# PROJECT CHARTER

## Projekt

**Gamification IT Security Awareness**

Browserbasierter Prototyp eines Serious Games zur spielerischen Vermittlung von IT-Security-Awareness.

---

# Vision

Entwicklung eines motivierenden, browserbasierten Lernspiels, das Mitarbeitenden typische IT-Sicherheitsrisiken anhand realistischer Alltagssituationen vermittelt.

Gleichzeitig dient das Projekt als Forschungsgegenstand zur Untersuchung des AI-assisted Vibe Coding-Ansatzes mit Kiro im Softwareentwicklungsprozess.

---

# Zielgruppe

Die Anwendung richtet sich an Mitarbeitende ohne technischen Hintergrund.

Die Zielgruppe

* verfügt über unterschiedliche IT-Kenntnisse,
* nimmt regelmäßig an Security-Awareness-Schulungen teil,
* soll durch spielerische Interaktion nachhaltiger lernen als durch klassische E-Learning-Angebote.

---

# Lernziele

Der Prototyp soll den Nutzer befähigen,

* Phishing-Nachrichten zu erkennen,
* typische Social-Engineering-Angriffe zu identifizieren,
* sichere Entscheidungen im digitalen Arbeitsalltag zu treffen,
* sicherheitsrelevante Risiken besser einzuschätzen.

---

# Projektziel

Entwicklung eines funktionsfähigen MVP, der

* spielbar ist,
* browserbasiert läuft,
* lokal gespeichert werden kann,
* ohne Backend funktioniert,
* später über GitHub Pages veröffentlicht werden kann.

Zusätzlich soll der gesamte Entwicklungsprozess wissenschaftlich dokumentiert werden.

---

# MVP

Der MVP umfasst ausschließlich:

* Startbildschirm
* erstes spielbares Level (Phishing)
* einfache Navigation
* unmittelbares Feedback
* Punktesystem
* lokale Speicherung mittels Local Storage
* Ergebnisbildschirm

---

# Nice-to-have

Folgende Funktionen können umgesetzt werden, sind jedoch **nicht Bestandteil des MVP**:

* mehrere Level
* Story-Modus
* Badges
* Achievements
* Animationen
* Soundeffekte
* Highscore
* Dark Mode
* Fortschrittsübersicht
* weitere IT-Security-Themen

---

# Nicht Bestandteil des Projekts

Folgende Funktionen werden bewusst ausgeschlossen:

* Backend
* Datenbank
* Benutzerkonten
* Cloud-Synchronisation
* Multiplayer
* Administratorbereich
* Echtzeitkommunikation
* produktiver Unternehmenseinsatz

---

# Erfolgsdefinition

Das Projekt gilt als erfolgreich, wenn

* ein funktionsfähiger browserbasierter Prototyp entwickelt wurde,
* mindestens ein vollständiges spielbares Level existiert,
* der Entwicklungsprozess mittels Kiro nachvollziehbar dokumentiert wurde,
* der AI-gestützte Entwicklungsprozess wissenschaftlich ausgewertet werden kann.

---

# Entwicklungsprinzipien

Während der Entwicklung gelten folgende Grundsätze:

* MVP vor Vollständigkeit
* Einfachheit vor Komplexität
* Kleine Features vor großen Implementierungen
* Dokumentation ist Bestandteil der Entwicklung
* Entscheidungen werden als ADR dokumentiert
* Jede größere Funktion erhält eine eigene Kiro-Spezifikation
* Änderungen erfolgen über Feature-Branches und Pull Requests

---

# Scope-Grenze

Bei jeder neuen Idee wird geprüft:

1. Unterstützt sie das Lernziel?
2. Unterstützt sie die Forschungsfrage?
3. Ist sie für den MVP erforderlich?

Kann mindestens eine dieser Fragen nicht eindeutig mit **Ja** beantwortet werden, wird die Idee zunächst zurückgestellt und als mögliche Erweiterung dokumentiert.
