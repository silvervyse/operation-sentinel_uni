/**
 * Gibt den korrekten Asset-Pfad zurück, inklusive Base-Path für GitHub Pages.
 * Lokal (dev): base ist "/"
 * Auf GitHub Pages: base ist "/Gamification_IT-Security/"
 */
export function assetPath(path: string): string {
  const base = import.meta.env.BASE_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${cleanPath}`;
}
