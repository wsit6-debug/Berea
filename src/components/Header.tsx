import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, Check, Sparkles, Lock, MessageSquareHeart, NotebookPen, Palette } from 'lucide-react';
import {
  TRANSLATIONS,
  TranslationId,
  TranslationInfo,
  getApprovedTranslationsForDenomination
} from '../data/bibleData';
import { DENOMINATIONS, DenominationConfig, DenominationalLens } from '../data/theologyData';

import { BereaLogo } from './BereaLogo';
import { FEEDBACK_CONFIG } from '../data/feedbackConfig';

interface HeaderProps {
  currentBookName: string;
  currentChapterNum: number;
  onOpenBookSelector: () => void;
  activeLens: DenominationalLens;
  onSelectLens: (lens: DenominationalLens) => void;
  activeTranslation: TranslationId;
  onSelectTranslation: (t: TranslationId) => void;
  onOpenAbout: () => void;
  onOpenSearch: () => void;
  isAiPanelOpen?: boolean;
  onToggleAiPanel?: () => void;
  onOpenNotepad?: () => void;
  isNotepadActive?: boolean;
  onOpenColorScheme?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentBookName,
  currentChapterNum,
  onOpenBookSelector,
  activeLens,
  onSelectLens,
  activeTranslation,
  onSelectTranslation,
  onOpenAbout,
  onOpenSearch,
  isAiPanelOpen = true,
  onToggleAiPanel,
  onOpenNotepad,
  isNotepadActive = false,
  onOpenColorScheme,
  onLogout
}) => {
  const [showDenomDropdown, setShowDenomDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  const currentDenom: DenominationConfig = DENOMINATIONS.find(d => d.id === activeLens) || DENOMINATIONS[0];
  const approvedTranslations: TranslationInfo[] = getApprovedTranslationsForDenomination(activeLens);
  const displayedTranslations: TranslationInfo[] = showAllTranslations ? TRANSLATIONS : approvedTranslations;

  return (
    <header
      className="berea-header sticky top-0 z-40 backdrop-blur-xl border-b px-3 sm:px-6 py-2 transition-colors select-none"
      style={{
        backgroundColor: 'var(--clean-header-bg, #FAF7F2)',
        borderColor: 'var(--clean-header-border, #EBE5DC)',
        color: 'var(--clean-header-text, #26221F)'
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <div
            onClick={onOpenAbout}
            className="flex items-center cursor-pointer group pr-2"
            title="About Berea"
          >
            <BereaLogo size={42} textColor="var(--clean-header-text, #26221F)" />
          </div>

          <div className="h-4 w-px bg-[var(--clean-border,#EBE5DC)] hidden sm:block"></div>

          {/* Book & Chapter Selector Button */}
          <button
            onClick={onOpenBookSelector}
            className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1"
            title="Choose Book & Chapter"
          >
            <BookOpen className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
            <span className="font-semibold text-xs text-[var(--clean-text-primary,#26221F)] group-hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors truncate max-w-[100px] sm:max-w-none">
              {currentBookName} {currentChapterNum}
            </span>
            <ChevronDown className="w-3 h-3 text-[var(--clean-text-tertiary,#A8A29E)]" />
          </button>

          {/* 1. TOP GLOBAL DENOMINATION SELECTOR */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDenomDropdown(prev => !prev);
                setShowTranslationDropdown(false);
              }}
              className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1"
              title="Select Confessional Tradition (Filters Approved Bibles)"
            >
              <span className="text-xs sm:text-sm">{currentDenom.icon}</span>
              <span className="font-semibold text-xs text-[var(--clean-text-primary,#26221F)] group-hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors truncate max-w-[90px] sm:max-w-[140px]">
                {currentDenom.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--clean-text-tertiary,#A8A29E)]" />
            </button>

            {showDenomDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-[var(--clean-surface,#FFFFFF)] border border-[var(--clean-border,#EBE5DC)] rounded-xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn max-h-[420px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] uppercase font-bold text-[var(--clean-text-tertiary,#A8A29E)] px-2 py-0.5 flex items-center justify-between border-b border-[var(--clean-border,#EBE5DC)] pb-1.5 mb-1">
                  <span>Confessional Traditions</span>
                  <span className="text-[9px] text-[var(--clean-accent-caramel,#B4793D)] font-mono font-bold">7 Distinct Lenses</span>
                </div>
                {DENOMINATIONS.map((d) => {
                  const isSelected = activeLens === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectLens(d.id);
                        setShowDenomDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors border ${isSelected
                        ? 'bg-[var(--clean-highlight-cream,#FAF3E8)] border-[var(--clean-accent-caramel,#B4793D)] shadow-xs font-semibold'
                        : 'border-transparent text-[var(--clean-text-primary,#26221F)] hover:bg-[var(--clean-surface-warm,#FAF5ED)] hover:text-[var(--clean-accent-caramel,#B4793D)]'
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
                        <div>
                          <div className={`font-semibold text-xs ${isSelected ? 'text-[var(--clean-accent-dark,#78471F)]' : 'text-[var(--clean-text-primary,#26221F)]'}`}>
                            {d.name}
                          </div>
                          <div className="text-[10px] text-[var(--clean-text-secondary,#78716C)] leading-snug line-clamp-1">{d.tagline}</div>
                          <div className="text-[9px] text-[var(--clean-text-tertiary,#A8A29E)] font-mono mt-0.5 truncate max-w-[180px]">
                            {d.confessionalStandard.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)] flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. TOP APPROVED TRANSLATION SELECTOR */}
          <div className="relative">
            <button
              onClick={() => {
                setShowTranslationDropdown(prev => !prev);
                setShowDenomDropdown(false);
              }}
              className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1"
              title="Select Scripture Translation (Approved for your denomination)"
            >
              <span className="text-xs font-semibold text-[var(--clean-text-primary,#26221F)] group-hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors">
                {activeTranslation}
              </span>
              <span className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded bg-[var(--clean-highlight-cream,#FAF5ED)] text-[var(--clean-accent-caramel,#B4793D)] border border-[var(--clean-accent-caramel,#B4793D)]/25 font-bold">
                Approved
              </span>
              <ChevronDown className="w-3 h-3 text-[var(--clean-text-tertiary,#A8A29E)]" />
            </button>

            {showTranslationDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-[var(--clean-surface,#FFFFFF)] border border-[var(--clean-border,#EBE5DC)] rounded-xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn max-h-[380px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] uppercase font-bold text-[var(--clean-text-tertiary,#A8A29E)] px-2 py-0.5 flex items-center justify-between border-b border-[var(--clean-border,#EBE5DC)] pb-1.5 mb-1">
                  <span className="truncate max-w-[160px]">
                    {showAllTranslations ? 'All Translations' : `Approved for ${currentDenom.traditionGroup}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTranslations(prev => !prev);
                    }}
                    className="text-[9.5px] text-[var(--clean-accent-caramel,#B4793D)] hover:underline flex items-center gap-1 font-semibold"
                  >
                    {showAllTranslations ? 'Approved Only' : 'Show All (20+)'}
                  </button>
                </div>

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
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors ${isSelected
                        ? 'bg-[var(--clean-text-primary,#26221F)] text-[var(--clean-surface,#FFFFFF)] font-semibold shadow-xs'
                        : 'text-[var(--clean-text-primary,#26221F)] hover:bg-[var(--clean-surface-warm,#FAF5ED)] hover:text-[var(--clean-accent-caramel,#B4793D)]'
                        }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs">
                            {t.id}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded border font-medium truncate max-w-[140px] ${isSelected
                                ? 'bg-white/20 text-white border-transparent'
                                : isApproved
                                  ? 'bg-[var(--clean-highlight-cream,#FAF3E8)] text-[var(--clean-accent-caramel,#B4793D)] border-[var(--clean-accent-caramel,#B4793D)]/30'
                                  : 'bg-[var(--clean-surface-subtle,#FAF5ED)] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-border,#EBE5DC)]'
                              }`}
                          >
                            {t.badge}
                          </span>
                        </div>
                        <div className={`text-[11px] font-normal leading-snug line-clamp-1 ${isSelected ? 'text-stone-200' : 'text-[var(--clean-text-secondary,#57524E)]'}`}>
                          {t.name}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--clean-accent-honey,#D4A373)] flex-shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Clean Controls & AI Guide Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Spotlight Search */}
          <button
            onClick={onOpenSearch}
            style={{
              backgroundColor: 'var(--clean-surface, #FFFFFF)',
              borderColor: 'var(--clean-accent-caramel, #B4793D)',
              color: 'var(--clean-text-primary, #26221F)'
            }}
            className="ios-glass-btn !px-2.5 !py-1 cursor-pointer select-none"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
            <span className="hidden lg:inline text-xs font-normal">Search scripture, topics...</span>
            <kbd
              className="hidden sm:inline-block text-[9.5px] font-mono px-1.5 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                color: 'var(--clean-text-secondary, #78716C)'
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Clergy & Pastor Feedback Link (Launches Google Form directly) */}
          <a
            href={FEEDBACK_CONFIG.shareUrl || FEEDBACK_CONFIG.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ios-glass-btn !px-2.5 !py-1 transition-all"
            title="Open Feedback Form (Google Forms)"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
            <span className="text-xs font-semibold text-[var(--clean-text-primary,#26221F)] hidden sm:inline">Feedback</span>
          </a>

          {/* Color Scheme Theme Studio Trigger */}
          {onOpenColorScheme && (
            <button
              onClick={onOpenColorScheme}
              className="ios-glass-btn !px-2.5 !py-1 transition-all flex items-center gap-1.5"
              title="Color Scheme Studio (Customize Accent & Background)"
            >
              <Palette className="w-3.5 h-3.5 text-[var(--clean-accent-caramel,#B4793D)]" />
              <span className="text-xs font-semibold text-[var(--clean-text-primary,#26221F)] hidden sm:inline">Theme</span>
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
                      borderColor: 'var(--clean-accent-caramel, #B4793D)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }
              }
              className={`ios-glass-btn transition-all !px-3 !py-1 flex items-center gap-1.5 rounded-lg select-none cursor-pointer ${
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
                className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isNotepadActive
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
                      borderColor: 'var(--clean-accent-caramel, #B4793D)',
                      color: 'var(--clean-text-primary, #26221F)'
                    }
              }
              className={`ios-glass-btn transition-all !px-2.5 !py-1 flex items-center gap-1 rounded-lg select-none cursor-pointer ${
                isAiPanelOpen ? 'active font-bold shadow-sm' : ''
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
                className={`hidden sm:inline-block text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${
                  isAiPanelOpen
                    ? 'bg-black/25 text-white border-transparent'
                    : 'bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-secondary,#78716C)] border-[var(--clean-border,#EBE5DC)]'
                }`}
              >
                ⌘I
              </kbd>
            </button>
          )}

          {/* Lock / Log Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-caramel, #B4793D)'
              }}
              className="ios-glass-btn hover:!text-red-600 hover:!border-red-400 hover:!bg-red-500/10 !p-1.5 transition-all cursor-pointer"
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
