// === PlayerProfile-Typen ===

export type AgentCharacterId = 'alpha' | 'beta' | 'charlie' | 'delta';

export interface PlayerProfile {
  readonly codename: string;
  readonly selectedCharacter: AgentCharacterId;
  // Zukünftige Erweiterungsfelder:
  // readonly score?: number;
  // readonly reputation?: number;
  // readonly inventory?: readonly string[];
  // readonly achievements?: readonly string[];
}
