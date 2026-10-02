# ADR-008: Kebab-Case-Namenskonvention für Kiro-Agenten

## Status

Accepted

## Context

Beim Setup der Custom Agents wurden Dateinamen mit Leerzeichen und ohne .md-Endung verwendet. Kiro konnte diese Agenten nicht erkennen und nicht über `/` aufrufen.

## Decision

Alle Kiro-Agent-Dateien verwenden ausschließlich Kebab-Case-Dateinamen mit .md-Endung. Der Dateiname muss dem `name`-Feld im Frontmatter entsprechen.

Beispiel: `code-reviewer.md` mit `name: code-reviewer` im Frontmatter.

## Consequences

- Agenten werden zuverlässig von Kiro erkannt
- Einheitliche Namenskonvention im gesamten .kiro/-Ordner
- Keine Leerzeichen oder Sonderzeichen in Dateinamen
- Neue Agenten müssen dieser Konvention folgen
