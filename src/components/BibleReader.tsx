import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Verse, Chapter, TranslationId } from '../data/bibleData';
import { Bookmark, Copy, Sparkles, ChevronLeft, ChevronRight, Pause, Check, ZoomIn, ZoomOut, Volume2, AlignLeft, List, FastForward, Rewind, X, BookOpenCheck, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkIsWordsOfJesus, renderRedLetterContent } from '../services/redLetterService';
import {
  speakScripturePassage,
  stopScripturePlayback,
  playAuditoryCue,
  getAvailableVoices,
  subscribeVoicesLoaded,
  VoiceOption
} from '../services/audioNarrationService';
import { cleanApiText } from '../services/youversionService';

/**
 * Universal extractor for verse display text across all translation keys & data shapes
 */
export function getVerseDisplayText(
  verse: Verse | undefined | null,
  activeTranslation: TranslationId = 'ESV'
): string {
  if (!verse) return '';
  if (typeof verse.text === 'string') {
    return cleanApiText(verse.text);
  }
  if (verse.text && typeof verse.text === 'object') {
    // 1. Direct active translation
    const direct = verse.text[activeTranslation];
    if (typeof direct === 'string' && direct.trim().length > 0 && !direct.startsWith('[')) {
      return cleanApiText(direct);
    }
    // 2. Fallback translations in logical hierarchy
    const priorityList: TranslationId[] = ['ESV', 'NABRE', 'KJV', 'NIV', 'NASB', 'CSB', 'NLT', 'BSB', 'NRSV', 'NKJV'];
    for (const tid of priorityList) {
      const candidate = verse.text[tid];
      if (typeof candidate === 'string' && candidate.trim().length > 0 && !candidate.startsWith('[')) {
        return cleanApiText(candidate);
      }
    }
    // 3. First available non-bracketed translation
    for (const val of Object.values(verse.text)) {
      if (typeof val === 'string' && val.trim().length > 0 && !val.startsWith('[')) {
        return cleanApiText(val);
      }
    }
    // 4. Any value fallback
    const firstVal = Object.values(verse.text)[0];
    if (typeof firstVal === 'string') {
      return cleanApiText(firstVal);
    }
  }
  return '';
}

interface BibleReaderProps {
  bookName: string;
  chapter: Chapter;
  activeTranslation: TranslationId;
  selectedVerseNumber: number;
  onSelectVerse: (verse: Verse) => void;
  selectedVerseRange?: { start: number; end: number } | null;
  onSelectVerseRange?: (range: { start: number; end: number } | null, primaryVerse?: Verse) => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  isFirstChapter: boolean;
  isLastChapter: boolean;
  onOpenBereaAi: () => void;
  isAiPanelOpen?: boolean;
  isLoading?: boolean;
  onSelectPassage?: (bookId: string, chapterNum: number, verseNum?: number) => void;
  onCreateStudyGuide?: (verse: Verse, range?: { start: number; end: number }) => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  bookName,
  chapter,
  activeTranslation,
  selectedVerseNumber,
  onSelectVerse,
  selectedVerseRange,
  onSelectVerseRange,
  onNextChapter,
  onPrevChapter,
  isFirstChapter,
  isLastChapter,
  onOpenBereaAi,
  isAiPanelOpen = true,
  isLoading = false,
  onSelectPassage,
  onCreateStudyGuide
}) => {
  const [fontSize, setFontSize] = useState<number>(17);
  const [showRedLetter, setShowRedLetter] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('berea_show_red_letters');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [layoutMode, setLayoutMode] = useState<'paragraph' | 'verse'>('paragraph');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [copiedVerseNum, setCopiedVerseNum] = useState<number | null>(null);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<number[]>([]);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>(() => getAvailableVoices());
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    try {
      return localStorage.getItem('berea_preferred_voice') || '';
    } catch {
      return '';
    }
  });
  const [ttsProgress, setTtsProgress] = useState<{ text: string; progress: number } | null>(null);

  // Click-and-drag multi-verse selection state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tempDragRange, setTempDragRange] = useState<{ start: number; end: number } | null>(null);
  const dragStartVerseRef = useRef<number | null>(null);

  const activeRange = isDragging ? tempDragRange : (selectedVerseRange || (selectedVerseNumber ? { start: selectedVerseNumber, end: selectedVerseNumber } : null));
  const isMultiSelect = Boolean(activeRange && activeRange.start !== activeRange.end);

  // Subscribe to asynchronously loaded system voices
  useEffect(() => {
    const unsub = subscribeVoicesLoaded(() => {
      setAvailableVoices(getAvailableVoices());
    });
    return unsub;
  }, []);

  const isPlayingRef = useRef<boolean>(isPlayingAudio);
  isPlayingRef.current = isPlayingAudio;

  const currentVerseRef = useRef<number>(selectedVerseNumber);
  currentVerseRef.current = selectedVerseNumber;

  const selectedVoiceRef = useRef<string>(selectedVoiceId);
  selectedVoiceRef.current = selectedVoiceId;

  // Speak a specific verse with studio voice and prosody
  const playVerseAudio = useCallback((verseNum: number, speed: number = playbackSpeed, voiceId?: string) => {
    const versesList = chapter?.verses || [];
    const targetVerse = versesList.find(v => v.verseNumber === verseNum) || versesList[0];
    if (!targetVerse) return;

    const rawText = getVerseDisplayText(targetVerse, activeTranslation);
    if (!rawText) return;

    const activeVoice = voiceId !== undefined ? voiceId : selectedVoiceRef.current;

    speakScripturePassage(
      bookName,
      chapter.chapterNumber,
      targetVerse.verseNumber,
      rawText,
      speed,
      activeVoice || undefined,
      () => {
        setTtsProgress(null);
      },
      () => {
        setTtsProgress(null);
        // Finished verse -> Auto advance to next verse if still in playing mode
        if (isPlayingRef.current) {
          const currentIndex = chapter.verses.findIndex(v => v.verseNumber === targetVerse.verseNumber);
          if (currentIndex < chapter.verses.length - 1) {
            const nextV = chapter.verses[currentIndex + 1];
            if (nextV) {
              onSelectVerse(nextV);
              playVerseAudio(nextV.verseNumber, speed, activeVoice);
            }
          } else {
            setIsPlayingAudio(false);
            stopScripturePlayback();
          }
        }
      },
      (err) => {
        console.warn('Audio playback error', err);
        setTtsProgress(null);
      },
      (p) => {
        setTtsProgress(p);
      }
    );
  }, [bookName, chapter.chapterNumber, chapter.verses, activeTranslation, playbackSpeed, onSelectVerse]);

  // Audio Playback Toggle Button Handler
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      playAuditoryCue('pause');
      stopScripturePlayback();
      setIsPlayingAudio(false);
    } else {
      playAuditoryCue('start');
      setIsPlayingAudio(true);
      playVerseAudio(selectedVerseNumber, playbackSpeed, selectedVoiceId);
    }
  };

  // Jump to verse when user clicks verse
  const handleSelectVerseWithAudio = (verse: Verse) => {
    onSelectVerse(verse);
    playAuditoryCue('select');
    if (isPlayingAudio) {
      playVerseAudio(verse.verseNumber, playbackSpeed, selectedVoiceId);
    }
  };

  // Step audio forward / backward
  const handleAudioStep = (direction: 'prev' | 'next') => {
    const currentIndex = chapter.verses.findIndex(v => v.verseNumber === selectedVerseNumber);
    if (direction === 'prev' && currentIndex > 0) {
      const prevV = chapter.verses[currentIndex - 1];
      onSelectVerse(prevV);
      if (isPlayingAudio) playVerseAudio(prevV.verseNumber, playbackSpeed, selectedVoiceId);
    } else if (direction === 'next' && currentIndex < chapter.verses.length - 1) {
      const nextV = chapter.verses[currentIndex + 1];
      onSelectVerse(nextV);
      if (isPlayingAudio) playVerseAudio(nextV.verseNumber, playbackSpeed, selectedVoiceId);
    }
  };

  // Clean up audio on chapter navigation or unmount
  useEffect(() => {
    return () => {
      stopScripturePlayback();
      setIsPlayingAudio(false);
    };
  }, [chapter.chapterNumber, bookName]);

  const handleToggleRedLetter = () => {
    setShowRedLetter(prev => {
      const nextVal = !prev;
      try {
        localStorage.setItem('berea_show_red_letters', String(nextVal));
      } catch { }
      return nextVal;
    });
  };

  const chapterHasRedLines = (chapter?.verses || []).some(v => {
    const text = getVerseDisplayText(v, activeTranslation);
    return Boolean(v.isWordsOfJesus || checkIsWordsOfJesus(bookName, chapter.chapterNumber, v.verseNumber, text));
  });

  const handleCopyVerse = (verse: Verse, e: React.MouseEvent) => {
    e.stopPropagation();
    const verseText = getVerseDisplayText(verse, activeTranslation);
    const textToCopy = `"${verseText}" — ${bookName} ${chapter.chapterNumber}:${verse.verseNumber} (${activeTranslation})`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedVerseNum(verse.verseNumber);
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  const handleToggleBookmark = (verseNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedVerses(prev => {
      const next = prev.includes(verseNumber)
        ? prev.filter(v => v !== verseNumber)
        : [...prev, verseNumber];
      try {
        localStorage.setItem('berea_bookmarked_verses', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  const handleVerseMouseDown = (verseNum: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    dragStartVerseRef.current = verseNum;
    setIsDragging(true);
    setTempDragRange({ start: verseNum, end: verseNum });
  };

  const handleVerseMouseEnter = (verseNum: number) => {
    if (!isDragging || dragStartVerseRef.current === null) return;
    const start = Math.min(dragStartVerseRef.current, verseNum);
    const end = Math.max(dragStartVerseRef.current, verseNum);
    setTempDragRange(prev => (prev && prev.start === start && prev.end === end ? prev : { start, end }));
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || dragStartVerseRef.current === null) return;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const verseEl = el?.closest('[data-verse-number]');
    if (verseEl) {
      const vNum = Number(verseEl.getAttribute('data-verse-number'));
      if (vNum && !isNaN(vNum)) {
        const start = Math.min(dragStartVerseRef.current, vNum);
        const end = Math.max(dragStartVerseRef.current, vNum);
        setTempDragRange(prev => (prev && prev.start === start && prev.end === end ? prev : { start, end }));
      }
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging && dragStartVerseRef.current !== null && tempDragRange) {
        const finalRange = tempDragRange;
        const targetVerse = (chapter?.verses || []).find(v => v.verseNumber === finalRange.start) || chapter?.verses[0];

        if (finalRange.start === finalRange.end) {
          if (targetVerse) {
            handleSelectVerseWithAudio(targetVerse);
          }
          if (onSelectVerseRange) {
            onSelectVerseRange({ start: finalRange.start, end: finalRange.end }, targetVerse);
          }
        } else {
          if (targetVerse) {
            onSelectVerse(targetVerse);
          }
          if (onSelectVerseRange) {
            onSelectVerseRange(finalRange, targetVerse);
          }
        }
        setIsDragging(false);
        setTempDragRange(null);
        dragStartVerseRef.current = null;
      }
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, tempDragRange, chapter, onSelectVerse, onSelectVerseRange]);

  const handleCopyRange = (start: number, end: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const rangeVerses = (chapter?.verses || []).filter(v => v.verseNumber >= start && v.verseNumber <= end);
    const text = `${bookName} ${chapter.chapterNumber}:${start}–${end} (${activeTranslation})\n\n` +
      rangeVerses.map(v => `[${v.verseNumber}] ${getVerseDisplayText(v, activeTranslation)}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedVerseNum(-1);
    setTimeout(() => setCopiedVerseNum(null), 2000);
  };

  const activeVerse = chapter.verses.find(v => v.verseNumber === selectedVerseNumber) || chapter.verses[0];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#EBE5DC] shadow-[0_2px_12px_rgba(180,160,140,0.06)] overflow-hidden">

      {/* Top Compact Reading Bar */}
      <div className="reader-toolbar px-3 sm:px-5 py-2 bg-white border-b border-[#EBE5DC] flex items-center justify-between select-none flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Chapter Stepper */}
          <div className="flex items-center gap-0.5 bg-[#FAF5ED] rounded-full p-0.5 border border-[#EBE5DC]">
            <button
              onClick={onPrevChapter}
              disabled={isFirstChapter}
              className="p-1 rounded-full text-[#78716C] hover:text-[#26221F] hover:bg-white disabled:opacity-25 transition-all"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-[#26221F] px-1.5 font-heading whitespace-nowrap">
              {bookName} {chapter.chapterNumber}
            </span>
            <button
              onClick={onNextChapter}
              disabled={isLastChapter}
              className="p-1 rounded-full text-[#78716C] hover:text-[#26221F] hover:bg-white disabled:opacity-25 transition-all"
              title="Next Chapter"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] font-semibold text-[#78716C] px-2 py-0.5 bg-[#FAF5ED] rounded-full border border-[#EBE5DC]">
            {activeTranslation}
          </span>
        </div>

        {/* Right Controls: Reading Mode, Audio Narration, Red Letters & Font Sizer */}
        <div className="flex items-center gap-1.5">
          {/* Reading Mode Toggle */}
          <div className="ios-segmented-capsule hidden sm:flex">
            <button
              onClick={() => setLayoutMode('paragraph')}
              className={`ios-segment-pill !text-[10.5px] !py-0.5 !px-2 ${layoutMode === 'paragraph' ? 'active' : ''}`}
              title="Paragraph Flow (Compact Book View)"
            >
              <AlignLeft className="w-3 h-3" />
              <span>Flow</span>
            </button>
            <button
              onClick={() => setLayoutMode('verse')}
              className={`ios-segment-pill !text-[10.5px] !py-0.5 !px-2 ${layoutMode === 'verse' ? 'active' : ''}`}
              title="Verse by Verse View"
            >
              <List className="w-3 h-3" />
              <span>Verses</span>
            </button>
          </div>

          {/* Audio Player Pill with Real Web Speech API */}
          <button
            onClick={handleToggleAudio}
            className={`text-xs py-1 px-2.5 rounded-full border flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${isPlayingAudio
                ? 'bg-[#B4793D] text-white border-[#B4793D] font-medium shadow-[0_2px_8px_rgba(180,121,61,0.25)]'
                : 'bg-white text-[#26221F] border-[#EBE5DC] hover:border-[#D4A373]'
              }`}
            title={isPlayingAudio ? 'Pause Narration' : 'Listen to Audio Narration'}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3 h-3 text-white fill-white" />
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-0.5 h-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-0.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                </div>
                <span>Pause</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#B4793D]" />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Red Lines Toggle with Visual Indicator (Fixed width with zero layout shift) */}
          <button
            onClick={handleToggleRedLetter}
            className={`red-letter-toggle-btn ${showRedLetter ? 'is-active' : 'is-inactive'}`}
            title="Toggle Words of Christ in Red Lines"
          >
            <span className="w-2 h-2 flex-shrink-0 flex items-center justify-center relative">
              {showRedLetter ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
                </>
              ) : (
                <span className="w-2 h-2 rounded-full bg-[#D6D3D1]"></span>
              )}
            </span>
            <span>{showRedLetter ? 'Red Lines: ON' : 'Red Lines: OFF'}</span>
          </button>

          {/* Font Size Controls */}
          <div className="hidden md:flex items-center bg-[#FAF5ED] rounded-full p-0.5 border border-[#EBE5DC]">
            <button
              onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
              className="p-1 rounded-full text-[#78716C] hover:text-[#26221F] hover:bg-white transition-all"
              title="Smaller font"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[10px] font-mono text-[#78716C]">{fontSize}px</span>
            <button
              onClick={() => setFontSize(prev => Math.min(24, prev + 1))}
              className="p-1 rounded-full text-[#78716C] hover:text-[#26221F] hover:bg-white transition-all"
              title="Larger font"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Red Lines Active Notification when current passage has no direct words of Christ */}
      {showRedLetter && !chapterHasRedLines && (
        <div className="bg-[#FEF2F2] border-b border-[#FECACA] px-3 sm:px-5 py-1.5 flex items-center justify-between text-xs text-[#991B1B] select-none animate-fadeIn flex-wrap gap-2">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block w-2 h-2 rounded-full bg-[#DC2626]"></span>
            <span>Red Lines active (Words of Christ). No direct quotes in {bookName} {chapter.chapterNumber}.</span>
          </span>
          {onSelectPassage && (
            <div className="flex items-center gap-2 text-[11px] font-semibold">
              <button
                onClick={() => onSelectPassage('john', 3, 16)}
                className="hover:underline text-[#7F1D1D] bg-white px-2 py-0.5 rounded border border-[#FECACA] shadow-xs"
                title="View John 3 in Red Lines"
              >
                John 3:16 →
              </button>
              <button
                onClick={() => onSelectPassage('matthew', 5, 1)}
                className="hover:underline text-[#7F1D1D] bg-white px-2 py-0.5 rounded border border-[#FECACA] shadow-xs"
                title="View Matthew 5 (Sermon on the Mount) in Red Lines"
              >
                Matthew 5 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Scripture Canvas */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 custom-scrollbar bg-white relative">
        {isLoading ? (
          <div className="max-w-2xl mx-auto space-y-3 py-6 animate-pulse">
            <div className="h-6 bg-[#FAF5ED] rounded w-1/4 mx-auto mb-4"></div>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="space-y-1.5">
                <div className="h-3.5 bg-[#FAF5ED] rounded w-full"></div>
                <div className="h-3.5 bg-[#FAF5ED] rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto pb-16">
            {/* Compact Chapter Header */}
            <div className="mb-4 text-center select-none">
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#26221F] tracking-tight">
                {bookName} {chapter.chapterNumber}
              </h1>
              {chapter.summary && (
                <p className="mt-1 text-xs text-[#78716C] font-normal italic max-w-md mx-auto leading-normal">
                  {chapter.summary}
                </p>
              )}
            </div>

            {/* Paragraph Mode (Flowing Narrative) */}
            {layoutMode === 'paragraph' ? (
              <div
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
                className={`font-scripture text-[#38332E] text-justify space-y-3 ${isDragging ? 'select-none cursor-text' : ''}`}
                onMouseMove={handleContainerMouseMove}
              >
                <p className="leading-relaxed">
                  {(chapter?.verses || []).map((verse) => {
                    const isSelected = activeRange
                      ? (verse.verseNumber >= activeRange.start && verse.verseNumber <= activeRange.end)
                      : (selectedVerseNumber === verse.verseNumber);
                    const isRangeStart = activeRange?.start === verse.verseNumber;
                    const isRangeEnd = activeRange?.end === verse.verseNumber;
                    const isBookmarked = bookmarkedVerses.includes(verse.verseNumber);
                    const verseText = getVerseDisplayText(verse, activeTranslation);
                    const isWordOfJesus = Boolean(
                      verse.isWordsOfJesus ||
                      checkIsWordsOfJesus(bookName, chapter.chapterNumber, verse.verseNumber, verseText)
                    );

                    return (
                      <span
                        key={verse.verseNumber}
                        data-verse-number={verse.verseNumber}
                        onMouseDown={(e) => handleVerseMouseDown(verse.verseNumber, e)}
                        onMouseEnter={() => handleVerseMouseEnter(verse.verseNumber)}
                        className={`cursor-pointer transition-all duration-100 px-1 py-0.5 inline ${isSelected
                            ? `bg-[#FAF3E8] text-[#26221F] font-normal shadow-2xs ${isRangeStart ? 'rounded-l-md pl-1.5' : ''} ${isRangeEnd ? 'rounded-r-md pr-1.5' : ''} ${isMultiSelect ? 'border-y border-[#B4793D]/30' : 'rounded ring-1 ring-[#B4793D]/30'}`
                            : 'hover:bg-[#FAF9F5] rounded'
                          }`}
                      >
                        <sup className={`text-[10px] select-none font-bold mr-1 ${isSelected ? 'text-[#B4793D]' : 'text-[#A8A29E]'}`}>
                          {verse.verseNumber}
                          {isBookmarked && <span className="text-[#B4793D] ml-0.5">★</span>}
                        </sup>{' '}
                        {renderRedLetterContent(verseText, isWordOfJesus, showRedLetter, isSelected)}{' '}
                      </span>
                    );
                  })}
                </p>

                {/* Contextual Pill: Multi-Verse Range Selection */}
                {isMultiSelect && activeRange ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] flex flex-wrap items-center justify-between gap-2 animate-fadeIn select-none text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#B4793D] font-heading flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        vv. {activeRange.start}–{activeRange.end}
                      </span>
                      <span className="text-[10.5px] font-medium text-[#78716C] bg-white px-2 py-0.5 rounded-full border border-[#EBE5DC]">
                        {activeRange.end - activeRange.start + 1} verses selected for AI
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleCopyRange(activeRange.start, activeRange.end, e)}
                        className="ios-glass-btn !py-0.5 !px-2 text-xs bg-white flex items-center gap-1"
                        title="Copy selected verses"
                      >
                        {copiedVerseNum === -1 ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#78716C]" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {onCreateStudyGuide && (
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateStudyGuide(activeVerse, activeRange);
                          }}
                          className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[#EBE5DC] text-[#78716C] hover:text-[#B4793D] hover:border-[#D4A373] shadow-xs flex items-center gap-1"
                          title="Generate Study Guide for selected range"
                        >
                          <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
                          <span>Study Guide</span>
                        </button>
                      )}

                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBereaAi();
                        }}
                        className="clean-caramel-btn !py-0.5 !px-2.5 text-xs shadow-xs flex items-center gap-1"
                        title="Analyze selected passage with Berea AI"
                      >
                        <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                        <span>Ask AI</span>
                      </button>

                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectVerseRange) {
                            onSelectVerseRange(null);
                          }
                        }}
                        className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F]"
                        title="Clear multi-verse selection"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Floating Contextual Pill for Single Selected Verse in Flow Mode */
                  activeVerse && (
                    <div className="mt-3 p-2.5 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] flex flex-wrap items-center justify-between gap-2 animate-fadeIn select-none text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#B4793D] font-heading">
                          v{activeVerse.verseNumber}
                        </span>
                        {activeVerse.greekHebrew && activeVerse.greekHebrew.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#78716C] truncate max-w-[200px]">
                            <span>Lemma:</span>
                            <span className="font-medium text-[#26221F] bg-white px-1.5 py-0.2 rounded border border-[#EBE5DC]">
                              {activeVerse.greekHebrew[0].word} <em>({activeVerse.greekHebrew[0].transliteration})</em>
                            </span>
                          </div>
                        )}
                        <span className="hidden md:inline text-[10px] text-[#A8A29E] italic">
                          (Click & drag to select multiple verses)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => handleCopyVerse(activeVerse, e)}
                          className="ios-glass-btn !py-0.5 !px-2 text-xs bg-white"
                          title="Copy Verse"
                        >
                          {copiedVerseNum === activeVerse.verseNumber ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#78716C]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>

                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => handleToggleBookmark(activeVerse.verseNumber, e)}
                          className={`ios-glass-btn !py-0.5 !px-2.5 text-xs transition-all ${bookmarkedVerses.includes(activeVerse.verseNumber)
                              ? '!bg-[#FAF3E8] !text-[#B4793D] !border-[#D4A373] font-medium'
                              : 'bg-white hover:border-[#D4A373]'
                            }`}
                          title={bookmarkedVerses.includes(activeVerse.verseNumber) ? 'Remove Bookmark' : 'Bookmark Verse'}
                        >
                          <Bookmark className={`w-3 h-3 ${bookmarkedVerses.includes(activeVerse.verseNumber) ? 'fill-[#B4793D] text-[#B4793D]' : 'text-[#78716C]'}`} />
                          <span>{bookmarkedVerses.includes(activeVerse.verseNumber) ? 'Bookmarked' : 'Bookmark'}</span>
                        </button>

                        {onCreateStudyGuide && (
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectVerse(activeVerse);
                              onCreateStudyGuide(activeVerse);
                            }}
                            className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[#EBE5DC] text-[#78716C] hover:text-[#B4793D] hover:border-[#D4A373] shadow-xs"
                            title="Generate Study Guide for this passage"
                          >
                            <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
                            <span>Study Guide</span>
                          </button>
                        )}

                        {!isAiPanelOpen && (
                          <button
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectVerse(activeVerse);
                              onOpenBereaAi();
                            }}
                            className="clean-caramel-btn !py-0.5 !px-2.5 text-xs shadow-xs"
                            title="Open in AI Guide"
                          >
                            <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                            <span>Insights</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              /* Verse by Verse Mode */
              <div
                className={`space-y-1 ${isDragging ? 'select-none cursor-text' : ''}`}
                onMouseMove={handleContainerMouseMove}
              >
                {(chapter?.verses || []).map((verse) => {
                  const isSelected = activeRange
                    ? (verse.verseNumber >= activeRange.start && verse.verseNumber <= activeRange.end)
                    : (selectedVerseNumber === verse.verseNumber);
                  const isRangeEnd = activeRange?.end === verse.verseNumber;
                  const isBookmarked = bookmarkedVerses.includes(verse.verseNumber);
                  const verseText = getVerseDisplayText(verse, activeTranslation);
                  const isWordOfJesus = Boolean(
                    verse.isWordsOfJesus ||
                    checkIsWordsOfJesus(bookName, chapter.chapterNumber, verse.verseNumber, verseText)
                  );

                  return (
                    <div
                      key={verse.verseNumber}
                      data-verse-number={verse.verseNumber}
                      onMouseDown={(e) => handleVerseMouseDown(verse.verseNumber, e)}
                      onMouseEnter={() => handleVerseMouseEnter(verse.verseNumber)}
                      className={`group relative px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${isSelected
                          ? 'bg-[#FAF3E8] border-l-3 border-[#B4793D] shadow-xs'
                          : showRedLetter && isWordOfJesus
                            ? 'bg-red-50/20 border-l-2 border-red-500 hover:bg-red-50/40'
                            : 'hover:bg-[#FAF9F5] border-l-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span className={`text-[10.5px] select-none font-semibold flex-shrink-0 w-4 text-right ${isSelected
                            ? 'text-[#B4793D] font-bold'
                            : showRedLetter && isWordOfJesus
                              ? 'text-red-600 font-bold'
                              : 'text-[#A8A29E]'
                          }`}>
                          {verse.verseNumber}
                        </span>

                        <div className="flex-1">
                          <p
                            style={{ fontSize: `${fontSize}px`, lineHeight: '1.75' }}
                            className="font-scripture tracking-normal"
                          >
                            {renderRedLetterContent(verseText, isWordOfJesus, showRedLetter, isSelected)}
                          </p>

                          {/* Multi-Verse Action Banner when at the end of the range in Verse Mode */}
                          {isMultiSelect && activeRange && isRangeEnd && (
                            <div className="mt-2 pt-2 border-t border-[#EBE5DC] flex flex-wrap items-center justify-between gap-2 animate-fadeIn select-none">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-[#B4793D] flex items-center gap-1">
                                  <Layers className="w-3 h-3" />
                                  vv. {activeRange.start}–{activeRange.end}
                                </span>
                                <span className="text-[9.5px] font-medium text-[#78716C] bg-white px-1.5 py-0.2 rounded border border-[#EBE5DC]">
                                  {activeRange.end - activeRange.start + 1} verses for AI
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleCopyRange(activeRange.start, activeRange.end, e)}
                                  className="ios-glass-btn text-xs !py-0.5 !px-2 bg-white flex items-center gap-1"
                                  title="Copy selected verses"
                                >
                                  {copiedVerseNum === -1 ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[#78716C]" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                {onCreateStudyGuide && (
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onCreateStudyGuide(activeVerse, activeRange);
                                    }}
                                    className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[#EBE5DC] text-[#78716C] hover:text-[#B4793D] hover:border-[#D4A373] shadow-xs flex items-center gap-1"
                                    title="Generate Study Guide for selected range"
                                  >
                                    <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
                                    <span>Study Guide</span>
                                  </button>
                                )}

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenBereaAi();
                                  }}
                                  className="clean-caramel-btn text-xs !py-0.5 !px-2.5 shadow-xs flex items-center gap-1"
                                  title="Analyze selected verses in Berea AI"
                                >
                                  <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                                  <span>Ask AI</span>
                                </button>

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onSelectVerseRange) {
                                      onSelectVerseRange(null);
                                    }
                                  }}
                                  className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F]"
                                  title="Clear range selection"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Selected Verse Compact Actions (Single Verse Selection) */}
                          {!isMultiSelect && isSelected && (
                            <div className="mt-2 pt-1.5 border-t border-[#EBE5DC] flex items-center justify-between animate-fadeIn select-none">
                              {verse.greekHebrew && verse.greekHebrew.length > 0 ? (
                                <div className="flex items-center gap-1 text-[10.5px] text-[#78716C] truncate max-w-[200px]">
                                  <span className="text-[#B4793D] font-semibold">Lemma:</span>
                                  <span className="font-medium text-[#26221F] bg-white px-1.5 py-0.2 rounded border border-[#EBE5DC]">
                                    {verse.greekHebrew[0].word} <em>({verse.greekHebrew[0].transliteration})</em>
                                  </span>
                                </div>
                              ) : <div />}

                              <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleCopyVerse(verse, e)}
                                  className="ios-glass-btn text-xs !py-0.5 !px-2 bg-white"
                                  title="Copy Verse"
                                >
                                  {copiedVerseNum === verse.verseNumber ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[#78716C]" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleToggleBookmark(verse.verseNumber, e)}
                                  className={`ios-glass-btn text-xs !py-0.5 !px-2.5 transition-all ${isBookmarked
                                      ? '!bg-[#FAF3E8] !text-[#B4793D] !border-[#D4A373] font-medium'
                                      : 'bg-white hover:border-[#D4A373]'
                                    }`}
                                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
                                >
                                  <Bookmark className={`w-3 h-3 ${isBookmarked ? 'fill-[#B4793D] text-[#B4793D]' : 'text-[#78716C]'}`} />
                                  <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                                </button>

                                {onCreateStudyGuide && (
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectVerse(verse);
                                      onCreateStudyGuide(verse);
                                    }}
                                    className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[#EBE5DC] text-[#78716C] hover:text-[#B4793D] hover:border-[#D4A373] shadow-xs"
                                    title="Generate Study Guide for this passage"
                                  >
                                    <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
                                    <span>Study Guide</span>
                                  </button>
                                )}

                                {!isAiPanelOpen && (
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectVerse(verse);
                                      onOpenBereaAi();
                                    }}
                                    className="clean-caramel-btn text-xs !py-0.5 !px-2.5 shadow-xs"
                                    title="Open in AI Guide"
                                  >
                                    <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                                    <span>Insights</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Compact Bottom Stepper Footer with Berea Colophon Seal */}
            <div className="mt-8 pt-4 border-t border-[#EBE5DC] flex items-center justify-between text-xs select-none">
              <button
                onClick={onPrevChapter}
                disabled={isFirstChapter}
                className="flex items-center gap-1 text-[#78716C] hover:text-[#26221F] disabled:opacity-25 font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Chapter</span>
              </button>

              <div className="flex items-center gap-2.5 opacity-85 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#EBE5DC] bg-[#FAF7F2] p-0.5 shadow-xs flex items-center justify-center">
                  <img src="/berea-logo.jpg" alt="Berea" className="w-full h-full object-contain" />
                </div>
                <span className="font-heading font-semibold text-xs text-[#78716C]">
                  Berea <span className="font-sans font-normal text-[10px] text-[#A8A29E]">• Acts 17:11</span>
                </span>
              </div>

              <button
                onClick={onNextChapter}
                disabled={isLastChapter}
                className="flex items-center gap-1 text-[#B4793D] hover:text-[#9A632E] disabled:opacity-25 font-semibold transition-colors"
              >
                <span>Next Chapter</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Floating Mini Audio Player Bar (Appears when Audio Narration is Playing) */}
        {isPlayingAudio && (
          <div className="absolute bottom-3 left-4 right-4 sm:left-8 sm:right-8 bg-[#26221F] text-white px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(38,34,31,0.35)] border border-[#3E3833] flex items-center justify-between gap-3 animate-fadeIn z-30 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1 h-3.5 px-1 bg-[#38332E] rounded-full">
                <span className="w-0.5 h-2.5 bg-[#D4A373] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-0.5 h-3.5 bg-[#B4793D] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-0.5 h-2 bg-[#D4A373] rounded-full animate-bounce"></span>
              </div>
              <div className="truncate">
                <span className="text-[11px] text-[#A8A29E] block leading-none">
                  {ttsProgress ? (
                    <span className="text-[#FBBF24] font-medium animate-pulse">{ttsProgress.text}</span>
                  ) : (
                    'Narrating Holy Scripture'
                  )}
                </span>
                <span className="text-xs font-semibold text-white font-heading truncate">
                  {bookName} {chapter.chapterNumber}:{selectedVerseNumber} ({activeTranslation})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => handleAudioStep('prev')}
                className="p-1 rounded-full text-[#A8A29E] hover:text-white hover:bg-[#38332E] transition-all"
                title="Previous Verse"
              >
                <Rewind className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleToggleAudio}
                className="p-1.5 rounded-full bg-[#B4793D] text-white hover:bg-[#9A632E] transition-all shadow-xs"
                title={isPlayingAudio ? 'Pause Narration' : 'Resume Narration'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-3.5 h-3.5 fill-white" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                onClick={() => handleAudioStep('next')}
                className="p-1 rounded-full text-[#A8A29E] hover:text-white hover:bg-[#38332E] transition-all"
                title="Next Verse"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              {/* Narrator Voice Selector Dropdown (Safari & OS Native Voices) */}
              <div className="hidden sm:flex items-center ml-1">
                <select
                  value={selectedVoiceId}
                  onChange={(e) => {
                    const newVoice = e.target.value;
                    setSelectedVoiceId(newVoice);
                    try {
                      if (newVoice) localStorage.setItem('berea_preferred_voice', newVoice);
                      else localStorage.removeItem('berea_preferred_voice');
                    } catch { }
                    if (isPlayingAudio) {
                      playVerseAudio(selectedVerseNumber, playbackSpeed, newVoice);
                    }
                  }}
                  className="bg-[#38332E] text-xs text-[#EBE5DC] border border-[#48423B] rounded-full px-2.5 py-1 focus:outline-none focus:border-[#B4793D] font-medium cursor-pointer max-w-[210px] truncate"
                  title="Select Studio Narrator Voice"
                >
                  <option value="">⚡ Auto (Dignified British / Clear US)</option>
                  {availableVoices.filter(v => v.id !== '').map(v => (
                    <option key={v.id} value={v.id}>
                      {v.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center bg-[#38332E] rounded-full p-0.5 ml-1 border border-[#48423B]">
                {[0.85, 1.0, 1.15].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackSpeed(rate);
                      playVerseAudio(selectedVerseNumber, rate, selectedVoiceId);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono transition-all ${playbackSpeed === rate
                        ? 'bg-[#B4793D] text-white font-bold'
                        : 'text-[#A8A29E] hover:text-white'
                      }`}
                  >
                    {rate === 1.0 ? '1x' : `${rate}x`}
                  </button>
                ))}
              </div>

              {/* Stop & Dismiss Button */}
              <button
                onClick={() => {
                  stopScripturePlayback();
                  setIsPlayingAudio(false);
                }}
                className="p-1 ml-1 text-[#A8A29E] hover:text-white hover:bg-[#38332E] rounded-full transition-all"
                title="Stop & Close Audio Player"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
