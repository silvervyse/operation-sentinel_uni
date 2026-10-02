/**
 * Director Nova Pose-System
 *
 * Geheimdienstchefin "Director Nova" begleitet den Spieler durch das Onboarding.
 * Sie hat mehrere Pose-Varianten, die in verschiedenen Dialog-Kontexten verwendet werden.
 */

import { assetPath } from '../../utils/asset-path';

export type DirectorPose = 'neutral' | 'freundlich' | 'lobend' | 'skeptisch' | 'lächelnd';

/**
 * Gibt den Bildpfad für eine Director-Nova-Pose zurück.
 * Beachtet die Namenskonvention: neutral mit Bindestrich, andere mit Unterstrich.
 */
export function getDirectorImagePath(pose: DirectorPose): string {
  const separator = pose === 'neutral' ? '-' : '_';
  return assetPath(`/assets/images/Direktor Nova/Geheimdienstchefin${separator}${pose}.webp`);
}

/** Neutrale Pose für die Erstbegrüßung im Onboarding */
export const GREETING_POSE: DirectorPose = 'neutral';
