# Tasks: Application Shell

## Task 1: Vite-Demo-Inhalte bereinigen

- [ ] Inhalt von `src/App.tsx` entfernen (Counter, Logos, Links)
- [ ] Inhalt von `src/App.css` entfernen
- [ ] Inhalt von `src/index.css` entfernen
- [ ] Demo-Assets entfernen (`src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`)
- [ ] `public/favicon.svg` beibehalten (oder durch eigenes ersetzen)
- [ ] Prüfen, dass `npm run dev` fehlerfrei startet

---

## Task 2: CSS-Grundlagen und Layout einrichten

- [ ] `src/index.css` mit CSS-Reset und CSS-Variablen befüllen
- [ ] `src/App.css` mit grundlegenden App-Styles befüllen
- [ ] `src/components/Layout.tsx` erstellen (zentrierter Container-Wrapper)
- [ ] Responsive max-width und Padding definieren
- [ ] Prüfen, dass Layout auf 320px bis 1440px funktioniert

---

## Task 3: StartScreen-Komponente erstellen

- [ ] `src/features/menu/StartScreen.tsx` erstellen
- [ ] Titel anzeigen (z.B. "IT Security Awareness")
- [ ] Kurzen Beschreibungstext anzeigen
- [ ] "Spiel starten"-Button implementieren
- [ ] Props-Interface definieren: `{ onStart: () => void }`
- [ ] Semantisches HTML verwenden (`<main>`, `<h1>`, `<button>`)

---

## Task 4: LevelPlaceholder-Komponente erstellen

- [ ] `src/features/menu/LevelPlaceholder.tsx` erstellen
- [ ] Platzhaltertext anzeigen (z.B. "Level 1 – kommt bald")
- [ ] "Zurück zum Start"-Button implementieren
- [ ] Props-Interface definieren: `{ onBack: () => void }`

---

## Task 5: Screen-Navigation in App.tsx implementieren

- [ ] Screen-Type definieren: `type Screen = 'start' | 'level'`
- [ ] `useState<Screen>('start')` in App.tsx einrichten
- [ ] StartScreen rendern wenn `currentScreen === 'start'`
- [ ] LevelPlaceholder rendern wenn `currentScreen === 'level'`
- [ ] `onStart`-Handler: setzt Screen auf `'level'`
- [ ] `onBack`-Handler: setzt Screen auf `'start'`
- [ ] Layout-Wrapper um die Screen-Komponenten legen

---

## Task 6: Aufräumen und Verifizieren

- [ ] Ungenutzte `.gitkeep`-Dateien in befüllten Ordnern entfernen
- [ ] `npm run build` ausführen – keine Fehler
- [ ] `npm run lint` ausführen – keine Fehler
- [ ] Manuell prüfen: Startscreen → Button klicken → Level-Platzhalter → Zurück-Button → Startscreen
- [ ] Responsive Darstellung auf verschiedenen Viewports prüfen
