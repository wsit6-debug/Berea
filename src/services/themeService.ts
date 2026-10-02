export type BackgroundMode = 'warm' | 'white' | 'sepia' | 'dark' | 'custom';

export interface ThemeConfig {
  id?: string;
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
  id: 'original',
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

// Convert Hex to RGB integer triplet
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const num = parseInt(c, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
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
 * Apply Theme:
 * - Background Tone controls: Outside perimeter canvas (--clean-bg) & Top bar (--clean-header-bg, --clean-header-btn-bg, --clean-header-border, --clean-header-text)
 * - Accent Color controls: Distinctive color system of what is within the bible sections (pills, badges, active tabs, buttons, borders, highlights)
 * - Bible Pages: Keep the clean white background (--clean-surface: #FFFFFF) with deep readable text (--clean-text-primary: #26221F)
 */
export function applyThemeToDocument(theme: ThemeConfig): void {
  const root = document.documentElement;
  const { hue, saturation, lightness, accentHex, bgMode } = theme;

  // 1. Accent variants: Changes the surrounding controls, toolbars, and borders within the bible section
  const { r, g, b } = hexToRgb(accentHex);
  root.style.setProperty('--clean-accent-rgb', `${r}, ${g}, ${b}`);

  // Calculate relative luminance of the accent color
  const accentLum = getRelativeLuminance(accentHex);
  const isYellowOrBright = (hue >= 36 && hue <= 88) || accentLum > 0.35;

  // 1. Accent Dark (for text, titles, headings, and high-contrast labels):
  // Must have high WCAG contrast against white (ratio >= 4.5:1).
  // For yellow/gold/amber (hue 36-88), clamp lightness to deep rich amber/bronze (24-28%).
  let darkLightness = Math.max(16, lightness - 16);
  if (isYellowOrBright) {
    darkLightness = Math.min(26, Math.max(16, Math.round(lightness * 0.42)));
  } else {
    darkLightness = Math.min(32, darkLightness);
  }
  const accentDarkHex = hslToHex(hue, Math.min(100, Math.max(75, saturation + 15)), darkLightness);

  // 2. Accent Border (for cards, buttons, badges, pills):
  // Must be clearly outlined and visible against white backgrounds.
  // For yellow/bright colors, use a rich, vivid golden border (lightness 40-45%) so it never washes out.
  let borderLightness = Math.min(58, Math.max(40, lightness));
  if (isYellowOrBright) {
    borderLightness = Math.min(45, Math.max(36, Math.round(lightness * 0.68)));
  }
  const accentBorderHex = hslToHex(hue, Math.min(100, Math.max(70, saturation + 10)), borderLightness);
  const accentBorderStrongHex = hslToHex(hue, Math.min(100, Math.max(80, saturation + 15)), Math.max(26, borderLightness - 12));

  // 3. Accent Tint (for card backgrounds like Theological Synthesis):
  // Very soft luminous tint (lightness 95%) with controlled saturation so text always stands out.
  const accentTintHex = hslToHex(hue, Math.min(40, Math.max(20, saturation)), 95);

  // 4. Accent Honey (warm medium highlight):
  const accentHoneyHex = hslToHex(hue, Math.min(95, saturation + 5), Math.min(60, lightness + 5));

  // 5. Contrast text for buttons that have solid accent background:
  // If the accent itself is bright (like yellow), white text on yellow is unreadable, so use dark text.
  const accentContrastText = accentLum > 0.40 ? '#1C1917' : '#FFFFFF';

  root.style.setProperty('--clean-accent-caramel', accentHex);
  root.style.setProperty('--clean-accent-dark', accentDarkHex);
  root.style.setProperty('--clean-accent-honey', accentHoneyHex);
  root.style.setProperty('--clean-highlight-cream', accentTintHex);
  root.style.setProperty('--clean-accent-border', accentBorderHex);
  root.style.setProperty('--clean-accent-border-strong', accentBorderStrongHex);
  root.style.setProperty('--clean-accent-contrast-text', accentContrastText);

  // 2. Bible pages: Keep the clean crisp white background & readable text
  root.style.setProperty('--clean-surface', '#FFFFFF');
  root.style.setProperty('--clean-surface-warm', accentTintHex);
  root.style.setProperty('--clean-surface-subtle', hslToHex(hue, Math.min(45, Math.max(25, saturation)), 91));
  root.style.setProperty('--clean-border', accentBorderHex);
  root.style.setProperty('--clean-border-soft', hslToHex(hue, Math.min(45, Math.max(20, saturation)), 84));
  root.style.setProperty('--clean-text-primary', '#26221F');
  root.style.setProperty('--clean-text-secondary', '#57524E');
  root.style.setProperty('--clean-text-tertiary', '#8C827A');
  root.classList.remove('dark-theme');

  // 3. Background Tone controls the background perimeter AND the top bar
  let bgHex = '#FAF7F2';
  if (bgMode === 'custom' && theme.bgHex) {
    bgHex = theme.bgHex;
  } else if (bgMode === 'dark') {
    bgHex = '#121214';
  } else if (bgMode === 'sepia') {
    bgHex = '#F5EEDB';
  } else if (bgMode === 'white') {
    bgHex = '#F8FAFC';
  } else {
    bgHex = '#FAF7F2';
  }
  // Bottom section canvas
  root.style.setProperty('--clean-bg', bgHex);

  const bgLuminance = getRelativeLuminance(bgHex);
  const bgHsl = hexToHsl(bgHex);
  const isDarkBg = bgLuminance < 0.28 || bgHsl.l < 48;

  if (isDarkBg) {
    // Dark background:
    // Top section is automatically adjusted to be darker than the bottom section
    const headerBg = hslToHex(bgHsl.h, Math.min(30, bgHsl.s + 4), Math.max(3, bgHsl.l - 5));
    // Separating line has a distinct tone controlled by background tone, darker than both
    const headerBorder = hslToHex(bgHsl.h, Math.min(35, bgHsl.s + 8), Math.max(1, bgHsl.l - 8));
    const headerBtnBg = hslToHex(bgHsl.h, Math.min(22, bgHsl.s), Math.min(28, bgHsl.l + 4));

    root.style.setProperty('--clean-header-bg', headerBg);
    root.style.setProperty('--clean-header-border', headerBorder);
    root.style.setProperty('--clean-header-btn-bg', headerBtnBg);
    root.style.setProperty('--clean-header-text', '#F8FAFC');
    root.style.setProperty('--clean-header-text-secondary', 'rgba(255, 255, 255, 0.75)');
  } else if (bgMode === 'sepia') {
    // Sepia: top section is darker than bottom section (#F5EEDB)
    root.style.setProperty('--clean-header-bg', '#EADBBD');
    root.style.setProperty('--clean-header-border', '#C7B28B');
    root.style.setProperty('--clean-header-btn-bg', '#E5DAC0');
    root.style.setProperty('--clean-header-text', '#2C2216');
    root.style.setProperty('--clean-header-text-secondary', '#6B5D4D');
  } else if (bgMode === 'white') {
    // White: top section is darker than bottom section (#F8FAFC)
    root.style.setProperty('--clean-header-bg', '#ECEFF4');
    root.style.setProperty('--clean-header-border', '#CBD5E1');
    root.style.setProperty('--clean-header-btn-bg', '#FFFFFF');
    root.style.setProperty('--clean-header-text', '#0F172A');
    root.style.setProperty('--clean-header-text-secondary', '#64748B');
  } else if (bgMode === 'custom') {
    // Custom background:
    // Top section is automatically adjusted to be darker than the bottom section
    const headerBg = hslToHex(bgHsl.h, Math.min(45, bgHsl.s + 4), Math.max(10, bgHsl.l - 7));
    // Separating line has a distinct tone controlled by background tone
    const headerBorder = hslToHex(bgHsl.h, Math.min(50, bgHsl.s + 12), Math.max(6, bgHsl.l - 16));
    const headerBtnBg = hslToHex(bgHsl.h, Math.min(35, bgHsl.s), Math.max(90, Math.min(97, bgHsl.l)));

    const headerBgLum = getRelativeLuminance(headerBg);
    const isDarkHeader = headerBgLum < 0.38 || bgHsl.l < 52;

    root.style.setProperty('--clean-header-bg', headerBg);
    root.style.setProperty('--clean-header-border', headerBorder);
    root.style.setProperty('--clean-header-btn-bg', headerBtnBg);
    root.style.setProperty('--clean-header-text', isDarkHeader ? '#F8FAFC' : '#26221F');
    root.style.setProperty('--clean-header-text-secondary', isDarkHeader ? 'rgba(255, 255, 255, 0.75)' : '#57524E');
  } else {
    // Warm Linen: top section (#F0E6D8) is automatically darker than bottom section (#FAF7F2)
    root.style.setProperty('--clean-header-bg', '#F0E6D8');
    root.style.setProperty('--clean-header-border', '#D2C0A7');
    root.style.setProperty('--clean-header-btn-bg', '#FAF5ED');
    root.style.setProperty('--clean-header-text', '#26221F');
    root.style.setProperty('--clean-header-text-secondary', '#78716C');
  }
}

