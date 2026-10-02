/**
 * Ersetzt alle {{codename}}-Platzhalter in einem Text durch den tatsächlichen Codename-Wert.
 */
export function replaceCodename(text: string, codename: string): string {
  return text.replaceAll('{{codename}}', codename);
}
