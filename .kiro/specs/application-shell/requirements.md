# Requirements: Application Shell

## Überblick

Das Application Shell Feature bildet das grundlegende Anwendungsgerüst des Security-Awareness-Games. Es stellt die Basis-Infrastruktur bereit, auf der spätere Features (Level, Scoring, Fortschrittsspeicherung) aufbauen.

---

## Anforderungen

### REQ-1: Bereinigung der Vite-Demo-Inhalte

Die von `npm create vite@latest` generierten Demo-Inhalte (Counter, Logos, Links) werden entfernt. Nach der Bereinigung zeigt die Anwendung ausschließlich eigene Inhalte.

**Akzeptanzkriterien:**
- [ ] Keine Vite- oder React-Demo-Texte, -Logos oder -Links sichtbar
- [ ] Keine ungenutzten Demo-Assets im Projekt
- [ ] App startet fehlerfrei mit `npm run dev`

---

### REQ-2: Startscreen

Die Anwendung zeigt beim Start einen Willkommensbildschirm mit Titel, Beschreibungstext und einem Button zum Starten des Spiels.

**Akzeptanzkriterien:**
- [ ] Titel "IT Security Awareness" (oder ähnlich passend) wird angezeigt
- [ ] Kurzer Beschreibungstext erklärt den Zweck der Anwendung
- [ ] Ein "Spiel starten"-Button ist vorhanden und klickbar
- [ ] Der Startscreen ist der erste sichtbare Bildschirm beim Laden der Anwendung

---

### REQ-3: Level-Platzhalter-Screen

Nach Klick auf den Startbutton wird ein Platzhalter-Screen angezeigt, der später durch das erste spielbare Level ersetzt wird.

**Akzeptanzkriterien:**
- [ ] Platzhalter-Screen zeigt einen Hinweistext (z.B. "Level 1 – kommt bald")
- [ ] Ein Button ermöglicht die Rückkehr zum Startscreen
- [ ] Keine echte Spiellogik implementiert

---

### REQ-4: Navigation zwischen Screens

Die Anwendung ermöglicht den Wechsel zwischen Startscreen und Level-Platzhalter ohne zusätzliche Routing-Library.

**Akzeptanzkriterien:**
- [ ] Navigation funktioniert über React State
- [ ] Kein `react-router` oder andere Routing-Library verwendet
- [ ] Wechsel zwischen Screens ist flüssig und ohne Seitenneuladen

---

### REQ-5: Responsives Layout

Die Anwendung passt sich an unterschiedliche Bildschirmgrößen an (Desktop, Tablet, Smartphone).

**Akzeptanzkriterien:**
- [ ] Layout funktioniert auf Viewports ab 320px Breite
- [ ] Inhalte sind auf allen Geräteklassen lesbar und bedienbar
- [ ] Keine horizontale Scrollbar bei normaler Nutzung
- [ ] Ausschließlich CSS (kein UI-Framework)

---

### REQ-6: Ordnerstruktur

Die Dateien folgen der in der Steering-Datei definierten Struktur unter `src/`.

**Akzeptanzkriterien:**
- [ ] Wiederverwendbare Komponenten liegen in `src/components/`
- [ ] Screen-Komponenten liegen in `src/features/menu/`
- [ ] Kein Code außerhalb der vorgesehenen Ordner
- [ ] Keine zusätzlichen Ordner ohne klaren Grund

---

## Explizit ausgeschlossen

- Spiellogik
- Scoring / Punkte
- localStorage-Nutzung
- Zusätzliche Libraries / Routing-Library
- Backend-Kommunikation
- Animationen
- Sound
