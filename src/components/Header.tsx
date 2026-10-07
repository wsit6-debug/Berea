import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Sparkles, Lock, MessageSquareHeart, NotebookPen, Palette, Bookmark, Columns, HardDrive, Download, Globe, CheckCircle2 } from 'lucide-react';
import {
  TRANSLATIONS,
  TranslationId,
  TranslationInfo,
  getApprovedTranslationsForDenomination,
  getTranslationColor
} from '../data/bibleData';
import { BUNDLED_OFFLINE_TRANSLATIONS } from '../services/youversionService';
import { DENOMINATIONS, DenominationConfig, DenominationalLens } from '../data/theologyData';
import { BereaLogo } from './BereaLogo';
import { FEEDBACK_CONFIG } from '../data/feedbackConfig';
import { SettingsWidget } from './SettingsWidget';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  activeLens: DenominationalLens;
  onSelectLens: (lens: DenominationalLens) => void;
  activeTranslation: TranslationId;
  onSelectTranslation: (t: TranslationId) => void;
  onOpenAbout: () => void;
  onOpenSearch: () => void;
  onOpenBookmarks?: () => void;
  isBookmarksOpen?: boolean;
  bookmarkCount?: number;
  isAiPanelOpen?: boolean;
  onToggleAiPanel?: () => void;
  onOpenNotepad?: () => void;
  isNotepadActive?: boolean;
  onOpenCompare?: () => void;
  isCompareActive?: boolean;
  onOpenColorScheme?: () => void;
  onOpenOfflineBibles?: () => void;
  onOpenFeedback?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeLens,
  onSelectLens,
  activeTranslation,
  onSelectTranslation,
  onOpenAbout,
  onOpenSearch,
  onOpenOfflineBibles,
  onOpenBookmarks,
  isBookmarksOpen = false,
  bookmarkCount = 0,
  isAiPanelOpen = true,
  onToggleAiPanel,
  onOpenNotepad,
  isNotepadActive = false,
  onOpenCompare,
  isCompareActive = false,
  onOpenColorScheme,
  onOpenFeedback,
  onLogout
}) => {
  const { language } = useLanguage();
  const [showDenomDropdown, setShowDenomDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  const denomDropdownRef = useRef<HTMLDivElement>(null);
  const translationDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-close Confessional Tradition and Translation dropdowns when clicking outside
  useEffect(() => {
    if (!showDenomDropdown && !showTranslationDropdown) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (showDenomDropdown && denomDropdownRef.current && !denomDropdownRef.current.contains(target)) {
        setShowDenomDropdown(false);
      }
      if (showTranslationDropdown && translationDropdownRef.current && !translationDropdownRef.current.contains(target)) {
        setShowTranslationDropdown(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDenomDropdown(false);
        setShowTranslationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDenomDropdown, showTranslationDropdown]);

  // Filter denominations to only those that have approved Bibles in the currently selected language
  const availableDenominations = useMemo(() => {
    const filtered = DENOMINATIONS.filter(d => {
      return getApprovedTranslationsForDenomination(d.id).some(
        t => (t.language || 'en') === language
      );
    });
    return filtered.length > 0 ? filtered : DENOMINATIONS;
  }, [language]);

  // Auto-switch lens if activeLens is not supported in this language
  useEffect(() => {
    if (availableDenominations.length > 0 && !availableDenominations.some(d => d.id === activeLens)) {
      onSelectLens(availableDenominations[0].id);
    }
  }, [availableDenominations, activeLens, onSelectLens]);

  const currentDenom: DenominationConfig = availableDenominations.find(d => d.id === activeLens) || availableDenominations[0] || DENOMINATIONS[0];
  const popularIds = [
    'NABRE', 'RSVCE', 'NRSVCE', 'DRB', 'NJB', // Catholic
    'KJV', 'NIV', 'ESV', 'NLT', 'NASB', 'RSV', 'NRSV', 'NKJV', 'CSB',
    'RV1960', 'RV2004', 'PDT', 'NTV', 'LBLA', 'NVI',
    'FRLSG', 'FRPDV17', 'FRDBY', 'BDS',
    'ARA', 'NVIPT', 'NVT', 'NTLH', 'KJA', 'NAA', 'ARC09',
    'LUTH1545', 'SCH2000', 'CUV', 'SYNO', 'UKDER', 'TUB', 'PPCH', 'GYZ', 'NAV', 'SVD'
  ];
  
  const sortFn = (a: TranslationInfo, b: TranslationInfo) => {
    const aPop = popularIds.includes(a.id) ? 1 : 0;
    const bPop = popularIds.includes(b.id) ? 1 : 0;
    if (aPop !== bPop) return bPop - aPop;
    return 0; // maintain original relative order otherwise
  };

  const languageFilteredTranslations = TRANSLATIONS.filter(t => (t.language || 'en') === language).sort(sortFn);
  const approvedTranslations: TranslationInfo[] = getApprovedTranslationsForDenomination(activeLens).filter(t => (t.language || 'en') === language).sort(sortFn);
  
  // If there are zero approved translations for this language/denomination combo, auto-fallback to showing all available for that language.
  const isFallbackMode = approvedTranslations.length === 0;
  const displayedTranslations: TranslationInfo[] = isFallbackMode 
    ? languageFilteredTranslations 
    : (showAllTranslations ? approvedTranslations : approvedTranslations.slice(0, 5));

  return (
    <header
      className="berea-header sticky top-0 z-40 backdrop-blur-xl border-b px-3 sm:px-6 py-2 transition-colors select-none"
      style={{
        backgroundColor: 'var(--clean-header-bg, #FAF7F2)',
        borderColor: 'var(--clean-header-border, #EBE5DC)',
        color: 'var(--clean-header-text, #26221F)'
      }}
    >
      <div className="max-w-[1740px] mx-auto w-full px-1 sm:px-3 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 flex-nowrap">
          <div
            onClick={onOpenAbout}
            className="flex items-center cursor-pointer group pr-2"
            title="About Berea"
          >
            <BereaLogo
              size={42}
              textColor="var(--clean-header-text, #26221F)"
              subtextColor="var(--clean-header-text-secondary, rgba(255, 255, 255, 0.75))"
            />
          </div>

          <div className="h-4 w-px bg-[var(--clean-border,#EBE5DC)] hidden sm:block"></div>

          {/* 1. TOP GLOBAL DENOMINATION SELECTOR */}
          <div className="relative" ref={denomDropdownRef}>
            <button
              onClick={() => {
                setShowDenomDropdown(prev => !prev);
                setShowTranslationDropdown(false);
              }}
              style={
                showDenomDropdown
                  ? {
                      backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                      borderColor: 'var(--clean-accent-caramel, #B4793D)',
                      color: '#FFFFFF'
                    }
                  : {
                      backgroundColor: 'var(--clean-surface, #FFFFFF)',
                      borderColor: 'var(--clean-border, #EBE5DC)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }
              }
              className={`ios-glass-btn transition-all !px-2.5 sm:!px-3 !py-1.5 flex items-center gap-1.5 rounded-full select-none cursor-pointer ${
                showDenomDropdown ? 'active font-bold shadow-sm' : ''
              }`}
              title="Select Confessional Tradition (Filters Approved Bibles)"
            >
              <span className="text-xs sm:text-sm">{currentDenom.icon}</span>
              <span
                style={{ color: showDenomDropdown ? '#FFFFFF' : 'var(--clean-text-primary, #26221F)' }}
                className="font-semibold text-xs truncate max-w-[90px] sm:max-w-[140px]"
              >
                {currentDenom.name}
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  showDenomDropdown ? 'rotate-180 text-white' : 'text-[var(--clean-text-tertiary,#A8A29E)]'
                }`}
              />
            </button>

            {showDenomDropdown && (
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-primary, #26221F)'
                }}
                className="absolute top-full left-0 mt-2 w-72 sm:w-84 border rounded-2xl shadow-[0_20px_48px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] z-50 p-2 space-y-1 animate-dropdown max-h-[440px] overflow-y-auto custom-scrollbar backdrop-blur-xl"
              >
                <div
                  style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  className="text-[10px] uppercase font-bold tracking-wider text-[var(--clean-text-secondary,#A8A29E)] px-2.5 py-1.5 flex items-center justify-between border-b pb-2 mb-1"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
                    Confessional Traditions
                  </span>
                  <span
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                      color: 'var(--clean-accent-dark, #B4793D)'
                    }}
                    className="text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-full border border-[var(--clean-accent-border,#EBE5DC)]"
                  >
                    {availableDenominations.length} Available
                  </span>
                </div>
                {availableDenominations.map((d) => {
                  const isSelected = activeLens === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectLens(d.id);
                        setShowDenomDropdown(false);
                      }}
                      style={{
                        backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF3E8)' : 'transparent',
                        borderColor: isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'transparent',
                        color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-primary, #26221F)'
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all border cursor-pointer ${
                        isSelected
                          ? 'shadow-2xs font-semibold'
                          : 'hover:bg-[var(--clean-surface-warm,#FAF5ED)] hover:text-[var(--clean-accent-dark,#B4793D)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-base flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--clean-surface-warm,#FAF5ED)] border border-[var(--clean-border-soft,#F0EAE1)]">
                          {d.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div
                            style={{ color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-primary, #26221F)' }}
                            className="font-semibold text-xs leading-tight"
                          >
                            {d.name}
                          </div>
                          <div
                            style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                            className="text-[10px] leading-snug line-clamp-1 mt-0.5"
                          >
                            {d.tagline}
                          </div>
                          <div
                            style={{ color: 'var(--clean-text-secondary, #A8A29E)' }}
                            className="text-[9px] font-mono mt-0.5 truncate max-w-[180px]"
                          >
                            {d.confessionalStandard.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--clean-accent-caramel,#B4793D)] text-white shadow-2xs ml-1 shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. TOP APPROVED TRANSLATION SELECTOR */}
          <div className="relative" ref={translationDropdownRef}>
            <button
              onClick={() => {
                setShowTranslationDropdown(prev => !prev);
                setShowDenomDropdown(false);
              }}
              style={
                showTranslationDropdown
                  ? {
                      backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                      borderColor: 'var(--clean-accent-caramel, #B4793D)',
                      color: '#FFFFFF'
                    }
                  : {
                      backgroundColor: 'var(--clean-surface, #FFFFFF)',
                      borderColor: 'var(--clean-border, #EBE5DC)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }
              }
              className={`ios-glass-btn transition-all !px-2.5 sm:!px-3 !py-1.5 flex items-center gap-1.5 rounded-full select-none cursor-pointer ${
                showTranslationDropdown ? 'active font-bold shadow-sm' : ''
              }`}
              title="Select Scripture Translation (Approved for your denomination)"
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor: showTranslationDropdown ? '#FFFFFF' : getTranslationColor(activeTranslation).primary
                }}
              />
              <span
                style={{ color: showTranslationDropdown ? '#FFFFFF' : 'var(--clean-text-primary, #26221F)' }}
                className="text-xs font-semibold"
              >
                {activeTranslation}
              </span>
              <span
                style={
                  showTranslationDropdown
                    ? {
                        backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        color: '#FFFFFF',
                        borderColor: 'transparent'
                      }
                    : {
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        color: 'var(--clean-accent-caramel, #B4793D)',
                        borderColor: 'rgba(180, 121, 61, 0.25)'
                      }
                }
                className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded-full border font-bold"
              >
                Approved
              </span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  showTranslationDropdown ? 'rotate-180 text-white' : 'text-[var(--clean-text-tertiary,#A8A29E)]'
                }`}
              />
            </button>

            {showTranslationDropdown && (
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-primary, #26221F)',
                  scrollbarWidth: 'thin',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain'
                }}
                className="absolute top-full left-0 mt-2 w-80 sm:w-84 border rounded-2xl shadow-[0_20px_48px_-12px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] z-50 p-2.5 animate-dropdown backdrop-blur-xl"
              >
                {/* Quick Access to Compare Versions Matrix */}
                {onOpenCompare && (
                  <button
                    onClick={() => {
                      onOpenCompare();
                      setShowTranslationDropdown(false);
                    }}
                    style={{
                      background: 'linear-gradient(to bottom right, var(--clean-highlight-cream, #FAF5ED), var(--clean-surface, #FFFFFF))',
                      borderColor: isCompareActive ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }}
                    className="w-full mb-2 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border shadow-2xs hover:border-[var(--clean-accent-border-strong,#B4793D)] cursor-pointer"
                    title="Open side-by-side Scripture Comparison Matrix"
                  >
                    <div className="flex items-center gap-2">
                      <Columns
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                      />
                      <span className="font-semibold" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                        Compare Versions
                      </span>
                    </div>
                    {isCompareActive && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D] font-semibold">
                        Active
                      </span>
                    )}
                  </button>
                )}

                <div
                  style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  className="text-[10px] uppercase font-bold px-2 py-0.5 flex items-center justify-between border-b pb-1.5 mb-2 sticky top-0 bg-[var(--clean-surface,#FFFFFF)] z-10"
                >
                    <span
                      style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                      className="truncate max-w-[160px]"
                    >
                      {isFallbackMode ? 'All Translations (Fallback)' : (showAllTranslations ? `All Approved for ${currentDenom.traditionGroup}` : `Top 5 for ${currentDenom.traditionGroup}`)}
                    </span>
                    {!isFallbackMode && approvedTranslations.length > 5 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowAllTranslations(prev => !prev);
                        }}
                        style={{ color: 'var(--clean-accent-dark, #B4793D)' }}
                        className="text-[9.5px] hover:underline flex items-center gap-1 font-semibold"
                      >
                        {showAllTranslations ? 'Top 5 Only' : `Show All (${approvedTranslations.length})`}
                      </button>
                    )}
                </div>
                <div className="space-y-1 block">
                {displayedTranslations.map((t) => {
                  const isSelected = activeTranslation === t.id;
                  const isApproved = t.approvedDenominations.includes(activeLens);
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTranslation(t.id);
                        setShowTranslationDropdown(false);
                      }}
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--clean-highlight-cream, #FAF3E8)'
                          : 'transparent',
                        borderColor: isSelected
                          ? 'var(--clean-accent-border-strong, #B4793D)'
                          : 'transparent',
                        color: isSelected
                          ? 'var(--clean-accent-dark, #78471F)'
                          : 'var(--clean-text-primary, #26221F)'
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all border cursor-pointer ${
                        isSelected
                          ? 'shadow-2xs font-semibold'
                          : 'hover:bg-[var(--clean-surface-warm,#FAF5ED)] hover:text-[var(--clean-accent-dark,#B4793D)]'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: getTranslationColor(t.id).primary }}
                          />
                          <span
                            className="font-bold text-xs"
                            style={{ color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-primary, #26221F)' }}
                          >
                            {t.id}
                          </span>
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(180, 121, 61, 0.15)'
                                : isApproved
                                  ? 'var(--clean-highlight-cream, #FAF3E8)'
                                  : 'var(--clean-surface-warm, #FAF5ED)',
                              borderColor: isSelected
                                ? 'var(--clean-accent-border-strong, #B4793D)'
                                : isApproved
                                  ? 'var(--clean-accent-border, #B4793D)'
                                  : 'var(--clean-accent-border, #EBE5DC)',
                              color: isSelected
                                ? 'var(--clean-accent-dark, #78471F)'
                                : isApproved
                                  ? 'var(--clean-accent-dark, #B4793D)'
                                  : 'var(--clean-text-secondary, #78716C)'
                            }}
                            className="text-[9px] px-1.5 py-0.2 rounded-full border font-medium truncate max-w-[120px]"
                          >
                            {t.badge}
                          </span>
                          {BUNDLED_OFFLINE_TRANSLATIONS.has(t.apiCode.toUpperCase()) ? (
                            <span
                              className="text-[8.5px] px-1.5 py-0.2 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-0.5 shadow-2xs"
                              title="Offline Ready (CC0 / Public Domain)"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              Offline
                            </span>
                          ) : (
                            <span
                              className="text-[8.5px] px-1.5 py-0.2 rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-0.5 shadow-2xs"
                              title="Online Only (Publisher Restricted)"
                            >
                              <Globe className="w-2.5 h-2.5" />
                              Online
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-secondary, #57524E)'
                          }}
                          className="text-[11px] font-normal leading-snug line-clamp-1"
                        >
                          {t.name}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[var(--clean-accent-caramel,#B4793D)] text-white shadow-2xs shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
                </div>

                {/* Offline Management & Downloads Button */}
                {onOpenOfflineBibles && (
                  <div
                    style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
                    className="pt-2 mt-2 border-t"
                  >
                    <button
                      onClick={() => {
                        setShowTranslationDropdown(false);
                        onOpenOfflineBibles();
                      }}
                      className="w-full text-left p-2 rounded-xl text-xs flex items-center justify-between text-[var(--clean-accent-dark,#8C5E2E)] hover:bg-[var(--clean-highlight-cream,#FAF3E8)] transition-all font-medium cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 text-[11px]">
                        <HardDrive className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
                        Manage Offline Bibles & Downloads
                      </span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs">
                        21 CC0/PD
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Omnibar filling the large open space */}
        <div className="flex-1 max-w-md mx-2 sm:mx-4 flex items-center justify-center min-w-0">
          <button
            onClick={onOpenSearch}
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              borderColor: 'var(--clean-border, #EBE5DC)',
              color: 'var(--clean-text-primary, #26221F)'
            }}
            className="w-full max-w-sm ios-glass-btn !px-3.5 !py-1.5 cursor-pointer select-none flex items-center justify-between rounded-full shadow-2xs transition-all hover:border-[var(--clean-accent-caramel,#B4793D)] flex-shrink-0 group"
            title="Search Scripture, topics, notes (⌘K)"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)] transition-transform duration-200 group-hover:scale-110 flex-shrink-0" />
              <span className="text-xs font-normal text-stone-500 group-hover:text-stone-700 transition-colors truncate">Search scripture, topics...</span>
            </div>
            <kbd
              className="text-[9px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ml-2 shadow-2xs"
              style={{
                backgroundColor: 'var(--clean-surface-warm, #FAF7F2)',
                borderColor: 'var(--clean-border, #EBE5DC)',
                color: 'var(--clean-text-secondary, #78716C)'
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Workspace Tools, Settings & Logout */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 flex-nowrap">

          {/* Bookmarks Button */}
          {onOpenBookmarks && (
            <button
              data-bookmarks-toggle="true"
              onClick={onOpenBookmarks}
              style={
                isBookmarksOpen
                  ? {
                    backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                    borderColor: 'var(--clean-accent-caramel, #B4793D)',
                    color: '#FFFFFF'
                  }
                  : {
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)'
                  }
              }
              className={`ios-glass-btn !px-3 !py-1.5 transition-all flex items-center gap-1.5 rounded-full select-none cursor-pointer ${
                isBookmarksOpen ? 'active font-bold shadow-sm' : ''
              }`}
              title="Toggle Bookmarked Verses (⌘B)"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarksOpen ? 'fill-white text-white' : bookmarkCount > 0 ? 'fill-[var(--clean-accent-caramel,#B4793D)] text-[var(--clean-accent-caramel,#B4793D)]' : 'text-[var(--clean-accent-caramel,#B4793D)]'}`} />
              <span className="text-xs font-semibold hidden sm:inline" style={{ color: isBookmarksOpen ? '#FFFFFF' : 'var(--clean-text-primary,#26221F)' }}>Bookmarks</span>
              {bookmarkCount > 0 && (
                <span
                  style={{
                    backgroundColor: isBookmarksOpen ? 'rgba(255, 255, 255, 0.25)' : 'var(--clean-highlight-cream,#FAF5ED)',
                    color: isBookmarksOpen ? '#FFFFFF' : 'var(--clean-accent-caramel,#B4793D)',
                    borderColor: isBookmarksOpen ? 'transparent' : 'var(--clean-accent-border,#EBE5DC)'
                  }}
                  className="px-1.5 py-0.2 border rounded-full text-[10px] font-bold"
                >
                  {bookmarkCount}
                </span>
              )}
              <kbd className={`hidden md:inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                isBookmarksOpen
                  ? 'bg-black/25 text-white border-transparent'
                  : 'bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-border,#EBE5DC)]'
              }`}>
                ⌘B
              </kbd>
            </button>
          )}

          {/* Notepad Top Tab */}
          {onOpenNotepad && (
            <button
              onClick={onOpenNotepad}
              style={
                isNotepadActive
                  ? {
                    backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                    borderColor: 'var(--clean-accent-caramel, #B4793D)',
                    color: '#FFFFFF'
                  }
                  : {
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)'
                  }
              }
              className={`ios-glass-btn transition-all !px-3 !py-1.5 flex items-center gap-1.5 rounded-full select-none cursor-pointer ${
                isNotepadActive ? 'active font-bold shadow-sm' : ''
              }`}
              title="Open Personal Notepad (⌘N)"
            >
              <NotebookPen
                className="w-3.5 h-3.5"
                style={{ color: isNotepadActive ? '#FFFFFF' : 'var(--clean-accent-caramel, #B4793D)' }}
              />
              <span style={{ color: isNotepadActive ? '#FFFFFF' : 'var(--clean-text-primary, #26221F)' }} className="text-xs font-semibold">
                Notepad
              </span>
              <kbd
                className={`hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border ${isNotepadActive
                    ? 'bg-black/25 text-white border-transparent'
                    : 'bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-border,#EBE5DC)]'
                  }`}
              >
                ⌘N
              </kbd>
            </button>
          )}

          {/* AI Guide Inspector Toggle Button */}
          {onToggleAiPanel && (
            <button
              onClick={onToggleAiPanel}
              style={
                isAiPanelOpen
                  ? {
                    backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                    borderColor: 'var(--clean-accent-caramel, #B4793D)',
                    color: '#FFFFFF'
                  }
                  : {
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)'
                  }
              }
              className={`ios-glass-btn transition-all !px-3 !py-1.5 flex items-center gap-1.5 rounded-full select-none cursor-pointer ${isAiPanelOpen ? 'active font-bold shadow-sm' : ''
                }`}
              title="Toggle AI Guide Panel (⌘I)"
            >
              <Sparkles
                className="w-3.5 h-3.5"
                style={{ color: isAiPanelOpen ? '#FFFFFF' : 'var(--clean-accent-caramel, #B4793D)' }}
              />
              <span style={{ color: isAiPanelOpen ? '#FFFFFF' : 'var(--clean-text-primary, #26221F)' }} className="text-xs font-semibold">
                Guide
              </span>
              <kbd
                className={`hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded-full border ${isAiPanelOpen
                    ? 'bg-black/25 text-white border-transparent'
                    : 'bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-border,#EBE5DC)]'
                  }`}
              >
                ⌘I
              </kbd>
            </button>
          )}

          <div className="h-4 w-px bg-[var(--clean-border,#EBE5DC)] hidden sm:block"></div>

          {/* Settings Button (Theme & Feedback) */}
          <SettingsWidget
            onOpenThemeStudio={onOpenColorScheme}
            onOpenFeedbackModal={onOpenFeedback}
          />

          {/* Lock / Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-border, #EBE5DC)'
              }}
              className="ios-glass-btn hover:!text-red-600 hover:!border-red-400 hover:!bg-red-500/10 !p-2 rounded-full transition-all cursor-pointer flex-shrink-0"
              title="Lock & Log Out"
              aria-label="Lock and log out"
            >
              <Lock className="w-3.5 h-3.5" style={{ color: 'var(--clean-text-secondary, #78716C)' }} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
