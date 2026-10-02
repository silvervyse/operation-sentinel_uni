import type { PlayerProgress } from '../types/game.types';

const STORAGE_KEY = 'it-security-game-progress';

function createDefaultProgress(): PlayerProgress {
  return {
    completedMissions: [],
    totalScore: 0,
    unlockedAchievements: [],
    lastPlayedAt: new Date().toISOString(),
  };
}

function isValidPlayerProgress(data: unknown): data is PlayerProgress {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.completedMissions)) return false;
  if (typeof obj.totalScore !== 'number') return false;
  if (!Array.isArray(obj.unlockedAchievements)) return false;
  if (typeof obj.lastPlayedAt !== 'string') return false;

  for (const entry of obj.completedMissions) {
    if (typeof entry !== 'object' || entry === null) return false;
    const mission = entry as Record<string, unknown>;
    if (typeof mission.missionId !== 'string') return false;
    if (typeof mission.score !== 'number') return false;
    if (typeof mission.completedAt !== 'string') return false;
  }

  for (const id of obj.unlockedAchievements) {
    if (typeof id !== 'string') return false;
  }

  return true;
}

export function saveProgress(progress: PlayerProgress): void {
  const json = JSON.stringify(progress);
  localStorage.setItem(STORAGE_KEY, json);
}

export function loadProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return createDefaultProgress();

    const parsed: unknown = JSON.parse(raw);

    if (!isValidPlayerProgress(parsed)) {
      return createDefaultProgress();
    }

    return parsed;
  } catch {
    return createDefaultProgress();
  }
}
