# Steering: UI Styleguide

## Ziel

Das Spiel soll sich wie ein modernes Cyber-Agenten-Spiel anfühlen.

Die Oberfläche soll nicht wie ein klassisches E-Learning, eine Bürosoftware oder eine normale Webseite wirken.

Priorität:
1. Spielgefühl
2. Lesbarkeit
3. Wiederverwendbarkeit
4. Konsistenz
5. visuelle Politur

---

## Stilrichtung

Orientierung:

- Secret Agent
- Cyber Security
- Mission Control
- futuristische Kommandozentrale
- digitale Ermittlungsakte
- High-Tech Interface
- stilisierte Illustration / Graphic Novel

Vermeiden:

- klassische Corporate-Schulungsoptik
- langweilige Formularseiten
- Office-Dashboard-Look
- generische Website-Optik
- Pixel Art
- zu realistischer Militärlook

---

## Farben

Nutze ein dunkles Interface mit kühlen Akzenten.

Empfohlene Farbwelt:

- Hintergrund: sehr dunkles Navy / Blau-Schwarz
- Oberflächen: dunkles Blau-Grau
- Primärfarbe: Cyan oder Electric Blue
- Sekundärfarbe: Violett / Indigo
- Warnung: Amber
- Fehler / Gefahr: Rot
- Erfolg: Grün oder Türkis
- Text: fast weiß
- Sekundärtext: gedämpftes Blau-Grau

Farben sollen möglichst zentral im Theme oder über Tailwind-Tokens definiert werden.

Keine hart codierten Farbcodes in einzelnen Komponenten, wenn ein Token genutzt werden kann.

---

## Typografie

Grundschrift:

- modern
- gut lesbar
- nicht verspielt

Empfehlung:

- Inter für normalen Text
- optional Orbitron oder ähnliche Display-Schrift nur für Titel / Missionsüberschriften

Regeln:

- Keine langen Textblöcke.
- Kurze, prägnante Sätze.
- Dialoge sollen wie Missionsnachrichten wirken.
- Überschriften dürfen technisch/futuristisch wirken.
- Fließtext muss sehr gut lesbar bleiben.

---

## Layout

Das Layout soll wie eine Agenten-Konsole wirken.

Nutze:

- klare Panels
- Karten
- Overlays
- Statusleisten
- Mission-Control-Bereiche
- dezente Linien und Rahmen
- viel dunklen Hintergrund
- gezielte Glow-Effekte

Vermeide:

- überladene Dashboards
- zu viele gleichzeitige Informationen
- große weiße Flächen
- klassische Formularoptik

---

## Buttons

Buttons sollen über das Design System umgesetzt werden, nicht als Bilddateien.

### Primary Button

Verwendung:
- wichtigste Aktion
- Neues Spiel
- Mission starten
- Weiter

Look:
- dunkler Hintergrund
- cyanfarbener Rahmen oder Akzent
- leichter Glow
- klare Hover-Reaktion
- bei Klick leichte Skalierung oder kurzes Feedback

### Secondary Button

Verwendung:
- Zurück
- Details
- optionale Aktionen

Look:
- transparent oder dunkle Fläche
- dezente Outline
- weniger Glow als Primary

### Locked Button

Verwendung:
- gesperrte Missionen
- gesperrte Agentenakte

Look:
- sichtbar deaktiviert
- Schloss-Icon
- gedämpfte Farben
- kein aggressiver Hover
- beim Klick kurze Hinweisnachricht

---

## Karten und Panels

Cards sollen wirken wie digitale Akten oder Missionsmodule.

Regeln:

- dunkle halbtransparente Oberfläche
- dezenter Rahmen
- leichter Schatten oder Glow
- klare Hierarchie
- Hover darf leicht hervorheben
- keine starken bunten Flächen

---

## Icons

Nutze bevorzugt `lucide-react`.

Icons sollen:

- minimalistisch
- einheitlich
- linienbasiert
- gut lesbar
- nicht zu verspielt sein

Keine gemischten Icon-Stile verwenden.

---

## Animationen

Animationen sollen Atmosphäre schaffen, aber nicht ablenken.

Geeignet:

- sanfte Fade-ins
- leichte Slide-Übergänge
- Button-Hover
- Panel-Einblendungen
- kurze Glitch- oder Scan-Effekte
- dezente Hintergrundbewegung

Nicht geeignet:

- hektische Animationen
- dauernd blinkende Elemente
- übertriebene Partikeleffekte
- Animationen, die die Bedienung verlangsamen

Animationen bevorzugt mit `motion` umsetzen.

---

## Sounds

Sounds sollen kurz und dezent sein.

Verwende vorhandene Assets:

- `Click.mp3` für Klicks
- `Hover.mp3` für Hover-Feedback
- `mainmenu.mp3` für das Hauptmenü

Regeln:

- Sounds nicht zu laut abspielen.
- Keine Sounds bei jeder Kleinigkeit.
- Hintergrundmusik dezent loopen.
- Nutzerinteraktion darf nicht durch Sound gestört werden.

---

## Bilder und Assets

Der aktuelle Hauptmenü-Hintergrund befindet sich unter:

- `images/Mainmenu.png`

Stil der zukünftigen Bilder:

- stilisierte Illustration
- minimalistisch
- dunkle Cyber-Agenten-Atmosphäre
- klare Flächen
- nicht zu detailüberladen

Bilder sollen keine eingebetteten Texte enthalten, damit UI-Texte flexibel im Spiel gesetzt werden können.

---

## Responsiveness

Das Spiel muss auf Desktop gut funktionieren.

Für den MVP reicht:

- Desktop-first
- responsive genug für kleinere Browserfenster
- keine kaputten Layouts bei reduzierter Breite
- Inhalte müssen scrollbar bleiben

Mobile Optimierung ist nicht priorisiert, soll aber nicht komplett brechen.

---

## Accessibility Basics

Auch als MVP beachten:

- ausreichender Kontrast
- Buttons klar erkennbar
- klickbare Elemente sichtbar
- keine wichtigen Informationen nur über Farbe vermitteln
- gesperrte Inhalte zusätzlich mit Icon oder Text kennzeichnen

---

## Textstil im UI

Texte sollen zur Spielwelt passen.

Beispiele:

Statt:
- „Fortschritt anzeigen“

Besser:
- „Agentenakte öffnen“

Statt:
- „Level auswählen“

Besser:
- „Missionsnetzwerk öffnen“

Statt:
- „Du musst zuerst starten“

Besser:
- „Initialisiere zuerst deinen Agenten, um Zugriff auf das Missionsnetzwerk zu erhalten.“

---

## Priorität für den MVP

Nicht alles perfekt machen.

Für den MVP gilt:

- Gameplay und Flow wichtiger als visuelle Perfektion
- Assets dürfen Platzhalter sein
- UI soll konsistent wirken
- keine Zeit in unnötige Spezialeffekte investieren
- neue Komponenten nur erstellen, wenn sie wiederverwendbar sind