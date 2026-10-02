import type { AgentCharacterId } from '../../types/player-profile.types';
import { assetPath } from '../../utils/asset-path';

// === Charakter-Datensatz ===

/** Verfügbare Posen für Charakter-Bilder */
export type CharacterPose = 'charakterauswahl' | 'dialog' | 'mission' | 'mission-select' | 'passfoto' | 'tutorial';

export interface AgentCharacter {
  readonly id: AgentCharacterId;
  readonly name: string;
  readonly basePath: string;
}

export const AGENT_CHARACTERS: readonly AgentCharacter[] = [
  { id: 'alpha', name: 'Agent Alpha', basePath: assetPath('/assets/images/Charaktere/Alpha') },
  { id: 'beta', name: 'Agent Beta', basePath: assetPath('/assets/images/Charaktere/Beta') },
  { id: 'charlie', name: 'Agent Charlie', basePath: assetPath('/assets/images/Charaktere/Charlie') },
  { id: 'delta', name: 'Agent Delta', basePath: assetPath('/assets/images/Charaktere/Delta') },
];

/**
 * Erzeugt den vollständigen Bildpfad für einen Charakter in einer bestimmten Pose.
 * Verwendet eine Lookup-Map da die Dateinamen nicht konsistent sind.
 */
const CHARACTER_IMAGE_MAP: Record<AgentCharacterId, Record<CharacterPose, string>> = {
  alpha: {
    charakterauswahl: assetPath('/assets/images/Charaktere/Alpha/alpha_charakterauswahl.webp'),
    dialog: assetPath('/assets/images/Charaktere/Alpha/alpha_dialog.webp'),
    mission: assetPath('/assets/images/Charaktere/Alpha/alpha_mission.webp'),
    'mission-select': assetPath('/assets/images/Charaktere/Alpha/Mission-select.webp'),
    passfoto: assetPath('/assets/images/Charaktere/Alpha/Passfoto.webp'),
    tutorial: assetPath('/assets/images/Charaktere/Alpha/tutorial.webp'),
  },
  beta: {
    charakterauswahl: assetPath('/assets/images/Charaktere/Beta/Beta_Charakterauswahl.webp'),
    dialog: assetPath('/assets/images/Charaktere/Beta/Beta_dialog.webp'),
    mission: assetPath('/assets/images/Charaktere/Beta/Beta_mission.webp'),
    'mission-select': assetPath('/assets/images/Charaktere/Beta/mission-select.webp'),
    passfoto: assetPath('/assets/images/Charaktere/Beta/Passfoto.webp'),
    tutorial: assetPath('/assets/images/Charaktere/Beta/Tutorial.webp'),
  },
  charlie: {
    charakterauswahl: assetPath('/assets/images/Charaktere/Charlie/Charlie_Charakterauswahl.webp'),
    dialog: assetPath('/assets/images/Charaktere/Charlie/Charlie_dialog.webp'),
    mission: assetPath('/assets/images/Charaktere/Charlie/Charlie_mission.webp'),
    'mission-select': assetPath('/assets/images/Charaktere/Charlie/Mission-select.webp'),
    passfoto: assetPath('/assets/images/Charaktere/Charlie/Passfoto.webp'),
    tutorial: assetPath('/assets/images/Charaktere/Charlie/Tutorial.webp'),
  },
  delta: {
    charakterauswahl: assetPath('/assets/images/Charaktere/Delta/Delta_Charakterauswahl.webp'),
    dialog: assetPath('/assets/images/Charaktere/Delta/Delta_dialog.webp'),
    mission: assetPath('/assets/images/Charaktere/Delta/Delta_mission.webp'),
    'mission-select': assetPath('/assets/images/Charaktere/Delta/mission-select.webp'),
    passfoto: assetPath('/assets/images/Charaktere/Delta/Passfoto.webp'),
    tutorial: assetPath('/assets/images/Charaktere/Delta/Tutorial.webp'),
  },
};

export function getCharacterImagePath(id: AgentCharacterId, pose: CharacterPose): string {
  return CHARACTER_IMAGE_MAP[id][pose];
}
