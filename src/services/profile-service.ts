import type { AgentCharacterId, PlayerProfile } from '../types/player-profile.types';

// === Validierungskonstanten ===

/** Erlaubte Zeichen im Codename: Buchstaben, Zahlen, Umlaute, Leerzeichen, Bindestriche, Unterstriche */
export const CODENAME_PATTERN = /^[a-zA-Z0-9äöüÄÖÜß\-_ ]+$/;

/** Die vier gültigen Charakter-Identifier */
export const VALID_CHARACTERS: AgentCharacterId[] = ['alpha', 'beta', 'charlie', 'delta'];

/** Maximale Länge des Codenames nach Trimming */
export const MAX_CODENAME_LENGTH = 20;

// === Validierungs-Interface ===

export interface ValidationResult {
  valid: boolean;
  errors: { field: 'codename' | 'selectedCharacter'; message: string }[];
}

// === Validierungsfunktionen ===

/**
 * Validiert einen Codename-String für UI-Feedback.
 * Prüft: non-empty nach Trim, max 20 Zeichen, nur erlaubte Zeichen.
 */
export function validateCodename(codename: string): ValidationResult {
  const errors: ValidationResult['errors'] = [];
  const trimmed = codename.trim();

  if (trimmed.length === 0) {
    errors.push({ field: 'codename', message: 'Ein Deckname ist erforderlich.' });
  } else if (trimmed.length > MAX_CODENAME_LENGTH) {
    errors.push({
      field: 'codename',
      message: `Der Deckname darf maximal ${MAX_CODENAME_LENGTH} Zeichen lang sein.`,
    });
  } else if (!CODENAME_PATTERN.test(trimmed)) {
    errors.push({
      field: 'codename',
      message: 'Der Deckname darf nur Buchstaben, Zahlen, Umlaute, Leerzeichen, Bindestriche und Unterstriche enthalten.',
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validiert ein vollständiges PlayerProfile-Objekt.
 * Prüft codename und selectedCharacter auf Gültigkeit.
 * Nimmt `unknown` entgegen für sichere Typ-Validierung.
 */
export function validateProfile(profile: unknown): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  if (typeof profile !== 'object' || profile === null) {
    errors.push({ field: 'codename', message: 'Ungültiges Profil-Format.' });
    errors.push({ field: 'selectedCharacter', message: 'Ungültiges Profil-Format.' });
    return { valid: false, errors };
  }

  const obj = profile as Record<string, unknown>;

  // Codename validieren
  if (typeof obj.codename !== 'string') {
    errors.push({ field: 'codename', message: 'Ein Deckname ist erforderlich.' });
  } else {
    const codenameResult = validateCodename(obj.codename);
    errors.push(...codenameResult.errors);
  }

  // selectedCharacter validieren
  if (typeof obj.selectedCharacter !== 'string') {
    errors.push({ field: 'selectedCharacter', message: 'Ein Charakter muss ausgewählt werden.' });
  } else if (!VALID_CHARACTERS.includes(obj.selectedCharacter as AgentCharacterId)) {
    errors.push({
      field: 'selectedCharacter',
      message: 'Ungültiger Charakter-Identifier.',
    });
  }

  return { valid: errors.length === 0, errors };
}

// === Persistenz ===

/** localStorage-Key für das Spielerprofil */
const STORAGE_KEY = 'it-security-player-profile';

/**
 * Speichert ein PlayerProfile in localStorage.
 * Validiert das Profil vor dem Speichern und wirft bei ungültigem Profil oder localStorage-Fehler.
 */
export function saveProfile(profile: PlayerProfile): void {
  const result = validateProfile(profile);
  if (!result.valid) {
    throw new Error(`Ungültiges Profil: ${result.errors.map(e => e.message).join(', ')}`);
  }

  const json = JSON.stringify(profile);
  localStorage.setItem(STORAGE_KEY, json);
}

/**
 * Lädt ein PlayerProfile aus localStorage.
 * Gibt null zurück bei: fehlendem Eintrag, JSON-Parse-Fehler, ungültigem Profil oder localStorage-Fehler.
 * Entfernt ungültige Einträge aus localStorage.
 */
export function loadProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    const result = validateProfile(parsed);

    if (!result.valid) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed as PlayerProfile;
  } catch {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore removal failure
    }
    return null;
  }
}

/**
 * Prüft ob ein gültiges PlayerProfile in localStorage existiert.
 */
export function hasProfile(): boolean {
  return loadProfile() !== null;
}
