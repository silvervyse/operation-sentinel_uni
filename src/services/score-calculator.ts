import type { Answer, Mission } from '../types/game.types';

/**
 * Pure Funktion: Berechnet den Gesamtscore basierend auf Antworten und Missionsdaten.
 * Unbekannte Choice-IDs werden mit 0 Punkten bewertet.
 */
export function calculateScore(answers: readonly Answer[], mission: Mission): number {
  return answers.reduce((total, answer) => {
    const scenario = mission.scenarios.find(s => s.id === answer.scenarioId);
    if (!scenario) return total;

    const choice = scenario.choices.find(c => c.id === answer.choiceId);
    return total + (choice?.points ?? 0);
  }, 0);
}
