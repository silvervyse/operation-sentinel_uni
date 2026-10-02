## Geplante MVP-Erweiterungen

### 1. Einstellungsmenü

Das Spiel erhält ein einfaches Einstellungsmenü, das über das Hauptmenü erreichbar ist.

Im MVP können Spielende:

- Soundeffekte aktivieren bzw. deaktivieren und Musik und Sounds voneinander gertennt einstellenb
- ihren Codenamen ändern
- ihre Stammdaten fürs Zertifiakt ändern
- den Spielstand vollständig zurücksetzen

Alle Einstellungen werden im Local Storage gespeichert. Vor dem Zurücksetzen des Spielstands erscheint eine Sicherheitsabfrage.

---

### 2. Weiterer spielbarer Charakter

Die bestehende Charakterauswahl wird um einen weiteren spielbaren Charakter erweitert.

Der neue Charakter:

- besitzt ein eigenes Portrait,
- kann bei der Agenten-Initialisierung ausgewählt werden,
- wird im Local Storage gespeichert,
- erscheint anschließend in der Agentenakte sowie an allen bereits vorhandenen Stellen im Spiel.

Die Implementierung erfolgt auf Basis der bestehenden Charakterlogik, sodass zukünftig weitere Charaktere mit geringem Aufwand ergänzt werden können.

---

### 3. Achievement-System

Die Agentenakte wird um eine zusätzliche Seite erweitert, auf der freigeschaltete Achievements angezeigt werden.

Im MVP werden beispielhaft folgende Achievements umgesetzt:

- Mission 1 abgeschlossen
- Drei Sterne in Mission 1 erreicht
- Abschlussquiz ohne Fehler bestanden
- Sichere Passphrase erstellt

Nicht freigeschaltete Achievements werden ausgegraut dargestellt. Erreichte Achievements werden dauerhaft im Local Storage gespeichert.

---

### 4. Quizfragen-Pool erweitern und randomisieren

Der bestehende Fragenpool des Abschlussquiz wird auf mindestens 20 Fragen erweitert.

Bei jedem Quizdurchlauf werden:

- zehn Fragen zufällig aus dem Pool ausgewählt,
- die Reihenfolge der Fragen zufällig festgelegt,
- die Antwortmöglichkeiten jeder Frage zufällig gemischt.

Dadurch unterscheidet sich jeder Spieldurchlauf und der Wiederspielwert des Spiels wird erhöht.

---

### 5. Zusätzliche Laptop-Szenarien implementieren

Die erste Mission wird um weitere Laptop-Szenarien ergänzt. Statt einer festen Reihenfolge werden zu Beginn jeder Mission vier Szenarien zufällig aus einem größeren Pool ausgewählt.

Jedes Szenario behandelt eine andere Form unsicherer Passwortnutzung, beispielsweise:

- Passwort basiert auf persönlichen Informationen
- Wiederverwendung desselben Passworts für mehrere Konten
- Passwort auf einem Post-it am Laptop notiert
- Verwendung eines einfachen Wörterbuchwortes
- Tastaturmuster wie `qwertz`
- Jahreszahlen oder Datumsangaben im Passwort

Durch die zufällige Auswahl unterscheiden sich die Missionen bei jedem Spieldurchlauf, wodurch der Wiederspielwert erhöht und ein Auswendiglernen einzelner Lösungen verhindert wird.

---

### 6. Mehrsprachigkeit implementieren

Das Spiel wird um eine Sprachumschaltung erweitert. Im MVP werden zunächst Deutsch und Englisch unterstützt.

Alle im Spiel angezeigten Texte, Dialoge, Missionsbeschreibungen sowie Quizfragen werden in externe Sprachdateien ausgelagert. Spielende können die gewünschte Sprache im Einstellungsmenü auswählen. Die Auswahl wird dauerhaft im Local Storage gespeichert und beim nächsten Spielstart automatisch übernommen.

Die Umsetzung demonstriert den Einsatz KI-gestützter Übersetzung sowie eine internationalisierungsfähige Softwarearchitektur, wodurch das Spiel künftig mit geringem Aufwand um weitere Sprachen erweitert werden kann.

### 7. Passwortgenerator implementieren

Die Agentenakte wird um einen integrierten Passwortgenerator erweitert, der Spielenden bei der Erstellung sicherer Zugangsdaten unterstützt und auch nach Abschluss der Mission dauerhaft genutzt werden kann.

Im MVP können Spielende zwischen zwei Generierungsarten wählen:

- **Sicheres Passwort:** zufällig generiertes Passwort aus Groß- und Kleinbuchstaben, Zahlen sowie Sonderzeichen
- **Passphrase:** zufällig generierte Kombination mehrerer nicht zusammenhängender Wörter

Das generierte Passwort bzw. die Passphrase kann per Klick in die Zwischenablage kopiert werden. Zusätzlich wird eine kurze Einschätzung der Passwortstärke angezeigt.

Der Passwortgenerator ist jederzeit über die Agentenakte erreichbar und dient als dauerhaftes Hilfsmittel, um das im Spiel erlernte Wissen unmittelbar in der Praxis anzuwenden.


### 8. Über-das-Projekt-Seite

Das Spiel erhält eine eigene Über-das-Projekt-Seite, auf der die wichtigsten Informationen zur Entstehung und zum Zweck des Spiels zusammengefasst werden.

Dabei werden unter anderem:

der Hintergrund des Hochschulprojekts erläutert
das Lernziel und der thematische Schwerpunkt des Spiels beschrieben
die beteiligten Entwickler genannt
verwendete Technologien und Werkzeuge aufgeführt
ein Hinweis auf den nicht-kommerziellen Demonstrations- und Lernzweck ergänzt

So erhalten Spielende einen transparenten Überblick über das Projekt, ohne dass dafür ein umfangreiches Impressum erforderlich ist.

### 9. Hinweis für mobile Endgeräte

Beim Aufrufen des Spiels wird geprüft, ob die Anwendung auf einem Smartphone oder einem Bildschirm mit geringer Breite geöffnet wurde.

Dabei werden unter anderem:

die verfügbare Bildschirmbreite und die Eingabemöglichkeiten des Geräts geprüft
Smartphone-Nutzer auf die Desktop-Optimierung des Spiels hingewiesen
ein eigener Hinweisbildschirm  angezeigt
die Nutzung auf einem Laptop oder Desktop-PC empfohlen
optional ein Fortfahren auf eigene Entscheidung ermöglicht

So wird verhindert, dass Spielende aufgrund eines zu kleinen Displays oder einer ungeeigneten Touch-Bedienung ein eingeschränktes Spielerlebnis erhalten.