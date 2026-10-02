/**
 * Checkpoint-Service: Speichert und lädt Missionsfortschritt (Speicherpunkte).
 * Nutzt localStorage für Persistenz.
 */

const CHECKPOINT_KEY = 'op-sentinel-mission-checkpoints';

export interface MissionCheckpoint {
  missionId: string;
  /** Level-Index: 0 = nach Briefing/Tutorial-Start, 1-4 = nach jeweiligem Laptop, 5 = PasswordCreation, 6 = Quiz */
  levelIndex: number;
  /** Höchster jemals erreichter Level-Index (wird nie zurückgesetzt) */
  highestLevel: number;
  /** Randomisierte Level-Reihenfolge (IDs), damit bei Fortsetzen die gleiche Reihenfolge gilt */
  levelOrder: string[];
  savedAt: string;
}

interface CheckpointStore {
  checkpoints: Record<string, MissionCheckpoint>;
}

function loadStore(): CheckpointStore {
  try {
    const raw = localStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return { checkpoints: {} };
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.checkpoints === 'object') return parsed;
    return { checkpoints: {} };
  } catch {
    return { checkpoints: {} };
  }
}

function saveStore(store: CheckpointStore): void {
  localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(store));
}

/** Speichert einen Checkpoint für eine Mission. highestLevel wird nur nach oben aktualisiert. */
export function saveCheckpoint(checkpoint: MissionCheckpoint): void {
  const store = loadStore();
  const existing = store.checkpoints[checkpoint.missionId];
  // highestLevel darf nie sinken
  const highestLevel = Math.max(
    checkpoint.highestLevel ?? checkpoint.levelIndex,
    existing?.highestLevel ?? 0
  );
  store.checkpoints[checkpoint.missionId] = { ...checkpoint, highestLevel };
  saveStore(store);
}

/** Lädt den Checkpoint für eine Mission (oder null wenn keiner existiert) */
export function loadCheckpoint(missionId: string): MissionCheckpoint | null {
  const store = loadStore();
  const checkpoint = store.checkpoints[missionId] ?? null;
  // Migration: alte Checkpoints ohne highestLevel
  if (checkpoint && checkpoint.highestLevel === undefined) {
    checkpoint.highestLevel = checkpoint.levelIndex;
  }
  return checkpoint;
}

/** Löscht den Checkpoint für eine Mission */
export function clearCheckpoint(missionId: string): void {
  const store = loadStore();
  delete store.checkpoints[missionId];
  saveStore(store);
}

/** Prüft ob ein Checkpoint für eine Mission existiert */
export function hasCheckpoint(missionId: string): boolean {
  const store = loadStore();
  return !!store.checkpoints[missionId];
}

/** Gibt den höchsten jemals erreichten Level-Index zurück (0 wenn kein Checkpoint existiert) */
export function getHighestLevel(missionId: string): number {
  const checkpoint = loadCheckpoint(missionId);
  return checkpoint?.highestLevel ?? 0;
}
