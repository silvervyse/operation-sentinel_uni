# Mission-Konzept: Operation Codebreaker

## Übersicht

| Eigenschaft | Wert |
|---|---|
| Missionsname | Operation Codebreaker |
| Thema | Passwortsicherheit |
| Missionsnummer | 1 |
| Geschätzte Spielzeit | 15–20 Minuten |
| Schwierigkeit | Einsteiger |
| Zielgruppe | Mitarbeitende ohne technischen Hintergrund |

---

## Lernziele

Nach Abschluss der Mission sollen Spieler:

1. Verstehen, warum persönliche Informationen keine sicheren Passwörter ergeben
2. Erkennen, dass Passwörter auf Notizzetteln ein Sicherheitsrisiko sind
3. Verstehen, warum Passwort-Muster (Sommer2023 → Sommer2024) unsicher sind
4. Wissen, dass einfache Passwörter in Sekunden geknackt werden können
5. Ein sicheres Passwort nach aktuellen Empfehlungen erstellen können

---

## Spielfluss

```text
┌─────────────────┐
│ Mission Briefing │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Tutorial-Level  │  (geführt, immer zuerst)
└────────┬────────┘
         ▼
┌─────────────────┐
│ Laptop-Szenarien │  (randomisierte Reihenfolge)
│  4–5 Laptops    │
│  + Feedback      │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Eigenes Passwort │  (Verschlüsselungsaufgabe)
│    erstellen     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Abschluss-Quiz  │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Bewertung &      │
│ Badge-Vergabe    │
└─────────────────┘
```

---

## Phase 1: Mission Briefing

Der Agent erhält einen Einsatzbefehl:

> "Agent, wir haben mehrere kompromittierte Geräte sichergestellt. Ihre Aufgabe: Zugang zu den verschlüsselten Daten erlangen. Nutzen Sie die Akten der Zielpersonen, um deren Passwörter zu rekonstruieren. Anschließend sichern Sie die gewonnenen Daten mit einer eigenen Verschlüsselung."

---

## Phase 2: Tutorial-Level

### Zweck
- Einführung in die Spielmechanik
- Zeigt dem Spieler, wie Hinweise in der Akte genutzt werden
- Immer der erste Laptop, wird nicht randomisiert

### Ablauf
1. Laptop wird angezeigt mit Passwort-Eingabefeld
2. System zeigt: "Öffne die Akte der Zielperson"
3. Akte öffnet sich → Hinweise werden hervorgehoben
4. System erklärt: "Kombiniere die Informationen zu einem möglichen Passwort"
5. Spieler gibt Passwort ein (mit Hilfestellungen)
6. Erfolg + kurze Erklärung

### Tutorial-Szenario
- **Akte zeigt**: Name "Max Müller", Geburtsjahr 1990
- **Passwort**: `Max1990`
- **Lektion**: Vor- und Nachname + Geburtsjahr sind leicht zu erraten

---

## Phase 3: Laptop-Szenarien

### Szenario 1: Haustiername + Geburtsdatum

**Mechanik**: Point-and-Click auf Akte → Informationen sammeln → Passwort kombinieren

**Akte enthält**:
- Foto mit Haustier (Name steht auf Halsband oder in Social-Media-Post)
- Geburtsdatum der Zielperson

**Passwort-Schema**: `[Tiername][Geburtsjahr]` z.B. "Bello2001"

**Eingabe**: Spieler tippt das vermutete Passwort ein

**Feedback**:
> "Passwort geknackt! Persönliche Daten wie Haustiernamen und Geburtstage sind in sozialen Medien leicht auffindbar. Ein Angreifer braucht dafür nur wenige Minuten Recherche."

---

### Szenario 2: Passwortnotiz auf Foto

**Mechanik**: Point-and-Click auf ein Foto der Wohnung → Post-it finden → Passwort ablesen

**Akte enthält**:
- Foto eines Schreibtischs / Monitors
- Irgendwo im Bild ist ein Post-it mit dem Passwort sichtbar

**Interaktion**: Spieler muss das Post-it im Bild finden (klicken)

**Passwort**: Wird vom Post-it abgelesen (z.B. "Sonne!2024")

**Feedback**:
> "Passwort gefunden! Physische Notizen von Passwörtern sind ein häufiges Sicherheitsrisiko. Verwende stattdessen einen Passwort-Manager."

---

### Szenario 3: Passwort-Pattern erkennen

**Mechanik**: Alte, bereits geknackte Passwörter sind in der Akte sichtbar → Muster erkennen → aktuelles erraten

**Akte enthält**:
- Frühere Passwörter: "Sommer2022", "Sommer2023"
- Hinweis: "Passwort wurde kürzlich geändert"

**Passwort**: `Sommer2024` (oder aktuelles Jahr)

**Feedback**:
> "Muster erkannt! Vorhersagbare Passwort-Änderungen (nur Jahreszahl ändern) bieten keinen echten Schutz. Verwende bei jedem Wechsel ein komplett neues Passwort."

---

### Szenario 4: Sehr einfaches Passwort (Brute-Force-Simulation)

**Mechanik**: Kein manuelles Erraten → Spieler startet eine simulierte Brute-Force-Attacke

**Akte enthält**:
- Hinweis: "Zielperson ist technisch wenig versiert"
- Keine nützlichen persönlichen Infos

**Interaktion**:
1. Spieler klickt "Wörterbuchangriff starten"
2. Animation zeigt durchlaufende Passwörter
3. Nach wenigen Sekunden: "Passwort gefunden: Hallo1234"
4. Anzeige: "Geknackt in 0,3 Sekunden"

**Feedback**:
> "Dieses Passwort steht in den Top 100 der meistverwendeten Passwörter. Ein automatisierter Angriff knackt es in unter einer Sekunde."

---

### Szenario 5: Keyboard-Pattern

**Mechanik**: Akte zeigt Hinweise auf "einfache Merkstrategie", Spieler muss das Pattern auf einer virtuellen Tastatur erkennen

**Akte enthält**:
- Notiz: "Ich merke mir Passwörter mit der Tastatur"
- Hinweis auf die Reihe (z.B. "Immer von links nach rechts")

**Passwort**: `qwertz123` oder `asdfgh`

**Feedback**:
> "Tastaturmuster sind eines der ersten Dinge, die Angreifer testen. Sie bieten keine Sicherheit, auch wenn sie zufällig aussehen."

---

### Szenario 6: Passwort-Wiederverwendung

**Mechanik**: In der Akte steht, dass die Zielperson dasselbe Passwort überall nutzt. Ein altes Datenleck wird referenziert.

**Akte enthält**:
- Meldung: "E-Mail-Adresse in Datenleck XY aufgetaucht"
- Geleaktes Passwort ist sichtbar

**Passwort**: Das geleakte Passwort funktioniert auch hier

**Feedback**:
> "Credential Stuffing: Wenn ein Passwort einmal geleakt wird und überall verwendet wird, sind alle Konten kompromittiert. Verwende für jeden Dienst ein eigenes Passwort."

---

## Phase 4: Eigenes Passwort erstellen

### Kontext
> "Agent, Sie haben alle Daten gesichert. Verschlüsseln Sie die Dateien jetzt mit einem eigenen, sicheren Passwort."

### Mechanik
1. Passwort-Eingabefeld wird angezeigt
2. Echtzeit-Stärkeanzeige (Balken + Text)
3. Checkliste mit Mindestanforderungen:
   - [ ] Mindestens 12 Zeichen
   - [ ] Groß- und Kleinbuchstaben
   - [ ] Mindestens eine Zahl
   - [ ] Mindestens ein Sonderzeichen
   - [ ] Kein Wort aus dem Wörterbuch
   - [ ] Keine persönlichen Informationen
4. Bewertung: Schwach / Mittel / Stark / Sehr stark

### Bewertung für Stern
- "Sehr stark" → Stern wird vergeben
- Darunter → Hinweis, was verbessert werden könnte

---

## Phase 5: Abschluss-Quiz

### Format
- 5 Multiple-Choice-Fragen
- Zufällige Auswahl aus einem Pool von 10+ Fragen
- Sofortiges Feedback nach jeder Frage

### Beispielfragen

**Frage 1**: Welches Passwort ist am sichersten?
- a) Sommer2024
- b) qwertz123
- c) K7$mP!x9Lw2n
- d) MaxMüller1990

**Frage 2**: Was ist die beste Strategie für Passwörter?
- a) Ein starkes Passwort überall verwenden
- b) Für jeden Dienst ein eigenes, starkes Passwort mit Passwort-Manager
- c) Passwörter auf Post-its am Monitor notieren
- d) Jedes Jahr eine Zahl hochzählen

**Frage 3**: Ein Datenleck hat dein Passwort veröffentlicht. Was tust du?
- a) Nichts, das Passwort ist ja stark
- b) Nur bei dem betroffenen Dienst ändern
- c) Bei allen Diensten ändern, wo es verwendet wurde
- d) Den Computer neu starten

**Frage 4**: Wie lange braucht ein Computer, um "Hallo1234" zu knacken?
- a) Mehrere Jahre
- b) Einige Tage
- c) Unter einer Sekunde
- d) Das ist unknackbar

**Frage 5**: Welche Information sollte NICHT in einem Passwort vorkommen?
- a) Zufällige Sonderzeichen
- b) Name des Haustieres
- c) Zufällige Buchstabenkombinationen
- d) Generierte Passphrase

### Bewertung für Stern
- Alle Fragen richtig → Stern
- Weniger → Hinweis auf Fehler, kein Stern

---

## Randomisierungs-Pools

### Haustiernamen
```
["Bello", "Luna", "Max", "Milo", "Nala", "Rocky", "Buddy", "Coco", "Felix", "Simba"]
```

### Vornamen für Zielpersonen
```
["Thomas", "Sarah", "Michael", "Julia", "Andreas", "Laura", "Stefan", "Anna", "Martin", "Lisa"]
```

### Nachnamen
```
["Müller", "Schmidt", "Weber", "Fischer", "Wagner", "Becker", "Hoffmann", "Schneider", "Meyer", "Koch"]
```

### Geburtsjahre
```
[1975, 1980, 1982, 1985, 1988, 1990, 1992, 1995, 1998, 2000]
```

### Jahreszahlen für Patterns
```
[2022, 2023, 2024, 2025]
```

### Saisonale Wörter für Patterns
```
["Sommer", "Winter", "Frühling", "Herbst", "Januar", "Urlaub", "Ferien"]
```

### Einfache Passwörter (Top-Liste)
```
["Hallo1234", "Passwort1", "123456789", "password", "iloveyou", "admin123"]
```

### Keyboard-Patterns
```
["qwertz123", "asdfgh", "1qay2wsx", "yxcvbn", "qwert12345"]
```

### Laptop-Reihenfolge
- Tutorial immer zuerst
- Restliche 5 Szenarien werden zufällig gemischt
- Pro Durchlauf werden 4 von 5 regulären Szenarien ausgewählt (Variation)

---

## Bewertungssystem

### 3-Sterne-System

| Stern | Bedingung | Kriterium |
|-------|-----------|-----------|
| ⭐ 1 | Alle Laptops geknackt | Alle präsentierten Szenarien erfolgreich gelöst |
| ⭐ 2 | Starkes eigenes Passwort | Bewertung "Sehr stark" bei der Verschlüsselungsaufgabe |
| ⭐ 3 | Perfektes Quiz | Alle Quiz-Fragen korrekt beantwortet |

### Badge-Vergabe
- **3 Sterne** → Badge "Codebreaker" wird freigeschaltet
- **Weniger als 3 Sterne** → Mission kann wiederholt werden
- Badge-Status wird im LocalStorage gespeichert

### Fehlversuche bei Laptops
- Pro Laptop: 3 Versuche
- Nach 3 Fehlversuchen: Hinweis wird gegeben
- Laptop gilt trotzdem als "geknackt" (mit Hilfe), aber:
  - Bei mehr als 1 Laptop mit Hilfe → Stern 1 wird nicht vergeben

---

## UI-Konzept (Screens)

### Screen 1: Mission Briefing
- Vollbild-Overlay mit Briefing-Text
- Typewriter-Effekt
- "Mission annehmen"-Button

### Screen 2: Laptop-Ansicht
- Zentraler Laptop (stilisiert)
- Login-Screen auf dem Laptop
- Passwort-Eingabefeld
- Button: "Akte öffnen" (Seitenleiste)

### Screen 3: Akten-Panel
- Slide-in von rechts oder als Overlay
- Informationen der Zielperson
- Fotos, Notizen, Social-Media-Ausschnitte
- Hinweise visuell hervorgehoben (subtle glow)

### Screen 4: Brute-Force-Animation
- Terminal-artiger Screen
- Passwörter laufen schnell durch
- Fortschrittsbalken
- Ergebnis wird angezeigt mit Zeitangabe

### Screen 5: Feedback-Screen
- Nach jedem geknackten Laptop
- Rote/Gelbe Warnung: "So unsicher war dieses Passwort"
- Kurze Lerninfo
- "Weiter zum nächsten Laptop"-Button

### Screen 6: Passwort-Erstellung
- Großes Eingabefeld
- Echtzeit-Stärkebalken
- Checkliste mit Live-Validierung
- Bestätigungs-Button

### Screen 7: Quiz
- Frage + 4 Antwortmöglichkeiten
- Visuelles Feedback (grün/rot)
- Fortschrittsanzeige (Frage 1/5)

### Screen 8: Ergebnis / Bewertung
- 3 Sterne (ausgefüllt oder leer)
- Badge-Animation bei 3 Sternen
- "Wiederholen" oder "Zurück zur Zentrale"-Button

---

## Datenstruktur (Vorschlag)

```typescript
interface MissionScenario {
  id: string;
  type: 'personal-info' | 'physical-note' | 'pattern' | 'brute-force' | 'keyboard' | 'reuse';
  targetPerson: TargetPerson;
  hints: Hint[];
  passwordTemplate: string;
  feedback: FeedbackInfo;
}

interface TargetPerson {
  firstName: string;
  lastName: string;
  birthYear: number;
  petName?: string;
  photo?: string;
}

interface MissionProgress {
  missionId: string;
  scenariosCompleted: string[];
  hintsUsed: number;
  passwordStrength: number;
  quizScore: number;
  stars: number;
  badgeEarned: boolean;
  completedAt?: string;
}
```

---

## Erweiterungsmöglichkeiten (Post-MVP)

- Zusätzliche Szenarien (Social Engineering, Phishing-Kombination)
- Schwierigkeitsgrade (leichtere/schwierigere Hinweise)
- Zeitdruck-Modus
- Leaderboard (lokal)
- Passwort-Manager-Tutorial als Bonus-Level
- 2FA-Erklärung als Zusatzinhalt

---

## Nächste Schritte (Feature-Zerlegung)

1. **Feature: Mission-Datenstruktur** → TypeScript-Interfaces und Randomisierungs-Logik
2. **Feature: Tutorial-Level** → Geführter erster Laptop
3. **Feature: Laptop-UI** → Laptop-Ansicht + Akte + Eingabe
4. **Feature: Szenarien 1-3** → Persönliche Infos, Notiz, Pattern
5. **Feature: Szenario 4** → Brute-Force-Animation
6. **Feature: Szenarien 5-6** → Keyboard + Wiederverwendung
7. **Feature: Passwort-Erstellung** → Eigenes Passwort + Bewertung
8. **Feature: Quiz** → Fragenpool + Auswertung
9. **Feature: Bewertung & Badge** → Sterne-System + LocalStorage
10. **Feature: Polish** → Animationen, Sound, Übergänge
