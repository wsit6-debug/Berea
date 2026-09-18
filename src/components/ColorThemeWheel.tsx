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
  const [editTarget, setEditTarget] = useState<EditTarget>('accent');
  const [isDraggingWheel, setIsDraggingWheel] = useState(false);
  const [hexInput, setHexInput] = useState(theme.accentHex);

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

  return (
    <>
      {/* FLOATING BOTTOM-RIGHT LAUNCHER */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#1C1B1E] text-[#26221F] dark:text-[#F5F3EF] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-[#EBE5DC] dark:border-[#38363C] hover:border-[#B4793D] transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Toggle Color Scheme Studio"
          aria-label="Toggle Color Theme Wheel"
        >
          {/* Conical Rainbow Wheel Badge */}
          <span
            className="w-5 h-5 rounded-full shadow-xs shrink-0 flex items-center justify-center p-0.5"
            style={{
              background:
                'conic-gradient(from 180deg at 50% 50%, #FF2A2A, #FFA726, #FFEE58, #66BB6A, #26C6DA, #29B6F6, #AB47BC, #FF2A2A)'
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-white/80"
              style={{ backgroundColor: theme.accentHex }}
            />
          </span>

          <span className="text-xs font-bold font-heading text-[#26221F] dark:text-[#F5F3EF]">
            Color Scheme
          </span>
        </button>
      </div>

      {/* DEDICATED BOTTOM COLOR SCHEME STUDIO (Solid, Opaque, High Contrast) */}
      {isOpen && (
        <div
          ref={drawerRef}
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-auto animate-fadeIn"
        >
          <div
            className="w-full max-w-4xl mx-auto rounded-t-2xl border-t border-x border-[#DCD5C9] dark:border-[#38363C] shadow-[0_-8px_36px_rgba(0,0,0,0.22)] p-4 sm:p-5 flex flex-col gap-3.5 select-none"
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              color: 'var(--clean-text-primary, #26221F)'
            }}
          >
            {/* Top Bar: Title & Reset/Close */}
            <div className="flex items-center justify-between border-b border-[#EBE5DC] dark:border-[#38363C] pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-black/15 shadow-2xs shrink-0"
                  style={{ backgroundColor: currentColorHex }}
                />
                <div>
                  <h3 className="font-heading font-bold text-xs leading-none" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                    Color Scheme Studio
                  </h3>
                  <p className="text-[10px] leading-none mt-0.5" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                    {theme.name || (editTarget === 'accent' ? 'Custom Accent' : 'Custom Background')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="p-1 px-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-[11px] flex items-center gap-1 font-medium cursor-pointer"
                  style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                  title="Reset to Berea default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Target Selector: Accent Color vs Background Tone */}
            <div className="flex items-center p-1 rounded-xl border border-[#EBE5DC] dark:border-[#38363C]" style={{ backgroundColor: 'var(--clean-surface-subtle, #FAF5ED)' }}>
              <button
                type="button"
                onClick={() => setEditTarget('accent')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  editTarget === 'accent'
                    ? 'bg-white dark:bg-[#1C1B1E] font-bold shadow-xs border border-[#EBE5DC] dark:border-[#38363C]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: 'var(--clean-text-primary, #26221F)' }}
              >
                <Paintbrush className="w-3.5 h-3.5" style={{ color: currentAccentHex }} />
                <span>Accent Color</span>
                <span className="text-[10px] opacity-70 hidden sm:inline">(Buttons, Tabs & Highlights)</span>
              </button>

              <button
                type="button"
                onClick={() => setEditTarget('background')}
                className={`flex-1 py-2 px-3 rounded-lg font-medium text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  editTarget === 'background'
                    ? 'bg-white dark:bg-[#1C1B1E] font-bold shadow-xs border border-[#EBE5DC] dark:border-[#38363C]'
                    : 'opacity-70 hover:opacity-100'
                }`}
                style={{ color: 'var(--clean-text-primary, #26221F)' }}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Background Tone</span>
                <span className="text-[10px] opacity-70 hidden sm:inline">(Page Canvas & Reading Surface)</span>
              </button>
            </div>

            {/* Contrast Guard Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2D5C3] dark:border-[#38363C] text-[10.5px]" style={{ backgroundColor: 'var(--clean-surface-warm, #FAF3E8)', color: 'var(--clean-accent-dark, #78471F)' }}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                <strong>Contrast Guard:</strong> Reading & notes surfaces stay protected and balanced for optimal legibility.
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
            <div className="w-full flex flex-col gap-2.5 p-3 rounded-xl border border-[#EBE5DC] dark:border-[#38363C]" style={{ backgroundColor: 'var(--clean-surface-warm, #FAF7F2)' }}>
              {/* Saturation Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                  <span>{editTarget === 'accent' ? 'Intensity (Saturation)' : 'Tone Saturation'}</span>
                  <span className="font-semibold" style={{ color: 'var(--clean-text-primary, #26221F)' }}>{currentSaturation}%</span>
                </div>
                <input
                  type="range"
                  min={editTarget === 'background' ? 0 : 10}
                  max={editTarget === 'background' ? 60 : 100}
                  value={currentSaturation}
                  onChange={e => handleSaturationChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#EBE5DC] dark:bg-[#38363C] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                />
              </div>

              {/* Lightness Slider */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                  <span>{editTarget === 'accent' ? 'Brightness (Lightness)' : 'Background Lightness'}</span>
                  <span className="font-semibold" style={{ color: 'var(--clean-text-primary, #26221F)' }}>{currentLightness}%</span>
                </div>
                <input
                  type="range"
                  min={editTarget === 'background' ? 10 : 20}
                  max={editTarget === 'background' ? 98 : 80}
                  value={currentLightness}
                  onChange={e => handleLightnessChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#EBE5DC] dark:bg-[#38363C] rounded-lg appearance-none cursor-pointer accent-[#007AFF]"
                />
              </div>
            </div>

            {/* Bottom: Hex Input and Direct Color Swatch */}
            <div className="w-full flex items-center justify-between gap-2">
              <div
                className="flex items-center gap-1.5 flex-1 px-3 py-1.5 rounded-lg border border-[#EBE5DC] dark:border-[#38363C]"
                style={{ backgroundColor: 'var(--clean-surface-subtle, #FAF5ED)' }}
              >
                <span className="text-xs font-mono font-bold" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                  HEX
                </span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={e => handleHexInputChange(e.target.value)}
                  placeholder={currentColorHex}
                  className="w-full bg-transparent font-mono text-xs font-bold outline-none uppercase"
                  style={{ color: 'var(--clean-text-primary, #26221F)' }}
                  maxLength={7}
                />
              </div>

              <label
                className="relative flex items-center justify-center w-9 h-8 rounded-lg cursor-pointer shadow-2xs border border-[#EBE5DC] dark:border-[#38363C] transition-transform hover:scale-105 shrink-0"
                style={{ backgroundColor: currentColorHex }}
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
          </div>
        </div>
      )}
    </>
  );
};
