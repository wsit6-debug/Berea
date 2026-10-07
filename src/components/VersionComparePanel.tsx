import React, { useState, useMemo } from 'react';
import {
  Columns, ChevronLeft, ChevronRight, Check, Sparkles, BookOpen, Layers
} from 'lucide-react';
import {
  TRANSLATIONS,
  TranslationId,
  Verse,
  getTranslationColor,
  getApprovedTranslationsForDenomination
} from '../data/bibleData';
import { DenominationalLens } from '../data/theologyData';
import { cleanApiText } from '../services/youversionService';

export interface VersionComparePanelProps {
  currentBook: string;
  currentChapter: number;
  chapterVerses?: Verse[];
  selectedVerse?: Verse | null;
  activeTranslation: TranslationId;
  activeLens: DenominationalLens;
  onSelectTranslation?: (translationId: TranslationId) => void;
  onSelectVerse?: (verse: Verse) => void;
}

export const VersionComparePanel: React.FC<VersionComparePanelProps> = ({
  currentBook,
  currentChapter,
  chapterVerses = [],
  selectedVerse,
  activeTranslation,
  activeLens,
  onSelectTranslation,
  onSelectVerse
}) => {
  // Determine approved translations for current denomination lens
  const approvedTranslations = useMemo(() => {
    return getApprovedTranslationsForDenomination(activeLens);
  }, [activeLens]);

  // Selected translations to compare (default to active + top 2 approved)
  const [comparisonTranslations, setComparisonTranslations] = useState<TranslationId[]>(() => {
    const initial = [activeTranslation];
    approvedTranslations.forEach(t => {
      if (!initial.includes(t.id) && initial.length < 3) {
        initial.push(t.id);
      }
    });
    // Fallback if less than 3
    if (initial.length < 3) {
      ['ESV', 'KJV', 'NIV', 'NASB'].forEach(id => {
        if (!initial.includes(id as TranslationId) && initial.length < 3) {
          initial.push(id as TranslationId);
        }
      });
    }
    return initial;
  });

  // Active verse being compared (either selectedVerse or verse 1)
  const currentVerseNum = selectedVerse?.verseNumber ?? 1;
  const activeCompareVerse = useMemo(() => {
    if (selectedVerse) return selectedVerse;
    if (chapterVerses.length > 0) {
      return chapterVerses.find(v => v.verseNumber === currentVerseNum) || chapterVerses[0];
    }
    return null;
  }, [selectedVerse, chapterVerses, currentVerseNum]);

  const handlePrevVerse = () => {
    if (!chapterVerses.length) return;
    const prevNum = Math.max(1, currentVerseNum - 1);
    const prevVerse = chapterVerses.find(v => v.verseNumber === prevNum);
    if (prevVerse && onSelectVerse) {
      onSelectVerse(prevVerse);
    }
  };

  const handleNextVerse = () => {
    if (!chapterVerses.length) return;
    const maxNum = chapterVerses[chapterVerses.length - 1].verseNumber;
    const nextNum = Math.min(maxNum, currentVerseNum + 1);
    const nextVerse = chapterVerses.find(v => v.verseNumber === nextNum);
    if (nextVerse && onSelectVerse) {
      onSelectVerse(nextVerse);
    }
  };

  const toggleTranslation = (tId: TranslationId) => {
    setComparisonTranslations(prev => {
      if (prev.includes(tId)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter(x => x !== tId);
      }
      return [...prev, tId];
    });
  };

  const handleSelectAllApproved = () => {
    const approvedIds = approvedTranslations.map(t => t.id);
    setComparisonTranslations(approvedIds.slice(0, 5));
  };

  return (
    <div className="flex flex-col h-full bg-white text-[#26221F] overflow-hidden select-none rounded-2xl border border-[var(--clean-accent-border,#EBE5DC)] shadow-xs">
      {/* Top Verse Navigation Bar */}
      <div
        className="px-3 py-2 border-b flex items-center justify-between gap-2 flex-shrink-0"
        style={{
          backgroundColor: 'var(--clean-surface, #FFFFFF)',
          borderColor: 'var(--clean-accent-border, #EBE5DC)'
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center border text-[11px] font-bold shrink-0"
            style={{
              backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
              borderColor: 'var(--clean-accent-border, #E2D5C3)',
              color: 'var(--clean-accent-caramel, #B4793D)'
            }}
          >
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="font-serif font-bold text-xs text-[#26221F] truncate">
            {currentBook} {currentChapter}:{activeCompareVerse?.verseNumber ?? 1}
          </span>
          <span className="text-[10px] text-[#A8A29E] font-medium hidden sm:inline-block">
            • {comparisonTranslations.length} Versions
          </span>
        </div>

        {/* Verse Prev / Next controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrevVerse}
            disabled={currentVerseNum <= 1}
            className="p-1 rounded hover:bg-[#FAF7F2] text-[#78716C] hover:text-[#26221F] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#EBE5DC]"
            title="Previous Verse"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <select
            value={currentVerseNum}
            onChange={(e) => {
              const num = parseInt(e.target.value, 10);
              const target = chapterVerses.find(v => v.verseNumber === num);
              if (target && onSelectVerse) onSelectVerse(target);
            }}
            className="text-[10px] font-semibold py-0.5 px-1.5 rounded border border-[#EBE5DC] bg-white text-[#26221F] focus:outline-none focus:border-[#B4793D] cursor-pointer"
          >
            {chapterVerses.map(v => (
              <option key={v.verseNumber} value={v.verseNumber}>
                v.{v.verseNumber}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextVerse}
            disabled={chapterVerses.length > 0 && currentVerseNum >= chapterVerses[chapterVerses.length - 1].verseNumber}
            className="p-1 rounded hover:bg-[#FAF7F2] text-[#78716C] hover:text-[#26221F] disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-[#EBE5DC]"
            title="Next Verse"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3">
        {/* Translation Selector Pill Matrix */}
        <div
          className="p-2 rounded-xl border space-y-1.5"
          style={{
            backgroundColor: 'var(--clean-surface-subtle, #FAF7F2)',
            borderColor: 'var(--clean-border-soft, #EBE5DC)'
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-semibold px-0.5">
            <span className="text-[#78716C] uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#B4793D]" />
              Select Translations to Compare
            </span>
            <button
              onClick={handleSelectAllApproved}
              className="text-[#B4793D] hover:underline font-bold"
            >
              Approved Top 5
            </button>
          </div>

          <div className="flex flex-wrap gap-1">
            {TRANSLATIONS.map((t) => {
              const selectedIndex = comparisonTranslations.indexOf(t.id);
              const isSelected = selectedIndex !== -1;
              const orderNum = isSelected ? selectedIndex + 1 : null;
              const colorTheme = getTranslationColor(t.id);
              const isApproved = approvedTranslations.some(at => at.id === t.id);

              return (
                <button
                  key={t.id}
                  onClick={() => toggleTranslation(t.id)}
                  style={
                    isSelected
                      ? {
                          backgroundColor: colorTheme.badgeBg,
                          borderColor: colorTheme.badgeBg,
                          color: colorTheme.badgeText,
                          boxShadow: `0 1px 4px ${colorTheme.primary}30`
                        }
                      : {
                          backgroundColor: '#FFFFFF',
                          borderColor: isApproved ? 'var(--clean-accent-border, #E2D5C3)' : 'var(--clean-border-soft, #EBE5DC)',
                          color: '#57524E'
                        }
                  }
                  className="text-[10px] font-semibold py-0.5 px-2 rounded-md border transition-all cursor-pointer select-none flex items-center gap-1.5 hover:scale-[1.02]"
                  title={`${t.name} (${t.year}) - ${t.philosophy}`}
                >
                  {isSelected ? (
                    <span
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold shrink-0"
                      style={{
                        backgroundColor: colorTheme.badgeText,
                        color: colorTheme.badgeBg
                      }}
                    >
                      {orderNum}
                    </span>
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: colorTheme.primary
                      }}
                    />
                  )}
                  <span>{t.id}</span>
                  {isApproved && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#15803D]" title="Approved for lens" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Translation Cards Stack */}
        <div className="space-y-2.5">
          {comparisonTranslations.map((tId, idx) => {
            const tObj = TRANSLATIONS.find(x => x.id === tId);
            const colorTheme = getTranslationColor(tId);
            const isCurrentlyActive = activeTranslation === tId;

            // Extract scripture text for this version
            const rawCompareText =
              (activeCompareVerse?.text &&
                (activeCompareVerse.text[tId] ||
                  activeCompareVerse.text['KJV'] ||
                  Object.values(activeCompareVerse.text)[0])) ||
              'Loading translation scripture...';
            const verseText = cleanApiText(rawCompareText);

            return (
              <div
                key={tId}
                className="p-3 rounded-xl border space-y-2 transition-all shadow-2xs group relative"
                style={{
                  backgroundColor: colorTheme.bg,
                  borderColor: colorTheme.border,
                  borderLeftWidth: '4px',
                  borderLeftColor: colorTheme.primary
                }}
              >
                {/* Translation Title Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide shrink-0 shadow-2xs flex items-center gap-1"
                      style={{
                        backgroundColor: colorTheme.badgeBg,
                        color: colorTheme.badgeText
                      }}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8.5px] font-bold"
                        style={{
                          backgroundColor: colorTheme.badgeText,
                          color: colorTheme.badgeBg
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span>{tId}</span>
                    </span>

                    <span
                      className="font-bold text-xs truncate text-[#26221F]"
                      title={tObj?.name}
                    >
                      {tObj?.name}
                    </span>
                  </div>

                  {/* Philosophy and Year tags */}
                  <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                    <span
                      className="px-1.5 py-0.2 rounded border text-[9px] font-medium hidden sm:inline-block"
                      style={{
                        borderColor: colorTheme.border,
                        color: colorTheme.text,
                        backgroundColor: 'rgba(255,255,255,0.7)'
                      }}
                    >
                      {tObj?.philosophy.split('/')[0].trim()}
                    </span>
                    <span className="text-[#78716C] text-[9.5px] font-mono">
                      {tObj?.year}
                    </span>

                    {/* Quick activate button */}
                    {onSelectTranslation && (
                      <button
                        onClick={() => onSelectTranslation(tId)}
                        disabled={isCurrentlyActive}
                        className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded transition-all flex items-center gap-1 ${
                          isCurrentlyActive
                            ? 'bg-[#15803D]/10 text-[#15803D] font-bold'
                            : 'bg-white/80 hover:bg-white text-[#78716C] hover:text-[#26221F] border border-[#EBE5DC]'
                        }`}
                        title={isCurrentlyActive ? 'Currently active Bible' : 'Set as active Bible'}
                      >
                        {isCurrentlyActive ? (
                          <>
                            <Check className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <span>Use</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Verse Text Content */}
                <p className="font-scripture text-xs text-[#26221F] leading-relaxed pl-1 selection:bg-[#FAF0E6]">
                  {verseText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VersionComparePanel;
