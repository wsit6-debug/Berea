import React, { useState } from 'react';
import { BookOpen, Search, ChevronDown, Check, Sparkles } from 'lucide-react';
import { 
  TRANSLATIONS, 
  TranslationId, 
  TranslationInfo, 
  getApprovedTranslationsForDenomination 
} from '../data/bibleData';
import { DENOMINATIONS, DenominationConfig, DenominationalLens } from '../data/theologyData';

import { BereaLogo } from './BereaLogo';

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
  onToggleAiPanel
}) => {
  const [showDenomDropdown, setShowDenomDropdown] = useState(false);
  const [showTranslationDropdown, setShowTranslationDropdown] = useState(false);
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  const currentDenom: DenominationConfig = DENOMINATIONS.find(d => d.id === activeLens) || DENOMINATIONS[0];
  const approvedTranslations: TranslationInfo[] = getApprovedTranslationsForDenomination(activeLens);
  const displayedTranslations: TranslationInfo[] = showAllTranslations ? TRANSLATIONS : approvedTranslations;

  return (
    <header className="berea-header sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-xl border-b border-[#EBE5DC] px-3 sm:px-6 py-2 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <div
            onClick={onOpenAbout}
            className="flex items-center cursor-pointer group pr-2"
            title="About Berea"
          >
            <BereaLogo size={42} />
          </div>

          <div className="h-4 w-px bg-[#EBE5DC] hidden sm:block"></div>

          {/* Book & Chapter Selector Button */}
          <button
            onClick={onOpenBookSelector}
            className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1"
            title="Choose Book & Chapter"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B4793D]" />
            <span className="font-semibold text-xs text-[#26221F] group-hover:text-[#B4793D] transition-colors truncate max-w-[100px] sm:max-w-none">
              {currentBookName} {currentChapterNum}
            </span>
            <ChevronDown className="w-3 h-3 text-[#A8A29E]" />
          </button>

          {/* 1. TOP GLOBAL DENOMINATION SELECTOR */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDenomDropdown(prev => !prev);
                setShowTranslationDropdown(false);
              }}
              className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1 border border-[#EBE5DC] hover:border-[#D4A373] transition-all shadow-xs"
              title="Select Confessional Tradition (Filters Approved Bibles)"
            >
              <span className="text-xs sm:text-sm">{currentDenom.icon}</span>
              <span className="font-semibold text-xs text-[#26221F] group-hover:text-[#B4793D] transition-colors truncate max-w-[90px] sm:max-w-[140px]">
                {currentDenom.name}
              </span>
              <ChevronDown className="w-3 h-3 text-[#A8A29E]" />
            </button>

            {showDenomDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-72 sm:w-80 bg-white border border-[#EBE5DC] rounded-xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn max-h-[420px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] uppercase font-bold text-[#A8A29E] px-2 py-0.5 flex items-center justify-between border-b border-[#EBE5DC] pb-1.5 mb-1">
                  <span>Confessional Traditions</span>
                  <span className="text-[9px] text-[#B4793D] font-mono">7 Distinct Lenses</span>
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
                        backgroundColor: isSelected ? '#FAF3E8' : undefined,
                        borderColor: isSelected ? '#B4793D' : undefined
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors border ${
                        isSelected
                          ? 'bg-[#FAF3E8] border-[#B4793D] shadow-xs'
                          : 'border-transparent text-[#26221F] hover:bg-[#FAF5ED] hover:text-[#B4793D]'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0 mt-0.5">{d.icon}</span>
                        <div>
                          <div className={`font-semibold text-xs ${isSelected ? 'text-[#78471F]' : 'text-[#26221F]'}`}>
                            {d.name}
                          </div>
                          <div className="text-[10px] text-[#78716C] leading-snug line-clamp-1">{d.tagline}</div>
                          <div className="text-[9px] text-[#A8A29E] font-mono mt-0.5 truncate max-w-[180px]">
                            {d.confessionalStandard.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#B4793D] flex-shrink-0 mt-0.5" />}
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
              className="ios-glass-btn group !px-2 sm:!px-2.5 !py-1 border border-[#EBE5DC] hover:border-[#D4A373] transition-all shadow-xs"
              title="Select Scripture Translation (Approved for your denomination)"
            >
              <span className="text-xs font-semibold text-[#26221F] group-hover:text-[#B4793D] transition-colors">
                {activeTranslation}
              </span>
              <span className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded bg-[#FAF5ED] text-[#B4793D] border border-[#EBE5DC] font-medium">
                Approved
              </span>
              <ChevronDown className="w-3 h-3 text-[#A8A29E]" />
            </button>

            {showTranslationDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-80 bg-white border border-[#EBE5DC] rounded-xl shadow-xl z-50 p-2 space-y-1 animate-fadeIn max-h-[380px] overflow-y-auto custom-scrollbar">
                <div className="text-[10px] uppercase font-bold text-[#A8A29E] px-2 py-0.5 flex items-center justify-between border-b border-[#EBE5DC] pb-1.5 mb-1">
                  <span className="truncate max-w-[160px]">
                    {showAllTranslations ? 'All Translations' : `Approved for ${currentDenom.traditionGroup}`}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllTranslations(prev => !prev);
                    }}
                    className="text-[9.5px] text-[#B4793D] hover:underline flex items-center gap-1 font-semibold"
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
                        backgroundColor: isSelected ? '#26221F' : undefined,
                        color: isSelected ? '#FFFFFF' : undefined
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-start justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#26221F] text-white font-semibold shadow-xs'
                          : 'text-[#26221F] hover:bg-[#FAF5ED] hover:text-[#B4793D]'
                      }`}
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-xs" style={{ color: isSelected ? '#FFFFFF' : undefined }}>
                            {t.id}
                          </span>
                          <span 
                            style={{
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : isApproved ? '#FAF3E8' : '#FAF5ED',
                              color: isSelected ? '#FFFFFF' : isApproved ? '#B4793D' : '#78716C',
                              borderColor: isSelected ? 'transparent' : '#EBE5DC'
                            }}
                            className="text-[9px] px-1.5 py-0.2 rounded border font-medium truncate max-w-[140px]"
                          >
                            {t.badge}
                          </span>
                        </div>
                        <div className="text-[11px] font-normal leading-snug line-clamp-1" style={{ color: isSelected ? '#F0EAE1' : '#57524E' }}>
                          {t.name}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A373] flex-shrink-0 mt-0.5" />}
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
            className="ios-glass-btn text-[#78716C] hover:text-[#26221F] border border-[#EBE5DC] hover:border-[#D4A373] !px-2.5 !py-1"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-[#B4793D]" />
            <span className="hidden lg:inline text-xs font-normal">Search scripture, topics...</span>
            <kbd className="hidden sm:inline-block text-[9.5px] font-mono bg-white px-1.5 py-0.5 rounded text-[#78716C] border border-[#EBE5DC]">
              ⌘K
            </kbd>
          </button>

          {/* AI Guide Inspector Toggle Button */}
          {onToggleAiPanel && (
            <button
              onClick={onToggleAiPanel}
              className="ios-glass-btn text-[#78716C] hover:text-[#26221F] border border-[#EBE5DC] hover:border-[#D4A373] !px-2.5 !py-1 transition-all"
              title="Toggle AI Guide Panel (⌘I)"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B4793D]" />
              <span className="text-xs font-semibold text-[#26221F]">Guide</span>
              <kbd className="hidden sm:inline-block text-[9.5px] font-mono bg-white px-1.5 py-0.5 rounded text-[#78716C] border border-[#EBE5DC]">
                ⌘I
              </kbd>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
