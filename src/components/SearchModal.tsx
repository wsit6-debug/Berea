import React, { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, MapPin, Sparkles, ChevronRight, RefreshCw } from 'lucide-react';
import { TranslationId, getApprovedTranslationsForDenomination } from '../data/bibleData';
import { BIBLICAL_LOCATIONS } from '../data/geoData';
import { THEOLOGICAL_INSIGHTS, DenominationalLens } from '../data/theologyData';
import { searchEntireBible, BibleSearchResult, parsePassageReference } from '../services/youversionService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPassage: (bookId: string, chapterNum: number, verseNum?: number) => void;
  activeTranslation: TranslationId;
  activeLens?: DenominationalLens;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPassage,
  activeTranslation,
  activeLens = 'catholic'
}) => {
  const [query, setQuery] = useState('');
  const [searchTranslation, setSearchTranslation] = useState<TranslationId>(activeTranslation);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'SCRIPTURE' | 'MAPS' | 'THEOLOGY'>('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [verseResults, setVerseResults] = useState<BibleSearchResult[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSearchTranslation(activeTranslation);
  }, [activeTranslation]);

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setVerseResults([]);
      setIsSearching(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await searchEntireBible(trimmed, searchTranslation, 40);
        setVerseResults(results);
      } catch (err) {
        console.error('Error searching entire Bible:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query, searchTranslation, isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search Locations
  const geoResults = cleanQuery.length > 1
    ? Object.values(BIBLICAL_LOCATIONS).filter(loc =>
        loc.name.toLowerCase().includes(cleanQuery) ||
        loc.description.toLowerCase().includes(cleanQuery) ||
        loc.modernCountry.toLowerCase().includes(cleanQuery)
      )
    : [];

  // Search Theological Topics
  const theologyResults = cleanQuery.length > 1
    ? Object.entries(THEOLOGICAL_INSIGHTS).filter(([key, val]) =>
        val.passageRef.toLowerCase().includes(cleanQuery) ||
        val.theologicalThemes.some(t => t.toLowerCase().includes(cleanQuery)) ||
        val.originalLanguageInsights.some(o => o.term.toLowerCase().includes(cleanQuery) || o.transliteration.toLowerCase().includes(cleanQuery))
      )
    : [];

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text;
    try {
      const lowerText = text.toLowerCase();
      const lowerQ = q.toLowerCase();
      const idx = lowerText.indexOf(lowerQ);
      if (idx === -1) return text;

      const before = text.slice(0, idx);
      const match = text.slice(idx, idx + q.length);
      const after = text.slice(idx + q.length);

      return (
        <>
          {before}
          <span className="bg-[#FAF3E8] text-[#78471F] font-semibold px-0.5 rounded">
            {match}
          </span>
          {after}
        </>
      );
    } catch {
      return text;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4 bg-black/30 backdrop-blur-xl animate-fadeIn select-none">
      <div className="bg-white border border-[#EBE5DC] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-[0_20px_50px_rgba(180,160,140,0.2)] overflow-hidden">
        {/* Spotlight Search Bar */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#EBE5DC] flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#FAF5ED] border border-[#EBE5DC] flex items-center justify-center">
            <Search className="w-3.5 h-3.5 text-[#B4793D]" />
          </div>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search scripture, topics, historical places..."
            className="flex-1 bg-transparent text-[#26221F] placeholder-[#A8A29E] text-sm focus:outline-none font-normal"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[11px] text-[#A8A29E] hover:text-[#26221F]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="ios-icon-btn !w-6 !h-6"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter Sub-bar */}
        <div className="px-4 py-2 bg-white border-b border-[#EBE5DC] flex items-center justify-between gap-2">
          {/* Category Tabs */}
          <div className="ios-segmented-capsule">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`ios-segment-pill !text-[11px] ${filterCategory === 'ALL' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterCategory('SCRIPTURE')}
              className={`ios-segment-pill !text-[11px] ${filterCategory === 'SCRIPTURE' ? 'active' : ''}`}
            >
              Scripture ({verseResults.length})
            </button>
            <button
              onClick={() => setFilterCategory('MAPS')}
              className={`ios-segment-pill !text-[11px] ${filterCategory === 'MAPS' ? 'active' : ''}`}
            >
              Places ({geoResults.length})
            </button>
            <button
              onClick={() => setFilterCategory('THEOLOGY')}
              className={`ios-segment-pill !text-[11px] ${filterCategory === 'THEOLOGY' ? 'active' : ''}`}
            >
              Theology ({theologyResults.length})
            </button>
          </div>

          {/* Translation Picker */}
          <div className="ios-segmented-capsule hidden sm:flex">
            {getApprovedTranslationsForDenomination(activeLens).slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => setSearchTranslation(t.id)}
                className={`ios-segment-pill !text-[10px] !py-0.5 !px-2 ${searchTranslation === t.id ? 'active' : ''}`}
                title={`${t.name} (${t.badge})`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        {!cleanQuery && (
          <div className="p-4 space-y-2 bg-[#FAF7F2]">
            <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider block">
              Suggested Searches
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['John 3:16', 'Grace and faith', 'Berea', 'Righteousness', 'Romans 8:28', 'Psalm 23', 'Holy Spirit'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setQuery(chip)}
                  className="ios-glass-btn text-xs py-1 px-2.5 hover:border-[#D4A373] hover:text-[#B4793D]"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 custom-scrollbar bg-white select-text">
          {isSearching && verseResults.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-[#78716C] text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#B4793D]" />
              <span>Searching full Scripture in {searchTranslation}...</span>
            </div>
          )}
          {/* Scripture Results */}
          {(filterCategory === 'ALL' || filterCategory === 'SCRIPTURE') && verseResults.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-[#B4793D]" />
                  Scripture Passages ({verseResults.length} matches in {searchTranslation})
                </span>
              </div>
              <div className="space-y-1.5">
                {verseResults.map((v, i) => (
                  <div
                    key={`${v.bookId}_${v.chapterNum}_${v.verseNum}_${i}`}
                    onClick={() => {
                      onNavigateToPassage(v.bookId, v.chapterNum, v.verseNum);
                      onClose();
                    }}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#FAF5ED] border border-[#EBE5DC] hover:border-[#D4A373] cursor-pointer transition-colors space-y-1 group shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#26221F] group-hover:text-[#78471F] flex items-center gap-1">
                        <span>{v.bookName} {v.chapterNum}:{v.verseNum}</span>
                        <span className="text-[9.5px] text-[#A8A29E] font-mono">({v.translation})</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E] group-hover:text-[#B4793D] transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="font-scripture text-xs text-[#38332E] leading-relaxed">
                      {highlightMatch(v.text, cleanQuery)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Places Results */}
          {(filterCategory === 'ALL' || filterCategory === 'MAPS') && geoResults.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1 px-1">
                <MapPin className="w-3 h-3 text-[#B4793D]" />
                Historical Atlas ({geoResults.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {geoResults.map((loc) => (
                  <div
                    key={loc.id}
                    onClick={() => {
                      if (loc.scriptureReferences && loc.scriptureReferences.length > 0) {
                        const parsed = parsePassageReference(loc.scriptureReferences[0]);
                        if (parsed) {
                          onNavigateToPassage(parsed.bookId, parsed.chapterNum, parsed.verseNum);
                        }
                      }
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white hover:bg-[#FAF5ED] border border-[#EBE5DC] hover:border-[#D4A373] cursor-pointer transition-colors flex flex-col justify-between shadow-xs"
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#26221F]">{loc.name}</div>
                      <div className="text-[10px] text-[#78716C]">{loc.modernCountry} • {loc.era}</div>
                    </div>
                    <p className="text-[11px] text-[#78716C] line-clamp-2 mt-1">{loc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Theology Results */}
          {(filterCategory === 'ALL' || filterCategory === 'THEOLOGY') && theologyResults.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1 px-1">
                <Sparkles className="w-3 h-3 text-[#B4793D]" />
                Theological Topics ({theologyResults.length})
              </span>
              <div className="space-y-1.5">
                {theologyResults.map(([key, t]) => (
                  <div
                    key={key}
                    onClick={() => {
                      const parsed = parsePassageReference(t.passageRef);
                      if (parsed) {
                        onNavigateToPassage(parsed.bookId, parsed.chapterNum, parsed.verseNum);
                      }
                      onClose();
                    }}
                    className="p-3 rounded-xl bg-white hover:bg-[#FAF5ED] border border-[#EBE5DC] hover:border-[#D4A373] cursor-pointer transition-colors shadow-xs"
                  >
                    <div className="font-semibold text-xs text-[#B4793D] mb-0.5">{t.passageRef}</div>
                    <p className="text-xs text-[#78716C] line-clamp-2 leading-relaxed">{t.conciseOverview}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cleanQuery && !isSearching && verseResults.length === 0 && geoResults.length === 0 && theologyResults.length === 0 && (
            <div className="py-12 text-center text-[#78716C] text-xs space-y-1">
              <p className="text-[#26221F] font-semibold">No matches found for "{query}"</p>
              <p className="text-[#A8A29E]">Try searching for keywords like "grace", "love", "faith", or "John 3:16".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
