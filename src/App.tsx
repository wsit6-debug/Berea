import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { BookSelectorModal } from './components/BookSelectorModal';
import { PitchDeckAboutModal } from './components/PitchDeckAboutModal';
import { SearchModal } from './components/SearchModal';
import { LoginScreen } from './components/LoginScreen';
import { BookmarksModal } from './components/BookmarksModal';
import { fetchFullMultiTranslationChapter } from './services/youversionService';
import { getUserDenominationPreference, setUserDenominationPreference } from './services/configService';
import { scheduleBackgroundQuizPreGeneration } from './services/quizService';
import { useBookmarkedVerses } from './services/bookmarkService';
import { BereaAiTab } from './types';

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
  const [isAiPanelOpen, setIsAiPanelOpen] = useState<boolean>(true);
  const [aiPanelTab, setAiPanelTab] = useState<BereaAiTab>('overview');

  // Modals state
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isBookmarksModalOpen, setIsBookmarksModalOpen] = useState(false);
  const [quizType, setQuizType] = useState<'chapter' | 'book' | null>(null);
  const bookmarks = useBookmarkedVerses();

  // Dynamic Chapter State fetched from YouVersion Scripture API
  const currentBook = getBook(bookId) || BIBLE_BOOKS[0];
  const [currentChapter, setCurrentChapter] = useState<Chapter>(() => getChapter(bookId, chapterNum));
  const [isLoadingChapter, setIsLoadingChapter] = useState<boolean>(false);

  const targetVerseRef = useRef<number | undefined>(savedPassage?.verseNum || 1);

  // Selected Verse State
  const [selectedVerse, setSelectedVerse] = useState<Verse>(() => {
    const initialVerseNum = savedPassage?.verseNum || 1;
    return currentChapter.verses.find(v => v.verseNumber === initialVerseNum) || currentChapter.verses[0] || {
      verseNumber: 1,
      text: { KJV: 'Loading scripture...' }
    };
  });
  const [selectedVerseRange, setSelectedVerseRange] = useState<{ start: number; end: number } | null>(null);

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
        setIsAiPanelOpen(prev => !prev);
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
    <div className="berea-app h-screen flex flex-col font-sans bg-[#FAF7F2] text-[#26221F] overflow-hidden">
      {/* Top Application Header with Global Denomination and Approved Translation Selectors */}
      <Header
        currentBookName={currentBook.name}
        currentChapterNum={chapterNum}
        onOpenBookSelector={() => setIsBookSelectorOpen(true)}
        activeLens={activeLens}
        onSelectLens={handleSelectLens}
        activeTranslation={activeTranslation}
        onSelectTranslation={setActiveTranslation}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
        bookmarkCount={bookmarks.length}
        isAiPanelOpen={isAiPanelOpen}
        onToggleAiPanel={() => setIsAiPanelOpen(prev => !prev)}
        onLogout={handleLogout}
      />

      {/* Main App Workspace: Clean Scripture Reading + Berea AI Guide */}
      <main className="flex-1 max-w-7xl 2xl:max-w-[1536px] w-full mx-auto p-2 sm:p-3 flex flex-col min-h-0 overflow-hidden">
        <div className={`flex-1 grid grid-cols-1 ${isAiPanelOpen ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto w-full'} gap-3 h-full min-h-0 overflow-hidden`}>
          {/* Bible Reader Pane */}
          <div className={`${isAiPanelOpen ? 'lg:col-span-7 xl:col-span-7 2xl:col-span-8' : 'w-full'} flex flex-col h-full min-h-0 overflow-hidden`}>
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
              onOpenBereaAi={() => setIsAiPanelOpen(true)}
              isAiPanelOpen={isAiPanelOpen}
              isLoading={isLoadingChapter}
              onSelectPassage={handleSelectPassage}
              onCreateStudyGuide={(verse, range) => {
                setSelectedVerse(verse);
                if (range && range.start !== range.end) {
                  setSelectedVerseRange(range);
                }
                setIsAiPanelOpen(true);
                setAiPanelTab('studyGuide');
              }}
              isLastChapterOfBook={chapterNum === currentBook.chaptersCount}
              onOpenBookmarks={() => setIsBookmarksModalOpen(true)}
              onOpenBookSelector={() => setIsBookSelectorOpen(true)}
              onOpenQuiz={(type) => {
                setQuizType(type);
                setAiPanelTab('quiz');
                setIsAiPanelOpen(true);
              }}
            />
          </div>

          {/* Berea AI Inspector Sidebar */}
          {isAiPanelOpen && (
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
                onClose={() => setIsAiPanelOpen(false)}
                activeTab={aiPanelTab}
                onTabChange={setAiPanelTab}
                activeQuizType={quizType}
                onQuizTypeChange={setQuizType}
                onOpenQuiz={(type) => {
                  setQuizType(type);
                  setAiPanelTab('quiz');
                  setIsAiPanelOpen(true);
                }}
                onNavigateToPassage={(bId, chNum, vNum) => handleSelectPassage(bId, chNum, vNum)}
              />
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
