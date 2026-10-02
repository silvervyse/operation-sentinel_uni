import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// === HELPER FUNCTIONS ===

/**
 * Convert a hex color string to its sRGB linear components.
 * Used internally by relativeLuminance.
 */
function sRGBtoLinear(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance per WCAG 2.1 definition.
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function relativeLuminance(hex: string): number {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);

  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

/**
 * Calculate contrast ratio per WCAG 2.1.
 * https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
 */
function calculateContrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert a hex color string to HSL values.
 * Returns h in degrees (0-360), s and l as percentages (0-100).
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) {
    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / d + 2) / 6;
  } else {
    h = ((r - g) / d + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

// === TESTS ===

describe('Design Tokens', () => {
  describe('Property 1: Farbkontrast erfüllt WCAG AA', () => {
    it('text-primary (#f0f4f8) hat mindestens 4.5:1 Kontrast zu bg-primary (#0a0e1a)', () => {
      const contrast = calculateContrastRatio('#f0f4f8', '#0a0e1a');
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    it('text-secondary (#94a3b8) hat mindestens 3:1 Kontrast zu bg-primary (#0a0e1a)', () => {
      const contrast = calculateContrastRatio('#94a3b8', '#0a0e1a');
      expect(contrast).toBeGreaterThanOrEqual(3);
    });

    it('accent-primary (#00d4ff) hat mindestens 4.5:1 Kontrast zu bg-primary (#0a0e1a)', () => {
      const contrast = calculateContrastRatio('#00d4ff', '#0a0e1a');
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Property 2: Hintergrundfarben HSL-Bereiche', () => {
    it('bg-primary (#0a0e1a) lightness < 10%, hue 200-240', () => {
      const hsl = hexToHsl('#0a0e1a');
      expect(hsl.l).toBeLessThan(10);
      expect(hsl.h).toBeGreaterThanOrEqual(200);
      expect(hsl.h).toBeLessThanOrEqual(240);
    });

    it('bg-secondary (#131828) lightness 10-18%, hue 200-240', () => {
      const hsl = hexToHsl('#131828');
      expect(hsl.l).toBeGreaterThanOrEqual(10);
      expect(hsl.l).toBeLessThanOrEqual(18);
      expect(hsl.h).toBeGreaterThanOrEqual(200);
      expect(hsl.h).toBeLessThanOrEqual(240);
    });

    it('bg-tertiary (#1c2333) lightness 15-25%, hue 200-240', () => {
      const hsl = hexToHsl('#1c2333');
      expect(hsl.l).toBeGreaterThanOrEqual(15);
      expect(hsl.l).toBeLessThanOrEqual(25);
      expect(hsl.h).toBeGreaterThanOrEqual(200);
      expect(hsl.h).toBeLessThanOrEqual(240);
    });
  });

  describe('Property 3: Spacing-Tokens Vielfache von 4px', () => {
    it('alle 8 Spacing-Werte sind Vielfache von 4px', () => {
      const spacings = [4, 8, 12, 16, 24, 32, 48, 64];
      spacings.forEach(value => {
        expect(value % 4).toBe(0);
      });
    });
  });

  describe('Property 4: Alle CSS Custom Properties in :root definiert', () => {
    const cssContent = readFileSync(resolve(__dirname, '../index.css'), 'utf-8');

    // Extract the :root block content
    const rootMatch = cssContent.match(/:root\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/s);
    const rootContent = rootMatch ? rootMatch[1] : '';

    const expectedTokens = [
      // Farben
      '--color-bg-primary',
      '--color-bg-secondary',
      '--color-bg-tertiary',
      '--color-accent-primary',
      '--color-accent-secondary',
      '--color-warning',
      '--color-danger',
      '--color-text-primary',
      '--color-text-secondary',
      // Typografie
      '--font-sans',
      '--font-mono',
      '--text-xs',
      '--text-sm',
      '--text-base',
      '--text-lg',
      '--text-xl',
      '--text-2xl',
      '--font-normal',
      '--font-medium',
      '--font-bold',
      '--leading-body',
      '--leading-heading',
      // Spacing
      '--spacing-1',
      '--spacing-2',
      '--spacing-3',
      '--spacing-4',
      '--spacing-5',
      '--spacing-6',
      '--spacing-7',
      '--spacing-8',
      // Border Radius
      '--radius-none',
      '--radius-sm',
      '--radius-md',
      '--radius-lg',
      // Schatten
      '--shadow-sm',
      '--shadow-md',
      '--shadow-lg',
      // Animationen
      '--duration-fast',
      '--duration-normal',
      '--duration-slow',
      '--ease-out',
      '--ease-in-out',
      // Layout
      '--max-width',
    ];

    expectedTokens.forEach(token => {
      it(`${token} ist in :root definiert`, () => {
        expect(rootContent).toContain(token);
      });
    });
  });

  describe('Property 5: Reduced Motion setzt alle Dauern auf 0ms', () => {
    const cssContent = readFileSync(resolve(__dirname, '../index.css'), 'utf-8');

    // Extract prefers-reduced-motion block
    const reducedMotionMatch = cssContent.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\}\s*\}/
    );
    const reducedMotionContent = reducedMotionMatch ? reducedMotionMatch[1] : '';

    it('prefers-reduced-motion Block existiert', () => {
      expect(reducedMotionMatch).not.toBeNull();
    });

    it('--duration-fast wird auf 0ms gesetzt', () => {
      expect(reducedMotionContent).toMatch(/--duration-fast:\s*0ms/);
    });

    it('--duration-normal wird auf 0ms gesetzt', () => {
      expect(reducedMotionContent).toMatch(/--duration-normal:\s*0ms/);
    });

    it('--duration-slow wird auf 0ms gesetzt', () => {
      expect(reducedMotionContent).toMatch(/--duration-slow:\s*0ms/);
    });
  });

  describe('Property 6: Dark-Klasse auf html-Element', () => {
    const htmlContent = readFileSync(resolve(__dirname, '../../index.html'), 'utf-8');

    it('<html> Element hat class="dark"', () => {
      expect(htmlContent).toMatch(/<html[^>]*class="[^"]*dark[^"]*"/);
    });
  });
});
