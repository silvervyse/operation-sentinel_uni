# Dokumentation: Operation Sentinel – Gamifiziertes IT-Security Awareness Training

## 1. Projektübersicht

**Operation Sentinel** ist ein browserbasierter Proof of Concept für ein gamifiziertes IT-Security Awareness Training. Die Anwendung richtet sich an Mitarbeitende ohne technischen Hintergrund im Unternehmenskontext und vermittelt grundlegendes Wissen zur Passwortsicherheit durch interaktives, szenariobasiertes Gameplay.

Das Spiel ist als Einzelspieler-Erfahrung konzipiert, läuft vollständig clientseitig im Browser und speichert den Fortschritt lokal. Es benötigt kein Backend, keine Registrierung und erhebt keine personenbezogenen Daten während des Spielens.

---

## 2. Zielgruppe und Einsatzkontext

### Zielgruppe
- Mitarbeitende in Unternehmen ohne IT-Fachkenntnisse
- Erwachsene im beruflichen Kontext
- Teilnehmende an verpflichtenden IT-Security-Schulungen

### Einsatzkontext
- Unternehmensinterne Awareness-Kampagnen
- Onboarding neuer Mitarbeitender
- Regelmäßige Auffrischung von Sicherheitswissen
- Nachweis absolvierter Schulungen gegenüber Führungskräften/HR

### Abgrenzung zu klassischen E-Learnings
Traditionelle Security-Awareness-Trainings setzen häufig auf passive Wissensvermittlung (Videos, Texte, Multiple-Choice-Tests). Studien zeigen, dass solche Formate oft als Pflichtübung wahrgenommen werden und kaum nachhaltiges Verhalten ändern ([ISACA, 2020](https://www.isaca.org/resources/isaca-journal/issues/2020/volume-4/using-gamification-to-improve-the-security-awareness-of-users)). Operation Sentinel setzt stattdessen auf aktives Entdecken, Ausprobieren und unmittelbares Feedback.

---

## 3. Gamification-Mechanismen

Die verwendeten Gamification-Elemente orientieren sich an etablierten Taxonomien für gamifizierte Lernumgebungen (vgl. [Toda et al., 2019](https://link.springer.com/10.1186/s40561-019-0106-1)) und lassen sich in folgende Kategorien einteilen:

### 3.1 Narrative und Immersion

| Element | Umsetzung |
|---------|-----------|
| **Rahmenhandlung** | Spieler agiert als Cyber-Agent in einer Geheimdienstorganisation |
| **Charakter-Erstellung** | Wahl eines Avatars und Codenames – erzeugt persönliche Bindung |
| **NPC-Interaktion** | Director Nova begleitet als Mentorin mit Typewriter-Dialogen |
| **Missions-Metapher** | Lerneinheiten werden als „Operationen" präsentiert |
| **Thematisches UI** | Dunkles Cyber-Agent-Interface statt E-Learning-Optik |

Die narrative Einbettung adressiert das psychologische Grundbedürfnis nach *Relatedness* (Zugehörigkeit) aus der Self-Determination Theory (SDT) von Deci & Ryan. Spielende fühlen sich als Teil einer Geschichte und handeln für ein übergeordnetes Ziel.

### 3.2 Fortschrittssystem

| Element | Umsetzung |
|---------|-----------|
| **Sterne-Bewertung** | 3-Sterne-System pro Mission (Laptop-Hacking, Verschlüsselung, Quiz) |
| **Ränge** | Rekrut → Agent (erweiterbar) |
| **Badges** | Visuelle Auszeichnungen in der Agentenakte |
| **Agentenakte** | Persönliches Profil mit Fortschrittsübersicht |
| **Badge-Zeremonie** | Feierliche Verleihung nach Missionsabschluss |

Das Fortschrittssystem adressiert das Bedürfnis nach *Competence* (Kompetenzerleben). Spielende sehen ihre Entwicklung visualisiert und erhalten klare Meilensteine.

### 3.3 Herausforderung und Feedback

| Element | Umsetzung |
|---------|-----------|
| **Laptop-Hacking** | Interaktive Passwort-Knack-Szenarien mit steigender Schwierigkeit |
| **Passwort-Analyzer** | Echtzeit-Feedback bei eigener Passworterstellung |
| **Abschlussquiz** | Zeitlimitiertes Quiz mit 10 Fragen + Bonusfrage |
| **Sofortiges Feedback** | Richtig/Falsch-Anzeige mit Erklärungen |
| **Schwierigkeitsprogression** | Von einfachen zu komplexen Passwort-Konzepten |

### 3.4 Autonomie und Wiederspielwert

| Element | Umsetzung |
|---------|-----------|
| **Missionswiederholung** | Einzelne Teile (Hacking, Verschlüsselung, Quiz) separat wiederholbar |
| **Checkpoint-System** | Spieler können unterbrechen und fortsetzen |
| **Randomisierung** | Quiz-Fragen und Antworten werden bei jedem Durchlauf gemischt |
| **Optionaler Passwortmanager** | Spieler entscheiden selbst über Tool-Nutzung |
| **Freier Zugang** | Agentenakte und Passwort-Analyzer jederzeit zugänglich |

Die freie Wahl der Reihenfolge und die Möglichkeit zur Wiederholung adressieren das Bedürfnis nach *Autonomy*. Spielende bestimmen ihr eigenes Tempo.

### 3.5 Belohnungssystem

| Element | Umsetzung |
|---------|-----------|
| **Soundeffekte** | Erfolgs- und Fehlersounds bei Stern-Enthüllung |
| **Animationen** | Badge-Verleihung mit Spring-Animation |
| **Rang-Aufstieg** | Sichtbarer Fortschritt im Profil |
| **Zertifikat** | PDF-Download als realer Nachweis |
| **Freischaltungen** | Nächste Mission wird nach Abschluss freigeschaltet |

---

## 4. Didaktisches Konzept und Wissensvermittlung

### 4.1 Learning by Doing

Das zentrale didaktische Prinzip ist **handlungsorientiertes Lernen**. Statt Regeln zur Passwortsicherheit zu lesen, erleben Spielende aktiv:

1. **Laptop-Hacking-Phase**: Spieler knacken unsichere Passwörter und erfahren dabei, *warum* bestimmte Muster unsicher sind (kurze Passwörter, Wörterbucheinträge, persönliche Informationen, Tastaturmuster)

2. **Passwort-Erstellungs-Phase**: Spieler müssen selbst sichere Passwörter erstellen und erhalten unmittelbares Feedback durch den Analyzer. Die Anforderungen steigen stufenweise:
   - Datei 1: Nur Buchstaben → Bedeutung der Länge
   - Datei 2: Max. 13 Zeichen → Bedeutung der Entropie
   - Datei 3: Kein Wörterbuchwort → Wörterbuchattacken
   - Datei 4: Streng vertraulich → Kombination aller Kriterien
   - Datei 5: Passphrase → Alternative Strategie

3. **Quiz-Phase**: Prüfung des Transferwissens in neuen Kontexten (situative Fragen statt reines Faktenwissen)

### 4.2 Scaffolding (gestufte Unterstützung)

- Tooltips geben bei Bedarf Hinweise
- Die Direktorin erklärt Konzepte narrativ eingebettet
- Der Passwort-Analyzer zeigt die Bewertungskriterien transparent
- Die Schwierigkeit steigt progressiv

### 4.3 Transferwissen

Das Quiz prüft nicht nur Faktenwissen, sondern situatives Urteilsvermögen:
- „Ein Kollege klebt sein Passwort an den Monitor – wie bewertest du das?"
- „Du verwendest dasselbe Passwort für Banking und Streaming – welches Risiko besteht?"

Diese Szenarien spiegeln reale Alltagssituationen wider und fördern den Transfer ins Arbeitsumfeld.

### 4.4 Vermittelte Lerninhalte (Mission 1)

- Erkennen sicherer und unsicherer Passwörter
- Typische Schwachstellen (persönliche Informationen, Tastaturmuster, kurze Passwörter)
- Bedeutung von Passwortlänge und Entropie
- Gefahren der Passwortwiederverwendung
- Sichere Passphrasen als Alternative
- Passwortmanager als Unterstützung
- Brute-Force- und Wörterbuchattacken verstehen
- Grundlagen zum Schutz digitaler Benutzerkonten

---

## 5. Wiederspielwert und nachhaltige Nutzung

### 5.1 Motivatoren für wiederholtes Spielen

| Motivator | Mechanismus |
|-----------|-------------|
| **3-Sterne-Herausforderung** | Spieler mit 2 Sternen werden motiviert, das Quiz erneut zu bestehen |
| **Randomisiertes Quiz** | Fragen und Antworten ändern sich bei jedem Durchlauf |
| **Rang-System** | Rang kann verloren gehen und muss ggf. neu verdient werden |
| **Freier Passwort-Analyzer** | Dauerhaft nutzbar zum Prüfen eigener Passwörter im Alltag |
| **Selektive Wiederholung** | Nur einzelne Teile wiederholen statt die gesamte Mission |

### 5.2 Langfristige Verankerung

- Die Agentenakte dient als **Nachschlagewerk** mit Missionsbriefing
- Der Passwort-Analyzer bleibt auch nach dem Training **dauerhaft verfügbar** als Alltagstool
- Das Zertifikat erzeugt **Verbindlichkeit** gegenüber der eigenen Leistung

---

## 6. Zertifikat-Funktion im Unternehmenskontext

### 6.1 Zweck

Die Zertifikat-Funktion ermöglicht es Mitarbeitenden, einen PDF-Nachweis über ihr absolviertes Training herunterzuladen. Dies dient:

- Der Dokumentation gegenüber Führungskräften und HR
- Der Erfüllung von Compliance-Anforderungen
- Der persönlichen Erfolgsdokumentation

### 6.2 Inhalte des Zertifikats

- Datum und Uhrzeit des Abschlusses
- Name der/des Mitarbeitenden
- E-Mail-Adresse
- Name der Führungskraft
- Bearbeitete Inhalte (aus externer Markdown-Datei – vom Unternehmen anpassbar)
- Ergebnis des Abschlussquiz (Prozentzahl)

### 6.3 Sicherheitsmerkmale

- **Einzigartige Zertifikat-ID** (UUID) pro Download
- **SHA-256 Hash** über die Zertifikatsdaten (ermöglicht spätere Verifizierung bei Backend-Erweiterung)
- **Wasserzeichen** („Operation Sentinel – Verifiziertes Zertifikat") als visuelles Echtheitszeichen

### 6.4 Voraussetzung

Das Zertifikat ist erst verfügbar, wenn alle Missionen mit 3 Sternen (volle Punktzahl) abgeschlossen wurden. Dies stellt sicher, dass nur nachweislich erfolgreiche Schulungsteilnahmen zertifiziert werden.

---

## 7. Theoretische Einordnung

### Self-Determination Theory (Deci & Ryan)

Die Anwendung adressiert gezielt die drei psychologischen Grundbedürfnisse:

| Bedürfnis | Umsetzung in Operation Sentinel |
|-----------|-------------------------------|
| **Autonomie** | Freie Wahl der Wiederholung, eigenes Tempo, optionale Tools |
| **Kompetenz** | Sterne, Ränge, steigender Schwierigkeitsgrad, unmittelbares Feedback |
| **Zugehörigkeit** | Narrative Einbettung, Charakter-Identifikation, Mentorin-Beziehung |

### Flow-Theorie (Csikszentmihalyi)

Die progressive Schwierigkeit und das unmittelbare Feedback zielen darauf ab, Spielende in einen Flow-Zustand zu versetzen – eine Balance zwischen Herausforderung und Fähigkeit, die optimales Lernen ermöglicht.

---

## 8. Technische Umsetzung

| Aspekt | Technologie |
|--------|-------------|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Animationen | Motion (Framer Motion) |
| PDF-Generierung | jsPDF |
| Persistenz | localStorage |
| Build-Tool | Vite |
| Hosting | GitHub Pages (statisch) |
| Icons | Lucide React |

---

## 9. Erweiterungsmöglichkeiten

- Weitere Missionen (Social Engineering, Phishing)
- Leaderboard für Teams (benötigt Backend)
- Verifizierungs-Server für Zertifikate
- Anpassbare Inhalte pro Unternehmen
- Multi-Language Support
- Accessibility-Verbesserungen
- Mobile-Optimierung

---

## 10. Quellen und weiterführende Literatur

- Toda, A.M. et al. (2019): Analysing gamification elements in educational environments using an existing Gamification taxonomy. [Smart Learning Environments](https://link.springer.com/10.1186/s40561-019-0106-1)
- ISACA (2020): Using Gamification to Improve the Security Awareness of Users. [ISACA Journal](https://www.isaca.org/resources/isaca-journal/issues/2020/volume-4/using-gamification-to-improve-the-security-awareness-of-users)
- Deci, E.L. & Ryan, R.M. (2000): Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being.
- PMC (2024): A systematic mapping study on gamification within information security awareness programs. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11467640/)
- Landers, R.N. (2015): Developing a Theory of Gamified Learning. [ResearchGate](https://www.researchgate.net/publication/268632276_Developing_a_Theory_of_Gamified_Learning)

---

*Dieses Dokument wurde im Rahmen einer Projektarbeit zur Evaluation eines AI-gestützten Vibe-Coding-Ansatzes mit Kiro erstellt.*
