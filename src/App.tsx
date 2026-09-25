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
  getDefaultTranslationForDenomination
} from './data/bibleData';
import { DenominationalLens } from './data/theologyData';
import { Header } from './components/Header';
import { BibleReader } from './components/BibleReader';
import { BereaAiPanel } from './components/BereaAiPanel';
import { NotepadPanel } from './components/NotepadPanel';
import { BookSelectorModal } from './components/BookSelectorModal';
import { PitchDeckAboutModal } from './components/PitchDeckAboutModal';
import { SearchModal } from './components/SearchModal';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Clear any legacy persistent auth tokens so every visit prompts for password
  useEffect(() => {
    localStorage.removeItem('berea_authenticated');
    localStorage.removeItem('berea_auth_timestamp');
  }, []);

  const handleLogout = () => {
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

  const [bookId, setBookId] = useState<string>(() => savedPassage?.bookId || 'genesis');
  const [chapterNum, setChapterNum] = useState<number>(() => savedPassage?.chapterNum || 1);
  const [activeLens, setActiveLens] = useState<DenominationalLens>(() => {
    const pref = getUserDenominationPreference();
    return (pref === 'all' || pref === 'none') ? 'catholic' : pref;
  });
  const [activeTranslation, setActiveTranslation] = useState<TranslationId>(() => getDefaultTranslationForDenomination(activeLens));
  const [activeSidebar, setActiveSidebar] = useState<'guide' | 'notepad' | null>('guide');
  const [aiPanelTab, setAiPanelTab] = useState<BereaAiTab>('overview');

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
    const approved = getApprovedTranslationsForDenomination(newLens);
    if (!approved.some(t => t.id === activeTranslation)) {
      const defaultTrans = getDefaultTranslationForDenomination(newLens);
      setActiveTranslation(defaultTrans);
    }
  };

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

  const handleSelectPassage = (newBookId: string, newChapterNum: number, targetVerseNum?: number) => {
    const vNum = targetVerseNum || 1;
    targetVerseRef.current = vNum;
    setSelectedVerseRange(null);
    setSelectedCharacter(null);
    setBookId(newBookId);
    setChapterNum(newChapterNum);

    // Check locally available chapter data
    const localCh = getChapter(newBookId, newChapterNum);
    if (localCh && localCh.verses.length > 0) {
      const v = localCh.verses.find(x => x.verseNumber === vNum) || localCh.verses[0];
      if (v) setSelectedVerse(v);
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
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
        onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
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
        <div className={`flex-1 grid grid-cols-1 ${activeSidebar ? 'lg:grid-cols-12' : 'max-w-5xl mx-auto w-full'} gap-3 sm:gap-4 h-full min-h-0 overflow-hidden`}>
          {/* Bible Reader Pane */}
          <div className={`${activeSidebar ? 'lg:col-span-7 xl:col-span-7 2xl:col-span-8' : 'w-full'} flex flex-col h-full min-h-0 overflow-hidden`}>
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
              onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
              onOpenBookSelector={() => setIsBookSelectorOpen(true)}
              onOpenQuiz={(type) => {
                setQuizType(type);
                setAiPanelTab('quiz');
                setActiveSidebar('guide');
              }}
              onSelectCharacter={(charId) => {
                setSelectedCharacter(charId);
                setAiPanelTab('characters');
                setActiveSidebar('guide');
              }}
              selectedCharacter={selectedCharacter}
            />
          </div>

          {/* Berea AI Guide Inspector Sidebar */}
          {activeSidebar === 'guide' && (
            <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 flex flex-col h-full min-h-0 overflow-hidden animate-fadeIn">
              <BereaAiPanel
                currentBook={currentBook.name}
                currentChapter={chapterNum}
                selectedVerse={selectedVerse}
                selectedVerseRange={selectedVerseRange}
                onVerseRangeChange={setSelectedVerseRange}
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

          {/* Dedicated Notepad Sidebar (Independent Tab) */}
          {activeSidebar === 'notepad' && (
            <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-4 flex flex-col h-full min-h-0 overflow-hidden animate-fadeIn">
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
  );
}

export default App;
