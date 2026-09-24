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
            <BereaLogo
              size={42}
              textColor="var(--clean-header-text, #26221F)"
              subtextColor="var(--clean-header-text-secondary, rgba(255, 255, 255, 0.75))"
            />
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
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-primary, #26221F)'
                }}
                className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 border rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn max-h-[420px] overflow-y-auto custom-scrollbar"
              >
                <div
                  style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  className="text-[10px] uppercase font-bold text-[var(--clean-text-secondary,#A8A29E)] px-2 py-0.5 flex items-center justify-between border-b pb-1.5 mb-1"
                >
                  <span>Confessional Traditions</span>
                  <span
                    style={{ color: 'var(--clean-accent-dark, #B4793D)' }}
                    className="text-[9px] font-mono font-bold"
                  >
                    7 Distinct Lenses
                  </span>
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
                      style={{
                        backgroundColor: isSelected ? 'var(--clean-highlight-cream, #FAF3E8)' : 'transparent',
                        borderColor: isSelected ? 'var(--clean-accent-border-strong, #B4793D)' : 'transparent',
                        color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-primary, #26221F)'
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors border hover:bg-[var(--clean-surface-warm,#FAF5ED)] hover:text-[var(--clean-accent-dark,#B4793D)]"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
                        <div>
                          <div
                            style={{ color: isSelected ? 'var(--clean-accent-dark, #78471F)' : 'var(--clean-text-primary, #26221F)' }}
                            className="font-semibold text-xs"
                          >
                            {d.name}
                          </div>
                          <div
                            style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                            className="text-[10px] leading-snug line-clamp-1"
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
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />}
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
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-primary, #26221F)'
                }}
                className="absolute top-full left-0 mt-1.5 w-80 border rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-fadeIn max-h-[380px] overflow-y-auto custom-scrollbar"
              >
                <div
                  style={{ borderBottomColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  className="text-[10px] uppercase font-bold text-[var(--clean-text-secondary,#A8A29E)] px-2 py-0.5 flex items-center justify-between border-b pb-1.5 mb-1"
                >
                  <span className="truncate max-w-[160px]">
                    {showAllTranslations ? 'All Translations' : `Approved for ${currentDenom.traditionGroup}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTranslations(prev => !prev);
                    }}
                    style={{ color: 'var(--clean-accent-dark, #B4793D)' }}
                    className="text-[9.5px] hover:underline flex items-center gap-1 font-semibold"
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
                      style={{
                        backgroundColor: isSelected
                          ? 'var(--clean-accent-caramel, #B4793D)'
                          : 'transparent',
                        color: isSelected
                          ? 'var(--clean-accent-contrast-text, #FFFFFF)'
                          : 'var(--clean-text-primary, #26221F)'
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors hover:bg-[var(--clean-surface-warm,#FAF5ED)]"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs">
                            {t.id}
                          </span>
                          <span
                            style={{
                              backgroundColor: isSelected
                                ? 'rgba(255, 255, 255, 0.25)'
                                : isApproved
                                  ? 'var(--clean-highlight-cream, #FAF3E8)'
                                  : 'var(--clean-surface-warm, #FAF5ED)',
                              borderColor: isSelected
                                ? 'transparent'
                                : isApproved
                                  ? 'var(--clean-accent-border, #B4793D)'
                                  : 'var(--clean-accent-border, #EBE5DC)',
                              color: isSelected
                                ? 'inherit'
                                : isApproved
                                  ? 'var(--clean-accent-dark, #B4793D)'
                                  : 'var(--clean-text-secondary, #78716C)'
                            }}
                            className="text-[9px] px-1.5 py-0.2 rounded border font-medium truncate max-w-[140px]"
                          >
                            {t.badge}
                          </span>
                        </div>
                        <div
                          style={{ color: isSelected ? 'inherit' : 'var(--clean-text-secondary, #57524E)', opacity: isSelected ? 0.9 : 1 }}
                          className="text-[11px] font-normal leading-snug line-clamp-1"
                        >
                          {t.name}
                        </div>
                      </div>
                      {isSelected && (
                        <Check
                          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                          style={{ color: 'var(--clean-accent-contrast-text, #FFFFFF)' }}
                        />
                      )}
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
              className={`ios-glass-btn transition-all !px-3 !py-1 flex items-center gap-1.5 rounded-lg select-none cursor-pointer ${isNotepadActive ? 'active font-bold shadow-sm' : ''
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
                className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border ${isNotepadActive
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
              className={`ios-glass-btn transition-all !px-2.5 !py-1 flex items-center gap-1 rounded-lg select-none cursor-pointer ${isAiPanelOpen ? 'active font-bold shadow-sm' : ''
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
                className={`hidden sm:inline-block text-[9.5px] font-mono px-1.5 py-0.5 rounded border ${isAiPanelOpen
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
