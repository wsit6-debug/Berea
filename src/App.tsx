import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NotebookPen, X } from 'lucide-react';
import {
  BIBLE_BOOKS,
  TranslationId,
  getBook,
  getChapter,
  Verse,
  Chapter,
  getApprovedTranslationsForDenomination,
  getDefaultTranslationForDenomination,
  TRANSLATIONS
} from './data/bibleData';
import { DenominationalLens, DENOMINATIONS } from './data/theologyData';
import { useLanguage } from './i18n/LanguageContext';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { BereaAiPanel } from './components/BereaAiPanel';
import { NotepadPanel } from './components/NotepadPanel';
import { BookSelectorModal } from './components/BookSelectorModal';
import { PitchDeckAboutModal } from './components/PitchDeckAboutModal';
import { SearchModal } from './components/SearchModal';
import { AnimatedPresence } from './components/AnimatedPresence';
import { LoginScreen } from './components/LoginScreen';
import { ColorThemeWheel } from './components/ColorThemeWheel';
import { FeedbackModal } from './components/FeedbackModal';
import { BookmarksModal } from './components/BookmarksModal';
import { fetchFullMultiTranslationChapter } from './services/youversionService';
import { getUserDenominationPreference, setUserDenominationPreference } from './services/configService';
import { scheduleBackgroundQuizPreGeneration } from './services/quizService';
import { useBookmarkedVerses } from './services/bookmarkService';
import { BereaAiTab, NotepadState } from './types';
import { loadNotepadState, saveNotepadState, createNewNoteTab } from './services/notepadService';

export function App() {
  const { language } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Clear any legacy persistent auth tokens so every visit prompts for password
  useEffect(() => {
    localStorage.removeItem('berea_authenticated');
    localStorage.removeItem('berea_auth_timestamp');
  }, []);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setIsAuthenticated(false);
  };
  // Retrieve saved passage from local storage if available, otherwise default to Genesis 1:1
  const savedPassage = (() => {
    try {
      const raw = localStorage.getItem('berea_current_passage');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return null;
  })();

  const [bookId, setBookId] = useState<string>(() => savedPassage?.bookId || 'john');
  const [chapterNum, setChapterNum] = useState<number>(() => savedPassage?.chapterNum || 2);
  const [activeLens, setActiveLens] = useState<DenominationalLens>(() => {
    const pref = getUserDenominationPreference();
    return (pref === 'all' || pref === 'none') ? 'catholic' : pref;
  });
  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(() => savedPassage?.translation || 'NABRE');
  const [activeSidebar, setActiveSidebar] = useState<'guide' | 'notepad' | null>('guide');
  const [aiPanelTab, setAiPanelTab] = useState<BereaAiTab>('overview');

  // Split pane slider state (VS Code style resizable sidebar)
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidthPct, setSidebarWidthPct] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('berea_sidebar_width_pct');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 22 && parsed <= 68) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 41.67; // Default 5/12 split
  });
  const [isDraggingSplitter, setIsDraggingSplitter] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pointer drag listener for the VS Code style splitter
  useEffect(() => {
    if (!isDraggingSplitter) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;

      const rightWidthPx = rect.right - e.clientX;
      let newPct = (rightWidthPx / rect.width) * 100;

      // Keep comfortable minimum bounds so tabs & reading are never crushed:
      // Bible reader min 400px, sidebar min 360px, max sidebar 62%, min sidebar 25%
      const minSidebarPct = Math.max(25, (360 / rect.width) * 100);
      const maxSidebarPct = Math.min(62, ((rect.width - 400) / rect.width) * 100);
      newPct = Math.min(Math.max(newPct, minSidebarPct), maxSidebarPct);

      setSidebarWidthPct(newPct);
    };

    const handlePointerUp = () => {
      setIsDraggingSplitter(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDraggingSplitter]);

  // Persist sidebar width preference
  useEffect(() => {
    try {
      localStorage.setItem('berea_sidebar_width_pct', sidebarWidthPct.toFixed(2));
    } catch {
      // ignore
    }
  }, [sidebarWidthPct]);

  const handleSplitterPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingSplitter(true);
  };

  const handleResetSplitter = () => {
    setSidebarWidthPct(41.67);
  };

  const handleSplitterKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSidebarWidthPct(prev => Math.min(prev + 2, 68));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSidebarWidthPct(prev => Math.max(prev - 2, 22));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSidebarWidthPct(41.67);
    }
  };

  // Modals state
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isColorSchemeOpen, setIsColorSchemeOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [quizType, setQuizType] = useState<'chapter' | 'book' | null>(null);
  const bookmarks = useBookmarkedVerses();

  // Dynamic Chapter State fetched from YouVersion Scripture API
  const currentBook = getBook(bookId) || BIBLE_BOOKS[0];
  const [currentChapter, setCurrentChapter] = useState<Chapter>(() => getChapter(bookId, chapterNum));
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);

  const targetVerseRef = useRef<number | undefined>(savedPassage?.verseNum || 1);
  const currentBookName = currentBook.name;

  // Selected Verse State
  const [selectedVerse, setSelectedVerse] = useState<Verse>(() => {
    const initialVerseNum = savedPassage?.verseNum || 1;
    return currentChapter.verses.find(v => v.verseNumber === initialVerseNum) || currentChapter.verses[0] || {
      verseNumber: 1,
      text: { KJV: 'Loading scripture...' }
    };
  });
  const [selectedVerseRange, setSelectedVerseRange] = useState<{ start: number; end: number } | null>(null);

  // Synchronized Notepad State lifted to App level so highlights on book side correlate to active tab
  const [notepadState, setNotepadState] = useState<NotepadState>(() =>
    loadNotepadState(currentBookName, chapterNum)
  );

  // Global synchronized highlight color & mode shared between book side and notepad
  const [activeHighlightColor, setActiveHighlightColor] = useState<'yellow' | 'green' | 'red' | 'blue'>('yellow');
  const [isHighlighterMode, setIsHighlighterMode] = useState<boolean>(false);

  // Auto-sync notepad tabs when chapter or book changes
  useEffect(() => {
    setNotepadState(prev => {
      const general = prev.tabs.find(t => !t.book && !t.chapter);
      let pageTab = prev.tabs.find(t => t.book === currentBookName && t.chapter === chapterNum);

      // Clean up only auto-generated empty untouched chapter tabs from other chapters
      const cleanedTabs = prev.tabs.filter(t => {
        // Keep General Journal
        if (!t.book && !t.chapter) return true;
        // Keep current chapter's tab
        if (t.book === currentBookName && t.chapter === chapterNum) return true;
        // Keep tabs with text content
        const rawContent = (t.content || '').replace(/<[^>]*>/g, '').trim();
        if (rawContent.length > 0 || (t.content && t.content.includes('<img'))) return true;
        // Keep tabs with verse highlights
        if (t.verseHighlights && Object.keys(t.verseHighlights).length > 0) return true;
        // Keep customized/renamed tabs
        if (t.title !== `${t.book} ${t.chapter} Journal`) return true;
        // Prune untouched empty auto-generated tabs from other chapters
        return false;
      });

      if (!pageTab) {
        pageTab = createNewNoteTab(`${currentBookName} ${chapterNum} Journal`, currentBookName, chapterNum);
        pageTab.fontFamily = prev.globalFontFamily || 'sans';
        pageTab.fontSize = prev.globalFontSize || 'sm';
        cleanedTabs.push(pageTab);
      }

      const isCurrentlyGeneral = prev.activeTabId === general?.id;

      return {
        ...prev,
        tabs: cleanedTabs,
        activeTabId: isCurrentlyGeneral ? prev.activeTabId : pageTab.id
      };
    });
  }, [currentBookName, chapterNum]);

  // Persist notepadState to localStorage on any state update
  useEffect(() => {
    saveNotepadState(notepadState);
  }, [notepadState]);

  // Active tab is strictly the selected tab from all tabs
  const activeTab = notepadState.tabs.find(t => t.id === notepadState.activeTabId) || notepadState.tabs[0];
  const activeTabHighlights = (activeTab?.book === currentBookName && activeTab?.chapter === chapterNum)
    ? (activeTab?.verseHighlights || {})
    : (!activeTab?.book && !activeTab?.chapter)
      ? (activeTab?.verseHighlights || {})
      : {};

  // Toggle verse highlight strictly scoped to the active note tab
  const handleToggleVerseHighlight = useCallback((
    verseNum: number,
    color: 'yellow' | 'green' | 'red' | 'blue' = 'yellow',
    range?: { start: number; end: number } | null
  ) => {
    setNotepadState(prev => {
      // Find active tab within visible scope or fallback to activeTabId
      const targetActiveTab = prev.tabs.find(t => t.id === prev.activeTabId) || prev.tabs[0];
      if (!targetActiveTab) return prev;

      const activeId = targetActiveTab.id;
      const updatedTabs = prev.tabs.map(tab => {
        if (tab.id !== activeId) return tab;

        const currentHighlights = { ...(tab.verseHighlights || {}) };

        if (range && range.start <= range.end) {
          // Check if all verses in range already have this color
          let allSame = true;
          for (let v = range.start; v <= range.end; v++) {
            if (currentHighlights[v] !== color) {
              allSame = false;
              break;
            }
          }
          for (let v = range.start; v <= range.end; v++) {
            if (allSame) {
              delete currentHighlights[v];
            } else {
              currentHighlights[v] = color;
            }
          }
        } else {
          // Single verse toggle
          if (currentHighlights[verseNum] === color) {
            delete currentHighlights[verseNum];
          } else {
            currentHighlights[verseNum] = color;
          }
        }

        return {
          ...tab,
          verseHighlights: currentHighlights,
          updatedAt: Date.now()
        };
      });

      const nextState = {
        ...prev,
        tabs: updatedTabs
      };
      saveNotepadState(nextState);
      return nextState;
    });
  }, [currentBookName, chapterNum]);

  // Save current passage coordinates to local storage on navigation
  useEffect(() => {
    try {
      localStorage.setItem('berea_current_passage', JSON.stringify({
        bookId,
        chapterNum,
        verseNum: selectedVerse?.verseNumber || 1
      }));
    } catch (e) {
      console.warn(e);
    }
  }, [bookId, chapterNum, selectedVerse]);

  // Handle Denomination Change with Automatic Approved Translation Enforcement & Persistence
  const handleSelectLens = (newLens: DenominationalLens) => {
    setActiveLens(newLens);
    setUserDenominationPreference(newLens);
    const approvedInLang = getApprovedTranslationsForDenomination(newLens).filter(
      t => (t.language || 'en') === language
    );
    if (!approvedInLang.some(t => t.id === activeTranslation)) {
      const defaultTrans = getDefaultTranslationForDenomination(newLens, language);
      setActiveTranslation(defaultTrans);
    }
  };

  // When interface/scripture language changes, ensure denomination and translation remain valid
  useEffect(() => {
    const approvedInLang = getApprovedTranslationsForDenomination(activeLens).filter(
      t => (t.language || 'en') === language
    );

    let targetLens = activeLens;
    if (approvedInLang.length === 0) {
      const validDenom = DENOMINATIONS.find(d =>
        getApprovedTranslationsForDenomination(d.id).some(t => (t.language || 'en') === language)
      );
      if (validDenom) {
        targetLens = validDenom.id;
        setActiveLens(targetLens);
        setUserDenominationPreference(targetLens);
      }
    }

    const curTransObj = TRANSLATIONS.find(t => t.id === activeTranslation);
    const isTransValid = curTransObj &&
      (curTransObj.language || 'en') === language &&
      curTransObj.approvedDenominations.includes(targetLens);

    if (!isTransValid) {
      const defaultTrans = getDefaultTranslationForDenomination(targetLens, language);
      setActiveTranslation(defaultTrans);
    }
  }, [language]);

  // Fetch full multi-translation chapter from YouVersion Scripture API
  const loadChapterFromApi = useCallback(async (targetBookId: string, targetChapterNum: number, currentTrans?: TranslationId) => {
    setIsLoadingChapter(true);
    try {
      const transToLoad = currentTrans || activeTranslation;
      const versionsToFetch: TranslationId[] = Array.from(new Set([
        transToLoad,
        'NABRE', 'RSVCE', 'NRSVCE', 'DRB', 'ESV', 'NIV', 'NLT', 'NASB', 'CSB', 'NKJV', 'KJV', 'GENEVA', 'BSB', 'CEB'
      ]));
      const fetched = await fetchFullMultiTranslationChapter(targetBookId, targetChapterNum, versionsToFetch);
      setCurrentChapter(fetched);

      const desiredVerseNum = targetVerseRef.current || 1;
      const defaultV = fetched.verses.find(v => v.verseNumber === desiredVerseNum) || fetched.verses[0];
      if (defaultV) {
        setSelectedVerse(defaultV);
      }
    } catch (err) {
      console.error('Failed to fetch chapter from YouVersion API', err);
    } finally {
      setIsLoadingChapter(false);
    }
  }, [activeTranslation]);

  // Trigger API fetch whenever bookId, chapterNum, or activeTranslation changes
  useEffect(() => {
    loadChapterFromApi(bookId, chapterNum, activeTranslation);
  }, [bookId, chapterNum, activeTranslation, loadChapterFromApi]);

  // Background debounced quiz pre-generation (sequential & auto-aborted when foreground requested)
  useEffect(() => {
    if (!currentChapter || currentChapter.verses.length === 0) return;
    const chapterText = currentChapter.verses.map(v => v.text[activeTranslation] || Object.values(v.text)[0]).join(' ');
    scheduleBackgroundQuizPreGeneration(currentBook.name, chapterNum, chapterText);
  }, [bookId, chapterNum, currentChapter, activeTranslation]);

  // Keyboard shortcut for Cmd+K, Cmd+I, and Cmd+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setActiveSidebar(prev => prev === 'guide' ? null : 'guide');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setActiveSidebar(prev => prev === 'notepad' ? null : 'notepad');
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsBookmarksModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNextChapter = () => {
    targetVerseRef.current = 1;
    setSelectedVerseRange(null);
    setSelectedCharacter(null);
    if (chapterNum < currentBook.chaptersCount) {
      setChapterNum(prev => prev + 1);
    } else {
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (currentIdx < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIdx + 1];
        setBookId(nextBook.id);
        setChapterNum(1);
      }
    }
  };

  const handlePrevChapter = () => {
    targetVerseRef.current = 1;
    setSelectedVerseRange(null);
    setSelectedCharacter(null);
    if (chapterNum > 1) {
      setChapterNum(prev => prev - 1);
    } else {
      const currentIdx = BIBLE_BOOKS.findIndex(b => b.id === bookId);
      if (currentIdx > 0) {
        const prevBook = BIBLE_BOOKS[currentIdx - 1];
        setBookId(prevBook.id);
        setChapterNum(prevBook.chaptersCount);
      }
    }
  };

  const handleSelectPassage = (
    newBookId: string,
    newChapterNum: number,
    targetVerseNum?: number,
    targetRange?: { start: number; end: number } | null
  ) => {
    const vNum = targetVerseNum || 1;
    targetVerseRef.current = vNum;

    const rangeToSet = targetRange !== undefined ? targetRange : (targetVerseNum ? { start: targetVerseNum, end: targetVerseNum } : null);
    setSelectedVerseRange(rangeToSet);

    if (newBookId === bookId && newChapterNum === chapterNum) {
      if (currentChapter && currentChapter.verses.length > 0) {
        const v = currentChapter.verses.find(x => x.verseNumber === vNum) || currentChapter.verses[0];
        if (v) setSelectedVerse(v);
      }
      return;
    }

    setBookId(newBookId);
    setChapterNum(newChapterNum);

    // Check locally available chapter data
    const localCh = getChapter(newBookId, newChapterNum);
    if (localCh && localCh.verses.length > 0) {
      const v = localCh.verses.find(x => x.verseNumber === vNum) || localCh.verses[0];
      if (v) setSelectedVerse(v);
    }
  };

  return (
    <>
      {!isAuthenticated && (
        <LoginScreen 
          onLogin={() => {
            setIsLoggingOut(false);
            setIsAuthenticated(true);
          }}
          isClosingOnMount={isLoggingOut}
          onClosingComplete={() => setIsLoggingOut(false)}
          bookName={currentBook.name}
          bookId={bookId}
          chapterNumber={currentChapter.chapterNumber}
          verses={currentChapter.verses}
          activeTranslation={activeTranslation}
          selectedVerse={selectedVerse}
          activeSidebar={activeSidebar}
          userNotes={notepadState.tabs.find(t => t.id === notepadState.activeTabId)?.content || ''}
        />
      )}
      <div
        className="berea-app h-screen flex flex-col font-sans text-[#26221F] overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: 'var(--clean-bg, #FAF7F2)' }}
      >
      {/* Top Application Header with Global Denomination and Approved Translation Selectors */}
      <Header
        activeLens={activeLens}
        onSelectLens={handleSelectLens}
        activeTranslation={activeTranslation}
        onSelectTranslation={setActiveTranslation}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenBookmarks={() => setIsBookmarksModalOpen(prev => !prev)}
        isBookmarksOpen={isBookmarksModalOpen}
        bookmarkCount={bookmarks.length}
        isAiPanelOpen={activeSidebar === 'guide'}
        onToggleAiPanel={() => setActiveSidebar(prev => prev === 'guide' ? null : 'guide')}
        onOpenNotepad={() => setActiveSidebar(prev => prev === 'notepad' ? null : 'notepad')}
        isNotepadActive={activeSidebar === 'notepad'}
        onOpenColorScheme={() => setIsColorSchemeOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main App Workspace: Clean Scripture Reading + Berea AI Guide or Notepad */}
      <main className="flex-1 max-w-[1740px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-2 flex flex-col min-h-0 overflow-hidden">
        <div 
          ref={containerRef}
          style={
            activeSidebar && isWideScreen
              ? {
                  display: 'grid',
                  gridTemplateColumns: `minmax(380px, 1fr) 26px minmax(340px, ${sidebarWidthPct.toFixed(1)}%)`,
                  transition: isDraggingSplitter ? 'none' : 'grid-template-columns 0.15s ease-out'
                }
              : undefined
          }
          className={`flex-1 ${
            activeSidebar 
              ? (isWideScreen ? 'w-full' : 'grid grid-cols-1 gap-3') 
              : 'max-w-5xl mx-auto w-full'
          } h-full min-h-0 overflow-hidden relative berea-app-book-frame`}
        >
          {/* Bible Reader Pane */}
          <div className="w-full flex flex-col h-full min-h-0 overflow-hidden">
            <BibleReader
              bookName={currentBook.name}
              bookId={bookId}
              chapter={currentChapter}
              activeTranslation={activeTranslation}
              selectedVerseNumber={selectedVerse.verseNumber}
              onSelectVerse={(v) => {
                setSelectedVerse(v);
                setSelectedVerseRange(null);
              }}
              selectedVerseRange={selectedVerseRange}
              onSelectVerseRange={(range, primaryVerse) => {
                setSelectedVerseRange(range);
                if (primaryVerse) {
                  setSelectedVerse(primaryVerse);
                }
              }}
              onNextChapter={handleNextChapter}
              onPrevChapter={handlePrevChapter}
              isFirstChapter={bookId === BIBLE_BOOKS[0].id && chapterNum === 1}
              isLastChapter={bookId === BIBLE_BOOKS[BIBLE_BOOKS.length - 1].id && chapterNum === currentBook.chaptersCount}
              onOpenBereaAi={() => setActiveSidebar('guide')}
              isAiPanelOpen={activeSidebar === 'guide'}
              isLoading={isLoadingChapter}
              onSelectPassage={handleSelectPassage}
              tabHighlights={activeTabHighlights}
              onHighlightVerse={handleToggleVerseHighlight}
              activeTabTitle={activeTab?.title}
              isHighlighterMode={isHighlighterMode}
              onToggleHighlighterMode={() => setIsHighlighterMode(prev => !prev)}
              activeHighlightColor={activeHighlightColor}
              onSelectHighlightColor={setActiveHighlightColor}
              onCreateStudyGuide={(verse, range) => {
                setSelectedVerse(verse);
                if (range && range.start !== range.end) {
                  setSelectedVerseRange(range);
                }
                setActiveSidebar('guide');
                setAiPanelTab('studyGuide');
              }}
              isLastChapterOfBook={chapterNum === currentBook.chaptersCount}
              onOpenBookmarks={() => setIsBookmarksModalOpen(prev => !prev)}
              isBookmarksOpen={isBookmarksModalOpen}
              onOpenBookSelector={() => setIsBookSelectorOpen(true)}
              onOpenQuiz={(type) => {
                setQuizType(type);
                setAiPanelTab('quiz');
                setActiveSidebar('guide');
              }}
              onSelectCharacter={(charId) => {
                setSelectedCharacter(charId);
              }}
              selectedCharacter={selectedCharacter}
            />
          </div>

          {/* Book Spine Slider (The middle binding of an open book spanning the line area) */}
          {activeSidebar && isWideScreen && (
            <div
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={Math.round(sidebarWidthPct)}
              aria-valuemin={22}
              aria-valuemax={68}
              aria-label="Resize Scripture and Study pages"
              tabIndex={0}
              onPointerDown={handleSplitterPointerDown}
              onDoubleClick={handleResetSplitter}
              onKeyDown={handleSplitterKeyDown}
              title="Book Spine • Drag left or right to adjust page split • Double-click to center"
              className={`flex items-center justify-center w-[26px] h-full cursor-col-resize select-none touch-none relative group z-30 flex-shrink-0 ${
                isDraggingSplitter ? 'cursor-col-resize' : ''
              }`}
            >
              {/* Page Gutter Crease Shadow (Casts realistic paper curve shadows onto left and right pages) */}
              <div 
                className="absolute inset-y-0 -left-3 -right-3 pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
                }}
              />

              {/* Full-Length Book Spine Slider Cursor (Styled with active color scheme tokens) */}
              <div
                className="w-[20px] sm:w-[22px] h-full rounded-full sm:rounded-xl transition-all duration-200 relative flex flex-col items-center justify-between py-2 cursor-col-resize select-none"
                style={{
                  background: isDraggingSplitter
                    ? 'linear-gradient(to bottom, var(--clean-accent-dark, #8C5A28) 0%, var(--clean-accent-caramel, #B4793D) 50%, var(--clean-accent-dark, #8C5A28) 100%)'
                    : 'linear-gradient(to bottom, var(--clean-accent-dark, #8C5A28) 0%, var(--clean-accent-caramel, #B4793D) 35%, var(--clean-accent-honey, #D4A373) 50%, var(--clean-accent-caramel, #B4793D) 65%, var(--clean-accent-dark, #8C5A28) 100%)',
                  border: '1.5px solid var(--clean-accent-border-strong, #8C5A28)',
                  boxShadow: isDraggingSplitter
                    ? '0 0 18px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.8), inset 0 1px 3px rgba(255,255,255,0.45), inset 0 -1px 3px rgba(0,0,0,0.35)'
                    : '0 2px 10px rgba(0,0,0,0.22), inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 3px rgba(0,0,0,0.3)'
                }}
              >
                {/* Top Book Headband Accent (Woven embroidery matching theme accent) */}
                <div 
                  className="w-[18px] h-[7px] rounded-t-md border shadow-xs flex-shrink-0"
                  style={{
                    background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), var(--clean-highlight-cream, #FAF5ED), var(--clean-accent-dark, #8C5A28))',
                    borderColor: 'var(--clean-accent-border, #D4A373)'
                  }}
                  title="Spine Headband" 
                />

                {/* Upper Raised Spine Cords (Traditional bookbinding ribs) */}
                <div className="flex flex-col gap-10 items-center w-full my-auto opacity-90 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                </div>

                {/* Center Tactile Grip & Chevron Indicators */}
                <div 
                  className="flex flex-col items-center gap-1.5 my-auto py-2.5 px-1.5 rounded-full border backdrop-blur-xs flex-shrink-0 shadow-sm"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.28)',
                    borderColor: 'rgba(255, 255, 255, 0.45)'
                  }}
                >
                  <span className="text-[11px] font-bold leading-none text-white select-none opacity-95 drop-shadow-xs">‹</span>
                  <div className="flex flex-col gap-1 items-center">
                    <div className="w-2.5 h-0.5 rounded-full bg-white opacity-85 shadow-2xs" />
                    <div className="w-3.5 h-0.5 rounded-full bg-white opacity-95 shadow-2xs" />
                    <div className="w-2.5 h-0.5 rounded-full bg-white opacity-85 shadow-2xs" />
                  </div>
                  <span className="text-[11px] font-bold leading-none text-white select-none opacity-95 drop-shadow-xs">›</span>
                </div>

                {/* Lower Raised Spine Cords (Traditional bookbinding ribs) */}
                <div className="flex flex-col gap-10 items-center w-full my-auto opacity-90 group-hover:opacity-100 transition-opacity">
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                  <div 
                    className="w-[14px] h-[3px] rounded-full shadow-xs"
                    style={{
                      background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), #FFFFFF, var(--clean-accent-dark, #8C5A28))'
                    }} 
                  />
                </div>

                {/* Bottom Book Tailband Accent (Woven embroidery matching theme accent) */}
                <div 
                  className="w-[18px] h-[7px] rounded-b-md border shadow-xs flex-shrink-0"
                  style={{
                    background: 'linear-gradient(to right, var(--clean-accent-dark, #8C5A28), var(--clean-highlight-cream, #FAF5ED), var(--clean-accent-dark, #8C5A28))',
                    borderColor: 'var(--clean-accent-border, #D4A373)'
                  }}
                  title="Spine Tailband" 
                />
              </div>
            </div>
          )}

          {/* Berea AI Guide Inspector Sidebar */}
          <AnimatedPresence isVisible={activeSidebar === 'guide'} duration={250}>
            {(isClosing) => (
              <div className={`w-full flex flex-col h-full min-h-0 overflow-hidden ${isClosing ? 'animate-springSlideOutRight' : 'animate-springSlideInRight'}`}>
                <BereaAiPanel
                  currentBook={currentBook.name}
                  currentChapter={chapterNum}
                  selectedVerse={selectedVerse}
                  selectedVerseRange={selectedVerseRange}
                  onVerseRangeChange={setSelectedVerseRange}
                  onNavigateToChapterAndVerse={(c, v, range) => handleSelectPassage(currentBook.id, c, v, range)}
                  chapterVerses={currentChapter?.verses}
                  activeLens={activeLens}
                  onLensChange={handleSelectLens}
                  activeTranslation={activeTranslation}
                  onTranslationChange={setActiveTranslation}
                  onClose={() => setActiveSidebar(null)}
                  activeTab={aiPanelTab}
                  onTabChange={setAiPanelTab}
                  activeQuizType={quizType}
                  onQuizTypeChange={setQuizType}
                  onOpenQuiz={(type) => {
                    setQuizType(type);
                    setAiPanelTab('quiz');
                    setActiveSidebar('guide');
                  }}
                  selectedCharacter={selectedCharacter}
                  onNavigateToPassage={(bId, chNum, vNum) => handleSelectPassage(bId, chNum, vNum)}
                />
              </div>
            )}
          </AnimatedPresence>

          {/* Dedicated Notepad Sidebar (Independent Tab) */}
          <AnimatedPresence isVisible={activeSidebar === 'notepad'} duration={250}>
            {(isClosing) => (
              <div className={`w-full flex flex-col h-full min-h-0 overflow-hidden ${isClosing ? 'animate-springSlideOutRight' : 'animate-springSlideInRight'}`}>
                <div
                  className="flex flex-col h-full bg-white text-[#26221F] border rounded-2xl overflow-hidden shadow-xs"
                  style={{
                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  {/* Header with Title & Close Button */}
                  <div
                    className="p-2 px-3 border-b flex items-center justify-between select-none flex-shrink-0"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)',
                      color: '#26221F'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-lg border flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                          borderColor: 'var(--clean-accent-border, #E2D5C3)'
                        }}
                      >
                        <NotebookPen className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      </div>
                      <div>
                        <h3
                          className="font-serif font-bold text-xs leading-none"
                          style={{ color: '#26221F' }}
                        >
                          Personal Study Notepad
                        </h3>
                        <p
                          className="text-[10px] leading-none mt-0.5"
                          style={{ color: '#78716C' }}
                        >
                          Reflections, study notes & chapter journals
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveSidebar(null)}
                      className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F] flex-shrink-0"
                      title="Close Notepad"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                    <NotepadPanel
                      currentBook={currentBook.name}
                      currentChapter={chapterNum}
                      selectedVerse={selectedVerse}
                      selectedVerseRange={selectedVerseRange}
                      activeTranslation={activeTranslation}
                      activeLens={activeLens}
                      notepadState={notepadState}
                      setNotepadState={setNotepadState}
                      tabHighlights={activeTabHighlights}
                      onHighlightVerse={handleToggleVerseHighlight}
                      activeTabTitle={activeTab?.title}
                      isHighlighterMode={isHighlighterMode}
                      onToggleHighlighterMode={() => setIsHighlighterMode(prev => !prev)}
                      activeHighlightColor={activeHighlightColor}
                      onSelectHighlightColor={setActiveHighlightColor}
                      onSelectPassage={handleSelectPassage}
                    />
                  </div>
                </div>
              </div>
            )}
          </AnimatedPresence>
        </div>
      </main>

      {/* Book & Chapter Picker Modal (All 66 Books OT/NT) */}
      <BookSelectorModal
        isOpen={isBookSelectorOpen}
        onClose={() => setIsBookSelectorOpen(false)}
        currentBookId={bookId}
        currentChapterNum={chapterNum}
        onSelectPassage={(bId, chNum) => handleSelectPassage(bId, chNum)}
      />

      {/* Pitch Deck & Architecture Overview Modal */}
      <PitchDeckAboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Global Scripture & Theology Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigateToPassage={(bId, chNum, vNum) => handleSelectPassage(bId, chNum, vNum)}
        activeTranslation={activeTranslation}
        activeLens={activeLens}
      />

      {/* Customizable Color Scheme Wheel (Bottom-Right Studio Drawer) */}
      <ColorThemeWheel
        isOpen={isColorSchemeOpen}
        onClose={() => setIsColorSchemeOpen(false)}
        onOpen={() => setIsColorSchemeOpen(true)}
      />

      {/* Pastoral & Clergy Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentBookName={currentBook.name}
        currentChapterNum={chapterNum}
        currentVerseNum={selectedVerse?.verseNumber}
        activeLens={activeLens}
        activeTranslation={activeTranslation}
      />

      {/* Bookmarked Verses Modal */}
      <BookmarksModal
        isOpen={isBookmarksModalOpen}
        onClose={() => setIsBookmarksModalOpen(false)}
        onNavigateToPassage={(bId, chNum, vNum) => handleSelectPassage(bId, chNum, vNum)}
      />

    </div>
    </>
  );
}

export default App;
