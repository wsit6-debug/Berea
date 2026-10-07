import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Verse, Chapter, TranslationId, getTranslationColor, TRANSLATIONS } from '../data/bibleData';
import { useLanguage } from '../i18n/LanguageContext';
import { Bookmark, Copy, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Pause, Check, ZoomIn, ZoomOut, Volume2, AlignLeft, List, FastForward, Rewind, X, BookOpenCheck, Layers, Highlighter, Trophy, HardDrive, Globe, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkIsWordsOfJesus, renderRedLetterContent } from '../services/redLetterService';
import { detectChapterPersonsWithAi } from '../services/characterHighlightService';
import {
  speakScripturePassage,
  stopScripturePlayback,
  playAuditoryCue,
  getAvailableVoices,
  subscribeVoicesLoaded,
  VoiceOption
} from '../services/audioNarrationService';
import { cleanApiText, BUNDLED_OFFLINE_TRANSLATIONS } from '../services/youversionService';
import { useBookmarkedVerses, toggleBookmark, isVerseBookmarked } from '../services/bookmarkService';

export const HIGHLIGHT_BUTTON_STYLES: Record<'yellow' | 'green' | 'red' | 'blue', { bg: string; border: string; label: string }> = {
  yellow: { bg: 'var(--hl-yellow-bg, rgba(180, 121, 61, 0.28))', border: 'var(--hl-yellow-border, var(--clean-accent-caramel, #B4793D))', label: 'Theme' },
  green: { bg: 'var(--hl-green-bg, #BBF7D0)', border: 'var(--hl-green-border, #22C55E)', label: 'Green' },
  red: { bg: 'var(--hl-red-bg, #FECDD3)', border: 'var(--hl-red-border, #F43F5E)', label: 'Red' },
  blue: { bg: 'var(--hl-blue-bg, #BAE6FD)', border: 'var(--hl-blue-border, #0EA5E9)', label: 'Blue' }
};

/**
 * Universal extractor for verse display text across all translation keys & data shapes
 */
export function getVerseDisplayText(
  verse: Verse | undefined | null,
  activeTranslation?: string
): string {
  if (!verse || !verse.text) return '';
  if (activeTranslation && verse.text[activeTranslation]) {
    return cleanApiText(verse.text[activeTranslation]);
  }
  const defaultKeys = ['ESV', 'KJV', 'NIV', 'NLT', 'NASB', 'CSB', 'NKJV', 'RSVCE', 'NABRE', 'GENEVA'];
  for (const k of defaultKeys) {
    if (verse.text[k]) {
      return cleanApiText(verse.text[k]);
    }
  }
  for (const firstVal of Object.values(verse.text)) {
    if (firstVal) {
      return cleanApiText(firstVal);
    }
  }
  return '';
}

interface BibleReaderProps {
  bookName: string;
  bookId?: string;
  chapter: Chapter;
  activeTranslation: TranslationId;
  selectedVerseNumber?: number | null;
  onSelectVerse: (verse: Verse | null) => void;
  selectedVerseRange?: { start: number; end: number } | null;
  onSelectVerseRange?: (range: { start: number; end: number } | null, primaryVerse?: Verse | null) => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  isFirstChapter: boolean;
  isLastChapter: boolean;
  onOpenBereaAi: () => void;
  isAiPanelOpen?: boolean;
  isLoading?: boolean;
  onSelectPassage?: (bookId: string, chapterNum: number, verseNum?: number) => void;
  onCreateStudyGuide?: (verse: Verse, range?: { start: number; end: number }) => void;
  tabHighlights?: Record<number, 'yellow' | 'green' | 'red' | 'blue'>;
  onHighlightVerse?: (
    verseNum: number,
    color?: 'yellow' | 'green' | 'red' | 'blue',
    range?: { start: number; end: number } | null
  ) => void;
  activeTabTitle?: string;
  isHighlighterMode?: boolean;
  onToggleHighlighterMode?: () => void;
  activeHighlightColor?: 'yellow' | 'green' | 'red' | 'blue';
  onSelectHighlightColor?: (color: 'yellow' | 'green' | 'red' | 'blue') => void;
  onOpenQuiz?: (type: 'chapter' | 'book') => void;
  isLastChapterOfBook?: boolean;
  onOpenBookmarks?: () => void;
  isBookmarksOpen?: boolean;
  onSelectCharacter?: (charId: string) => void;
  selectedCharacter?: string | null;
  onOpenBookSelector?: () => void;
  onOpenOfflineBibles?: () => void;
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  bookName,
  bookId = '',
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
  onCreateStudyGuide,
  tabHighlights,
  onHighlightVerse,
  activeTabTitle,
  isHighlighterMode: externalHighlighterMode,
  onToggleHighlighterMode: externalToggleHighlighterMode,
  activeHighlightColor: externalHighlightColor,
  onSelectHighlightColor: externalSetHighlightColor,
  onOpenQuiz,
  isLastChapterOfBook = false,
  onOpenBookmarks,
  isBookmarksOpen = false,
  onSelectCharacter,
  selectedCharacter,
  onOpenBookSelector,
  onOpenOfflineBibles
}) => {
  const [fontSize, setFontSize] = useState<number>(17);
  const [isEditingFontSize, setIsEditingFontSize] = useState<boolean>(false);
  const [fontSizeInput, setFontSizeInput] = useState<string>('17');

  const commitFontSizeChange = () => {
    const parsed = parseFloat(fontSizeInput);
    if (!isNaN(parsed) && parsed >= 10 && parsed <= 40) {
      setFontSize(Math.round(parsed * 2) / 2);
    }
    setIsEditingFontSize(false);
  };
  // Toolbar horizontal scroll navigation state
  const toolbarScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollToolbarLeft, setCanScrollToolbarLeft] = useState(false);
  const [canScrollToolbarRight, setCanScrollToolbarRight] = useState(false);

  const checkToolbarScroll = useCallback(() => {
    const el = toolbarScrollRef.current;
    if (!el) return;
    setCanScrollToolbarLeft(el.scrollLeft > 4);
    setCanScrollToolbarRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = toolbarScrollRef.current;
    if (!el) return;
    checkToolbarScroll();
    const ro = new ResizeObserver(checkToolbarScroll);
    ro.observe(el);
    el.addEventListener('scroll', checkToolbarScroll, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', checkToolbarScroll);
    };
  }, [checkToolbarScroll]);

  const scrollToolbar = (direction: 'left' | 'right') => {
    const el = toolbarScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -160 : 160, behavior: 'smooth' });
  };

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

  const bookmarks = useBookmarkedVerses();
  const effectiveBookId = bookId || bookName.toLowerCase().replace(/\s+/g, '');
  const isVerseSaved = (vNum: number) => isVerseBookmarked(effectiveBookId, chapter.chapterNumber, vNum);

  const { language: appLanguage } = useLanguage();
  const currentTranslationObj = TRANSLATIONS.find(t => t.id === activeTranslation);
  const effectiveLang = (currentTranslationObj?.language || appLanguage || 'en').toLowerCase();

  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>(() => getAvailableVoices(effectiveLang));
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(() => {
    try {
      return localStorage.getItem(`berea_preferred_voice_${effectiveLang}`) ||
             localStorage.getItem('berea_preferred_voice') || '';
    } catch {
      return '';
    }
  });
  const [ttsProgress, setTtsProgress] = useState<{ text: string; progress: number } | null>(null);

  // Synchronized Highlighter Mode on Left Reading Side
  const [internalHighlighterMode, setInternalHighlighterMode] = useState<boolean>(false);
  const isHighlighterMode = externalHighlighterMode !== undefined ? externalHighlighterMode : internalHighlighterMode;
  const toggleHighlighterMode = () => {
    if (externalToggleHighlighterMode) {
      externalToggleHighlighterMode();
    } else {
      setInternalHighlighterMode(p => !p);
    }
  };

  const [internalHighlightColor, setInternalHighlightColor] = useState<'yellow' | 'green' | 'red' | 'blue'>('yellow');
  const readerHighlightColor = externalHighlightColor || internalHighlightColor;
  const setReaderHighlightColor = (c: 'yellow' | 'green' | 'red' | 'blue') => {
    if (externalSetHighlightColor) {
      externalSetHighlightColor(c);
    } else {
      setInternalHighlightColor(c);
    }
  };

  // Click-and-drag multi-verse selection state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [tempDragRange, setTempDragRange] = useState<{ start: number; end: number } | null>(null);
  const dragStartVerseRef = useRef<number | null>(null);
  const wasDraggingRef = useRef<boolean>(false);

  const activeRange = isDragging ? tempDragRange : (selectedVerseRange || (selectedVerseNumber ? { start: selectedVerseNumber, end: selectedVerseNumber } : null));
  const isMultiSelect = Boolean(activeRange && activeRange.start !== activeRange.end);
  const [dismissedVerseNum, setDismissedVerseNum] = useState<number | null>(null);

  // AI-verified character/person detection for the current chapter
  const [aiVerifiedCharacters, setAiVerifiedCharacters] = useState<Set<string> | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const verseTexts = (chapter?.verses || []).map(v => getVerseDisplayText(v, activeTranslation));
    detectChapterPersonsWithAi(bookName, chapter.chapterNumber, verseTexts).then(people => {
      if (!isCancelled) {
        setAiVerifiedCharacters(people);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [bookName, chapter?.chapterNumber, chapter?.verses, activeTranslation]);

  // Synchronize available voices and stored voice preference with active translation language
  useEffect(() => {
    setAvailableVoices(getAvailableVoices(effectiveLang));
    try {
      const savedLangVoice = localStorage.getItem(`berea_preferred_voice_${effectiveLang}`) || '';
      setSelectedVoiceId(savedLangVoice);
    } catch { }
  }, [effectiveLang]);

  // Subscribe to asynchronously loaded system voices
  useEffect(() => {
    const unsub = subscribeVoicesLoaded(() => {
      setAvailableVoices(getAvailableVoices(effectiveLang));
    });
    return unsub;
  }, [effectiveLang]);

  const isPlayingRef = useRef<boolean>(isPlayingAudio);
  isPlayingRef.current = isPlayingAudio;

  const currentVerseRef = useRef<number | null | undefined>(selectedVerseNumber);
  currentVerseRef.current = selectedVerseNumber;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMountRef = useRef<boolean>(true);

  // Auto-scroll to selected verse or range start
  useEffect(() => {
    const targetVerse = selectedVerseRange?.start || selectedVerseNumber;
    if (!targetVerse || !scrollContainerRef.current) return;

    const timer = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const el = scrollContainerRef.current.querySelector(`[data-verse-number="${targetVerse}"]`) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: isInitialMountRef.current ? 'auto' : 'smooth', block: 'center' });
        isInitialMountRef.current = false;
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [selectedVerseNumber, selectedVerseRange, chapter?.chapterNumber, bookName, layoutMode, isLoading]);

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
      },
      effectiveLang
    );
  }, [bookName, chapter.chapterNumber, chapter.verses, activeTranslation, effectiveLang, playbackSpeed, onSelectVerse]);

  // Audio Playback Toggle Button Handler
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      playAuditoryCue('pause');
      stopScripturePlayback();
      setIsPlayingAudio(false);
    } else {
      playAuditoryCue('start');
      setIsPlayingAudio(true);
      playVerseAudio(selectedVerseNumber || 1, playbackSpeed, selectedVoiceId);
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
    return checkIsWordsOfJesus(bookName, chapter.chapterNumber, v.verseNumber, text);
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
    const v = chapter?.verses?.find(x => x.verseNumber === verseNumber);
    const verseText = v ? getVerseDisplayText(v, activeTranslation) : '';
    toggleBookmark({
      bookId: effectiveBookId,
      bookName,
      chapter: chapter.chapterNumber,
      verseNumber,
      text: verseText,
      translation: activeTranslation
    });
  };

  const handleVerseMouseDown = (verseNum: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;

    // If Highlighter tool is active in the toolbar, directly highlight on click/drag
    setDismissedVerseNum(null);
    if (isHighlighterMode && onHighlightVerse) {
      dragStartVerseRef.current = verseNum;
      setIsDragging(true);
      setTempDragRange({ start: verseNum, end: verseNum });
      return;
    }

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

        // If direct Highlighter mode is active, apply the highlight immediately to the selected section
        if (isHighlighterMode && onHighlightVerse) {
          if (finalRange.start === finalRange.end) {
            onHighlightVerse(finalRange.start, readerHighlightColor);
          } else {
            onHighlightVerse(finalRange.start, readerHighlightColor, finalRange);
          }
        }

        if (finalRange.start === finalRange.end) {
          if (targetVerse) {
            handleSelectVerseWithAudio(targetVerse);
          }
          if (onSelectVerseRange) {
            onSelectVerseRange({ start: finalRange.start, end: finalRange.end }, targetVerse);
          }
        } else {
          wasDraggingRef.current = true;
          setTimeout(() => {
            wasDraggingRef.current = false;
          }, 150);
          playAuditoryCue('select');
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
  }, [isDragging, tempDragRange, chapter, onSelectVerse, onSelectVerseRange, isHighlighterMode, readerHighlightColor, onHighlightVerse]);

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
  const matchedCharacters = new Set<string>();

  return (
    <div
      className="flex flex-col h-full bg-white rounded-2xl border shadow-md overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: 'var(--clean-surface, #FFFFFF)',
        borderColor: 'var(--clean-border, #EBE5DC)'
      }}
    >

      {/* Top Compact Reading Bar (Single Row, Never Wraps) */}
      <div
        className="p-1 px-2 border-b border-[var(--clean-border,#EBE5DC)] flex items-center gap-1 select-none flex-shrink-0 relative overflow-hidden"
        style={{
          backgroundColor: 'var(--clean-surface-warm, #FAF7F2)',
          color: 'var(--clean-text-primary, #26221F)'
        }}
      >
        {/* Scroll Left Push Button (visible when scrolled right) */}
        {canScrollToolbarLeft && (
          <button
            onClick={() => scrollToolbar('left')}
            className="w-5 h-6 rounded flex items-center justify-center bg-white hover:bg-[#FAF5ED] border border-[#E2D5C3] text-[#78716C] hover:text-[#B4793D] shadow-xs flex-shrink-0 transition-all z-10 cursor-pointer"
            title="Scroll toolbar left"
            aria-label="Scroll toolbar left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}

        <div
          ref={toolbarScrollRef}
          onWheel={(e) => {
            if (e.deltaY !== 0 && toolbarScrollRef.current) {
              toolbarScrollRef.current.scrollLeft += e.deltaY;
            }
          }}
          className="reader-toolbar flex-1 flex items-center justify-between select-none flex-shrink-0 transition-colors gap-2 flex-nowrap scroll-smooth no-scrollbar overflow-x-auto"
        >
        {/* Left Side: Chapter Navigation & Reading Mode */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-nowrap">
          {/* Chapter Stepper */}
          <div
            className="h-7 inline-flex items-center rounded-full border px-2 py-0.5 shadow-2xs transition-colors shrink-0"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <button
              onClick={onPrevChapter}
              disabled={isFirstChapter}
              style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
              className="disabled:opacity-25 transition-colors p-0.5 flex items-center justify-center font-bold cursor-pointer"
              title="Previous Chapter"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {onOpenBookSelector ? (
              <button
                onClick={onOpenBookSelector}
                className="text-xs font-semibold text-[#26221F] hover:text-[var(--clean-accent-caramel,#B4793D)] px-2 py-0.5 rounded-full hover:bg-white/80 transition-all font-heading whitespace-nowrap cursor-pointer flex items-center gap-1 group"
                title="Choose Book & Chapter"
              >
                <span>{bookName} {chapter.chapterNumber}</span>
                <ChevronDown className="w-3 h-3 text-[#A8A29E] group-hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors" />
              </button>
            ) : (
              <span className="text-xs font-bold text-[#26221F] px-1.5 font-heading whitespace-nowrap">
                {bookName} {chapter.chapterNumber}
              </span>
            )}
            <button
              onClick={onNextChapter}
              disabled={isLastChapter}
              style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
              className="disabled:opacity-25 transition-colors p-0.5 flex items-center justify-center font-bold cursor-pointer"
              title="Next Chapter"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {(() => {
            const tColor = getTranslationColor(activeTranslation);
            const activeTransObj = TRANSLATIONS.find(x => x.id === activeTranslation);
            const apiCode = activeTransObj?.apiCode || activeTranslation;
            const isOfflineReady = BUNDLED_OFFLINE_TRANSLATIONS.has(apiCode.toUpperCase());

            return (
              <div className="inline-flex items-center gap-1.5 shrink-0">
                <span
                  className="h-7 inline-flex items-center text-[11px] font-bold px-2.5 rounded-full border shadow-2xs transition-colors shrink-0"
                  style={{
                    backgroundColor: tColor.bg,
                    borderColor: tColor.border,
                    color: tColor.text
                  }}
                  title={`Active Translation: ${activeTranslation}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full mr-1.5 shrink-0"
                    style={{ backgroundColor: tColor.primary }}
                  />
                  {activeTranslation}
                </span>

                {onOpenOfflineBibles && (
                  <button
                    type="button"
                    onClick={onOpenOfflineBibles}
                    className={`h-7 inline-flex items-center text-[10.5px] font-semibold px-2 rounded-full border shadow-2xs transition-colors shrink-0 cursor-pointer ${
                      isOfflineReady
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                    title={
                      isOfflineReady
                        ? 'Offline Ready (CC0 / Public Domain) — Click to manage offline downloads'
                        : 'Online Only (Publisher Protected) — Click to view licensing rules'
                    }
                  >
                    {isOfflineReady ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        Offline Ready
                      </>
                    ) : (
                      <>
                        <Globe className="w-3 h-3 mr-1 text-amber-600" />
                        Online Only
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })()}

          {/* Dedicated Direct Highlighter Mode */}
          {onHighlightVerse && (
            <div
              className="inline-flex items-center h-7 rounded-full border p-0.5 gap-0.5 shadow-2xs transition-colors shrink-0"
              style={{
                backgroundColor: '#FFFFFF',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <button
                type="button"
                onClick={toggleHighlighterMode}
                style={
                  isHighlighterMode
                    ? {
                        backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                        color: '#FFFFFF'
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'var(--clean-text-primary, #26221F)'
                      }
                }
                className="inline-flex items-center gap-1.5 px-2.5 h-full rounded-full text-xs font-medium transition-all cursor-pointer select-none whitespace-nowrap"
                title={isHighlighterMode ? 'Exit highlight mode' : 'Direct highlight mode (click/drag verses to highlight)'}
              >
                <Highlighter
                  className="w-3.5 h-3.5"
                  style={{
                    color: isHighlighterMode ? '#FFFFFF' : 'var(--clean-accent-caramel, #B4793D)'
                  }}
                />
                <span style={{ color: isHighlighterMode ? '#FFFFFF' : 'var(--clean-text-primary, #26221F)' }}>
                  Highlight
                </span>
              </button>

              {isHighlighterMode && (
                <div
                  className="flex items-center gap-1 px-1.5 border-l"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  {(['yellow', 'green', 'red', 'blue'] as const).map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setReaderHighlightColor(color)}
                      className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-115 active:scale-95 shadow-2xs cursor-pointer ${
                        readerHighlightColor === color
                          ? 'ring-2 ring-[var(--clean-accent-caramel,#B4793D)] ring-offset-1 scale-110'
                          : 'opacity-85 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: HIGHLIGHT_BUTTON_STYLES[color].bg,
                        border: `1.5px solid ${HIGHLIGHT_BUTTON_STYLES[color].border}`
                      }}
                      title={`Select ${color}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls: Reading Mode, Audio Narration, Red Letters & Font Sizer */}
        <div className="flex items-center gap-1.5 shrink-0 flex-nowrap">
          {/* Reading Mode Toggle */}
          <div
            className="inline-flex items-center h-7 rounded-full border p-0.5 gap-0.5 shadow-2xs transition-colors shrink-0"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <button
              onClick={() => setLayoutMode('paragraph')}
              style={
                layoutMode === 'paragraph'
                  ? { backgroundColor: 'var(--clean-accent-caramel, #B4793D)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#57524E' }
              }
              className="inline-flex items-center gap-1 px-2.5 h-full rounded-full text-xs font-medium transition-all cursor-pointer select-none whitespace-nowrap"
              title="Paragraph Flow (Compact Book View)"
            >
              <AlignLeft className="w-3.5 h-3.5" style={{ color: layoutMode === 'paragraph' ? '#FFFFFF' : '#57524E', stroke: 'currentColor' }} />
              <span style={{ color: layoutMode === 'paragraph' ? '#FFFFFF' : '#57524E' }}>Flow</span>
            </button>
            <button
              onClick={() => setLayoutMode('verse')}
              style={
                layoutMode === 'verse'
                  ? { backgroundColor: 'var(--clean-accent-caramel, #B4793D)', color: '#FFFFFF' }
                  : { backgroundColor: 'transparent', color: '#57524E' }
              }
              className="inline-flex items-center gap-1 px-2.5 h-full rounded-full text-xs font-medium transition-all cursor-pointer select-none whitespace-nowrap"
              title="Verse by Verse View"
            >
              <List className="w-3.5 h-3.5" style={{ color: layoutMode === 'verse' ? '#FFFFFF' : '#57524E', stroke: 'currentColor' }} />
              <span style={{ color: layoutMode === 'verse' ? '#FFFFFF' : '#57524E' }}>Verses</span>
            </button>
          </div>

          {/* Audio Player Pill with Real Web Speech API */}
          <button
            onClick={handleToggleAudio}
            style={
              isPlayingAudio
                ? {
                    backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                    borderColor: 'var(--clean-accent-caramel, #B4793D)',
                    color: 'var(--clean-accent-contrast-text, #FFFFFF)',
                    boxShadow: '0 2px 8px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.25)',
                  }
                : {
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)',
                  }
            }
            className="text-xs py-1 px-2.5 rounded-full border flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer font-medium"
            title={isPlayingAudio ? 'Pause Narration' : 'Listen to Audio Narration'}
          >
            {isPlayingAudio ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-0.5 h-3 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-0.5 h-1.5 bg-current rounded-full animate-bounce"></span>
                </div>
                <span>Pause</span>
              </>
            ) : (
              <>
                <Volume2
                  className="w-3.5 h-3.5"
                  style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                />
                <span>Listen</span>
              </>
            )}
          </button>

          {/* Red Letters Toggle with Visual Indicator */}
          <button
            onClick={handleToggleRedLetter}
            style={
              showRedLetter
                ? {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderColor: '#DC2626',
                    color: '#DC2626'
                  }
                : {
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-text-primary, #26221F)'
                  }
            }
            className={`h-7 inline-flex items-center gap-1.5 text-xs font-medium px-3 rounded-full border shadow-2xs transition-all cursor-pointer select-none shrink-0 whitespace-nowrap ${
              showRedLetter ? 'font-bold' : ''
            }`}
            title="Toggle Words of Christ in Red Letters"
          >
            <span className="w-2 h-2 flex-shrink-0 flex items-center justify-center relative">
              {showRedLetter ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DC2626]"></span>
                </>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#78716C]"></span>
              )}
            </span>
            <span>Red Letters</span>
          </button>

          {/* Bookmarks Toggle / Viewer */}
          {onOpenBookmarks && (
            <button
              onClick={onOpenBookmarks}
              data-bookmarks-toggle="true"
              style={
                isBookmarksOpen
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
              className={`h-7 text-xs px-2.5 rounded-full border flex items-center gap-1.5 transition-all shadow-xs cursor-pointer select-none shrink-0 ${
                isBookmarksOpen ? 'font-bold shadow-sm' : 'hover:border-[var(--clean-accent-caramel,#B4793D)]'
              }`}
              title="Toggle Bookmarked Verses (⌘B)"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarksOpen ? 'fill-white text-white' : bookmarks.length > 0 ? 'fill-[var(--clean-accent-caramel,#B4793D)] text-[var(--clean-accent-caramel,#B4793D)]' : 'text-[var(--clean-accent-caramel,#B4793D)]'}`} />
              <span className="hidden sm:inline font-medium" style={{ color: isBookmarksOpen ? '#FFFFFF' : undefined }}>Bookmarks</span>
              {bookmarks.length > 0 && (
                <span
                  style={{
                    backgroundColor: isBookmarksOpen ? 'rgba(255, 255, 255, 0.25)' : 'var(--clean-highlight-cream, #FAF5ED)',
                    color: isBookmarksOpen ? '#FFFFFF' : 'var(--clean-accent-caramel, #B4793D)',
                    borderColor: isBookmarksOpen ? 'transparent' : 'var(--clean-accent-border, #EBE5DC)'
                  }}
                  className="px-1.5 py-0.2 border rounded-full text-[10px] font-bold"
                >
                  {bookmarks.length}
                </span>
              )}
            </button>
          )}

          {/* Font Size Controls */}
          <div
            className="inline-flex items-center h-7 rounded-full border px-2 gap-0.5 shadow-2xs select-none transition-colors shrink-0"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: 'var(--clean-accent-border, #EBE5DC)'
            }}
          >
            <button
              onClick={() => setFontSize(prev => Math.max(12, Math.round((prev - 1) * 2) / 2))}
              className="text-[var(--clean-accent-caramel,#B4793D)] hover:text-[var(--clean-accent-dark,#9A632E)] transition-colors p-0.5 flex items-center justify-center font-bold"
              title="Smaller font (-1px)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {isEditingFontSize ? (
              <input
                type="number"
                step="0.5"
                min="10"
                max="40"
                autoFocus
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onBlur={commitFontSizeChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitFontSizeChange();
                  if (e.key === 'Escape') setIsEditingFontSize(false);
                }}
                className="w-8 text-center text-xs font-mono font-bold text-[#26221F] bg-transparent outline-none"
                style={{ border: 'none', borderBottom: '1.5px solid var(--clean-accent-caramel, #B4793D)', outline: 'none', borderRadius: 0 }}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFontSizeInput(String(fontSize));
                  setIsEditingFontSize(true);
                }}
                className="text-xs font-mono font-bold text-[#26221F] px-1 hover:text-[var(--clean-accent-caramel,#B4793D)] transition-colors min-w-[2.2rem] text-center"
                title="Click to type exact size"
              >
                {fontSize}px
              </button>
            )}
            <button
              onClick={() => setFontSize(prev => Math.min(32, Math.round((prev + 1) * 2) / 2))}
              className="text-[var(--clean-accent-caramel,#B4793D)] hover:text-[var(--clean-accent-dark,#9A632E)] transition-colors p-0.5 flex items-center justify-center font-bold"
              title="Larger font (+1px)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Right Push Button (visible when content overflows right) */}
      {canScrollToolbarRight && (
        <button
          onClick={() => scrollToolbar('right')}
          className="w-5 h-6 rounded flex items-center justify-center bg-white hover:bg-[#FAF5ED] border border-[#E2D5C3] text-[#78716C] hover:text-[#B4793D] shadow-xs flex-shrink-0 transition-all z-10 cursor-pointer"
          title="Scroll toolbar right"
          aria-label="Scroll toolbar right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
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
      <div
        ref={scrollContainerRef}
        onClick={(e) => {
          if (wasDraggingRef.current) return;
          const target = e.target as HTMLElement;
          if (!target.closest('[data-verse-number]') && !target.closest('button') && !target.closest('a') && !target.closest('input')) {
            onSelectVerse(null);
            if (onSelectVerseRange) {
              onSelectVerseRange(null);
            }
          }
        }}
        className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 custom-scrollbar bg-white relative"
        style={{
          backgroundColor: 'var(--clean-surface, #FFFFFF)'
        }}
      >
        {isLoading ? (
          <div className="w-full space-y-3 py-6 animate-pulse">
            <div className="h-6 bg-[#FAF5ED] rounded w-1/4 mx-auto mb-4"></div>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="space-y-1.5">
                <div className="h-3.5 bg-[#FAF5ED] rounded w-full"></div>
                <div className="h-3.5 bg-[#FAF5ED] rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full pb-6">
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
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8', color: '#26221F' }}
                className={`font-scripture text-[#26221F] text-justify space-y-3 ${isDragging ? 'select-none cursor-text' : ''}`}
                onMouseMove={handleContainerMouseMove}
              >
                <p className="leading-relaxed">
                  {(chapter?.verses || []).map((verse) => {
                    const isSelected = activeRange
                      ? (verse.verseNumber >= activeRange.start && verse.verseNumber <= activeRange.end)
                      : (selectedVerseNumber === verse.verseNumber);
                    const isRangeStart = activeRange?.start === verse.verseNumber;
                    const isRangeEnd = activeRange?.end === verse.verseNumber;
                    const isBookmarked = isVerseSaved(verse.verseNumber);
                    const verseText = getVerseDisplayText(verse, activeTranslation);
                    const isWordOfJesus = Boolean(
                      verse.isWordsOfJesus ||
                      checkIsWordsOfJesus(bookName, chapter.chapterNumber, verse.verseNumber, verseText)
                    );
                    const tabHighlight = tabHighlights?.[verse.verseNumber];

                    let highlightClasses = '';
                    let highlightInlineStyle: React.CSSProperties = {};
                    if (tabHighlight === 'yellow') {
                      highlightClasses = 'hl-verse-yellow font-medium shadow-xs rounded px-1';
                      highlightInlineStyle = {
                        backgroundColor: 'var(--hl-yellow-bg)',
                        color: 'var(--hl-yellow-text)',
                        textDecorationLine: 'underline',
                        textDecorationColor: 'var(--hl-yellow-border)',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3.5px',
                        borderBottom: '2px solid var(--hl-yellow-border)',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone'
                      };
                    } else if (tabHighlight === 'green') {
                      highlightClasses = 'hl-verse-green font-medium shadow-xs rounded px-1';
                      highlightInlineStyle = {
                        backgroundColor: 'var(--hl-green-bg)',
                        color: 'var(--hl-green-text)',
                        textDecorationLine: 'underline',
                        textDecorationColor: 'var(--hl-green-border)',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3.5px',
                        borderBottom: '2px solid var(--hl-green-border)',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone'
                      };
                    } else if (tabHighlight === 'red') {
                      highlightClasses = 'hl-verse-red font-medium shadow-xs rounded px-1';
                      highlightInlineStyle = {
                        backgroundColor: 'var(--hl-red-bg)',
                        color: 'var(--hl-red-text)',
                        textDecorationLine: 'underline',
                        textDecorationColor: 'var(--hl-red-border)',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3.5px',
                        borderBottom: '2px solid var(--hl-red-border)',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone'
                      };
                    } else if (tabHighlight === 'blue') {
                      highlightClasses = 'hl-verse-blue font-medium shadow-xs rounded px-1';
                      highlightInlineStyle = {
                        backgroundColor: 'var(--hl-blue-bg)',
                        color: 'var(--hl-blue-text)',
                        textDecorationLine: 'underline',
                        textDecorationColor: 'var(--hl-blue-border)',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3.5px',
                        borderBottom: '2px solid var(--hl-blue-border)',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone'
                      };
                    }

                    let selectionStyle: React.CSSProperties | undefined = undefined;
                    if (isSelected) {
                      selectionStyle = {
                        textDecorationLine: 'underline',
                        textDecorationColor: 'var(--clean-accent-caramel, #B4793D)',
                        textDecorationThickness: '2px',
                        textUnderlineOffset: '3.5px',
                        boxDecorationBreak: 'clone',
                        WebkitBoxDecorationBreak: 'clone'
                      };
                    }

                    return (
                      <span
                        key={verse.verseNumber}
                        data-verse-number={verse.verseNumber}
                        style={tabHighlight ? highlightInlineStyle : isSelected ? selectionStyle : undefined}
                        onMouseDown={(e) => handleVerseMouseDown(verse.verseNumber, e)}
                        onMouseEnter={() => handleVerseMouseEnter(verse.verseNumber)}
                        className={`cursor-pointer transition-colors duration-100 py-0.5 inline ${tabHighlight
                          ? `${highlightClasses} ${isSelected ? 'ring-2 ring-[var(--clean-accent-caramel,#B4793D)]' : ''}`
                          : isSelected
                            ? 'font-normal'
                            : isHighlighterMode
                              ? 'hover:bg-black/5 hover:shadow-2xs rounded'
                              : 'hover:bg-black/5 rounded'
                          }`}
                      >
                        <sup
                          style={!tabHighlight && isSelected ? { color: 'var(--clean-accent-caramel, #B4793D)' } : undefined}
                          className={`text-[10.5px] select-none mr-1 ${tabHighlight ? 'text-inherit font-extrabold' : isSelected ? 'font-black text-[var(--clean-accent-caramel,#B4793D)]' : 'text-[#8C827A] font-bold'}`}
                        >
                          {verse.verseNumber}
                          {isBookmarked && <span style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} className="ml-0.5">★</span>}
                        </sup>{' '}
                        {renderRedLetterContent(verseText, isWordOfJesus, showRedLetter, isSelected, bookName, chapter.chapterNumber, verse.verseNumber, onSelectCharacter, matchedCharacters, selectedCharacter, aiVerifiedCharacters)}{' '}
                      </span>
                    );
                  })}
                </p>
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
                  const isBookmarked = isVerseSaved(verse.verseNumber);
                  const verseText = getVerseDisplayText(verse, activeTranslation);
                  const isWordOfJesus = checkIsWordsOfJesus(bookName, chapter.chapterNumber, verse.verseNumber, verseText);

                  const tabHighlight = tabHighlights?.[verse.verseNumber];

                  let highlightContainerClasses = '';
                  let highlightVerseStyle: React.CSSProperties = {};
                  if (tabHighlight === 'yellow') {
                    highlightContainerClasses = 'border-l-4 shadow-xs';
                    highlightVerseStyle = {
                      backgroundColor: 'var(--hl-yellow-bg)',
                      color: 'var(--hl-yellow-text)',
                      borderLeftColor: 'var(--hl-yellow-border)',
                      textDecorationLine: 'underline',
                      textDecorationColor: 'var(--hl-yellow-border)',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3.5px'
                    };
                  } else if (tabHighlight === 'green') {
                    highlightContainerClasses = 'border-l-4 border-emerald-500 shadow-xs';
                    highlightVerseStyle = {
                      backgroundColor: 'var(--hl-green-bg)',
                      color: 'var(--hl-green-text)',
                      borderLeftColor: 'var(--hl-green-border)',
                      textDecorationLine: 'underline',
                      textDecorationColor: 'var(--hl-green-border)',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3.5px'
                    };
                  } else if (tabHighlight === 'red') {
                    highlightContainerClasses = 'border-l-4 border-rose-500 shadow-xs';
                    highlightVerseStyle = {
                      backgroundColor: 'var(--hl-red-bg)',
                      color: 'var(--hl-red-text)',
                      borderLeftColor: 'var(--hl-red-border)',
                      textDecorationLine: 'underline',
                      textDecorationColor: 'var(--hl-red-border)',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3.5px'
                    };
                  } else if (tabHighlight === 'blue') {
                    highlightContainerClasses = 'border-l-4 border-sky-500 shadow-xs';
                    highlightVerseStyle = {
                      backgroundColor: 'var(--hl-blue-bg)',
                      color: 'var(--hl-blue-text)',
                      borderLeftColor: 'var(--hl-blue-border)',
                      textDecorationLine: 'underline',
                      textDecorationColor: 'var(--hl-blue-border)',
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3.5px'
                    };
                  }

                  return (
                    <div
                      key={verse.verseNumber}
                      data-verse-number={verse.verseNumber}
                      style={
                        tabHighlight
                          ? highlightVerseStyle
                          : isSelected
                            ? {
                                borderLeft: '3.5px solid var(--clean-accent-caramel, #B4793D)',
                                textDecorationLine: 'underline',
                                textDecorationColor: 'var(--clean-accent-caramel, #B4793D)',
                                textDecorationThickness: '2px',
                                textUnderlineOffset: '3.5px',
                                color: 'var(--clean-text-primary, #1C1917)'
                              }
                            : undefined
                      }
                      onMouseDown={(e) => handleVerseMouseDown(verse.verseNumber, e)}
                      onMouseEnter={() => handleVerseMouseEnter(verse.verseNumber)}
                      className={`group relative px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 ${isSelected
                          ? 'shadow-xs'
                          : showRedLetter && isWordOfJesus
                            ? 'bg-red-50/20 border-l-2 border-red-500 hover:bg-red-50/40'
                            : 'hover:bg-[var(--clean-highlight-cream,#FAF9F5)] border-l-2 border-transparent'
                        }`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          style={isSelected ? { color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' } : undefined}
                          className={`text-[10.5px] select-none font-semibold flex-shrink-0 w-4 text-right font-heading ${isSelected
                            ? 'font-bold'
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
                            {renderRedLetterContent(verseText, isWordOfJesus, showRedLetter, isSelected, bookName, chapter.chapterNumber, verse.verseNumber)}
                          </p>

                          {/* Multi-Verse Action Banner when at the end of the range in Verse Mode */}
                          {isMultiSelect && activeRange && isRangeEnd && (
                            <div
                              style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
                              className="mt-2 pt-2 border-t flex flex-wrap items-center justify-between gap-2 animate-fadeIn select-none"
                            >
                              <div className="flex items-center gap-1.5">
                                <span
                                  style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                                  className="text-[11px] font-bold font-heading flex items-center gap-1"
                                >
                                  <Layers className="w-3 h-3" />
                                  vv. {activeRange.start}–{activeRange.end}
                                </span>
                                <span
                                  style={{
                                    color: 'var(--clean-accent-dark, #78471F)',
                                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                  }}
                                  className="text-[9.5px] font-semibold bg-white px-1.5 py-0.2 rounded border font-heading shadow-2xs"
                                >
                                  {activeRange.end - activeRange.start + 1} verses for AI
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 ml-auto">
                                {/* 4-Color Highlighter Palette for Range */}
                                {onHighlightVerse && (
                                  <div
                                    style={{
                                      backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                                    }}
                                    className="ios-glass-btn text-xs !py-0.5 !px-2 border flex items-center gap-1.5 shadow-xs"
                                  >
                                    <Highlighter
                                      className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)] shrink-0"
                                    />
                                    <div className="flex items-center gap-1">
                                      {(['yellow', 'green', 'red', 'blue'] as const).map(color => (
                                        <button
                                          key={color}
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onHighlightVerse(activeRange.start, color, activeRange);
                                          }}
                                          className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-120 active:scale-95 shadow-2xs cursor-pointer opacity-85 hover:opacity-100"
                                          style={{
                                            backgroundColor: HIGHLIGHT_BUTTON_STYLES[color].bg,
                                            border: `1.5px solid ${HIGHLIGHT_BUTTON_STYLES[color].border}`
                                          }}
                                          title={`Highlight vv. ${activeRange.start}–${activeRange.end} in ${HIGHLIGHT_BUTTON_STYLES[color].label}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleCopyRange(activeRange.start, activeRange.end, e)}
                                  style={{
                                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                    color: 'var(--clean-text-primary, #26221F)'
                                  }}
                                  className="ios-glass-btn text-xs !py-0.5 !px-2 border hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] hover:text-[var(--clean-accent-dark,#78471F)] flex items-center gap-1 cursor-pointer font-heading"
                                  title="Copy selected verses"
                                >
                                  {copiedVerseNum === -1 ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
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
                                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                                    className="ios-glass-btn !py-0.5 !px-2 text-xs border text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-accent-caramel,#B4793D)] hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] shadow-xs flex items-center gap-1 cursor-pointer font-heading"
                                    title="Generate Study Guide for selected range"
                                  >
                                    <BookOpenCheck
                                      className="w-3 h-3"
                                      style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                                    />
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
                            <div
                              style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
                              className="mt-2 pt-1.5 border-t flex items-center justify-between animate-fadeIn select-none"
                            >
                              {verse.greekHebrew && verse.greekHebrew.length > 0 ? (
                                <div className="flex items-center gap-1 text-[10.5px] text-[var(--clean-text-secondary,#78716C)] truncate max-w-[200px]">
                                  <span
                                    style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                                    className="font-semibold font-heading"
                                  >
                                    Lemma:
                                  </span>
                                  <span
                                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                                    className="font-medium text-[var(--clean-text-primary,#26221F)] bg-white px-1.5 py-0.2 rounded border shadow-2xs"
                                  >
                                    {verse.greekHebrew[0].word} <em>({verse.greekHebrew[0].transliteration})</em>
                                  </span>
                                </div>
                              ) : <div />}

                              <div className="flex items-center gap-1.5 ml-auto">
                                {/* 4-Color Highlighter Palette for Single Verse */}
                                {onHighlightVerse && (
                                  <div
                                    style={{
                                      backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                                    }}
                                    className="ios-glass-btn text-xs !py-0.5 !px-2 border flex items-center gap-1.5 shadow-xs"
                                  >
                                    <Highlighter
                                      className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)] shrink-0"
                                    />
                                    <div className="flex items-center gap-1">
                                      {(['yellow', 'green', 'red', 'blue'] as const).map(color => {
                                        const isCurrent = tabHighlights?.[verse.verseNumber] === color;
                                        return (
                                          <button
                                            key={color}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onHighlightVerse(verse.verseNumber, color);
                                            }}
                                            className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-120 active:scale-95 shadow-2xs cursor-pointer ${isCurrent ? 'ring-2 ring-[var(--clean-accent-caramel,#B4793D)] ring-offset-1 scale-110' : ''}`}
                                            style={{
                                              backgroundColor: HIGHLIGHT_BUTTON_STYLES[color].bg,
                                              border: `1.5px solid ${HIGHLIGHT_BUTTON_STYLES[color].border}`
                                            }}
                                            title={`Highlight verse in ${HIGHLIGHT_BUTTON_STYLES[color].label}${isCurrent ? ' (click to toggle off)' : ''}`}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleCopyVerse(verse, e)}
                                  style={{
                                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                    color: 'var(--clean-text-primary, #26221F)'
                                  }}
                                  className="ios-glass-btn text-xs !py-0.5 !px-2 border hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] hover:text-[var(--clean-accent-dark,#78471F)] cursor-pointer font-heading"
                                  title="Copy Verse"
                                >
                                  {copiedVerseNum === verse.verseNumber ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      <span className="text-emerald-700">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onMouseDown={(e) => e.stopPropagation()}
                                  onClick={(e) => handleToggleBookmark(verse.verseNumber, e)}
                                  style={
                                    isBookmarked
                                      ? {
                                          backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                                          color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))',
                                          borderColor: 'var(--clean-accent-border-strong, var(--clean-accent-border, #D4A373))',
                                        }
                                      : {
                                          backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                          borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                          color: 'var(--clean-text-primary, #26221F)',
                                        }
                                  }
                                  className="ios-glass-btn text-xs !py-0.5 !px-2.5 transition-all cursor-pointer font-heading shadow-2xs"
                                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Verse'}
                                >
                                  <Bookmark
                                    className="w-3 h-3"
                                    style={{
                                      color: isBookmarked ? 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' : 'var(--clean-text-secondary, #78716C)',
                                      fill: isBookmarked ? 'var(--clean-accent-caramel, #B4793D)' : 'none',
                                    }}
                                  />
                                  <span style={{ color: isBookmarked ? 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' : 'var(--clean-text-primary, #26221F)' }}>
                                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                                  </span>
                                </button>

                                {onCreateStudyGuide && (
                                  <button
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectVerse(verse);
                                      onCreateStudyGuide(verse);
                                    }}
                                    style={{
                                      backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                      borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                      color: 'var(--clean-text-primary, #26221F)'
                                    }}
                                    className="ios-glass-btn !py-0.5 !px-2 text-xs shadow-2xs flex items-center gap-1 cursor-pointer font-heading"
                                    title="Generate Study Guide for this passage"
                                  >
                                    <BookOpenCheck
                                      className="w-3 h-3"
                                      style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                                    />
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
                                    className="clean-caramel-btn text-xs !py-0.5 !px-2.5 shadow-xs cursor-pointer font-heading font-semibold"
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


            
            {/* Book Completion Quiz Button */}
            {onOpenQuiz && isLastChapterOfBook && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 animate-fadeIn">
                <button
                  onClick={() => onOpenQuiz('book')}
                  className="px-4 py-2 bg-[var(--clean-accent-caramel,#B4793D)] text-white hover:bg-[var(--clean-accent-dark,#9A632E)] rounded-full text-xs font-semibold flex items-center gap-2 transition-all shadow-sm font-heading cursor-pointer"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  Finished Book
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Mini Audio Player Bar (Appears when Audio Narration is Playing) */}
        {isPlayingAudio && (
          <div className="absolute bottom-14 left-4 right-4 sm:left-8 sm:right-8 bg-[#26221F] text-white px-4 py-2.5 rounded-2xl shadow-[0_10px_30px_rgba(38,34,31,0.35)] border border-[#3E3833] flex items-center justify-between gap-3 animate-fadeIn z-30 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex items-center gap-1 h-3.5 px-1 bg-[#38332E] rounded-full">
                <span className="w-0.5 h-2.5 bg-[var(--clean-accent-honey,#D4A373)] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-0.5 h-3.5 bg-[var(--clean-accent-caramel,#B4793D)] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-0.5 h-2 bg-[var(--clean-accent-honey,#D4A373)] rounded-full animate-bounce"></span>
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
                className="p-1.5 rounded-full text-white transition-all shadow-xs"
                style={{ backgroundColor: 'var(--clean-accent-caramel, #B4793D)' }}
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
                      if (newVoice) {
                        localStorage.setItem(`berea_preferred_voice_${effectiveLang}`, newVoice);
                        localStorage.setItem('berea_preferred_voice', newVoice);
                      } else {
                        localStorage.removeItem(`berea_preferred_voice_${effectiveLang}`);
                        localStorage.removeItem('berea_preferred_voice');
                      }
                    } catch { }
                    if (isPlayingAudio) {
                      playVerseAudio(selectedVerseNumber || 1, playbackSpeed, newVoice);
                    }
                  }}
                  className="bg-[#38332E] text-xs text-[#EBE5DC] border border-[#48423B] rounded-full px-2.5 py-1 focus:outline-none focus:border-[var(--clean-accent-caramel,#B4793D)] font-medium cursor-pointer max-w-[210px] truncate"
                  title="Select Studio Narrator Voice"
                >
                  {availableVoices.map(v => (
                    <option key={v.id || 'auto-voice'} value={v.id}>
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
                      playVerseAudio(selectedVerseNumber || 1, rate, selectedVoiceId);
                    }}
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono transition-all ${playbackSpeed === rate
                        ? 'bg-[var(--clean-accent-caramel,#B4793D)] text-white font-bold'
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

      {/* Docked Selection & Highlight Action Bar (Docked at bottom, never floats in text, never requires scrolling) */}
      {(isMultiSelect && activeRange) ? (
        <div
          className="px-4 sm:px-6 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs select-none flex-shrink-0 transition-colors animate-fadeIn"
          style={{
            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
            borderColor: 'var(--clean-accent-border, #EBE5DC)',
            color: 'var(--clean-text-primary, #26221F)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--clean-accent-caramel,#B4793D)] font-heading flex items-center gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5" />
              vv. {activeRange.start}–{activeRange.end}
            </span>
            <span className="text-[10.5px] font-semibold text-[var(--clean-accent-dark,#78471F)] bg-white px-2 py-0.5 rounded-full border border-[var(--clean-accent-border,#EBE5DC)] shadow-2xs">
              {activeRange.end - activeRange.start + 1} verses selected
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {onHighlightVerse && (
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
                className="ios-glass-btn !py-0.5 !px-2 text-xs border flex items-center gap-1.5 shadow-xs"
              >
                <Highlighter className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                <div className="flex items-center gap-1">
                  {(['yellow', 'green', 'red', 'blue'] as const).map(color => (
                    <button
                      key={color}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onHighlightVerse(activeRange.start, color, activeRange);
                      }}
                      className="w-3.5 h-3.5 rounded-full transition-transform hover:scale-120 active:scale-95 shadow-2xs cursor-pointer opacity-85 hover:opacity-100"
                      style={{
                        backgroundColor: HIGHLIGHT_BUTTON_STYLES[color].bg,
                        border: `1.5px solid ${HIGHLIGHT_BUTTON_STYLES[color].border}`
                      }}
                      title={`Highlight vv. ${activeRange.start}–${activeRange.end} in ${HIGHLIGHT_BUTTON_STYLES[color].label}`}
                    />
                  ))}
                </div>
              </div>
            )}

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleCopyRange(activeRange.start, activeRange.end, e)}
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                color: 'var(--clean-text-primary, #26221F)'
              }}
              className="ios-glass-btn !py-0.5 !px-2 text-xs border hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] hover:text-[var(--clean-accent-dark,#78471F)] flex items-center gap-1 cursor-pointer font-heading"
              title="Copy selected verses"
            >
              {copiedVerseNum === -1 ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
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
                className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[var(--clean-accent-border,#EBE5DC)] text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-accent-caramel,#B4793D)] hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] shadow-xs flex items-center gap-1 cursor-pointer font-heading"
                title="Generate Study Guide for selected range"
              >
                <BookOpenCheck
                  className="w-3 h-3"
                  style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                />
                <span>Study Guide</span>
              </button>
            )}

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenBereaAi();
              }}
              className="clean-caramel-btn !py-0.5 !px-2.5 text-xs shadow-xs flex items-center gap-1 cursor-pointer"
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
              className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F] cursor-pointer"
              title="Clear multi-verse selection"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (activeVerse && layoutMode === 'paragraph' && activeVerse.verseNumber !== dismissedVerseNum) ? (
        <div
          className="px-4 sm:px-6 py-2 border-t flex flex-wrap items-center justify-between gap-2 text-xs select-none flex-shrink-0 transition-colors animate-fadeIn"
          style={{
            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
            borderColor: 'var(--clean-accent-border, #EBE5DC)',
            color: 'var(--clean-text-primary, #26221F)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--clean-accent-caramel,#B4793D)] font-heading text-xs">
              v{activeVerse.verseNumber}
            </span>
            {activeVerse.greekHebrew && activeVerse.greekHebrew.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#78716C] truncate max-w-[200px]">
                <span>Lemma:</span>
                <span className="font-medium text-[#26221F] bg-white px-1.5 py-0.2 rounded border border-[var(--clean-border,#EBE5DC)]">
                  {activeVerse.greekHebrew[0].word} <em>({activeVerse.greekHebrew[0].transliteration})</em>
                </span>
              </div>
            )}
            <span className="hidden md:inline text-[10px] text-[#A8A29E] italic">
              (Click & drag to select multiple verses)
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            {onHighlightVerse && (
              <div
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
                className="ios-glass-btn !py-0.5 !px-2 text-xs border flex items-center gap-1.5 shadow-xs"
              >
                <Highlighter className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                <div className="flex items-center gap-1">
                  {(['yellow', 'green', 'red', 'blue'] as const).map(color => {
                    const isCurrent = tabHighlights?.[activeVerse.verseNumber] === color;
                    return (
                      <button
                        key={color}
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHighlightVerse(activeVerse.verseNumber, color);
                        }}
                        className={`w-3.5 h-3.5 rounded-full transition-transform hover:scale-120 active:scale-95 shadow-2xs cursor-pointer ${isCurrent ? 'ring-2 ring-[var(--clean-accent-caramel,#B4793D)] ring-offset-1 scale-110' : ''}`}
                        style={{
                          backgroundColor: HIGHLIGHT_BUTTON_STYLES[color].bg,
                          border: `1.5px solid ${HIGHLIGHT_BUTTON_STYLES[color].border}`
                        }}
                        title={`Highlight verse in ${HIGHLIGHT_BUTTON_STYLES[color].label}${isCurrent ? ' (click to toggle off)' : ''}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleCopyVerse(activeVerse, e)}
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                color: 'var(--clean-text-primary, #26221F)'
              }}
              className="ios-glass-btn !py-0.5 !px-2 text-xs border hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] hover:text-[var(--clean-accent-dark,#78471F)] cursor-pointer font-heading"
              title="Copy Verse"
            >
              {copiedVerseNum === activeVerse.verseNumber ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--clean-accent-caramel,#B4793D)]" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => handleToggleBookmark(activeVerse.verseNumber, e)}
              className={`ios-glass-btn !py-0.5 !px-2.5 text-xs transition-all cursor-pointer font-heading ${isVerseSaved(activeVerse.verseNumber)
                ? '!bg-[var(--clean-highlight-cream,#FAF3E8)] !text-[var(--clean-accent-caramel,#B4793D)] !border-[var(--clean-accent-border,#D4A373)] font-semibold'
                : 'bg-white border-[var(--clean-accent-border,#EBE5DC)] hover:border-[var(--clean-accent-caramel,#D4A373)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)]'
              }`}
              title={isVerseSaved(activeVerse.verseNumber) ? 'Remove Bookmark' : 'Bookmark Verse'}
            >
              <Bookmark className={`w-3 h-3 ${isVerseSaved(activeVerse.verseNumber) ? 'fill-[var(--clean-accent-caramel,#B4793D)] text-[var(--clean-accent-caramel,#B4793D)]' : 'text-[var(--clean-text-secondary,#78716C)]'}`} />
              <span>{isVerseSaved(activeVerse.verseNumber) ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            {onCreateStudyGuide && (
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectVerse(activeVerse);
                  onCreateStudyGuide(activeVerse);
                }}
                className="ios-glass-btn !py-0.5 !px-2 text-xs border border-[var(--clean-accent-border,#EBE5DC)] text-[var(--clean-text-secondary,#78716C)] hover:text-[var(--clean-accent-caramel,#B4793D)] hover:border-[var(--clean-accent-caramel,#B4793D)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] shadow-xs cursor-pointer font-heading"
                title="Generate Study Guide for this passage"
              >
                <BookOpenCheck
                  className="w-3 h-3"
                  style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
                />
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
                className="clean-caramel-btn !py-0.5 !px-2.5 text-xs shadow-xs cursor-pointer"
                title="Open in AI Guide"
              >
                <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                <span>Insights</span>
              </button>
            )}

            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setDismissedVerseNum(activeVerse.verseNumber);
                if (onSelectVerseRange) {
                  onSelectVerseRange(null);
                }
              }}
              className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F] cursor-pointer ml-1"
              title="Dismiss verse bar"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}

      {/* Permanent Fixed Bottom Chapter Stepper — Always docked at the bottom */}
      <div
        className="px-6 py-2.5 border-t flex items-center justify-between text-xs select-none flex-shrink-0 transition-colors"
        style={{
          backgroundColor: 'var(--clean-surface-warm, #FAF7F2)',
          borderColor: 'var(--clean-border, #EBE5DC)',
          color: 'var(--clean-text-primary, #26221F)'
        }}
      >
        <button
          onClick={onPrevChapter}
          disabled={isFirstChapter}
          style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
          className="flex items-center gap-1.5 disabled:opacity-20 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Previous Chapter"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Chapter</span>
        </button>

        <div className="flex items-center opacity-85 hover:opacity-100 transition-opacity">
          <div
            className="w-7 h-7 rounded-xl overflow-hidden border p-0.5 shadow-xs flex items-center justify-center"
            style={{
              borderColor: 'var(--clean-accent-border, #EBE5DC)',
              backgroundColor: 'var(--clean-surface, #FFFFFF)'
            }}
          >
            <img src="/berea-logo.jpg" alt="Berea" className="w-full h-full object-contain" />
          </div>
        </div>

        <button
          onClick={onNextChapter}
          disabled={isLastChapter}
          style={{ color: 'var(--clean-accent-dark, var(--clean-accent-caramel, #B4793D))' }}
          className="flex items-center gap-1.5 disabled:opacity-20 font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Next Chapter"
        >
          <span>Next Chapter</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
