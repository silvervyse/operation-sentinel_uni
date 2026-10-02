import { assetPath } from '../utils/asset-path';

/**
 * Passwort-Analyse-Service
 * Bewertet ein eingegebenes Passwort nach Länge, Entropie, Wörterbuch und Brute-Force-Dauer.
 */

export interface PasswordAnalysis {
  length: { value: number; rating: 'schlecht' | 'ok' | 'hervorragend'; label: string };
  entropy: { rating: 'sehr schlecht' | 'schlecht' | 'ok' | 'hervorragend'; label: string; charsetSize: number };
  predictability: { rating: 'schlecht' | 'ok' | 'hervorragend'; label: string; reason?: string };
  dictionary: { found: boolean; word?: string; isPassphrase?: boolean; label: string };
  bruteForce: { seconds: number; label: string };
  overall: { rating: 'unsicher' | 'mittel' | 'sicher' | 'sehr sicher'; label: string; score: number };
}

// Brute-Force: 10 Milliarden Versuche pro Sekunde (moderner GPU-Cluster)
const ATTEMPTS_PER_SECOND = 10_000_000_000;

let wordSet: Set<string> | null = null;

/** Lädt die Wörterliste (einmalig, gecacht) — TXT-Datei mit einem Wort pro Zeile */
async function loadWordList(): Promise<Set<string>> {
  if (wordSet) return wordSet;
  try {
    const response = await fetch(assetPath('/assets/images/Mission1/wordlist-german.txt'));
    if (response.ok) {
      const text = await response.text();
      // Nur Wörter ab 4 Zeichen in ein Set laden (lowercase)
      wordSet = new Set<string>();
      for (const line of text.split('\n')) {
        const word = line.trim().toLowerCase();
        if (word.length >= 4) {
          wordSet.add(word);
        }
      }
      return wordSet;
    }
  } catch { /* ignore */ }
  return new Set();
}

/** Bestimmt die Zeichensatzgröße */
function getCharsetSize(password: string): number {
  let size = 0;
  // Buchstaben immer als 52 zählen (Angreifer weiß nicht ob Groß-/Klein verwendet wurde)
  if (/[a-zA-Z]/.test(password)) size += 52;
  if (/[0-9]/.test(password)) size += 10;
  if (/[^a-zA-Z0-9]/.test(password)) size += 32; // Sonderzeichen
  return size || 26; // Mindestens 26
}

/** Formatiert Sekunden in lesbare Dauer */
function formatDuration(seconds: number): string {
  if (seconds < 1) return 'Sofort';
  if (seconds < 60) return `${Math.round(seconds)} Sekunden`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} Minuten`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} Stunden`;
  if (seconds < 86400 * 365) return `${Math.round(seconds / 86400)} Tage`;
  if (seconds < 86400 * 365 * 1000) return `${Math.round(seconds / (86400 * 365))} Jahre`;
  if (seconds < 86400 * 365 * 1_000_000) return `${Math.round(seconds / (86400 * 365 * 1000))} Tausend Jahre`;
  if (seconds < 86400 * 365 * 1_000_000_000) return `${Math.round(seconds / (86400 * 365 * 1_000_000))} Millionen Jahre`;
  return `${(seconds / (86400 * 365 * 1_000_000_000)).toExponential(1)} Milliarden Jahre`;
}

/** Prüft ob das Passwort eine Passphrase ist (mehrere Wörter durch Nicht-Buchstaben getrennt) */
function isPassphrase(password: string, words: Set<string>): boolean {
  // Methode 1: Splitte an Nicht-Buchstaben-Zeichen (Zahlen, Sonderzeichen, Leerzeichen)
  const parts = password.split(/[^a-zA-ZäöüÄÖÜß]+/).filter(p => p.length >= 3);
  if (parts.length >= 2) {
    let wordCount = 0;
    for (const part of parts) {
      // Jeder Teil kann selbst zusammengesetzte Wörter enthalten
      const foundWords = findWordsInString(part.toLowerCase(), words);
      wordCount += foundWords;
    }
    if (wordCount >= 2) return true;
  }

  // Methode 2: Zusammengeklebte Wörter ohne Trenner (z.B. "HausMausStrauß")
  // Extrahiere den Buchstaben-Teil des Passworts
  const letterPart = password.replace(/[^a-zA-ZäöüÄÖÜß]/g, '');
  if (letterPart.length >= 6) {
    const foundWords = findWordsInString(letterPart.toLowerCase(), words);
    if (foundWords >= 2) return true;
  }

  return false;
}

/** Versucht gierig möglichst viele Wörterbuchwörter in einem String zu finden (min. 4 Zeichen pro Wort) */
function findWordsInString(str: string, words: Set<string>): number {
  let count = 0;
  let pos = 0;
  while (pos < str.length) {
    let found = false;
    // Versuche das längste Wort ab Position pos zu finden (max 15 Zeichen)
    for (let len = Math.min(str.length - pos, 15); len >= 4; len--) {
      const candidate = str.substring(pos, pos + len);
      if (words.has(candidate)) {
        count++;
        pos += len;
        found = true;
        break;
      }
    }
    if (!found) {
      pos++;
    }
  }
  return count;
}

/** Prüft ob das Passwort ein Wörterbuchwort enthält (Teilstring-Suche, min 4 Zeichen) */
function checkDictionary(password: string, words: Set<string>): { found: boolean; word?: string; isPassphrase?: boolean } {
  // Passphrase-Erkennung: mehrere Wörter durch Sonderzeichen/Zahlen getrennt → positiv
  if (isPassphrase(password, words)) {
    return { found: false, isPassphrase: true };
  }

  const lower = password.toLowerCase();
  // Prüfe alle möglichen Teilstrings ab 4 Zeichen
  for (let len = Math.min(lower.length, 20); len >= 4; len--) {
    for (let start = 0; start <= lower.length - len; start++) {
      const substr = lower.substring(start, start + len);
      if (words.has(substr)) {
        return { found: true, word: substr };
      }
    }
  }
  return { found: false };
}

/** Prüft ob das Passwort vorhersagbare Muster enthält (Tastaturfolgen, Wiederholungen) */
function checkPredictability(password: string, isPassphraseDetected: boolean): { rating: 'schlecht' | 'ok' | 'hervorragend'; label: string; reason?: string } {
  const lower = password.toLowerCase();

  // Tastaturfolgen (deutsch QWERTZ + Zahlenreihe)
  const keyboardRows = [
    'qwertzuiopü', 'asdfghjklöä', 'yxcvbnm',
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    '1234567890', '0987654321',
  ];
  for (const row of keyboardRows) {
    for (let len = 4; len <= row.length; len++) {
      for (let start = 0; start <= row.length - len; start++) {
        const seq = row.substring(start, start + len);
        if (lower.includes(seq)) {
          return { rating: 'schlecht', label: 'Tastaturmuster', reason: `Enthält: "${seq}"` };
        }
        // Auch umgekehrt
        const rev = seq.split('').reverse().join('');
        if (lower.includes(rev)) {
          return { rating: 'schlecht', label: 'Tastaturmuster', reason: `Enthält: "${rev}"` };
        }
      }
    }
  }

  // Wiederholende Zeichen (z.B. "aaa", "111")
  if (/(.)\1{2,}/.test(password)) {
    const match = password.match(/(.)\1{2,}/);
    return { rating: 'schlecht', label: 'Wiederholungen', reason: `Enthält: "${match?.[0]}"` };
  }

  // Wiederholende Muster (z.B. "abcabc", "1212")
  for (let patLen = 2; patLen <= Math.floor(password.length / 2); patLen++) {
    const pattern = password.substring(0, patLen);
    const repeated = pattern.repeat(Math.ceil(password.length / patLen)).substring(0, password.length);
    if (repeated === password) {
      return { rating: 'schlecht', label: 'Wiederholendes Muster', reason: `Muster: "${pattern}"` };
    }
  }

  // Aufsteigende/absteigende Zahlenfolgen (z.B. "12345", "9876")
  let ascending = 0;
  let descending = 0;
  for (let i = 1; i < password.length; i++) {
    if (password.charCodeAt(i) === password.charCodeAt(i - 1) + 1) {
      ascending++;
      if (ascending >= 3) return { rating: 'schlecht', label: 'Sequenz', reason: 'Aufsteigende Zeichenfolge' };
    } else {
      ascending = 0;
    }
    if (password.charCodeAt(i) === password.charCodeAt(i - 1) - 1) {
      descending++;
      if (descending >= 3) return { rating: 'schlecht', label: 'Sequenz', reason: 'Absteigende Zeichenfolge' };
    } else {
      descending = 0;
    }
  }

  // Wiederholende Teilstrings (z.B. "aus" kommt 3x vor in "hausmauslaus")
  const lowerPw = password.toLowerCase();
  for (let subLen = 3; subLen <= Math.floor(lowerPw.length / 3); subLen++) {
    for (let start = 0; start <= lowerPw.length - subLen; start++) {
      const sub = lowerPw.substring(start, start + subLen);
      let count = 0;
      let searchFrom = 0;
      while (true) {
        const idx = lowerPw.indexOf(sub, searchFrom);
        if (idx === -1) break;
        count++;
        searchFrom = idx + 1;
      }
      if (count >= 3) {
        const hint = isPassphraseDetected ? 'Vermutung: Reim' : `"${sub}" kommt ${count}x vor`;
        return { rating: 'schlecht', label: isPassphraseDetected ? 'Reim erkannt' : 'Wiederholende Teile', reason: hint };
      }
    }
  }

  return { rating: 'hervorragend', label: 'Keine Muster' };
}

/** Hauptanalyse-Funktion */
export async function analyzePassword(password: string): Promise<PasswordAnalysis> {
  const words = await loadWordList();

  // 1. Länge
  const len = password.length;
  const lengthRating = len < 8 ? 'schlecht' : len <= 12 ? 'ok' : 'hervorragend';
  const lengthLabel = len < 8 ? 'Zu kurz' : len <= 12 ? 'Ausreichend' : 'Hervorragend';

  // 2. Entropie (Zeichensatz)
  const charsetSize = getCharsetSize(password);
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  // Buchstaben (klein+groß) = 1 Zeichensatz, Zahlen = 1, Sonderzeichen = 1
  const charsetCount = [hasLetters, hasDigit, hasSpecial].filter(Boolean).length;

  let entropyRating: 'sehr schlecht' | 'schlecht' | 'ok' | 'hervorragend';
  let entropyLabel: string;

  if (charsetCount >= 3) {
    entropyRating = 'hervorragend';
    entropyLabel = 'Hoch';
  } else if (charsetCount === 2) {
    entropyRating = 'ok';
    entropyLabel = 'Mittel';
  } else {
    entropyRating = 'sehr schlecht';
    entropyLabel = 'Sehr Niedrig';
  }

  // 3. Wörterbuch
  const dictResult = checkDictionary(password, words);
  const dictLabel = dictResult.isPassphrase ? 'Super Passphrase!' : dictResult.found ? `Gefunden: "${dictResult.word}"` : 'Nicht gefunden';

  // 4. Vorhersagbarkeit
  const predictResult = checkPredictability(password, !!dictResult.isPassphrase);

  // 5. Brute-Force Dauer: T = Z^L / V
  const combinations = Math.pow(charsetSize, len);
  const bruteForceSeconds = combinations / ATTEMPTS_PER_SECOND;
  const bruteForceLabel = formatDuration(bruteForceSeconds);

  // 6. Gesamtbewertung — basierend auf Kategorien
  // Ratings pro Kategorie: hervorragend/ok/schlecht/sehr schlecht
  const lengthCat = lengthRating;
  const entropyCat = entropyRating === 'sehr schlecht' ? 'schlecht' : entropyRating;
  // Bei Passphrasen: Vorhersagbarkeit ignorieren (Reime/Muster in Passphrasen sind akzeptabel)
  const predictCat = dictResult.isPassphrase ? 'hervorragend' as const : predictResult.rating;
  const dictCat = dictResult.found ? 'ok' : 'hervorragend'; // Gefunden = ok (nicht gut), nicht gefunden = hervorragend
  const bruteCat = bruteForceSeconds > 86400 * 365 ? 'hervorragend' : bruteForceSeconds > 86400 ? 'ok' : 'schlecht';

  const categories = [lengthCat, entropyCat, predictCat, dictCat, bruteCat];
  const schlechtCount = categories.filter(c => c === 'schlecht').length;
  const okCount = categories.filter(c => c === 'ok').length;
  const allHervorragend = categories.every(c => c === 'hervorragend');
  // "Sehr sicher" nur wenn wirklich alles top ist (inkl. echte Vorhersagbarkeit)
  const trueAllPerfect = allHervorragend && predictResult.rating === 'hervorragend';

  let overallRating: 'unsicher' | 'mittel' | 'sicher' | 'sehr sicher';
  let overallLabel: string;

  if (trueAllPerfect) {
    overallRating = 'sehr sicher';
    overallLabel = 'SEHR SICHER';
  } else if (allHervorragend) {
    // Alles "hervorragend" in categories, aber echte Vorhersagbarkeit nicht perfekt → nur sicher
    overallRating = 'sicher';
    overallLabel = 'SICHER';
  } else if (schlechtCount >= 2) {
    // Sonderregel: Brute-Force > 1 Jahr kompensiert → halbwegs sicher statt katastrophal
    if (bruteCat === 'hervorragend') {
      overallRating = 'mittel';
      overallLabel = 'HALBWEGS SICHER';
    } else {
      overallRating = 'unsicher';
      overallLabel = 'KATASTROPHAL';
    }
  } else if (schlechtCount >= 1) {
    // Sonderregel: Nur Entropie oder Vorhersagbarkeit schlecht, aber BruteForce > 1 Jahr → kompensiert
    if (schlechtCount === 1 && bruteCat === 'hervorragend') {
      if (entropyCat === 'schlecht') {
        overallRating = 'sicher';
        overallLabel = 'SICHER';
      } else {
        // Vorhersagbarkeit schlecht, Rest gut → halbwegs sicher
        overallRating = 'mittel';
        overallLabel = 'HALBWEGS SICHER';
      }
    } else {
      overallRating = 'unsicher';
      overallLabel = 'NICHT SICHER';
    }
  } else if (okCount >= 1) {
    // Sonderregel: Nur Entropie "mittel", Rest hervorragend → sicher
    if (okCount === 1 && entropyCat === 'ok' && lengthCat === 'hervorragend' && predictCat === 'hervorragend' && dictCat === 'hervorragend' && bruteCat === 'hervorragend') {
      overallRating = 'sicher';
      overallLabel = 'SICHER';
    } else {
      overallRating = 'mittel';
      overallLabel = 'HALBWEGS SICHER';
    }
  } else {
    overallRating = 'sicher';
    overallLabel = 'SICHER';
  }

  const score = allHervorragend ? 100 : schlechtCount >= 2 ? 10 : schlechtCount >= 1 ? (overallRating === 'mittel' ? 60 : 30) : okCount >= 1 ? 60 : 80;

  return {
    length: { value: len, rating: lengthRating, label: lengthLabel },
    entropy: { rating: entropyRating, label: entropyLabel, charsetSize },
    predictability: predictResult,
    dictionary: { found: dictResult.found, word: dictResult.word, isPassphrase: dictResult.isPassphrase, label: dictLabel },
    bruteForce: { seconds: bruteForceSeconds, label: bruteForceLabel },
    overall: { rating: overallRating, label: overallLabel, score },
  };
}
