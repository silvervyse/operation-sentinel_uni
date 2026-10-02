import type { LucideIcon } from 'lucide-react';
import { Play, Map, User, FileBarChart } from 'lucide-react';

export interface MenuItemConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Hint-Nachricht wenn gesperrt (max 120 Zeichen) */
  lockedHintMessage?: string;
}

export const MENU_ITEMS: MenuItemConfig[] = [
  {
    id: 'new-game',
    label: 'Neues Spiel',
    icon: Play,
  },
  {
    id: 'missions',
    label: 'Missionen',
    icon: Map,
    lockedHintMessage:
      'Initialisiere zuerst deinen Agenten, um Zugriff auf das Missionsnetzwerk zu erhalten.',
  },
  {
    id: 'agent-file',
    label: 'Agentenakte',
    icon: User,
    lockedHintMessage:
      'Erstelle zuerst einen Agenten, um deine Akte einsehen zu können.',
  },
  {
    id: 'report',
    label: 'Zertifikat generieren',
    icon: FileBarChart,
    lockedHintMessage:
      'Schließe zuerst eine Mission ab, um ein Zertifikat generieren zu können.',
  },
];
