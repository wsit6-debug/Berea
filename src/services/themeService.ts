export type BackgroundMode = 'warm' | 'white' | 'sepia' | 'dark' | 'custom';

export interface ThemeConfig {
  hue: number; // 0 to 360 (Accent)
  saturation: number; // 0 to 100
  lightness: number; // 0 to 100
  accentHex: string;
  bgMode: BackgroundMode;
  bgHex?: string; // Custom background hex
  bgHue?: number;
  bgSaturation?: number;
  bgLightness?: number;
  name?: string;
}

export interface PresetTheme {
  id: string;
  name: string;
  accentHex: string;
  hue: number;
  saturation: number;
  lightness: number;
  bgMode: BackgroundMode;
  bgHex?: string;
  description: string;
}

export const PRESET_THEMES: PresetTheme[] = [
  {
    id: 'caramel',
    name: 'Warm Caramel',
    accentHex: '#B4793D',
    hue: 30,
    saturation: 49,
    lightness: 47,
    bgMode: 'warm',
    description: 'Original Berea warm linen & caramel editorial'
  },
  {
    id: 'sage',
    name: 'Sage & Olive',
    accentHex: '#3E7B54',
    hue: 142,
    saturation: 33,
    lightness: 36,
    bgMode: 'warm',
    description: 'Contemplative, earthy forest green'
  },
  {
    id: 'sapphire',
    name: 'Sapphire & Cobalt',
    accentHex: '#2563EB',
    hue: 221,
    saturation: 83,
    lightness: 53,
    bgMode: 'white',
    description: 'Calm, crisp oceanic focus'
  },
  {
    id: 'amethyst',
    name: 'Royal Liturgical',
    accentHex: '#7C3AED',
    hue: 262,
    saturation: 83,
    lightness: 58,
    bgMode: 'warm',
    description: 'Regal liturgical purple & violet'
  },
  {
    id: 'crimson',
    name: 'Sacred Crimson',
    accentHex: '#BE123C',
    hue: 345,
    saturation: 82,
    lightness: 41,
    bgMode: 'warm',
    description: 'Rich royal ruby & sacred red'
  },
  {
    id: 'amber',
    name: 'Golden Sunset',
    accentHex: '#D97706',
    hue: 37,
    saturation: 94,
    lightness: 44,
    bgMode: 'warm',
    description: 'Vibrant golden hour warmth'
  },
  {
    id: 'espresso',
    name: 'Espresso & Leather',
    accentHex: '#78350F',
    hue: 22,
    saturation: 78,
    lightness: 26,
    bgMode: 'sepia',
    description: 'Ancient leather-bound parchment'
  },
  {
    id: 'obsidian',
    name: 'Midnight Obsidian',
    accentHex: '#D4AF37',
    hue: 46,
    saturation: 65,
    lightness: 53,
    bgMode: 'dark',
    description: 'Sleek dark mode with illuminated gold'
  }
];

export const DEFAULT_THEME: ThemeConfig = {
  hue: 30,
  saturation: 49,
  lightness: 47,
  accentHex: '#B4793D',
  bgMode: 'warm',
  bgHex: '#FAF7F2',
  bgHue: 38,
  bgSaturation: 33,
  bgLightness: 96,
  name: 'Warm Caramel'
};

// HSL to Hex utility
export function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Hex to HSL utility
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h = Math.round(h * 60);
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Calculate WCAG relative luminance
export function getRelativeLuminance(hex: string): number {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const sRGB = [r, g, b].map(val => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)));
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

const STORAGE_KEY = 'berea_custom_color_theme';

export function loadSavedTheme(): ThemeConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_THEME, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load saved theme', e);
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));
  } catch (e) {
    console.warn('Failed to save theme', e);
  }
}

/**
 * Apply Theme with Automatic Contrast & Eye-Comfort Guard:
 * Ensures active user areas (Scripture reading & notes writing)
 * are NEVER too dark, glaring, or low-contrast.
 */
export function applyThemeToDocument(theme: ThemeConfig): void {
  const root = document.documentElement;
  const { hue, saturation, lightness, accentHex, bgMode } = theme;

  // 1. Accent variants
  const accentDarkHex = hslToHex(hue, Math.min(100, saturation + 5), Math.max(15, lightness - 14));
  const accentHoneyHex = hslToHex(hue, Math.max(15, saturation - 8), Math.min(85, lightness + 15));
  const accentTintHex = hslToHex(hue, Math.max(10, saturation - 15), Math.min(96, lightness + 44));

  root.style.setProperty('--clean-accent-caramel', accentHex);
  root.style.setProperty('--clean-accent-dark', accentDarkHex);
  root.style.setProperty('--clean-accent-honey', accentHoneyHex);
  root.style.setProperty('--clean-highlight-cream', accentTintHex);

  // 2. Custom Background or Preset Modes with Safe Area Clamping
  if (bgMode === 'custom' && theme.bgHex) {
    const bgLuminance = getRelativeLuminance(theme.bgHex);
    const bgHsl = hexToHsl(theme.bgHex);

    root.style.setProperty('--clean-bg', theme.bgHex);

    // Threshold for dark theme: only switch when background is truly dark (WCAG luminance <= 0.20 or lightness < 45%)
    const isDarkBg = bgLuminance < 0.20 || bgHsl.l < 45;

    if (!isDarkBg) {
      // LIGHT & MEDIUM-TONED CUSTOM BACKGROUND
      // Active surface is kept clean, crisp, and comfortable
      const surfaceWarmL = Math.max(88, Math.min(97, bgHsl.l > 80 ? bgHsl.l - 3 : 94));
      const surfaceSubtleL = Math.max(84, Math.min(94, bgHsl.l > 80 ? bgHsl.l - 6 : 90));
      const borderL = Math.max(72, Math.min(88, bgHsl.l > 80 ? bgHsl.l - 12 : 84));
      const borderSoftL = Math.max(76, Math.min(91, bgHsl.l > 80 ? bgHsl.l - 8 : 88));

      root.style.setProperty('--clean-surface', '#FFFFFF');
      root.style.setProperty('--clean-surface-warm', hslToHex(bgHsl.h, Math.min(25, bgHsl.s), surfaceWarmL));
      root.style.setProperty('--clean-surface-subtle', hslToHex(bgHsl.h, Math.min(25, bgHsl.s), surfaceSubtleL));
      root.style.setProperty('--clean-border', hslToHex(bgHsl.h, Math.min(22, bgHsl.s), borderL));
      root.style.setProperty('--clean-border-soft', hslToHex(bgHsl.h, Math.min(20, bgHsl.s), borderSoftL));
      
      // High-contrast readable text
      root.style.setProperty('--clean-text-primary', '#1C1917');
      root.style.setProperty('--clean-text-secondary', '#57534E');
      root.style.setProperty('--clean-text-tertiary', '#78716C');
      root.classList.remove('dark-theme');
    } else {
      // DARK CUSTOM BACKGROUND
      // Active surface is clamped to a comfortable, non-glaring dark slate
      const surfaceL = Math.max(14, Math.min(24, Math.round(bgHsl.l * 0.45) + 6));
      root.style.setProperty('--clean-surface', hslToHex(bgHsl.h, Math.min(18, bgHsl.s), surfaceL));
      root.style.setProperty(
        '--clean-surface-warm',
        hslToHex(bgHsl.h, Math.min(18, bgHsl.s), surfaceL + 4)
      );
      root.style.setProperty(
        '--clean-surface-subtle',
        hslToHex(bgHsl.h, Math.min(18, bgHsl.s), surfaceL + 8)
      );
      root.style.setProperty(
        '--clean-border',
        hslToHex(bgHsl.h, Math.min(16, bgHsl.s), surfaceL + 12)
      );
      root.style.setProperty(
        '--clean-border-soft',
        hslToHex(bgHsl.h, Math.min(16, bgHsl.s), surfaceL + 8)
      );
      // Crisp light text for comfortable reading without glare
      root.style.setProperty('--clean-text-primary', '#F8FAFC');
      root.style.setProperty('--clean-text-secondary', '#CBD5E1');
      root.style.setProperty('--clean-text-tertiary', '#94A3B8');
      root.style.setProperty('--clean-highlight-cream', `${accentHex}30`);
      root.classList.add('dark-theme');
    }
    return;
  }

  // Preset background modes
  if (bgMode === 'dark') {
    // Midnight Dark Mode (Safe contrast slate)
    root.style.setProperty('--clean-bg', '#121214');
    root.style.setProperty('--clean-surface', '#1C1B1E');
    root.style.setProperty('--clean-surface-warm', '#242327');
    root.style.setProperty('--clean-surface-subtle', '#2C2B30');
    root.style.setProperty('--clean-border', '#38363C');
    root.style.setProperty('--clean-border-soft', '#2C2B30');
    root.style.setProperty('--clean-text-primary', '#F5F3EF');
    root.style.setProperty('--clean-text-secondary', '#CBD5E1');
    root.style.setProperty('--clean-text-tertiary', '#94A3B8');
    root.style.setProperty('--clean-highlight-cream', `${accentHex}25`);
    root.classList.add('dark-theme');
  } else if (bgMode === 'sepia') {
    // Sepia Parchment
    root.style.setProperty('--clean-bg', '#F5EEDB');
    root.style.setProperty('--clean-surface', '#FBF7ED');
    root.style.setProperty('--clean-surface-warm', '#EFE6D0');
    root.style.setProperty('--clean-surface-subtle', '#E5DAC0');
    root.style.setProperty('--clean-border', '#DDD1B8');
    root.style.setProperty('--clean-border-soft', '#E6DCBF');
    root.style.setProperty('--clean-text-primary', '#2C2216');
    root.style.setProperty('--clean-text-secondary', '#6B5D4D');
    root.style.setProperty('--clean-text-tertiary', '#968574');
    root.classList.remove('dark-theme');
  } else if (bgMode === 'white') {
    // Pure Clean White
    root.style.setProperty('--clean-bg', '#F8FAFC');
    root.style.setProperty('--clean-surface', '#FFFFFF');
    root.style.setProperty('--clean-surface-warm', '#F1F5F9');
    root.style.setProperty('--clean-surface-subtle', '#E2E8F0');
    root.style.setProperty('--clean-border', '#E2E8F0');
    root.style.setProperty('--clean-border-soft', '#CBD5E1');
    root.style.setProperty('--clean-text-primary', '#0F172A');
    root.style.setProperty('--clean-text-secondary', '#64748B');
    root.style.setProperty('--clean-text-tertiary', '#94A3B8');
    root.classList.remove('dark-theme');
  } else {
    // Original Warm Linen
    root.style.setProperty('--clean-bg', '#FAF7F2');
    root.style.setProperty('--clean-surface', '#FFFFFF');
    root.style.setProperty('--clean-surface-warm', '#FAF5ED');
    root.style.setProperty('--clean-surface-subtle', '#F5EFE6');
    root.style.setProperty('--clean-border', '#EBE5DC');
    root.style.setProperty('--clean-border-soft', '#F0EAE1');
    root.style.setProperty('--clean-text-primary', '#26221F');
    root.style.setProperty('--clean-text-secondary', '#78716C');
    root.style.setProperty('--clean-text-tertiary', '#A8A29E');
    root.classList.remove('dark-theme');
  }
}
