# Evaluation: AI-gestützte Entwicklung eines gamifizierten IT-Security Trainings

## 1. Projekteckdaten

| Kennzahl | Wert |
|----------|------|
| Projektname | Operation Sentinel |
| Zeitraum | 28. Juni – 15. Juli 2026 (18 Kalendertage) |
| Aktive Entwicklungstage | 8 Tage |
| Geschätzte Gesamtarbeitszeit | ca. 30–35 Stunden |
| Ergebnis | Spielbarer MVP (Version 0.1.0) mit 1 vollständiger Mission |
| Tech-Stack | React, TypeScript, Vite, Tailwind CSS, Motion, jsPDF |
| Spielzeit pro Durchlauf | ca. 20–30 Minuten |
| Lines of Code (Applikation) | ca. 8.000–10.000 |
| Komponenten | 30+ React-Komponenten |
| Screens | 15+ verschiedene Bildschirme |

---

## 2. Zeitaufwand im Detail

### 2.1 Session-Übersicht

| Session | Datum | Dauer | Inhalt |
|---------|-------|-------|--------|
| 000 | 28.06.2026 | 2–3h | Projektsetup, Repository, ADRs, Steering, Vite-Init |
| 001 | 04.07.2026 | 1,5h | Design System, UI Components, Game State, Layout, Navigation (5 Specs) |
| 002 | 04.07.2026 | 1h | Hauptmenü mit Audio, Animationen, Glitch-Effekt |
| 003 | 06.07.2026 | 5h | Onboarding, Charakter-Auswahl, Sound-Slider, Agentenakte, Badge-Zeremonie |
| 003a | 07.07.2026 | 5h | Missionsmenü-Erweiterung, Tutorial-Beginn |
| 003b | 08.07.2026 | 3–4h | Laptop-Hacking-System (5 Level) |
| 003c | 09.07.2026 | 7h | Password-Creation, Checkpoint-System, Quiz (10+1 Fragen) |
| 004 | 15.07.2026 | 6–7h | Badge-Zeremonie, Sterne-System, Freischaltungen, Agentenakte, Zertifikat, Randomisierung, Dokumentation |

**Gesamtdauer: ca. 31–35 Stunden**

### 2.2 Zeitverteilung nach Kategorie (geschätzt)

| Kategorie | Anteil | Stunden |
|-----------|--------|---------|
| Konzept & Design-Entscheidungen | 15% | ~5h |
| Prompting & Kommunikation mit Kiro | 25% | ~8h |
| Implementierung (AI-gestützt) | 35% | ~11h |
| Visuelle Feinabstimmung & Bugfixes | 15% | ~5h |
| Asset-Erstellung (extern) | 5% | ~2h |
| Dokumentation | 5% | ~2h |

---

## 3. Vergleich: Entwicklungszeit mit vs. ohne AI

### 3.1 Geschätzte konventionelle Entwicklungszeit

Basierend auf Industrie-Benchmarks für vergleichbare Projekte:

| Referenz | Schätzung |
|----------|-----------|
| Einfaches Browser-Spiel mit Polish (Branchenstandard) | 3–6 Wochen Vollzeit ([Quora-Umfrage, 2026](https://www.quora.com/How-much-time-does-it-take-to-build-a-simple-online-game-on-an-existing-website-aimed-at-8-12-year-olds)) |
| E-Learning-Entwicklung pro Stunde Inhalt (interaktiv) | 72–197 Stunden ([Chapman Alliance / BlueCarrot, 2026](https://bluecarrot.io/blog/rapid-elearning-content-development/)) |
| MVP Browser-Game (erfahrener Entwickler) | 2–5 Wochen Vollzeit |
| Feature-rich Indie (2–5 Personen) | 6–12 Monate / 1.000–2.000 Personenstunden |

**Konservative Schätzung für Operation Sentinel ohne AI:**

Für einen erfahrenen Einzelentwickler mit Kenntnissen in React, Game Design und didaktischer Konzeption:

| Aufgabe | Geschätzter Aufwand (ohne AI) |
|---------|-------------------------------|
| Projektsetup & Architektur | 4–6h |
| Design System & UI Components | 15–20h |
| Hauptmenü & Navigation | 8–12h |
| Onboarding (Charakter, Dialoge, Badge) | 20–30h |
| Mission 1: Laptop-Hacking (5 Level) | 25–35h |
| Mission 1: Password-Creation | 20–30h |
| Mission 1: Quiz-System | 15–20h |
| Agentenakte & Tools | 15–20h |
| Missionsfortschritt & Zeremonie | 15–20h |
| Zertifikat-Generierung | 8–12h |
| Sound, Animationen, Polish | 15–20h |
| Testing & Bugfixes | 10–15h |
| **Gesamt** | **170–240h** |

### 3.2 Zeitersparnis-Faktor

| Metrik | Wert |
|--------|------|
| Tatsächliche Entwicklungszeit (mit AI) | ~33h |
| Geschätzte konventionelle Zeit (ohne AI) | ~170–240h |
| **Zeitersparnis-Faktor** | **5x – 7x** |
| Äquivalent in Arbeitswochen (40h/Woche) | 4–6 Wochen → 1 Woche |

### 3.3 Einschränkungen der Schätzung

- Die konventionelle Schätzung geht von einem erfahrenen Einzelentwickler aus
- Assets (Bilder, Sounds) wurden extern erstellt (ChatGPT, Free Sounds) und sind nicht in der Entwicklungszeit enthalten
- Ein Team aus 2–3 Spezialisten (Designer, Entwickler, Didaktiker) könnte konventionell schneller sein
- Die AI-gestützte Entwicklung erfordert Erfahrung im Prompting und Konzeptarbeit

---

## 4. AI-Tools und ihre Rollen

| Tool | Einsatzbereich | Anteil |
|------|---------------|--------|
| **Kiro** (IDE + AI-Agents) | Implementierung, Spec-Erstellung, Code-Generierung, Debugging, Refactoring | 70% der Entwicklungsarbeit |
| **ChatGPT** | Asset-Erstellung (Bilder), Konzept-Sparring, Dialog-Texte | 20% |
| **Eigene Konzeptarbeit** | Spieldesign, Didaktik, Entscheidungen, Feinabstimmung | 10% |

### 4.1 Kiro – Stärken

- Vollständige Feature-Implementierung aus natürlichsprachiger Beschreibung
- Konsistente Code-Qualität und TypeScript-Typsicherheit
- Schnelles Scaffolding komplexer Komponenten
- Automatische Build-Verifikation nach jeder Änderung
- Spec-Workflow (Requirements → Design → Tasks) für strukturierte Entwicklung
- Kontextbewusstsein durch Steering-Dateien

### 4.2 Kiro – Schwächen

- Visuelles Feintuning erfordert viele Iterationen ("3cm nach rechts", "etwas größer")
- CSS-Specificity-Probleme nicht immer beim ersten Versuch gelöst
- Neigt zu Überkomplexität bei einfachen Aufgaben
- Manchmal werden Änderungen an der falschen Stelle gemacht
- Animationsprobleme (initial={false} Bug) erfordern Debugging

### 4.3 ChatGPT (Bildgenerierung)

- Alle Spielgrafiken wurden mit ChatGPT (DALL-E) erstellt
- Charakter-Illustrationen, Hintergründe, UI-Elemente, Badges
- Konsistenter Stil durch iteratives Prompting
- Keine Lizenzkosten für Assets

---

## 5. Was lief gut

### Technisch
- **Spec-Driven Development** funktionierte exzellent: 5 Features in 1,5h (Session 001)
- **Datengetriebene Architektur**: Quiz-Fragen, Level-Konfigurationen, Dialoge als externe Dateien
- **Checkpoint-System**: Saubere Trennung von Spielfortschritt und Speicherung
- **Component-basierte Struktur**: Wiederverwendbare Komponenten für verschiedene Screens
- **TypeScript**: Typsicherheit verhinderte viele potenzielle Bugs

### Prozessual
- **Iterative Entwicklung**: Feature für Feature aufbauen statt alles auf einmal
- **Branch-basierte Entwicklung**: Jedes Feature in eigenem Branch mit PR
- **Steering-Dateien**: Permanenter Kontext für konsistente AI-Ausgaben
- **Frühes Spielgefühl**: Bereits nach Session 001 ein spielbarer Prototyp

### Gamification
- **Narrative Einbettung** gibt dem Training Charakter und unterscheidet es von E-Learning
- **Sofortiges Feedback** beim Passwort-Analyzer motiviert zum Experimentieren
- **3-Sterne-System** erzeugt klaren Wiederspielwert
- **Zertifikat-Funktion** schafft Verbindung zum realen Unternehmenskontext

---

## 6. Was lief schlecht / Herausforderungen

### Technisch
- **CSS/Layout-Feintuning**: Größenangaben, Abstände und Positionierung erforderten viele manuelle Iterationen
- **Animation-Bugs**: `initial={false}` in Motion, Direktorin-Größensprung bei Posenwechsel
- **localStorage-Management**: Viele Keys die bei Profil-Löschung vergessen wurden
- **Keine automatisierten Tests für Spiellogik**: Quiz, Checkpoints, Score-Berechnung ungetestet

### Prozessual
- **Fehlende Session-Dokumentation**: Sessions 003a–003c mussten rückwirkend rekonstruiert werden
- **Große Commits**: Teilweise wurde ein ganzes Feature in einem Commit zusammengefasst
- **Kein formales Testing**: Manuelles Testen des Spielflows statt automatisierter E2E-Tests

### Inhaltlich
- **Nur 1 Mission im MVP**: Weitere Missionen (Social Engineering, Phishing) sind konzeptionell geplant aber nicht umgesetzt
- **Keine echte Zertifikat-Verifizierung**: UUID + Hash sind ohne Backend nicht verifizierbar
- **Kein Accessibility-Audit**: WCAG-Konformität wurde nicht systematisch geprüft

---

## 7. Implikationen für den Unternehmenskontext

### 7.1 Vorteile gegenüber klassischen Schulungen

| Aspekt | Klassisches E-Learning | Operation Sentinel |
|--------|----------------------|-------------------|
| Engagement | Passiv, wird als Pflicht empfunden | Aktiv, spielerisch motivierend |
| Wissensvermittlung | Lesen + Multiple Choice | Hands-on: Passwörter knacken und erstellen |
| Nachhaltigkeit | Schnell vergessen | Erfahrungsbasiert, Tools bleiben nutzbar |
| Nachweis | Teilnahmebestätigung | Leistungsbasiertes Zertifikat (nur bei Bestehen) |
| Wiederspielwert | Keiner | Randomisierung, Sterne, Rang-System |
| Kosten pro Teilnehmer | Lizenzen für Plattform | Einmalige Entwicklung, statisches Hosting |

### 7.2 Deployment-Szenario

- Statisches Hosting (GitHub Pages, Intranet, CDN)
- Kein Server, keine Datenbank, keine DSGVO-relevante Datenerhebung
- Anpassbar pro Unternehmen (Markdown-basierte Inhalte, CSS-Tokens)
- Zertifikat-Inhalte über externe Markdown-Datei steuerbar

### 7.3 Skalierbarkeit

- Weitere Missionen als zusätzliche Daten-Dateien hinzufügbar
- Modularer Aufbau ermöglicht themenspezifische Pakete
- Backend-Erweiterung für Verifizierung und Reporting möglich
- Multi-Mandanten-Fähigkeit durch theming denkbar

---

## 8. Fazit

### Kernaussagen

1. **AI-gestützte Entwicklung beschleunigt die Prototyp-Erstellung um den Faktor 5–7x** gegenüber konventioneller Einzelentwicklung.

2. **Die Qualität ist MVP-tauglich**, erfordert aber menschliche Feinabstimmung bei visuellen Details und Gameplay-Entscheidungen.

3. **Gamification im Security-Training funktioniert**: Narrative Einbettung, sofortiges Feedback und Sterne-System erzeugen Engagement, das klassische E-Learnings nicht bieten.

4. **Der Vibe-Coding-Ansatz eignet sich besonders für Prototypen**: Schnelle Iteration, explorative Entwicklung und direkte Kommunikation mit der AI ermöglichen rasches Ausprobieren von Ideen.

5. **Grenzen der AI**: Kreative Entscheidungen (Spieldesign, Didaktik, UX), visuelles Feintuning und Qualitätssicherung bleiben beim Menschen.

### Ausblick

Der MVP demonstriert die Machbarkeit eines gamifizierten IT-Security-Trainings als browserbasierte Anwendung. Für einen produktiven Einsatz im Unternehmen wären folgende Schritte nötig:

- Weitere Missionen (Social Engineering, Phishing, Netzwerksicherheit)
- Backend für Zertifikat-Verifizierung und Reporting
- Accessibility-Audit und Barrierefreiheit
- Professionelles UX-Testing mit Zielgruppe
- Content-Review durch IT-Security-Experten
- Mobile-Optimierung

---

## 9. Quellen

- Toda, A.M. et al. (2019): Analysing gamification elements in educational environments. [Smart Learning Environments](https://link.springer.com/10.1186/s40561-019-0106-1)
- ISACA (2020): Using Gamification to Improve the Security Awareness of Users. [ISACA Journal](https://www.isaca.org/resources/isaca-journal/issues/2020/volume-4/using-gamification-to-improve-the-security-awareness-of-users)
- PMC (2024): A systematic mapping study on gamification within ISA programs. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11467640/)
- Chapman Alliance / BlueCarrot (2026): E-Learning Development Ratios. [BlueCarrot](https://bluecarrot.io/blog/rapid-elearning-content-development/)
- Deci, E.L. & Ryan, R.M. (2000): Self-Determination Theory and the Facilitation of Intrinsic Motivation.

---

*Dieses Dokument wurde als Teil einer Projektarbeit zur Evaluation eines AI-gestützten Vibe-Coding-Ansatzes erstellt. Stand: 15. Juli 2026.*
