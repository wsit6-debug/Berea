import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  X,
  Check,
  Palette,
  MessageSquareHeart,
  RotateCcw,
  ExternalLink,
  Paintbrush,
  Sun,
  Moon,
  Sparkles,
  Trash2,
  Plus,
  Lock
} from 'lucide-react';
import {
  ThemeConfig,
  DEFAULT_THEME,
  loadSavedTheme,
  saveTheme,
  applyThemeToDocument,
  BackgroundMode
} from '../services/themeService';
import { FEEDBACK_CONFIG } from '../data/feedbackConfig';

import { useLanguage } from '../i18n/LanguageContext';

export type SettingsTab = 'language' | 'theme' | 'feedback';

export interface SettingsWidgetProps {
  onOpenThemeStudio?: () => void;
  onOpenFeedbackModal?: () => void;
}

const ORIGINAL_DEFAULT_PRESET: ThemeConfig = {
  ...DEFAULT_THEME,
  name: 'Warm Caramel (Original)'
};

export const SettingsWidget: React.FC<SettingsWidgetProps> = ({
  onOpenThemeStudio,
  onOpenFeedbackModal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('language');
  const { language, setLanguage, languages, t } = useLanguage();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(() => loadSavedTheme());
  const [savedThemes, setSavedThemes] = useState<ThemeConfig[]>(() => {
    try {
      const stored = localStorage.getItem('berea_saved_themes_list');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Sync theme changes & saved presets
  useEffect(() => {
    const handleStorage = () => {
      setCurrentTheme(loadSavedTheme());
      try {
        const stored = localStorage.getItem('berea_saved_themes_list');
        setSavedThemes(stored ? JSON.parse(stored) : []);
      } catch {}
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('berea_saved_themes_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('berea_saved_themes_updated', handleStorage);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleApplyTheme = (newTheme: ThemeConfig) => {
    setCurrentTheme(newTheme);
    saveTheme(newTheme);
    applyThemeToDocument(newTheme);
  };

  const handleApplyBgMode = (mode: BackgroundMode) => {
    let bgHex = '#FAF7F2';
    if (mode === 'dark') bgHex = '#121214';
    else if (mode === 'sepia') bgHex = '#F5EEDB';
    else if (mode === 'white') bgHex = '#FFFFFF';

    const newTheme: ThemeConfig = {
      ...currentTheme,
      bgMode: mode,
      bgHex
    };
    handleApplyTheme(newTheme);
  };

  const handleResetTheme = () => {
    handleApplyTheme(DEFAULT_THEME);
  };

  const handleSaveCurrentPreset = () => {
    const newProfileName = `Saved Preset ${savedThemes.length + 1}`;
    const newTheme: ThemeConfig = { ...currentTheme, name: newProfileName };
    const updated = [...savedThemes, newTheme];
    setSavedThemes(updated);
    try {
      localStorage.setItem('berea_saved_themes_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('berea_saved_themes_updated'));
    } catch {}
  };

  const handleDeletePreset = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedThemes.filter((_, idx) => idx !== indexToDelete);
    setSavedThemes(updated);
    try {
      localStorage.setItem('berea_saved_themes_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('berea_saved_themes_updated'));
    } catch {}
  };

  const isOriginalThemeActive =
    currentTheme.accentHex?.toUpperCase() === DEFAULT_THEME.accentHex?.toUpperCase() &&
    (currentTheme.bgMode === 'warm' || currentTheme.bgHex === '#FAF7F2');

  return (
    <div className="relative flex-shrink-0">
      {/* HEADER SETTINGS BUTTON */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`ios-glass-btn transition-all !px-2.5 !py-1 flex items-center gap-1.5 rounded-lg select-none cursor-pointer flex-shrink-0 whitespace-nowrap ${
          isOpen ? 'active font-bold shadow-sm' : ''
        }`}
        style={
          isOpen
            ? {
                backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                borderColor: 'var(--clean-accent-caramel, #B4793D)',
                color: '#FFFFFF'
              }
            : {
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                color: 'var(--clean-text-primary, #26221F)'
              }
        }
        aria-label="Open Settings"
        title="Settings (Theme & Feedback)"
      >
        <Settings
          className={`w-3.5 h-3.5 transition-transform duration-300 flex-shrink-0 ${
            isOpen ? 'rotate-90' : 'group-hover:rotate-45'
          }`}
          style={{
            color: isOpen
              ? '#FFFFFF'
              : 'var(--clean-accent-caramel, #B4793D)'
          }}
        />

        <span className="text-xs font-semibold whitespace-nowrap">
          Settings
        </span>
      </button>

      {/* Settings Popover Panel - Drops down from top bar directly under button */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute top-full right-0 mt-2 z-50 flex flex-col rounded-2xl border shadow-2xl backdrop-blur-xl animate-fadeIn overflow-hidden"
          style={{
            zIndex: 70,
            width: '380px',
            maxWidth: 'calc(100vw - 2.5rem)',
            height: '520px',
            maxHeight: '85vh',
            backgroundColor: 'var(--clean-surface, #FFFFFF)',
            borderColor: 'var(--clean-accent-border, #EBE5DC)',
            color: 'var(--clean-text-primary, #26221F)'
          }}
        >
          {/* Fixed Height Header */}
          <div
            className="p-3.5 sm:p-4 border-b flex items-center justify-between shrink-0"
            style={{
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-surface-warm, #FAF5ED)',
              height: '56px'
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border shadow-2xs"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-accent-caramel, #B4793D)'
                }}
              >
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm leading-none">
                  {t('settingsTitle', 'Settings')}
                </h3>
                <p className="text-[11px] text-[var(--clean-text-secondary,#78716C)] leading-tight mt-0.5">
                  {t('settingsSubtitle', 'Language, Theme & Feedback')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-black/5"
              style={{ color: 'var(--clean-text-secondary, #78716C)' }}
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 3-Tab Navigation: Language | Theme | Feedback */}
          <div
            className="flex items-center p-1.5 border-b gap-1.5 shrink-0 overflow-x-auto custom-scrollbar"
            style={{
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              height: '46px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('language')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'language'
                  ? 'border-[var(--clean-accent-border-strong,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] text-[var(--clean-accent-dark,#78471F)] shadow-2xs'
                  : 'border-transparent text-[var(--clean-text-secondary,#78716C)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
              }`}
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center">🌍</span>
              <span>{t('tabLanguage', 'Language')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'theme'
                  ? 'border-[var(--clean-accent-border-strong,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] text-[var(--clean-accent-dark,#78471F)] shadow-2xs'
                  : 'border-transparent text-[var(--clean-text-secondary,#78716C)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{t('tabColorScheme', 'Theme')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                activeTab === 'feedback'
                  ? 'border-[var(--clean-accent-border-strong,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] text-[var(--clean-accent-dark,#78471F)] shadow-2xs'
                  : 'border-transparent text-[var(--clean-text-secondary,#78716C)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
              }`}
            >
              <MessageSquareHeart className="w-3.5 h-3.5" />
              <span>{t('tabFeedback', 'Feedback')}</span>
            </button>
          </div>

          {/* Content Area - Takes remaining height identically across both tabs */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3.5 space-y-3.5">
            {/* TAB 0: LANGUAGE */}
            {activeTab === 'language' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clean-text-secondary,#78716C)]">
                    {t('languageSelectTitle', 'Interface & Theology Language')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {languages.map(lang => {
                      const isActive = language === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setLanguage(lang.code)}
                          className={`p-2 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'border-[var(--clean-accent-caramel,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] font-bold shadow-xs'
                              : 'border-[var(--clean-accent-border,#EBE5DC)] bg-[var(--clean-surface,#FFFFFF)] hover:bg-[var(--clean-surface-warm,#FAF5ED)] font-medium'
                          }`}
                        >
                          <span className="text-base leading-none">{lang.flag}</span>
                          <span className="truncate text-left flex-1" style={{ color: isActive ? 'var(--clean-accent-dark,#78471F)' : 'var(--clean-text-primary,#26221F)' }}>
                            {lang.nativeName}
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 shrink-0 text-[var(--clean-accent-caramel,#B4793D)]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: COLOR SCHEME */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                {/* Background Atmosphere Modes */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clean-text-secondary,#78716C)]">
                    Background Atmosphere
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'warm', label: 'Warm Linen', hex: '#FAF7F2', icon: Sun },
                      { id: 'white', label: 'Crisp White', hex: '#FFFFFF', icon: Sparkles },
                      { id: 'sepia', label: 'Sepia Paper', hex: '#F5EEDB', icon: Sun },
                      { id: 'dark', label: 'Obsidian Dark', hex: '#121214', icon: Moon }
                    ].map(bg => {
                      const isActive = currentTheme.bgMode === bg.id;
                      const IconComp = bg.icon;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => handleApplyBgMode(bg.id as BackgroundMode)}
                          className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'border-[var(--clean-accent-caramel,#B4793D)] shadow-xs font-semibold'
                              : 'border-[var(--clean-accent-border,#EBE5DC)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
                          }`}
                          style={{
                            backgroundColor: bg.hex,
                            color: bg.id === 'dark' ? '#FFFFFF' : '#26221F'
                          }}
                        >
                          <IconComp className="w-3.5 h-3.5 shrink-0 opacity-70" />
                          <span className="truncate">{bg.label}</span>
                          {isActive && <Check className="w-3 h-3 ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Presets: Hard-Stuck Original + User-Saved Presets (Removable) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--clean-text-secondary,#78716C)]">
                      Color Presets
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveCurrentPreset}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors cursor-pointer flex items-center gap-1 hover:border-[var(--clean-accent-caramel,#B4793D)]"
                      style={{
                        backgroundColor: 'var(--clean-surface-warm, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        color: 'var(--clean-accent-caramel, #B4793D)'
                      }}
                      title="Save current scheme as a preset"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Save Current</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto custom-scrollbar pr-0.5">
                    {/* HARD-STUCK ORIGINAL PRESET (Permanent, Not Removable) */}
                    <div
                      onClick={() => handleApplyTheme(ORIGINAL_DEFAULT_PRESET)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                        isOriginalThemeActive
                          ? 'border-[var(--clean-accent-caramel,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] shadow-2xs font-semibold'
                          : 'border-[var(--clean-accent-border,#EBE5DC)] bg-[var(--clean-surface,#FFFFFF)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: ORIGINAL_DEFAULT_PRESET.bgHex }}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full shadow-2xs"
                            style={{ backgroundColor: ORIGINAL_DEFAULT_PRESET.accentHex }}
                          />
                        </div>
                        <span className="text-xs truncate">Warm Caramel</span>
                        <span
                          className="text-[9px] px-1.5 py-0.2 rounded border font-mono font-bold shrink-0"
                          style={{
                            borderColor: 'var(--clean-accent-border, #EBE5DC)',
                            backgroundColor: 'var(--clean-surface-warm, #FAF5ED)',
                            color: 'var(--clean-accent-caramel, #B4793D)'
                          }}
                          title="Permanent original default theme"
                        >
                          Original
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isOriginalThemeActive && (
                          <Check className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                        )}
                        <span title="Permanent preset">
                          <Lock className="w-3 h-3 text-[var(--clean-text-secondary,#A8A29E)] opacity-50" />
                        </span>
                      </div>
                    </div>

                    {/* USER-SAVED PRESETS (Removable) */}
                    {savedThemes.map((saved, idx) => {
                      const isSelected =
                        currentTheme.accentHex?.toUpperCase() === saved.accentHex?.toUpperCase() &&
                        currentTheme.bgHex?.toUpperCase() === (saved.bgHex || (saved.bgMode === 'dark' ? '#121214' : '#FAF7F2')).toUpperCase();

                      return (
                        <div
                          key={idx}
                          onClick={() => handleApplyTheme(saved)}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer group ${
                            isSelected
                              ? 'border-[var(--clean-accent-caramel,#B4793D)] bg-[var(--clean-highlight-cream,#FAF3E8)] shadow-2xs font-semibold'
                              : 'border-[var(--clean-accent-border,#EBE5DC)] bg-[var(--clean-surface,#FFFFFF)] hover:bg-[var(--clean-surface-warm,#FAF5ED)]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-5 h-5 rounded-full border border-black/15 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden"
                              style={{ backgroundColor: saved.bgHex || (saved.bgMode === 'dark' ? '#121214' : '#FAF7F2') }}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full shadow-2xs"
                                style={{ backgroundColor: saved.accentHex }}
                              />
                            </div>
                            <span className="text-xs truncate">{saved.name || `Custom Theme ${idx + 1}`}</span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                            )}
                            <button
                              type="button"
                              onClick={(e) => handleDeletePreset(idx, e)}
                              className="p-1 rounded hover:bg-red-50 text-[var(--clean-text-secondary,#78716C)] hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete preset"
                              aria-label="Delete preset"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {savedThemes.length === 0 && (
                      <p className="text-[11px] text-[var(--clean-text-secondary,#78716C)] italic px-1 py-1">
                        No custom presets saved yet. Customize below and click "Save Current".
                      </p>
                    )}
                  </div>
                </div>

                {/* Launch Advanced Studio Drawer */}
                <div
                  className="p-3 rounded-xl border space-y-2 shrink-0"
                  style={{
                    backgroundColor: 'var(--clean-surface-warm, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Paintbrush className="w-4 h-4 text-[var(--clean-accent-caramel,#B4793D)]" />
                    <span className="font-semibold text-xs">Custom HSL Color Studio</span>
                  </div>
                  <p className="text-[11px] text-[var(--clean-text-secondary,#78716C)] leading-tight">
                    Fine-tune exact 360° hues, saturation, lightness, and live contrast ratios.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenThemeStudio?.();
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                        color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                      }}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>Open Color Studio</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetTheme}
                      className="p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer hover:bg-black/5"
                      style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      title="Reset Theme to Default"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[var(--clean-text-secondary,#78716C)]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PASTORAL & THEOLOGICAL FEEDBACK */}
            {activeTab === 'feedback' && (
              <div className="space-y-4 flex flex-col h-full justify-between pb-1">
                <div className="space-y-3.5">
                  <div
                    className="p-3.5 rounded-xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--clean-surface-warm, #FAF5ED)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquareHeart className="w-4 h-4 text-[var(--clean-accent-caramel,#B4793D)]" />
                      <span className="font-semibold text-xs">Clergy & Theological Review</span>
                    </div>
                    <p className="text-[11.5px] text-[var(--clean-text-secondary,#78716C)] leading-relaxed">
                      Berea values scholastic, pastoral, and doctrinal guidance. Share feedback on confessional commentary, translations, or technical features.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        onOpenFeedbackModal?.();
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 border"
                      style={{
                        backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                        borderColor: 'var(--clean-accent-caramel, #B4793D)',
                        color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                      }}
                    >
                      <MessageSquareHeart className="w-4 h-4" />
                      <span>Open Pastoral Feedback Form</span>
                    </button>

                    <a
                      href={FEEDBACK_CONFIG.shareUrl || FEEDBACK_CONFIG.formUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 border hover:bg-[var(--clean-surface-warm,#FAF5ED)]"
                      style={{
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        color: 'var(--clean-text-primary, #26221F)'
                      }}
                    >
                      <span>Open Google Form directly</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[var(--clean-text-secondary,#78716C)]" />
                    </a>
                  </div>
                </div>

                <div className="text-[10.5px] text-[var(--clean-text-secondary,#78716C)] leading-tight text-center pt-2 border-t border-[var(--clean-accent-border,#EBE5DC)]">
                  Contact: <span className="font-mono text-[10px] text-[var(--clean-accent-caramel,#B4793D)]">{FEEDBACK_CONFIG.contactEmail}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
