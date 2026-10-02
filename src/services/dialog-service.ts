
/**
 * Dialog-Service: Lädt und verarbeitet Dialog-Texte aus externen Markdown-Dateien.
 *
 * Dialogdateien liegen im public-Ordner und werden zur Laufzeit via fetch() geladen.
 * Absätze werden durch Leerzeilen getrennt – jeder Absatz wird als eigene "Seite"
 * im Dialog-System dargestellt.
 */

/**
 * Lädt eine Dialog-Datei und teilt sie in einzelne Absätze auf.
 *
 * - Datei wird via fetch() zur Laufzeit geladen
 * - Absätze werden durch Leerzeilen getrennt (doppelter Zeilenumbruch)
 * - Leere Absätze werden gefiltert
 *
 * @param path - Pfad zur Markdown-Dialogdatei (z.B. assetPath('/assets/dialogs/intro.md'))
 * @returns Array von Absätzen als Strings
 * @throws Error wenn die Datei nicht geladen werden kann
 */
export async function loadDialog(path: string): Promise<string[]> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Dialog file not found: ${path}`);
  }
  const text = await response.text();
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
