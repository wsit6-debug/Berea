import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RotateCcw,
  ShieldCheck,
  Paintbrush,
  Sun
} from 'lucide-react';
import {
  ThemeConfig,
  DEFAULT_THEME,
  loadSavedTheme,
  saveTheme,
  applyThemeToDocument,
  hslToHex,
  hexToHsl,
  BackgroundMode
} from '../services/themeService';

export type EditTarget = 'accent' | 'background';

export interface ColorThemeWheelProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
}

export const ColorThemeWheel: React.FC<ColorThemeWheelProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onOpen: controlledOnOpen
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback((open: boolean) => {
    if (open) {
      controlledOnOpen?.();
      setInternalIsOpen(true);
    } else {
      controlledOnClose?.();
      setInternalIsOpen(false);
    }
  }, [controlledOnClose, controlledOnOpen]);

  const [theme, setTheme] = useState<ThemeConfig>(() => loadSavedTheme());
  const [savedThemes, setSavedThemes] = useState<ThemeConfig[]>(() => {
    try {
      const stored = localStorage.getItem('berea_saved_themes_list');
      if (stored) return JSON.parse(stored);
    } catch { }
    return [];
  });
  const [editTarget, setEditTarget] = useState<EditTarget>('accent');
  const [bgLightnessMode, setBgLightnessMode] = useState<'light' | 'dark'>(theme.bgLightness && theme.bgLightness < 50 ? 'dark' : 'light');
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [hexInput, setHexInput] = useState(theme.accentHex);

  const handleSaveProfile = () => {
    const newThemes = [...savedThemes, { ...theme, name: `Profile ${savedThemes.length + 1}` }];
    setSavedThemes(newThemes);
    localStorage.setItem('berea_saved_themes_list', JSON.stringify(newThemes));
    window.dispatchEvent(new Event('berea_saved_themes_updated'));
  };

  const handleDeleteProfile = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newThemes = savedThemes.filter((_, idx) => idx !== indexToDelete);
    setSavedThemes(newThemes);
    localStorage.setItem('berea_saved_themes_list', JSON.stringify(newThemes));
    window.dispatchEvent(new Event('berea_saved_themes_updated'));
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Active target parameters
  const currentAccentHex = theme.accentHex;
  const currentBgHex =
    theme.bgHex ||
    (theme.bgMode === 'dark'
      ? '#121214'
      : theme.bgMode === 'sepia'
        ? '#F5EEDB'
        : theme.bgMode === 'white'
          ? '#FFFFFF'
          : '#FAF7F2');

  const currentHue = editTarget === 'accent' ? theme.hue : (theme.bgHue ?? hexToHsl(currentBgHex).h);
  const currentSaturation = editTarget === 'accent' ? theme.saturation : (theme.bgSaturation ?? hexToHsl(currentBgHex).s);
  const currentLightness = editTarget === 'accent' ? theme.lightness : (theme.bgLightness ?? hexToHsl(currentBgHex).l);
  const currentColorHex = editTarget === 'accent' ? currentAccentHex : currentBgHex;

  const updateTheme = useCallback((newTheme: ThemeConfig) => {
    setTheme(newTheme);
    applyThemeToDocument(newTheme);
    saveTheme(newTheme);
  }, []);

  // Synchronize hex input
  useEffect(() => {
    setHexInput(currentColorHex);
  }, [editTarget, currentColorHex]);

  // Apply theme on mount
  useEffect(() => {
    const saved = loadSavedTheme();
    setTheme(saved);
    applyThemeToDocument(saved);

    const handleSavedThemesSync = () => {
      try {
        const stored = localStorage.getItem('berea_saved_themes_list');
        setSavedThemes(stored ? JSON.parse(stored) : []);
      } catch {}
    };
    window.addEventListener('berea_saved_themes_updated', handleSavedThemesSync);
    window.addEventListener('storage', handleSavedThemesSync);
    return () => {
      window.removeEventListener('berea_saved_themes_updated', handleSavedThemesSync);
      window.removeEventListener('storage', handleSavedThemesSync);
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  // Draw clean color wheel
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = width / 2 - 8;
    const innerRadius = outerRadius * 0.48;

    ctx.clearRect(0, 0, width, height);

    // Draw chromatic hue slices
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = ((angle - 1) * Math.PI) / 180;
      const endAngle = ((angle + 1.2) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.closePath();

      // Clear, saturated hue ring
      ctx.fillStyle = hslToHex(angle, editTarget === 'accent' ? Math.max(70, currentSaturation) : 55, editTarget === 'accent' ? 50 : 65);
      ctx.fill();
    }

    // Inner circle cutout
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = theme.bgMode === 'dark' ? '#1C1B1E' : '#FFFFFF';
    ctx.fill();

    // Center preview circle showing the exact resulting color
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * 0.74, 0, Math.PI * 2);
    ctx.fillStyle = currentColorHex;
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Subtle outer border for center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius * 0.74 + 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw thumb indicator for currently selected hue
    const thumbAngle = (currentHue * Math.PI) / 180;
    const thumbDistance = (innerRadius + outerRadius) / 2;
    const thumbX = centerX + Math.cos(thumbAngle) * thumbDistance;
    const thumbY = centerY + Math.sin(thumbAngle) * thumbDistance;

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 11, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(thumbX, thumbY, 8, 0, Math.PI * 2);
    ctx.fillStyle = currentColorHex;
    ctx.fill();
  }, [currentHue, currentSaturation, currentColorHex, editTarget, theme.bgMode]);

  // Redraw when opened or values change
  useEffect(() => {
    if (isOpen) {
      const animId = requestAnimationFrame(() => {
        drawWheel();
      });
      return () => cancelAnimationFrame(animId);
    }
  }, [isOpen, editTarget, drawWheel]);

  // Pointer handling for wheel
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDraggingWheel(true);
    calculateHueFromPointer(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingWheel) {
      calculateHueFromPointer(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isDraggingWheel) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setIsDraggingWheel(false);
    }
  };

  const calculateHueFromPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    let degrees = (Math.atan2(y, x) * 180) / Math.PI;
    if (degrees < 0) degrees += 360;

    const newHue = Math.round(degrees) % 360;

    if (editTarget === 'accent') {
      const newHex = hslToHex(newHue, theme.saturation, theme.lightness);
      updateTheme({
        ...theme,
        hue: newHue,
        accentHex: newHex,
        name: 'Custom Accent'
      });
    } else {
      const sat = theme.bgSaturation ?? 25;
      const light = theme.bgLightness ?? 95;
      const newHex = hslToHex(newHue, sat, light);
      updateTheme({
        ...theme,
        bgMode: 'custom',
        bgHue: newHue,
        bgSaturation: sat,
        bgLightness: light,
        bgHex: newHex,
        name: 'Custom Background'
      });
    }
  };

  const handleSaturationChange = (s: number) => {
    if (editTarget === 'accent') {
      const newHex = hslToHex(theme.hue, s, theme.lightness);
      updateTheme({
        ...theme,
        saturation: s,
        accentHex: newHex
      });
    } else {
      const h = theme.bgHue ?? currentHue;
      const l = theme.bgLightness ?? currentLightness;
      const newHex = hslToHex(h, s, l);
      updateTheme({
        ...theme,
        bgMode: 'custom',
        bgHue: h,
        bgSaturation: s,
        bgLightness: l,
        bgHex: newHex
      });
    }
  };

  const handleLightnessChange = (l: number) => {
    if (editTarget === 'accent') {
      const newHex = hslToHex(theme.hue, theme.saturation, l);
      updateTheme({
        ...theme,
        lightness: l,
        accentHex: newHex
      });
    } else {
      const h = theme.bgHue ?? currentHue;
      const s = theme.bgSaturation ?? currentSaturation;
      const newHex = hslToHex(h, s, l);
      updateTheme({
        ...theme,
        bgMode: 'custom',
        bgHue: h,
        bgSaturation: s,
        bgLightness: l,
        bgHex: newHex
      });
    }
  };

  const handleHexInputChange = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const hsl = hexToHsl(val);
      if (editTarget === 'accent') {
        updateTheme({
          ...theme,
          hue: hsl.h,
          saturation: hsl.s,
          lightness: hsl.l,
          accentHex: val.toUpperCase(),
          name: 'Custom Accent Hex'
        });
      } else {
        updateTheme({
          ...theme,
          bgMode: 'custom',
          bgHue: hsl.h,
          bgSaturation: hsl.s,
          bgLightness: hsl.l,
          bgHex: val.toUpperCase(),
          name: 'Custom Bg Hex'
        });
      }
    }
  };

  const handleResetDefault = () => {
    updateTheme(DEFAULT_THEME);
  };

  const isDarkTheme = theme.bgMode === 'dark' || (theme.bgLightness !== undefined && theme.bgLightness < 45);

  return (
    <>
      {/* (Floating launcher removed - accessed via Header Theme button) */}

      {/* DEDICATED BOTTOM COLOR SCHEME STUDIO (Solid, Opaque, High Contrast) */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-auto animate-fadeIn"
        >
          <div
            className="w-full max-w-4xl mx-auto rounded-t-2xl border-t border-x shadow-[0_-8px_36px_rgba(0,0,0,0.22)] p-4 sm:p-5 flex flex-col gap-3.5 select-none"
            style={{
              backgroundColor: isDarkTheme ? '#141316' : '#FFFFFF',
              borderColor: isDarkTheme ? '#38363C' : '#DCD5C9',
              color: isDarkTheme ? '#F5F3EF' : '#26221F'
            }}
          >
            {/* Top Bar: Title & Reset/Close */}
            <div
              className="flex items-center justify-between pb-2 border-b"
              style={{ borderColor: isDarkTheme ? '#2A292E' : '#EBE5DC' }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: currentColorHex }}
                />
                <div>
                  <h3
                    className="font-heading font-bold text-xs leading-none"
                    style={{ color: isDarkTheme ? '#FFFFFF' : '#26221F' }}
                  >
                    Color Scheme Studio
                  </h3>
                  <p
                    className="text-[10px] leading-none mt-0.5"
                    style={{ color: isDarkTheme ? '#CBD5E1' : '#78716C' }}
                  >
                    {theme.name || (editTarget === 'accent' ? 'Custom Accent' : 'Custom Background')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="p-1 px-2 rounded-md transition-colors text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                  style={{
                    color: isDarkTheme ? '#F8FAFC' : '#57524E',
                    backgroundColor: isDarkTheme ? '#26252B' : '#FAF5ED',
                    border: isDarkTheme ? '1px solid #48464C' : '1px solid #EBE5DC'
                  }}
                  title="Reset to Berea default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md transition-colors cursor-pointer"
                  style={{
                    color: isDarkTheme ? '#F8FAFC' : '#57524E',
                    backgroundColor: isDarkTheme ? '#26252B' : '#FAF5ED',
                    border: isDarkTheme ? '1px solid #48464C' : '1px solid #EBE5DC'
                  }}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Selector: Accent Color vs Background Tone */}
            <div
              className="flex items-center p-1 rounded-xl border"
              style={{
                backgroundColor: isDarkTheme ? '#18171C' : '#FAF5ED',
                borderColor: isDarkTheme ? '#38363C' : '#EBE5DC'
              }}
            >
              <button
                type="button"
                onClick={() => setEditTarget('accent')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer border ${editTarget === 'accent' ? 'font-bold shadow-xs' : 'border-transparent'
                  }`}
                style={{
                  backgroundColor: editTarget === 'accent' ? (isDarkTheme ? '#2C2B32' : '#FFFFFF') : 'transparent',
                  borderColor: editTarget === 'accent' ? (isDarkTheme ? '#5A5864' : '#E2D5C3') : 'transparent',
                  color: editTarget === 'accent' ? (isDarkTheme ? '#FFFFFF' : '#26221F') : (isDarkTheme ? '#CBD5E1' : '#78716C')
                }}
              >
                <Paintbrush className="w-3.5 h-3.5" style={{ color: currentAccentHex }} />
                <span>Accent Color</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">(Buttons, Tabs & Highlights)</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTarget('background')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer border ${editTarget === 'background' ? 'font-bold shadow-xs' : 'border-transparent'
                  }`}
                style={{
                  backgroundColor: editTarget === 'background' ? (isDarkTheme ? '#2C2B32' : '#FFFFFF') : 'transparent',
                  borderColor: editTarget === 'background' ? (isDarkTheme ? '#5A5864' : '#E2D5C3') : 'transparent',
                  color: editTarget === 'background' ? (isDarkTheme ? '#FFFFFF' : '#26221F') : (isDarkTheme ? '#CBD5E1' : '#78716C')
                }}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Background Tone</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">(Page Canvas & Reading Surface)</span>
              </button>
            </div>

            {/* Contrast Guard Badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10.5px]"
              style={{
                backgroundColor: isDarkTheme ? '#1E293B' : '#FAF3E8',
                borderColor: isDarkTheme ? '#334155' : '#E2D5C3',
                color: isDarkTheme ? '#F1F5F9' : '#78471F'
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                <strong style={{ color: isDarkTheme ? '#34D399' : '#059669' }}>Contrast Guard:</strong> Reading & notes surfaces stay protected and balanced for optimal legibility.
              </span>
            </div>

            {/* Main Wheel Area */}
            <div className="flex flex-col items-center justify-center my-1">
              <canvas
                ref={canvasRef}
                width={190}
                height={190}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="cursor-crosshair rounded-full shadow-md touch-none hover:scale-[1.01] transition-transform"
                title={`Click or drag around the color wheel to choose ${editTarget}`}
              />
            </div>

            {/* Sliders Container */}
            <div
              className="w-full flex flex-col gap-2.5 p-3 rounded-xl border"
              style={{
                backgroundColor: isDarkTheme ? '#1A191E' : '#FAF7F2',
                borderColor: isDarkTheme ? '#38363C' : '#EBE5DC'
              }}
            >
              {/* Saturation Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span style={{ color: isDarkTheme ? '#E2E8F0' : '#78716C' }}>
                    {editTarget === 'accent' ? 'Intensity (Saturation)' : 'Tone Saturation'}
                  </span>
                  <span className="font-semibold" style={{ color: isDarkTheme ? '#FFFFFF' : '#26221F' }}>
                    {(() => {
                      const min = editTarget === 'background' ? 0 : 10;
                      const max = editTarget === 'background' ? 60 : 100;
                      return Math.min(100, Math.max(0, Math.round(((currentSaturation - min) / (max - min)) * 100)));
                    })()}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={(() => {
                    const min = editTarget === 'background' ? 0 : 10;
                    const max = editTarget === 'background' ? 60 : 100;
                    return Math.min(100, Math.max(0, Math.round(((currentSaturation - min) / (max - min)) * 100)));
                  })()}
                  onChange={e => {
                    const norm = Number(e.target.value);
                    const min = editTarget === 'background' ? 0 : 10;
                    const max = editTarget === 'background' ? 60 : 100;
                    const actualVal = Math.round(min + (norm / 100) * (max - min));
                    handleSaturationChange(actualVal);
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                  style={{ backgroundColor: isDarkTheme ? '#38363C' : '#EBE5DC' }}
                />
              </div>

              {/* Lightness Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span style={{ color: isDarkTheme ? '#E2E8F0' : '#78716C' }}>
                    {editTarget === 'accent' ? 'Brightness (Lightness)' : 'Background Lightness'}
                  </span>
                  <div className="flex items-center gap-2">
                    {editTarget === 'background' && (
                      <div
                        className="flex p-0.5 rounded-lg border"
                        style={{
                          backgroundColor: isDarkTheme ? '#141316' : '#EBE5DC',
                          borderColor: isDarkTheme ? '#38363C' : '#DCD5C9'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setBgLightnessMode('light');
                            handleLightnessChange(90); // Darkest light version
                          }}
                          className="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer"
                          style={{
                            backgroundColor: bgLightnessMode === 'light' ? '#FFFFFF' : 'transparent',
                            color: bgLightnessMode === 'light' ? '#141211' : (isDarkTheme ? '#A8A29E' : '#78716C')
                          }}
                        >
                          LIGHT
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBgLightnessMode('dark');
                            handleLightnessChange(30); // Lightest dark version
                          }}
                          className="px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer"
                          style={{
                            backgroundColor: bgLightnessMode === 'dark' ? (isDarkTheme ? '#2C2B30' : '#26221F') : 'transparent',
                            color: bgLightnessMode === 'dark' ? '#FFFFFF' : (isDarkTheme ? '#A8A29E' : '#78716C')
                          }}
                        >
                          DARK
                        </button>
                      </div>
                    )}
                    <span className="font-semibold" style={{ color: isDarkTheme ? '#FFFFFF' : '#26221F' }}>
                      {(() => {
                        const min = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 10 : 80) : 20;
                        const max = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 30 : 98) : 80;
                        return Math.min(100, Math.max(0, Math.round(((currentLightness - min) / (max - min)) * 100)));
                      })()}%
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={(() => {
                    const min = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 10 : 80) : 20;
                    const max = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 30 : 98) : 80;
                    return Math.min(100, Math.max(0, Math.round(((currentLightness - min) / (max - min)) * 100)));
                  })()}
                  onChange={e => {
                    const norm = Number(e.target.value);
                    const min = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 10 : 80) : 20;
                    const max = editTarget === 'background' ? (bgLightnessMode === 'dark' ? 30 : 98) : 80;
                    const actualVal = Math.round(min + (norm / 100) * (max - min));
                    handleLightnessChange(actualVal);
                  }}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                  style={{ backgroundColor: isDarkTheme ? '#38363C' : '#EBE5DC' }}
                />
              </div>
            </div>

            {/* Bottom: Hex Input and Direct Color Swatch */}
            <div className="w-full flex items-center justify-between gap-2.5">
              <div
                className="flex items-center gap-2 flex-1 px-3 py-1.5 rounded-lg border"
                style={{
                  backgroundColor: isDarkTheme ? '#18171C' : '#FAF5ED',
                  borderColor: isDarkTheme ? '#38363C' : '#EBE5DC'
                }}
              >
                <span className="text-xs font-mono font-bold" style={{ color: isDarkTheme ? '#CBD5E1' : '#78716C' }}>
                  HEX
                </span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={e => handleHexInputChange(e.target.value)}
                  placeholder={currentColorHex}
                  className="w-full bg-transparent font-mono text-xs font-bold outline-none uppercase"
                  style={{ color: isDarkTheme ? '#FFFFFF' : '#26221F' }}
                  maxLength={7}
                />
              </div>

              <label
                className="relative flex items-center justify-center rounded-lg cursor-pointer shadow-2xs border transition-transform hover:scale-105 shrink-0"
                style={{
                  width: '38px',
                  height: '34px',
                  backgroundColor: currentColorHex,
                  borderColor: isDarkTheme ? '#48464C' : '#EBE5DC'
                }}
                title={`Open picker for ${editTarget}`}
              >
                <input
                  type="color"
                  value={currentColorHex}
                  onChange={e => handleHexInputChange(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>

            {/* Return to Default & Saved Profiles Section */}
            <div
              className="pt-3 border-t flex flex-col gap-2.5"
              style={{ borderColor: isDarkTheme ? '#2A292E' : '#EBE5DC' }}
            >
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs"
                  style={{
                    backgroundColor: isDarkTheme ? '#26252C' : '#FAF5ED',
                    borderColor: isDarkTheme ? '#48464C' : '#EBE5DC',
                    color: isDarkTheme ? '#FFFFFF' : '#26221F'
                  }}
                  title="Return to predetermined default color scheme"
                >
                  <RotateCcw className="w-3.5 h-3.5" style={{ color: currentAccentHex }} />
                  <span>Return to Default Scheme</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isDarkTheme ? '#26252C' : '#FAF5ED',
                    borderColor: isDarkTheme ? '#48464C' : '#EBE5DC',
                    color: isDarkTheme ? '#FFFFFF' : '#26221F'
                  }}
                >
                  Save Current
                </button>
              </div>

              {savedThemes.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: isDarkTheme ? '#CBD5E1' : '#78716C' }}>
                    Saved Profiles
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                    {savedThemes.map((t, idx) => (
                      <div key={idx} className="relative group/saved flex flex-col items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => updateTheme(t)}
                          className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
                          title={`Load ${t.name || `Profile ${idx + 1}`}`}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-[#B4793D] transition-all shadow-sm flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: t.bgHex || (t.bgMode === 'dark' ? '#121214' : '#FAF7F2') }}
                          >
                            <div className="w-3 h-3 rounded-full shadow-2xs" style={{ backgroundColor: t.accentHex }} />
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteProfile(idx, e)}
                          className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[8px] font-bold opacity-0 group-hover/saved:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Delete profile"
                          aria-label="Delete profile"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
