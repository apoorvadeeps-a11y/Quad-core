import { HighlightColorConfig } from '../types';

export const HIGHLIGHT_PALETTE: HighlightColorConfig[] = [
  {
    name: 'violet',
    hex: '#7656A7',
    glow: 'rgba(118, 86, 167, 0.4)',
    badgeBg: '#7656A7',
    badgeText: '#FFFFFF',
  },
  {
    name: 'terracotta',
    hex: '#C86D51',
    glow: 'rgba(200, 109, 81, 0.4)',
    badgeBg: '#C86D51',
    badgeText: '#FFFFFF',
  },
  {
    name: 'cyan',
    hex: '#0E8A9A',
    glow: 'rgba(14, 138, 154, 0.4)',
    badgeBg: '#0E8A9A',
    badgeText: '#FFFFFF',
  },
  {
    name: 'amber',
    hex: '#D97706',
    glow: 'rgba(217, 119, 6, 0.4)',
    badgeBg: '#D97706',
    badgeText: '#FFFFFF',
  },
];

/**
 * Parses RGB or RGBA string into [r, g, b]
 */
function parseRgb(colorStr: string): [number, number, number] | null {
  if (!colorStr) return null;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  return null;
}

/**
 * Computes standard relative luminance of an RGB triplet [0..255]
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/**
 * Computes WCAG contrast ratio between two luminance values
 */
function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Traverses element up the DOM to find the effective background color
 */
function getEffectiveBackgroundColor(el: HTMLElement | null): [number, number, number] {
  let curr: HTMLElement | null = el;
  while (curr && curr !== document.body) {
    const style = window.getComputedStyle(curr);
    const bg = style.backgroundColor;
    const parsed = parseRgb(bg);
    // Ignore fully transparent or default unset background
    if (parsed && !(bg.includes('rgba') && bg.endsWith(', 0)'))) {
      return parsed;
    }
    curr = curr.parentElement;
  }
  // Default to portal warm ivory background (#F7F3EC)
  return [247, 243, 236];
}

/**
 * Inspects element background color and chooses the highlight color with highest contrast
 */
export function getOptimalHighlightColor(targetElement: HTMLElement | null): HighlightColorConfig {
  if (!targetElement) return HIGHLIGHT_PALETTE[0]; // Default to violet

  const bgRgb = getEffectiveBackgroundColor(targetElement);
  const bgLum = getRelativeLuminance(bgRgb[0], bgRgb[1], bgRgb[2]);

  let bestChoice = HIGHLIGHT_PALETTE[0];
  let maxScore = -1;

  for (const choice of HIGHLIGHT_PALETTE) {
    const hex = choice.hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const choiceLum = getRelativeLuminance(r, g, b);
    const contrast = getContrastRatio(bgLum, choiceLum);

    // If the element has blue/violet tones, give slight boost to terracotta or amber for chromatic contrast
    let chromaticPenalty = 0;
    if (bgRgb[2] > bgRgb[0] + 30 && choice.name === 'violet') {
      chromaticPenalty = 0.5;
    }
    if (bgRgb[0] > 200 && bgRgb[1] > 180 && choice.name === 'amber') {
      chromaticPenalty = 0.8;
    }

    const finalScore = contrast - chromaticPenalty;
    if (finalScore > maxScore) {
      maxScore = finalScore;
      bestChoice = choice;
    }
  }

  return bestChoice;
}
