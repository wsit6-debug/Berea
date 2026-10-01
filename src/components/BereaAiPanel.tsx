import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles, BookOpen, MapPin, Columns, MessageSquare, ChevronRight, RefreshCw, Send, Sliders, X,
  Trash2, ArrowUpRight, ShieldCheck, BookOpenCheck, Copy, Check, Printer, ChevronDown, ChevronUp,
  History, Bookmark, Users, GraduationCap, Baby, ArrowRight, Layers, FileText, ListFilter, Languages, Trophy, HelpCircle, Network,
  Plus, Minus, CheckCircle2, Feather
} from 'lucide-react';
import { DENOMINATIONS, DenominationalLens, getTheologicalInsight, DENOMINATION_COMMENTATORS } from '../data/theologyData';
import { getVerbatimCommentary, summarizeCommentaryText } from '../services/commentaryDatabaseService';
import { ChapterSymbolismPanel } from './ChapterSymbolismPanel';
import { TRANSLATIONS, TranslationId, Verse, getTranslationColor, getApprovedTranslationsForDenomination } from '../data/bibleData';
import { getChapterGeoData, ChapterGeoEvent, calculateDistanceMiles, getShortPlaceName } from '../data/geoData';
import { OpenFreeMapWidget } from './OpenFreeMapWidget';
import { askBereaAssistant, ChatMessage, QuizQuestion, QuizStyle, WrittenGradingResult, gradeWrittenAnswer, generateHistoricalCommentary } from '../services/aiService';
import { requestForegroundQuiz, getCachedChapterQuiz, getCachedBookQuiz } from '../services/quizService';
import { BIBLE_BOOKS } from '../data/bibleData';
import { searchDoctrinalCorpus, preloadUnabridgedCorpus } from '../services/ragService';
import { MarkdownTheologyRenderer } from './MarkdownTheologyRenderer';
import { VerseOfTheDay } from './VerseOfTheDay';
import { cleanApiText, parsePassageReference, fetchChapterFromYouVersion } from '../services/youversionService';
import { AppliedAiLogo } from './AppliedAiLogo';
import TypologyPanel from './TypologyPanel';
import { StudyGuide, SupportingPassage, BereaAiTab, StudyGuideAudience } from '../types';

import {
  getSavedStudyGuides,
  saveStudyGuide,
  deleteStudyGuide,
  generateStudyGuideContent,
  formatStudyGuideForClipboard,
  addSupportingPassageToGuide,
  removeSupportingPassageFromGuide,
  formatContextSnapshotForDisplay
} from '../services/studyGuideService';
import confetti from 'canvas-confetti';
import { useLanguage } from '../i18n/LanguageContext';

const DEFAULT_WELCOME_TEXT = "Welcome to Berea. Ask any question about Scripture, theology, church history, or the active passage, or choose a prompt below to get started.";

interface BereaAiPanelProps {
  currentBook: string;
  currentChapter: number;
  selectedVerse: Verse | null;
  selectedVerseRange?: { start: number; end: number } | null;
  onVerseRangeChange?: (range: { start: number; end: number } | null) => void;
  onNavigateToChapterAndVerse?: (chapterNum: number, verseNum: number, range?: { start: number; end: number } | null) => void;
  chapterVerses?: Verse[];
  activeLens: DenominationalLens;
  onLensChange: (lens: DenominationalLens) => void;
  activeTranslation: TranslationId;
  onTranslationChange: (t: TranslationId) => void;
  onClose?: () => void;
  activeTab?: BereaAiTab;
  onTabChange?: (tab: BereaAiTab) => void;
  activeQuizType?: 'chapter' | 'book' | null;
  onQuizTypeChange?: (type: 'chapter' | 'book' | null) => void;
  onOpenQuiz?: (type: 'chapter' | 'book') => void;
  selectedCharacter?: string | null;
  onNavigateToPassage?: (bookId: string, chapterNum: number, verseNum?: number) => void;
}

export const BereaAiPanel: React.FC<BereaAiPanelProps> = ({
  currentBook,
  currentChapter,
  selectedVerse,
  selectedVerseRange,
  onVerseRangeChange,
  onNavigateToChapterAndVerse,
  chapterVerses,
  activeLens,
  onLensChange,
  activeTranslation,
  onTranslationChange,
  activeTab: externalTab,
  onTabChange,
  activeQuizType,
  onQuizTypeChange,
  onOpenQuiz,
  selectedCharacter,
  onNavigateToPassage,
  onClose
}) => {
  const [internalTab, setInternalTab] = useState<BereaAiTab>(externalTab || 'overview');

  useEffect(() => {
    if (externalTab) {
      setInternalTab(externalTab);
    }
  }, [externalTab]);

  const activeTab = externalTab || internalTab;
  const setActiveTab = (t: BereaAiTab) => {
    setInternalTab(t);
    onTabChange?.(t);
  };

  // Embedded Quiz State (runs inline at bottom of tab)
  const [internalQuizType, setInternalQuizType] = useState<'chapter' | 'book' | null>(activeQuizType || null);
  const currentQuizType = activeQuizType !== undefined ? activeQuizType : internalQuizType;

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<number, number>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [generatingQuizType, setGeneratingQuizType] = useState<'chapter' | 'book' | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [quizProgress, setQuizProgress] = useState(0);
  const [quizCheckpoint, setQuizCheckpoint] = useState<{ current: number; total: number } | null>(null);

  const [quizMode, setQuizMode] = useState<'chapter' | 'book'>('chapter');
  const [quizTargetBook, setQuizTargetBook] = useState<string>(currentBook);
  const [quizTargetChapter, setQuizTargetChapter] = useState<number>(currentChapter);

  // Track pre-generated cached state
  const [hasCachedChapter, setHasCachedChapter] = useState(false);
  const [hasCachedBook, setHasCachedBook] = useState(false);
  const [quizRevealedAnswers, setQuizRevealedAnswers] = useState<Record<number, boolean>>({});

  // User-configurable quiz length and style (min 5, max 100)
  const [quizStyle, setQuizStyle] = useState<QuizStyle>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('berea_quiz_style') as QuizStyle;
      if (saved === 'multiple_choice' || saved === 'true_false' || saved === 'written' || saved === 'mixed') {
        return saved;
      }
    }
    return 'multiple_choice';
  });

  const handleStyleChange = (style: QuizStyle) => {
    setQuizStyle(style);
    try {
      localStorage.setItem('berea_quiz_style', style);
    } catch {}
  };

  const [chapterQuizLength, setChapterQuizLength] = useState<number>(5);
  const [bookQuizLength, setBookQuizLength] = useState<number>(10);

  // Written quiz answers & AI grading state
  const [writtenAnswers, setWrittenAnswers] = useState<Record<number, string>>({});
  const [writtenGrades, setWrittenGrades] = useState<Record<number, WrittenGradingResult>>({});
  const [isGradingWritten, setIsGradingWritten] = useState(false);
  const [gradingProgress, setGradingProgress] = useState<{ current: number; total: number } | null>(null);

  const clampChapterCount = (val: number) => Math.max(5, Math.min(15, Math.floor(val) || 5));
  const clampBookCount = (val: number) => Math.max(5, Math.min(50, Math.floor(val) || 5));

  const [studyGuideMode, setStudyGuideMode] = useState<'discussion' | 'typology'>('discussion');

  useEffect(() => {
    const updateCacheStatus = () => {
      setHasCachedChapter(Boolean(getCachedChapterQuiz(currentBook, currentChapter, chapterQuizLength, quizStyle)));
      setHasCachedBook(Boolean(getCachedBookQuiz(currentBook, bookQuizLength, quizStyle)));
    };

    updateCacheStatus();

    window.addEventListener('berea_quiz_cache_updated', updateCacheStatus);
    return () => window.removeEventListener('berea_quiz_cache_updated', updateCacheStatus);
  }, [currentBook, currentChapter, chapterQuizLength, bookQuizLength, quizStyle]);

  useEffect(() => {
    if (!currentQuizType) {
      setQuizTargetBook(currentBook);
      setQuizTargetChapter(currentChapter);
    }
  }, [currentBook, currentChapter, currentQuizType]);

  const startQuiz = async (type: 'chapter' | 'book', overrideCount?: number, overrideStyle?: QuizStyle) => {
    const requestedCount = type === 'chapter'
      ? clampChapterCount(overrideCount || chapterQuizLength)
      : clampBookCount(overrideCount || bookQuizLength);
    const requestedStyle = overrideStyle || quizStyle;

    setInternalQuizType(type);
    onQuizTypeChange?.(type);
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizSelectedAnswers({});
    setQuizRevealedAnswers({});
    setWrittenAnswers({});
    setWrittenGrades({});
    setIsGradingWritten(false);
    setGradingProgress(null);
    setIsQuizSubmitted(false);
    setQuizError(null);
    setIsQuizLoading(true);
    setGeneratingQuizType(type);
    setQuizProgress(0);
    setQuizCheckpoint(null);

    const handleProgress = (current: number, total: number) => {
      const pct = total > 0 ? Math.round((current / total) * 100) : 0;
      setQuizProgress(pct);
      setQuizCheckpoint({ current, total });
    };

    try {
      const isTargetingCurrent = quizTargetBook === currentBook && quizTargetChapter === currentChapter;
      const chapterText = isTargetingCurrent ? (chapterVerses || []).map(v => v.text[activeTranslation] || Object.values(v.text)[0]).join(' ') : undefined;
      
      const rawQuestions = await requestForegroundQuiz(
        type,
        quizTargetBook,
        quizTargetChapter,
        chapterText,
        handleProgress,
        requestedCount,
        requestedStyle
      );

      // Safeguard against duplicates
      const seenSet = new Set<string>();
      const questions = rawQuestions.filter(q => {
        const k = (q.question || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!k || seenSet.has(k)) return false;
        seenSet.add(k);
        return true;
      });

      if (type === 'book' && questions.length === 0) {
        setQuizError('No chapter quizzes found for this book yet. Please complete chapter quizzes first to build up your comprehensive book quiz!');
      } else {
        setQuizQuestions(questions);
      }
    } catch (err: any) {
      setQuizError(`Failed to generate quiz: ${err.message || String(err)}`);
    } finally {
      setIsQuizLoading(false);
      setGeneratingQuizType(null);
    }
  };

  const handleGradeAllWrittenAnswers = async () => {
    if (quizQuestions.length === 0) return;
    const writtenIndices = quizQuestions
      .map((q, idx) => ({ q, idx }))
      .filter(({ q }) => q.style === 'written');

    const results: Record<number, WrittenGradingResult> = { ...writtenGrades };

    if (writtenIndices.length > 0) {
      setIsGradingWritten(true);
      setGradingProgress({ current: 0, total: writtenIndices.length });

      const chapterText = (chapterVerses || []).map(v => v.text[activeTranslation] || Object.values(v.text)[0]).join(' ');

      for (let i = 0; i < writtenIndices.length; i++) {
        setGradingProgress({ current: i + 1, total: writtenIndices.length });
        const { q, idx } = writtenIndices[i];
        const answer = writtenAnswers[idx] || '';
        try {
          const grade = await gradeWrittenAnswer(q.question, answer, chapterText, q.sampleAnswer, q.reference);
          results[idx] = grade;
        } catch (e) {
          console.warn('Grading error for question', idx, e);
          results[idx] = {
            score: answer.trim().length > 10 ? 75 : 40,
            grade: answer.trim().length > 10 ? 'Good' : 'Needs Review',
            isCorrect: answer.trim().length > 10,
            feedback: 'Answer recorded. Reflect on the scriptural themes discussed in the chapter.',
            biblicalInsights: q.sampleAnswer || q.explanation,
            modelAnswer: q.sampleAnswer
          };
        }
      }

      setWrittenGrades(results);
      setIsGradingWritten(false);
    }

    setIsQuizSubmitted(true);

    // Composite score across all questions in the quiz
    const totalScore = quizQuestions.reduce((acc, q, idx) => {
      if (q.style === 'written') {
        return acc + (results[idx]?.score ?? 70);
      }
      return acc + (quizSelectedAnswers[idx] === q.correctAnswerIndex ? 100 : 0);
    }, 0);
    const avgScore = totalScore / (quizQuestions.length || 1);
    if (avgScore >= 70) {
      confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
    }
  };

  useEffect(() => {
    if (activeQuizType && activeQuizType !== currentQuizType) {
      startQuiz(activeQuizType);
    }
  }, [activeQuizType, currentBook, currentChapter]);
  const [comparisonTranslations, setComparisonTranslations] = useState<TranslationId[]>(['ESV', 'KJV', 'NIV']);

  const { language } = useLanguage();
  const matrixTranslations = useMemo(() => {
    return TRANSLATIONS.filter(t => 
      (t.language || 'en') === (language || 'en') && 
      Array.isArray(t.approvedDenominations) && 
      t.approvedDenominations.length > 0
    );
  }, [language]);

  useEffect(() => {
    const validSelections = comparisonTranslations.filter(id => matrixTranslations.some(t => t.id === id));
    if (validSelections.length > 0) {
      if (validSelections.length !== comparisonTranslations.length) {
        setComparisonTranslations(validSelections);
      }
    } else if (matrixTranslations.length > 0) {
      setComparisonTranslations(matrixTranslations.slice(0, Math.min(3, matrixTranslations.length)).map(t => t.id));
    }
  }, [language, matrixTranslations]);

  const activeVerseNum = selectedVerse?.verseNumber || 1;
  const currentVerseRef = `${currentBook} ${currentChapter}:${activeVerseNum}`;

  // Asynchronous external scripture loader for comparison translations not bundled locally
  const [externalComparisonTexts, setExternalComparisonTexts] = useState<Record<string, string>>({});
  const [loadingComparisonTrans, setLoadingComparisonTrans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeTab !== 'compare') return;

    let isMounted = true;

    comparisonTranslations.forEach((tId) => {
      const tObj = TRANSLATIONS.find(x => x.id === tId);
      const isNTOnly = Boolean(
        tObj?.badge?.toLowerCase().includes('nt only') ||
        tObj?.badge?.toLowerCase().includes('nt epistles') ||
        tObj?.description?.toLowerCase().includes('new testament only')
      );
      const currentBookObj = BIBLE_BOOKS.find(b => b.name.toLowerCase() === currentBook.toLowerCase() || b.id.toLowerCase() === currentBook.toLowerCase());
      const isOT = currentBookObj ? currentBookObj.testament === 'OT' : false;
      const cacheKey = `${tId}_${currentBook}_${currentChapter}_${activeVerseNum}`;

      // Immediate short-circuit for NT-only translations on Old Testament books
      if (isNTOnly && isOT) {
        setExternalComparisonTexts(prev => ({
          ...prev,
          [cacheKey]: 'This translation contains the New Testament only.'
        }));
        return;
      }

      // Check if local text already exists in selectedVerse
      if (selectedVerse?.text?.[tId]) return;

      const NON_LATIN_LANGS = new Set(['ru', 'uk', 'zh', 'ja', 'ko', 'he', 'el', 'ar', 'fa', 'hi', 'ta', 'kn', 'ml', 'ne']);
      const isNonLatin = tObj && NON_LATIN_LANGS.has(tObj.language || '');
      const existing = externalComparisonTexts[cacheKey];
      const isCorruptedEnglish = isNonLatin && existing && /^[A-Za-z\s,;:'"?.!-]+$/.test(existing.trim().slice(0, 30));

      if (existing && !isCorruptedEnglish) return;

      setLoadingComparisonTrans(prev => ({ ...prev, [tId]: true }));

      fetchChapterFromYouVersion(currentBook, currentChapter, tId)
        .then((verses) => {
          if (!isMounted) return;
          const match = verses.find(v => v.verseNumber === activeVerseNum);
          const rawText = match?.text?.[tId] || (match?.text ? Object.values(match.text)[0] : '');
          const isRawEnglish = isNonLatin && rawText && /^[A-Za-z\s,;:'"?.!-]+$/.test(rawText.trim().slice(0, 30));

          if (rawText && !isRawEnglish) {
            setExternalComparisonTexts(prev => ({
              ...prev,
              [cacheKey]: cleanApiText(rawText)
            }));
          } else {
            setExternalComparisonTexts(prev => ({
              ...prev,
              [cacheKey]: isNTOnly
                ? 'This translation contains the New Testament only.'
                : 'Passage not present in this translation edition.'
            }));
          }
        })
        .catch((err) => {
          console.warn(`Error fetching scripture for ${tId}:`, err);
          if (isMounted) {
            setExternalComparisonTexts(prev => ({
              ...prev,
              [cacheKey]: 'Failed to retrieve scripture from remote server.'
            }));
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoadingComparisonTrans(prev => ({ ...prev, [tId]: false }));
          }
        });
    });

    return () => {
      isMounted = false;
    };
  }, [activeTab, comparisonTranslations, currentBook, currentChapter, activeVerseNum, selectedVerse]);

  // Dynamic Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: DEFAULT_WELCOME_TEXT,
      timestamp: 'Just now'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [localModelProgress, setLocalModelProgress] = useState<{ text: string; progress: number } | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Preload complete unabridged confessional dataset for active lens
  useEffect(() => {
    preloadUnabridgedCorpus(activeLens).catch(console.error);
  }, [activeLens]);

  // Auto-scroll chat to bottom on new message
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiThinking, activeTab]);

  const rawCurrentText = (selectedVerse?.text && (selectedVerse.text[activeTranslation] || selectedVerse.text['KJV'] || Object.values(selectedVerse.text)[0])) || undefined;
  const currentVerseText = rawCurrentText ? cleanApiText(rawCurrentText) : undefined;

  // Study Guide Generator State
  const [savedGuides, setSavedGuides] = useState<StudyGuide[]>(() => getSavedStudyGuides());
  const [currentGuide, setCurrentGuide] = useState<StudyGuide | null>(null);
  const [showSavedGuidesDrawer, setShowSavedGuidesDrawer] = useState(false);
  const [guideCopied, setGuideCopied] = useState(false);
  const [openSections, setOpenSections] = useState({
    context: true,
    supportingPassages: true,
    icebreakers: true,
    deepPrompts: true,
    application: true
  });
  const [newPassageRefInput, setNewPassageRefInput] = useState('');
  const [isAddingPassage, setIsAddingPassage] = useState(false);

  // Audience / Depth Selector State (persists across sessions)
  const [selectedAudience, setSelectedAudience] = useState<StudyGuideAudience>(() => {
    try {
      const saved = localStorage.getItem('berea_study_guide_audience') as StudyGuideAudience;
      if (saved === 'small_group' || saved === 'deep_exegesis' || saved === 'youth_family') {
        return saved;
      }
      return 'small_group';
    } catch {
      return 'small_group';
    }
  });

  // Study Guide Scope: whole chapter, individual verse, range, or custom specific verses
  type StudyGuideScope = 'chapter' | 'verse' | 'range' | 'custom';
  const [studyGuideScope, setStudyGuideScope] = useState<StudyGuideScope>('chapter');

  // Overview Tab Interactive State
  const [expandedDoctrinalEntries, setExpandedDoctrinalEntries] = useState<Record<string, boolean>>({});

  // Start Verse & Multi-Verse Range State
  const [manualStartVerseNum, setManualStartVerseNum] = useState<number>(activeVerseNum);
  const [endVerseNum, setEndVerseNum] = useState<number>(activeVerseNum);

  // Custom Specific Verses State (e.g. 1, 12, 23)
  const [customVerseNumbers, setCustomVerseNumbers] = useState<number[]>([activeVerseNum]);
  const [customVerseInput, setCustomVerseInput] = useState<string>(String(activeVerseNum));

  const handleCustomVerseInputChange = (val: string) => {
    setCustomVerseInput(val);
    const parsed = val
      .split(/[\s,]+/)
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 1 && n <= maxChapterVerses);
    const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b);
    setCustomVerseNumbers(uniqueSorted);
  };

  const toggleCustomVerseNumber = (vNum: number) => {
    setCustomVerseNumbers(prev => {
      let next: number[];
      if (prev.includes(vNum)) {
        next = prev.filter(x => x !== vNum);
      } else {
        next = [...prev, vNum].sort((a, b) => a - b);
      }
      setCustomVerseInput(next.join(', '));
      return next;
    });
  };

  // Sync manualStartVerseNum with activeVerseNum or selectedVerseRange on external navigation
  useEffect(() => {
    if (selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end) {
      setManualStartVerseNum(selectedVerseRange.start);
      setEndVerseNum(selectedVerseRange.end);
      if (activeTab === 'studyGuide') {
        setStudyGuideScope('range');
      }
    } else {
      setManualStartVerseNum(activeVerseNum);
      if (endVerseNum < activeVerseNum) {
        setEndVerseNum(activeVerseNum);
      }
    }
  }, [activeVerseNum, selectedVerseRange, activeTab]);

  // Ensure endVerseNum is never less than manualStartVerseNum
  useEffect(() => {
    if (endVerseNum < manualStartVerseNum) {
      setEndVerseNum(manualStartVerseNum);
    }
  }, [manualStartVerseNum]);

  const maxChapterVerses = chapterVerses?.length || 50;
  const effectiveStartVerse = manualStartVerseNum;
  const effectiveEndVerse = Math.max(effectiveStartVerse, endVerseNum);

  const activeRangeRef = effectiveEndVerse > effectiveStartVerse
    ? `${currentBook} ${currentChapter}:${effectiveStartVerse}–${effectiveEndVerse}`
    : `${currentBook} ${currentChapter}:${effectiveStartVerse}`;

  // Complete chapter text compilation
  const wholeChapterText = useMemo(() => {
    if (!chapterVerses || chapterVerses.length === 0) return '';
    return chapterVerses.map(v => {
      const raw = v.text[activeTranslation] || v.text['KJV'] || Object.values(v.text)[0] || '';
      return `[${v.verseNumber}] ${cleanApiText(raw)}`;
    }).join(' ');
  }, [chapterVerses, activeTranslation]);

  // Selected range text compilation
  const combinedRangeText = useMemo(() => {
    if (!chapterVerses || chapterVerses.length === 0) return currentVerseText;
    const start = selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end
      ? selectedVerseRange.start
      : effectiveStartVerse;
    const end = selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end
      ? selectedVerseRange.end
      : effectiveEndVerse;
    const rangeVerses = chapterVerses.filter(
      v => v.verseNumber >= start && v.verseNumber <= end
    );
    return rangeVerses.map(v => {
      const raw = v.text[activeTranslation] || v.text['KJV'] || Object.values(v.text)[0] || '';
      return `[${v.verseNumber}] ${cleanApiText(raw)}`;
    }).join(' ');
  }, [selectedVerseRange, effectiveStartVerse, effectiveEndVerse, chapterVerses, activeTranslation, currentVerseText]);

  // Passage Reference for Study Guide
  const effectiveStudyGuideRef = useMemo(() => {
    if (studyGuideScope === 'chapter') {
      return `${currentBook} ${currentChapter}`;
    }
    if (studyGuideScope === 'verse') {
      return `${currentBook} ${currentChapter}:${manualStartVerseNum}`;
    }
    if (studyGuideScope === 'custom') {
      const sorted = [...customVerseNumbers].sort((a, b) => a - b);
      if (sorted.length === 0) return `${currentBook} ${currentChapter}`;
      return `${currentBook} ${currentChapter}:${sorted.join(', ')}`;
    }
    return effectiveEndVerse > effectiveStartVerse
      ? `${currentBook} ${currentChapter}:${effectiveStartVerse}–${effectiveEndVerse}`
      : `${currentBook} ${currentChapter}:${effectiveStartVerse}`;
  }, [studyGuideScope, currentBook, currentChapter, manualStartVerseNum, customVerseNumbers, effectiveStartVerse, effectiveEndVerse]);

  // Text content analyzed for Study Guide
  const studyGuideTextToAnalyze = useMemo(() => {
    if (studyGuideScope === 'chapter') {
      return wholeChapterText;
    }
    if (studyGuideScope === 'verse') {
      if (chapterVerses && chapterVerses.length > 0) {
        const found = chapterVerses.find(v => v.verseNumber === manualStartVerseNum);
        if (found) {
          const raw = found.text[activeTranslation] || found.text['KJV'] || Object.values(found.text)[0] || '';
          return cleanApiText(raw);
        }
      }
      return currentVerseText;
    }
    if (studyGuideScope === 'custom') {
      if (!chapterVerses || chapterVerses.length === 0) return currentVerseText;
      const sorted = [...customVerseNumbers].sort((a, b) => a - b);
      const matched = chapterVerses.filter(v => sorted.includes(v.verseNumber));
      if (matched.length === 0) return currentVerseText;
      return matched.map(v => {
        const raw = v.text[activeTranslation] || v.text['KJV'] || Object.values(v.text)[0] || '';
        return `[${v.verseNumber}] ${cleanApiText(raw)}`;
      }).join(' ');
    }
    return combinedRangeText;
  }, [studyGuideScope, wholeChapterText, manualStartVerseNum, customVerseNumbers, chapterVerses, activeTranslation, currentVerseText, combinedRangeText]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync guide with active passage when switching to studyGuide or changing coordinates
  useEffect(() => {
    if (activeTab === 'studyGuide') {
      const existing = savedGuides.find(g =>
        g.passageRef === effectiveStudyGuideRef ||
        (studyGuideScope === 'chapter' && g.passageRef === `${currentBook} ${currentChapter}`) ||
        g.passageRef === currentVerseRef
      );
      setCurrentGuide(existing || null);
    }
  }, [activeTab, effectiveStudyGuideRef, studyGuideScope, currentBook, currentChapter, currentVerseRef, savedGuides]);

  const handleGenerateStudyGuide = (overrideAudience?: StudyGuideAudience, overrideEndVerse?: number) => {
    const audienceToUse = overrideAudience || selectedAudience;
    let targetVerseNumber: number | undefined = undefined;
    let targetEndVerseNumber: number | undefined = undefined;
    let customPassageRef: string | undefined = undefined;

    if (studyGuideScope === 'verse') {
      targetVerseNumber = manualStartVerseNum;
      targetEndVerseNumber = undefined;
    } else if (studyGuideScope === 'range') {
      targetVerseNumber = effectiveStartVerse;
      targetEndVerseNumber = overrideEndVerse !== undefined ? overrideEndVerse : (effectiveEndVerse > effectiveStartVerse ? effectiveEndVerse : undefined);
    } else if (studyGuideScope === 'custom') {
      const sorted = [...customVerseNumbers].sort((a, b) => a - b);
      targetVerseNumber = sorted[0];
      targetEndVerseNumber = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;
      customPassageRef = `${currentBook} ${currentChapter}:${sorted.join(', ')}`;
    } else {
      // 'chapter' (default)
      targetVerseNumber = undefined;
      targetEndVerseNumber = undefined;
    }

    const isSamePassage = currentGuide?.passageRef === effectiveStudyGuideRef;
    const guide = generateStudyGuideContent(
      currentBook,
      currentChapter,
      targetVerseNumber,
      studyGuideTextToAnalyze,
      activeLens,
      studyGuideScope === 'verse' ? selectedVerse?.greekHebrew : undefined,
      isSamePassage ? currentGuide?.supportingPassages : undefined,
      audienceToUse,
      targetEndVerseNumber,
      customPassageRef
    );
    const updated = saveStudyGuide(guide);
    setSavedGuides(updated);
    setCurrentGuide(guide);
    confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } });
  };

  const handleAudienceChange = (newAudience: StudyGuideAudience) => {
    setSelectedAudience(newAudience);
    try {
      localStorage.setItem('berea_study_guide_audience', newAudience);
    } catch { }
    // Do NOT auto-generate; user clicks Generate when ready
  };

  const handleAddSupportingPassage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentGuide || !newPassageRefInput.trim()) return;
    const cleanRef = newPassageRefInput.trim();
    const parsed = parsePassageReference(cleanRef);

    let text = '';
    if (parsed) {
      try {
        setIsAddingPassage(true);
        const verses = await fetchChapterFromYouVersion(parsed.bookId, parsed.chapterNum, activeTranslation);
        if (parsed.verseNum) {
          const exact = verses.find(v => v.verseNumber === parsed.verseNum);
          if (exact) {
            text = exact.text[activeTranslation] || Object.values(exact.text)[0] || '';
          }
        }
      } catch (err) {
        console.warn('Could not fetch supporting verse text:', err);
      } finally {
        setIsAddingPassage(false);
      }
    }

    const newPassage: SupportingPassage = {
      ref: cleanRef,
      text: text || undefined,
      note: 'Cross-reference scripture'
    };

    const updated = addSupportingPassageToGuide(currentGuide, newPassage);
    setCurrentGuide(updated);
    setSavedGuides(getSavedStudyGuides());
    setNewPassageRefInput('');
  };

  const handleRemoveSupportingPassage = (refToRemove: string) => {
    if (!currentGuide) return;
    const updated = removeSupportingPassageFromGuide(currentGuide, refToRemove);
    setCurrentGuide(updated);
    setSavedGuides(getSavedStudyGuides());
  };

  const handleCopyGuide = async () => {
    if (!currentGuide) return;
    try {
      await navigator.clipboard.writeText(formatStudyGuideForClipboard(currentGuide));
      setGuideCopied(true);
      setTimeout(() => setGuideCopied(false), 2000);
    } catch { }
  };

  const handlePrintGuide = () => {
    if (!currentGuide) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const audienceLabel = currentGuide.audience === 'deep_exegesis'
      ? 'Pastoral & Deep Exegesis'
      : currentGuide.audience === 'youth_family'
        ? 'Youth & Family'
        : 'Small Group Discipleship';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Berea Study Guide - ${currentGuide.passageRef}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #26221F; line-height: 1.6; max-width: 760px; margin: 0 auto; }
            h1 { font-size: 24px; border-bottom: 2px solid #B4793D; padding-bottom: 8px; margin-bottom: 4px; }
            .meta { font-size: 13px; color: #78716C; margin-bottom: 24px; }
            h2 { font-size: 15px; color: #B4793D; margin-top: 24px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #EBE5DC; padding-bottom: 4px; }
            p { margin: 8px 0; font-size: 14px; white-space: pre-line; }
            ol { padding-left: 22px; }
            li { margin-bottom: 8px; font-size: 14px; }
            .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #EBE5DC; font-size: 12px; color: #A8A29E; }
          </style>
        </head>
        <body>
          <h1>Berea Study Guide: ${currentGuide.passageRef}</h1>
          <div class="meta">Tradition: ${activeDenom.name} · Depth: ${audienceLabel} · Created: ${new Date(currentGuide.createdAt).toLocaleDateString()}</div>
          <h2>Context Snapshot</h2>
          <div>${formatContextSnapshotForDisplay(currentGuide.contextSnapshot)
        .replace(/^### (.*)$/gm, '<h3 style="color:#B4793D; font-size:14px; margin:16px 0 6px; border-bottom:1px solid #EBE5DC; padding-bottom:3px;">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/^> (.*)$/gm, '<blockquote style="margin:8px 0; padding:6px 12px; border-left:3px solid #B4793D; background:#FAF7F2; font-style:italic; color:#57524E;">$1</blockquote>')}</div>
          ${currentGuide.supportingPassages && currentGuide.supportingPassages.length > 0 ? `
            <h2>Supporting Scriptures & Cross-References</h2>
            <ul style="padding-left: 20px;">
              ${currentGuide.supportingPassages.map(p => `<li style="margin-bottom: 8px;"><strong>${p.ref}</strong>${p.note ? ` <em>(${p.note})</em>` : ''}${p.text ? `<br/><span style="color:#57524E; font-size: 13px;">"${p.text}"</span>` : ''}</li>`).join('')}
            </ul>
          ` : ''}
          <h2>Icebreaker Questions</h2>
          <ol>${currentGuide.icebreakers.map(q => `<li>${q}</li>`).join('')}</ol>
          <h2>Deep Discussion Prompts</h2>
          <ol>${currentGuide.deepPrompts.map(q => `<li>${q}</li>`).join('')}</ol>
          <h2>Actionable Takeaway</h2>
          <p>${currentGuide.application}</p>
          <div class="footer">Berea — Removing Friction in Faith (Acts 17:11)</div>
          <script>window.print();<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDeleteGuide = (id: string) => {
    const updated = deleteStudyGuide(id);
    setSavedGuides(updated);
    if (currentGuide?.id === id) {
      setCurrentGuide(updated[0] || null);
    }
  };

  const isRangeActive = Boolean(selectedVerseRange && selectedVerseRange.start !== selectedVerseRange.end);
  const effectiveVNum = isRangeActive ? selectedVerseRange!.start : selectedVerse?.verseNumber;
  const effectiveEndVNum = isRangeActive ? selectedVerseRange!.end : undefined;
  const effectiveVText = isRangeActive ? combinedRangeText : currentVerseText;

  const insight = getTheologicalInsight(
    currentBook,
    currentChapter,
    effectiveVNum,
    effectiveVText,
    selectedVerse?.greekHebrew,
    effectiveEndVNum
  );

  // Historical Commentary State
  const [selectedCommentator, setSelectedCommentator] = useState<string>('');
  const [commentaryText, setCommentaryText] = useState<string>('');
  const [isCommentaryLoading, setIsCommentaryLoading] = useState<boolean>(false);
  const [commentaryError, setCommentaryError] = useState<string>('');
  const [isCommentaryVerbatim, setIsCommentaryVerbatim] = useState<boolean>(false);
  const [commentaryProgress, setCommentaryProgress] = useState<string>('');
  const [showFullCommentary, setShowFullCommentary] = useState<boolean>(false);

  const selectedCommentatorObj = useMemo(() => {
    return (DENOMINATION_COMMENTATORS[activeLens] || []).find(c => c.id === selectedCommentator);
  }, [activeLens, selectedCommentator]);

  const isCommentaryLong = commentaryText.length > 500;
  const commentarySummary = useMemo(() => {
    if (!isCommentaryLong || !commentaryText) return '';
    return summarizeCommentaryText(commentaryText, selectedCommentatorObj?.name);
  }, [commentaryText, isCommentaryLong, selectedCommentatorObj]);

  const commentaryWordCount = useMemo(() => {
    return commentaryText ? commentaryText.trim().split(/\s+/).length : 0;
  }, [commentaryText]);

  const handleGenerateCommentary = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const commentatorId = e.target.value;
    setSelectedCommentator(commentatorId);
    setShowFullCommentary(false);
    if (!commentatorId) {
      setCommentaryText('');
      setIsCommentaryVerbatim(false);
      return;
    }
    
    const activeCommentators = DENOMINATION_COMMENTATORS[activeLens] || [];
    const commentator = activeCommentators.find(c => c.id === commentatorId);
    if (!commentator) return;
    
    const cacheKey = `berea_persona_v4_${currentBook}_${currentChapter}_${isRangeActive ? `${selectedVerseRange!.start}_${selectedVerseRange!.end}` : activeVerseNum}_${commentatorId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setCommentaryText(cached);
      setIsCommentaryVerbatim(localStorage.getItem(`${cacheKey}_is_verbatim`) === 'true');
      return;
    }

    setIsCommentaryLoading(true);
    setCommentaryError('');
    setCommentaryText('');
    setIsCommentaryVerbatim(false);
    setCommentaryProgress('Searching verbatim historical database...');

    try {
      // 1. Query public domain database for authentic historical commentary
      const verbatim = await getVerbatimCommentary(
        commentator.id,
        commentator.name,
        commentator.description,
        commentator.century,
        currentBook,
        currentChapter,
        isRangeActive ? selectedVerseRange!.start : activeVerseNum,
        isRangeActive ? selectedVerseRange!.end : undefined
      );

      if (verbatim && verbatim.text) {
        setCommentaryText(verbatim.text);
        setIsCommentaryVerbatim(true);
        localStorage.setItem(cacheKey, verbatim.text);
        localStorage.setItem(`${cacheKey}_is_verbatim`, 'true');
        return;
      }

      // 2. Fall back to AI historical synthesis if verse is not covered in primary source
      const denomName = DENOMINATIONS.find(d => d.id === activeLens)?.name || activeLens;
      const result = await generateHistoricalCommentary(
        insight.passageRef,
        effectiveVText || wholeChapterText,
        commentator.name,
        denomName,
        (progress) => setCommentaryProgress(progress.text)
      );
      setCommentaryText(result);
      setIsCommentaryVerbatim(false);
      localStorage.setItem(cacheKey, result);
      localStorage.setItem(`${cacheKey}_is_verbatim`, 'false');
    } catch (err: any) {
      setCommentaryError(err.message || 'Failed to generate commentary.');
    } finally {
      setIsCommentaryLoading(false);
    }
  };

  const chapterData = useMemo(() => getChapterGeoData(currentBook, currentChapter), [currentBook, currentChapter]);
  const [selectedChapterEvent, setSelectedChapterEvent] = useState<ChapterGeoEvent | null>(null);

  useEffect(() => {
    setSelectedChapterEvent(null);
  }, [currentBook, currentChapter]);

  const currentEvent = selectedChapterEvent || chapterData.events[0];
  const currentEventIndex = chapterData.events.findIndex(e => e.id === currentEvent?.id);

  const currentLegInfo = useMemo(() => {
    if (!currentEvent || currentEventIndex <= 0 || !chapterData.events[currentEventIndex - 1]) return null;
    const prev = chapterData.events[currentEventIndex - 1];

    if (chapterData.routeSegments && chapterData.routeSegments.length > 0) {
      const segs = chapterData.routeSegments;
      let seg = segs[currentEventIndex - 1];
      if (!seg || !seg.toName.toLowerCase().includes(getShortPlaceName(currentEvent).toLowerCase())) {
        const found = segs.find(s =>
          s.toName.toLowerCase().includes(getShortPlaceName(currentEvent).toLowerCase()) ||
          currentEvent.locationName.toLowerCase().includes(s.toName.toLowerCase())
        );
        if (found) seg = found;
      }
      if (seg) {
        const daysLabel = seg.travelDays < 1 ? `${Math.round(seg.travelDays * 24)}h` : `~${seg.travelDays} ${seg.travelDays === 1 ? 'day' : 'days'}`;
        return {
          distanceMiles: seg.distanceMiles,
          daysLabel,
          roadName: seg.historicalRoadName,
          fromName: seg.fromName,
          mode: seg.mode
        };
      }
    }

    const miles = currentEvent.distanceFromPrevious || calculateDistanceMiles(prev.lat, prev.lng, currentEvent.lat, currentEvent.lng);
    if (miles > 0) {
      const estDays = Math.max(0.1, Number((miles / 20).toFixed(1)));
      const daysLabel = estDays < 1 ? `${Math.round(estDays * 24)}h` : `~${estDays} ${estDays === 1 ? 'day' : 'days'}`;
      return {
        distanceMiles: miles,
        daysLabel,
        fromName: getShortPlaceName(prev),
        mode: 'land_walking' as const
      };
    }
    return null;
  }, [currentEvent, currentEventIndex, chapterData]);

  // Retrieve official confessional documents for the active lens & passage
  const doctrinalMatches = searchDoctrinalCorpus(`${currentVerseRef} ${currentVerseText || ''}`, {
    lens: activeLens,
    book: currentBook,
    chapter: currentChapter,
    verseNumber: activeVerseNum,
    limit: 2
  });
  const activeDoctrinalSources = doctrinalMatches.map(m => m.entry);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || chatInput;
    if (!messageText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsAiThinking(true);
    setLocalModelProgress(null);

    try {
      const { text, ragEntries, primaryCitation, isLiveAi } = await askBereaAssistant(messageText, {
        book: currentBook,
        chapter: currentChapter,
        verseNumber: effectiveVNum,
        endVerseNumber: effectiveEndVNum,
        activeVerseRef: isRangeActive
          ? `${currentBook} ${currentChapter}:${selectedVerseRange!.start}–${selectedVerseRange!.end}`
          : currentVerseRef,
        verseText: effectiveVText,
        lens: activeLens,
        history: chatMessages,
        onProgress: (p) => setLocalModelProgress(p)
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lensUsed: activeLens,
        ragEntries,
        primaryCitation,
        isLiveAi
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiThinking(false);
      setLocalModelProgress(null);
    }
  };

  useEffect(() => {
    const handleTriggerChat = (e: any) => {
      const detail = e.detail;
      if (detail?.prompt) {
        setActiveTab('chat');
        if (detail.autoSend) {
          handleSendMessage(detail.prompt);
        } else {
          setChatInput(detail.prompt);
        }
      }
    };
    window.addEventListener('berea_trigger_chat', handleTriggerChat);
    return () => window.removeEventListener('berea_trigger_chat', handleTriggerChat);
  }, []);

  const handleClearChat = () => {
    setChatMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: DEFAULT_WELCOME_TEXT,
        timestamp: 'Just now'
      }
    ]);
  };

  const activeDenom = DENOMINATIONS.find(d => d.id === activeLens) || DENOMINATIONS[0];

  return (
    <div
      className="berea-ai-inspector flex flex-col h-full bg-white text-[#26221F] border border-[var(--clean-accent-border,#EBE5DC)] rounded-2xl overflow-hidden shadow-xs"
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Segmented Tab Capsule / Header */}
      <div
        className="p-1.5 px-2.5 border-b border-[var(--clean-accent-border,#EBE5DC)] flex items-center gap-1.5 select-none flex-shrink-0"
        style={{ backgroundColor: '#FFFFFF', color: '#26221F' }}
      >
        <div className="ios-segmented-capsule flex-1 flex overflow-x-auto gap-0.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[60px] ${activeTab === 'overview' ? 'active' : ''}`}
            title="Passage Overview"
          >
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('studyGuide')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[75px] ${activeTab === 'studyGuide' ? 'active' : ''}`}
            title="Study Guide Generator"
          >
            <BookOpenCheck className="w-3 h-3 shrink-0" />
            <span className="truncate">Study Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[65px] ${activeTab === 'chat' ? 'active' : ''}`}
            title="Ask AI Assistant"
          >
            <MessageSquare className="w-3 h-3 shrink-0" />
            <span className="truncate">Ask AI</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[60px] ${activeTab === 'map' ? 'active' : ''}`}
            title="Biblical Atlas"
          >
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">Atlas</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[60px] ${activeTab === 'quiz' ? 'active' : ''}`}
            title="Interactive Quiz"
          >
            <HelpCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">Quiz</span>
          </button>
          <button
            onClick={() => setActiveTab('symbolism')}
            className={`ios-segment-pill flex-1 shrink !text-[10.5px] !py-0.5 min-w-[75px] ${activeTab === 'symbolism' ? 'active' : ''}`}
            title="Symbolism & Typology"
          >
            <Feather className="w-3 h-3 shrink-0" />
            <span className="truncate">Symbolism</span>
          </button>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="ios-icon-btn !w-6 !h-6 text-xs text-[#78716C] hover:text-[#26221F] flex-shrink-0"
            title="Close Guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div
        className="flex-1 overflow-y-auto p-0 flex flex-col custom-scrollbar bg-white text-[#26221F]"
        style={{ backgroundColor: '#FFFFFF', color: '#26221F' }}
      >
        <div className="p-3 space-y-2.5 flex-1">
          {/* STUDY GUIDE TAB */}
        {activeTab === 'studyGuide' && (
          <div className="space-y-3 animate-fadeIn">
            {/* Mode Switch */}
            <div
              className="flex rounded-lg p-0.5 mb-2 border"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <button
                onClick={() => setStudyGuideMode('discussion')}
                className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
                style={{
                  backgroundColor: studyGuideMode === 'discussion' ? 'var(--clean-surface, #FFFFFF)' : 'transparent',
                  color: studyGuideMode === 'discussion' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-secondary, #78716C)',
                  boxShadow: studyGuideMode === 'discussion' ? '0 1px 3px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.15)' : 'none',
                  border: studyGuideMode === 'discussion' ? '1px solid var(--clean-accent-border-strong, #B4793D)' : '1px solid transparent'
                }}
              >
                Discussion Guide
              </button>
              <button
                onClick={() => setStudyGuideMode('typology')}
                className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
                style={{
                  backgroundColor: studyGuideMode === 'typology' ? 'var(--clean-surface, #FFFFFF)' : 'transparent',
                  color: studyGuideMode === 'typology' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-secondary, #78716C)',
                  boxShadow: studyGuideMode === 'typology' ? '0 1px 3px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.15)' : 'none',
                  border: studyGuideMode === 'typology' ? '1px solid var(--clean-accent-border-strong, #B4793D)' : '1px solid transparent'
                }}
              >
                Typology Tracker
              </button>
            </div>

            {studyGuideMode === 'discussion' && (
              <>
            {/* 1. Audience / Depth Selector Bar */}
            <div
              className="p-2.5 rounded-xl border shadow-xs space-y-2"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <div className="flex items-center justify-between px-1">
                <span
                  className="text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                >
                  <Sliders className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                  Study Guide Depth
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowSavedGuidesDrawer(!showSavedGuidesDrawer)}
                    className="ios-glass-btn !text-[10px] !py-0.5 !px-2"
                    style={{
                      borderColor: showSavedGuidesDrawer ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-accent-dark, #8C5E2E)'
                    }}
                    title="View Saved Study Guides"
                  >
                    <History className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    <span>Saved</span>
                    <span
                      className="text-[9px] font-bold px-1 rounded-full bg-white border"
                      style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                    >
                      {savedGuides.length}
                    </span>
                  </button>
                  <span
                    className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-full border"
                    style={{
                      color: 'var(--clean-accent-dark, #8C5E2E)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    {selectedAudience === 'deep_exegesis' ? 'Pastoral & Exegetical' : selectedAudience === 'youth_family' ? 'Youth & Family' : 'Small Group'}
                  </span>
                </div>
              </div>

              {/* Segmented Audience Control */}
              <div
                className="flex rounded-lg p-0.5 gap-0.5 border"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAudienceChange('small_group')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${selectedAudience === 'small_group'
                    ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                    : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                  title="Practical small group discussion, fellowship, and personal application"
                >
                  <Users className="w-3.5 h-3.5" style={{ color: selectedAudience === 'small_group' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                  <span>Small Group</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAudienceChange('deep_exegesis')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${selectedAudience === 'deep_exegesis'
                    ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                    : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                  title="Pastoral exegesis, linguistic grammar, confessional dogmatics, and historical setting"
                >
                  <GraduationCap className="w-3.5 h-3.5" style={{ color: selectedAudience === 'deep_exegesis' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                  <span>Deep Exegesis</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAudienceChange('youth_family')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${selectedAudience === 'youth_family'
                    ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                    : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                  title="Engaging storytelling, real-world scenarios, and family discussion prompts"
                >
                  <Baby className="w-3.5 h-3.5" style={{ color: selectedAudience === 'youth_family' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                  <span>Youth & Family</span>
                </button>
              </div>

              {/* Passage Scope & Verse Range Controls */}
              <div
                className="pt-2 border-t space-y-2"
                style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                  >
                    <Layers className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    Passage Scope
                  </span>
                  <span
                    className="text-[11px] font-mono font-bold bg-white px-2 py-0.5 rounded-full border"
                    style={{
                      color: 'var(--clean-accent-dark, #8C5E2E)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    {effectiveStudyGuideRef}
                  </span>
                </div>

                {/* 4-Option Segmented Control: Whole Chapter vs Individual Verse vs Verse Range vs Specific Verses */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 rounded-lg p-0.5 gap-0.5 border"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setStudyGuideScope('chapter')}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${studyGuideScope === 'chapter'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                      }`}
                    title="Default: Complete chapter study guide"
                  >
                    <BookOpen className="w-3 h-3" style={{ color: studyGuideScope === 'chapter' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                    <span className="truncate">Whole Chapter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyGuideScope('verse')}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${studyGuideScope === 'verse'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                      }`}
                    title="Focus on an individual verse"
                  >
                    <FileText className="w-3 h-3" style={{ color: studyGuideScope === 'verse' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                    <span className="truncate">Single Verse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudyGuideScope('range');
                      if (endVerseNum <= manualStartVerseNum) {
                        setEndVerseNum(Math.min(manualStartVerseNum + 1, maxChapterVerses));
                      }
                    }}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${studyGuideScope === 'range'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                      }`}
                    title="Custom verse range"
                  >
                    <Layers className="w-3 h-3" style={{ color: studyGuideScope === 'range' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                    <span className="truncate">Verse Range</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyGuideScope('custom')}
                    className="py-1.5 px-1.5 rounded-md text-[10.5px] transition-all flex items-center justify-center gap-1 border hover:bg-white/50"
                    style={{
                      backgroundColor: studyGuideScope === 'custom' ? 'var(--clean-surface, #FFFFFF)' : 'transparent',
                      borderColor: studyGuideScope === 'custom' ? 'var(--clean-accent-border-strong, #B4793D)' : 'transparent',
                      color: studyGuideScope === 'custom' ? 'var(--clean-accent-dark, #26221F)' : 'var(--clean-text-primary, #26221F)',
                      fontWeight: studyGuideScope === 'custom' ? 700 : 600,
                      boxShadow: studyGuideScope === 'custom' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                    }}
                    title="Pick custom verses (e.g. 1, 12, 23)"
                  >
                    <ListFilter className="w-3 h-3" style={{ color: studyGuideScope === 'custom' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-dark, #8C5E2E)' }} />
                    <span className="truncate">Pick Verses</span>
                  </button>
                </div>

                {/* Scope Specific Configuration */}
                {studyGuideScope === 'chapter' && (
                  <div
                    className="flex items-center justify-between p-2 rounded-lg bg-white/90 border"
                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs text-[#57524E] font-medium">Complete chapter study guide (Default)</span>
                    </div>
                    <span
                      className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border"
                      style={{
                        color: 'var(--clean-accent-dark, #8C5E2E)',
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      {chapterVerses?.length || 0} verses
                    </span>
                  </div>
                )}

                {studyGuideScope === 'verse' && (
                  <div
                    className="flex items-center justify-between p-2 rounded-lg bg-white/90 border"
                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <span className="text-xs text-[#57524E] font-medium">Select Passage Verse:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#78716C]">{currentBook} {currentChapter}:</span>
                      <select
                        value={manualStartVerseNum}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setManualStartVerseNum(val);
                        }}
                        className="text-xs font-bold text-[#26221F] bg-white border rounded-md px-2 py-1 focus:outline-none shadow-2xs cursor-pointer"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        {Array.from({ length: maxChapterVerses }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            Verse {num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {studyGuideScope === 'range' && (
                  <div
                    className="flex items-center justify-between p-2 rounded-lg bg-white/90 border gap-2"
                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-[#78716C]">From:</span>
                      <select
                        value={manualStartVerseNum}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setManualStartVerseNum(val);
                          if (endVerseNum < val) {
                            setEndVerseNum(val);
                          }
                        }}
                        className="text-xs font-bold text-[#26221F] bg-white border rounded-md px-2 py-1 focus:outline-none shadow-2xs cursor-pointer"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        {Array.from({ length: maxChapterVerses }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            v.{num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-[#78716C]">Through:</span>
                      <select
                        value={effectiveEndVerse}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEndVerseNum(val);
                        }}
                        className="text-xs font-bold text-[#26221F] bg-white border rounded-md px-2 py-1 focus:outline-none shadow-2xs cursor-pointer"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        {Array.from({ length: Math.max(1, maxChapterVerses - manualStartVerseNum + 1) }, (_, i) => manualStartVerseNum + i).map(num => (
                          <option key={num} value={num}>
                            v.{num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {studyGuideScope === 'custom' && (
                  <div
                    className="p-2.5 rounded-lg bg-white/90 border space-y-2"
                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-[#57524E] font-medium">
                        Type or tap verses:
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-[#78716C]">{currentBook} {currentChapter}:</span>
                        <input
                          type="text"
                          value={customVerseInput}
                          onChange={(e) => handleCustomVerseInputChange(e.target.value)}
                          placeholder="e.g. 1, 12, 23"
                          className="w-28 text-xs font-bold font-mono text-[#26221F] bg-white border rounded-lg px-2.5 py-1 focus:outline-none shadow-2xs"
                          style={{ border: '1px solid var(--clean-accent-border, #EBE5DC)', outline: 'none' }}
                        />
                        {customVerseNumbers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setCustomVerseNumbers([]);
                              setCustomVerseInput('');
                            }}
                            className="text-[10px] text-[#A8A29E] hover:text-[var(--clean-accent-caramel,#B4793D)] px-1 py-0.5 rounded"
                            title="Clear selection"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick tap chips for chapter verses */}
                    <div
                      className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar p-1 rounded-md border"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      {Array.from({ length: maxChapterVerses }, (_, i) => i + 1).map((vNum) => {
                        const isPicked = customVerseNumbers.includes(vNum);
                        return (
                          <button
                            key={vNum}
                            type="button"
                            onClick={() => toggleCustomVerseNumber(vNum)}
                            className={`w-6 h-6 rounded text-[10px] font-mono font-semibold transition-all flex items-center justify-center border ${isPicked
                                ? 'text-white shadow-2xs'
                                : 'bg-white text-[#78716C] hover:text-[#26221F]'
                              }`}
                            style={isPicked ? {
                              backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                              borderColor: 'var(--clean-accent-border-strong, #B4793D)'
                            } : {
                              borderColor: 'var(--clean-accent-border, #EBE5DC)'
                            }}
                            title={`Toggle verse ${vNum}`}
                          >
                            {vNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="text-[10.5px] text-[#78716C] px-0.5">
                      {customVerseNumbers.length === 0
                        ? 'No verses selected (click chips or enter comma-separated numbers)'
                        : `${customVerseNumbers.length} verse${customVerseNumbers.length > 1 ? 's' : ''} selected: v.${[...customVerseNumbers].sort((a, b) => a - b).join(', ')}`}
                    </div>
                  </div>
                )}
              </div>
            </div>


            {/* Saved Guides Drawer */}
            {showSavedGuidesDrawer && (
              <div
                className="p-3 rounded-xl border space-y-2 animate-fadeIn shadow-2xs"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"
                    style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                  >
                    <History className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    Saved Study Guides ({savedGuides.length})
                  </span>
                  <button
                    onClick={() => setShowSavedGuidesDrawer(false)}
                    className="ios-icon-btn !w-5 !h-5 text-[10px]"
                  >
                    ✕
                  </button>
                </div>

                {savedGuides.length === 0 ? (
                  <p className="text-xs text-[#A8A29E] italic py-2 text-center">No saved guides yet. Click Generate to create one!</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {savedGuides.map((g) => {
                      const isSelected = currentGuide?.id === g.id;
                      return (
                        <div
                          key={g.id}
                          onClick={() => {
                            setCurrentGuide(g);
                            setShowSavedGuidesDrawer(false);
                          }}
                          className="p-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-all border"
                          style={isSelected ? {
                            backgroundColor: '#FFFFFF',
                            borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                            color: '#26221F'
                          } : {
                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                            borderColor: 'var(--clean-accent-border, #EBE5DC)',
                            color: '#57524E'
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-[#26221F]">{g.passageRef}</span>
                              <span
                                className="text-[9px] font-medium leading-none px-1.5 py-0.5 rounded-full border inline-flex items-center gap-1"
                                style={{
                                  backgroundColor: 'var(--clean-highlight-cream, #FAF0E1)',
                                  color: 'var(--clean-accent-dark, #B4793D)',
                                  borderColor: 'var(--clean-accent-border, #D4A373)'
                                }}
                              >
                                {g.audience === 'deep_exegesis' ? (
                                  <>
                                    <GraduationCap className="w-2 h-2 shrink-0" />
                                    <span>Exegesis</span>
                                  </>
                                ) : g.audience === 'youth_family' ? (
                                  <>
                                    <Baby className="w-2 h-2 shrink-0" />
                                    <span>Youth</span>
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-2 h-2 shrink-0" />
                                    <span>Small Group</span>
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="text-[10px] text-[#A8A29E] mt-0.5">
                              {new Date(g.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGuide(g.id);
                            }}
                            className="text-[#A8A29E] hover:text-red-600 p-1 rounded transition-colors"
                            title="Delete guide"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Current Study Guide Content / Empty State */}
            {currentGuide ? (
              <div className="space-y-2.5">
                {/* Guide Meta Bar: Reference + Audience Level + Confession */}
                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-[#26221F] text-xs">{currentGuide.passageRef}</span>
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF0E1)',
                        color: 'var(--clean-accent-dark, #B4793D)',
                        borderColor: 'var(--clean-accent-border, #D4A373)'
                      }}
                    >
                      {currentGuide.audience === 'deep_exegesis' ? (
                        <>
                          <GraduationCap className="w-3 h-3" />
                          Deep Exegesis
                        </>
                      ) : currentGuide.audience === 'youth_family' ? (
                        <>
                          <Baby className="w-3 h-3" />
                          Youth & Family
                        </>
                      ) : (
                        <>
                          <Users className="w-3 h-3" />
                          Small Group
                        </>
                      )}
                    </span>
                    {currentGuide.confessionCited && (
                      <span
                        className="text-[9.5px] px-1.5 py-0.5 rounded border truncate max-w-[200px]"
                        style={{
                          backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                          color: 'var(--clean-accent-dark, #78716C)',
                          borderColor: 'var(--clean-accent-border, #EBE5DC)'
                        }}
                        title={currentGuide.confessionCited}
                      >
                        {currentGuide.confessionCited}
                      </span>
                    )}
                  </div>
                </div>

                {/* Original Language Badge */}
                {currentGuide.originalLanguageNote && (
                  <div
                    className="p-2.5 rounded-xl border shadow-2xs"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <div
                      className="text-[10px] text-[#57524E] flex items-center gap-1 bg-white p-1.5 rounded-lg border"
                      style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                    >
                      <span
                        className="font-bold font-mono"
                        style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                      >
                        Original Language:
                      </span>
                      <span className="truncate">{currentGuide.originalLanguageNote}</span>
                    </div>
                  </div>
                )}

                {/* 1. Context Snapshot Accordion */}
                <div
                  className="rounded-xl border overflow-hidden shadow-2xs"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <button
                    onClick={() => toggleSection('context')}
                    className="w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-b"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                    >
                      <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      Context Snapshot
                    </span>
                    {openSections.context ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.context && (
                    <div className="p-3.5 bg-white text-xs text-[#44403C] leading-relaxed">
                      <MarkdownTheologyRenderer content={formatContextSnapshotForDisplay(currentGuide.contextSnapshot)} />
                    </div>
                  )}
                </div>

                {/* 2. Supporting Passages & Cross-References Accordion */}
                <div
                  className="rounded-xl border overflow-hidden shadow-2xs"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <button
                    onClick={() => toggleSection('supportingPassages')}
                    className="w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-b"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                    >
                      <Bookmark className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      Supporting Passages {currentGuide.supportingPassages && currentGuide.supportingPassages.length > 0 ? `(${currentGuide.supportingPassages.length})` : ''}
                    </span>
                    {openSections.supportingPassages ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.supportingPassages && (
                    <div className="p-3 bg-white space-y-2.5">
                      {/* List of supporting passages */}
                      {currentGuide.supportingPassages && currentGuide.supportingPassages.length > 0 ? (
                        <div className="space-y-2">
                          {currentGuide.supportingPassages.map((p, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-lg border space-y-1 text-xs"
                              style={{
                                backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                                borderColor: 'var(--clean-accent-border, #EBE5DC)'
                              }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span
                                  className="font-bold font-mono"
                                  style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                                >
                                  {p.ref}
                                </span>
                                <button
                                  onClick={() => handleRemoveSupportingPassage(p.ref)}
                                  className="text-[#A8A29E] hover:text-red-600 p-0.5 rounded transition-colors"
                                  title={`Remove ${p.ref}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                              {p.note && (
                                <p className="text-[11px] font-medium text-[#78716C] italic">{p.note}</p>
                              )}
                              {p.text && (
                                <p
                                  className="text-[11.5px] text-[#44403C] leading-relaxed pl-2 border-l-2"
                                  style={{ borderLeftColor: 'var(--clean-accent-border-strong, #D4A373)' }}
                                >
                                  "{p.text}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[#A8A29E] italic text-center py-1">No supporting passages added yet.</p>
                      )}

                      {/* Add new supporting passage form */}
                      <form onSubmit={handleAddSupportingPassage} className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={newPassageRefInput}
                          onChange={(e) => setNewPassageRefInput(e.target.value)}
                          placeholder="Add passage (e.g. Malachi 4:5, Matt 11:14)..."
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border text-[#26221F] placeholder:text-[#A8A29E] focus:outline-none"
                          style={{
                            backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                            border: '1px solid var(--clean-accent-border, #EBE5DC)',
                            outline: 'none'
                          }}
                        />
                        <button
                          type="submit"
                          disabled={!newPassageRefInput.trim() || isAddingPassage}
                          className="ios-glass-btn !text-xs !py-1.5 !px-2.5 bg-white font-medium border disabled:opacity-50"
                          style={{
                            color: 'var(--clean-accent-dark, #8C5E2E)',
                            borderColor: 'var(--clean-accent-border, #EBE5DC)'
                          }}
                        >
                          {isAddingPassage ? 'Adding...' : '+ Add'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* 3. Icebreaker Questions Accordion */}
                <div
                  className="rounded-xl border overflow-hidden shadow-2xs"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <button
                    onClick={() => toggleSection('icebreakers')}
                    className="w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-b"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                    >
                      <MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      Icebreaker Questions (2)
                    </span>
                    {openSections.icebreakers ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.icebreakers && (
                    <div className="p-3 bg-white space-y-2">
                      {currentGuide.icebreakers.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border text-xs text-[#38332E] flex items-start gap-2"
                          style={{
                            backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                            borderColor: 'var(--clean-accent-border, #EBE5DC)'
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            style={{
                              backgroundColor: 'var(--clean-highlight-cream, #FAF0E1)',
                              color: 'var(--clean-accent-dark, #B4793D)',
                              borderColor: 'var(--clean-accent-border, #D4A373)'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Deep Discussion Prompts Accordion */}
                <div
                  className="rounded-xl border overflow-hidden shadow-2xs"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <button
                    onClick={() => toggleSection('deepPrompts')}
                    className="w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-b"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                    >
                      <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      Deep Discussion Prompts (3)
                    </span>
                    {openSections.deepPrompts ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.deepPrompts && (
                    <div className="p-3 bg-white space-y-2">
                      {currentGuide.deepPrompts.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border text-xs text-[#38332E] flex items-start gap-2"
                          style={{
                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                            borderColor: 'var(--clean-accent-border, #EBE5DC)'
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 border"
                            style={{
                              backgroundColor: 'var(--clean-highlight-cream, #FAF0E1)',
                              color: 'var(--clean-accent-dark, #B4793D)',
                              borderColor: 'var(--clean-accent-border, #D4A373)'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Actionable Takeaway Accordion */}
                <div
                  className="rounded-xl border overflow-hidden shadow-2xs"
                  style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                >
                  <button
                    onClick={() => toggleSection('application')}
                    className="w-full px-3 py-2 flex items-center justify-between text-left transition-colors border-b"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                      borderBottomColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                    >
                      <Check className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      Actionable Takeaway
                    </span>
                    {openSections.application ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.application && (
                    <div className="p-3 bg-white text-xs text-[#44403C] leading-relaxed">
                      {currentGuide.application}
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div
                  className="p-2 rounded-xl border flex items-center justify-between gap-1.5"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <button
                    onClick={handleCopyGuide}
                    className="ios-glass-btn text-xs !py-1 !px-2.5 text-[#57524E] hover:text-[#26221F] flex items-center gap-1"
                    title="Copy formatted guide to clipboard"
                  >
                    {guideCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Guide</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleGenerateStudyGuide()}
                      className="ios-glass-btn text-xs !py-1 !px-2 text-[#57524E] hover:text-[#26221F] flex items-center gap-1"
                      title="Regenerate guide"
                    >
                      <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      <span>Regenerate</span>
                    </button>

                    <button
                      onClick={handlePrintGuide}
                      className="ios-glass-btn text-xs !py-1 !px-2 text-[#57524E] hover:text-[#26221F] flex items-center gap-1"
                      title="Print or Export as PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={() => handleDeleteGuide(currentGuide.id)}
                      className="ios-icon-btn !w-7 !h-7 text-xs text-[#A8A29E] hover:text-red-600 hover:bg-red-50"
                      title="Delete this study guide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div
                className="p-6 rounded-2xl border text-center space-y-3"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl bg-white border flex items-center justify-center mx-auto shadow-xs"
                  style={{
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-caramel, #B4793D)'
                  }}
                >
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className="font-serif text-sm font-bold"
                    style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                  >
                    Study Guide Generator
                  </h4>
                  <p className="text-xs text-[#78716C] max-w-xs mx-auto mt-1">
                    Generate an organized discussion guide with context, icebreakers, deep theological prompts, and application for <strong className="text-[#26221F]">{effectiveStudyGuideRef}</strong>.
                  </p>
                </div>
                <button
                  onClick={() => handleGenerateStudyGuide()}
                  className="clean-caramel-btn !py-1.5 !px-4 text-xs mx-auto shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-100 fill-amber-100" />
                  <span>Generate Study Guide for {effectiveStudyGuideRef}</span>
                </button>
              </div>
            )}
            </>
            )}

            {studyGuideMode === 'typology' && (
              <div
                className="rounded-xl border overflow-hidden flex-1 flex flex-col min-h-[400px] shadow-xs"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                <TypologyPanel
                  currentBook={currentBook}
                  currentChapter={currentChapter}
                  chapterText={wholeChapterText}
                  onNavigateToPassage={onNavigateToPassage}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div key={`${currentBook}_${currentChapter}_${isRangeActive ? `${selectedVerseRange!.start}_${selectedVerseRange!.end}` : activeVerseNum}`} className="space-y-2.5 animate-fadeIn">
            <VerseOfTheDay 
              activeTranslation={activeTranslation} 
              activeLens={activeLens}
              onNavigateToPassage={onNavigateToPassage || (() => {})} 
            />
            {/* Main Overview Card */}
            <div
              className="p-3 rounded-xl border space-y-2 shadow-xs"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                borderLeftWidth: '4px',
                borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                  style={{ color: 'var(--clean-accent-dark, #854D0E)' }}
                >
                  <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-dark, #854D0E)' }} />
                  Theological Synthesis
                </span>
                <span
                  className="text-[9.5px] font-bold bg-white px-2 py-0.5 rounded-full border shadow-2xs"
                  style={{
                    color: 'var(--clean-accent-dark, #854D0E)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  {insight.passageRef} {isRangeActive && `(${selectedVerseRange!.end - selectedVerseRange!.start + 1} verses)`}
                </span>
              </div>

              <p className="text-xs font-normal leading-relaxed text-[#26221F]">
                {insight.conciseOverview}
              </p>

              {/* Lens Perspective */}
              <div
                className="p-2 rounded-lg bg-white border text-xs space-y-0.5"
                style={{
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  borderLeftWidth: '3px',
                  borderLeftColor: activeDenom.accentColor
                }}
              >
                <span className="font-semibold text-[10.5px] flex items-center gap-1.5" style={{ color: activeDenom.accentColor }}>
                  <span className="text-xs">{activeDenom.icon}</span>
                  {activeDenom.name} Perspective
                </span>
                <p className="text-[#57524E] text-[11px] leading-normal">
                  {insight.lensPerspectives[activeLens] || Object.values(insight.lensPerspectives)[0] || ''}
                </p>
              </div>
            </div>

            {/* Official Confessional Standard (Genuine Confessional Standards only) */}
            {(() => {
              const confessionalSource = activeDoctrinalSources.find(
                s => !s.id?.startsWith('apologetics-') && !s.keywords?.includes('Apologetics') && !s.documentTitle?.startsWith('Christian Apologetics')
              );
              if (!confessionalSource) return null;

              const sourceKey = confessionalSource.id || `${confessionalSource.documentTitle}_${confessionalSource.citation}`;
              const isExpanded = Boolean(expandedDoctrinalEntries[sourceKey]);
              const rawCore = confessionalSource.coreDoctrine || '';
              const fullText = confessionalSource.fullExcerpt || rawCore;
              const hasLongerExcerpt = Boolean(confessionalSource.fullExcerpt && confessionalSource.fullExcerpt.trim().length > rawCore.trim().length);
              const endsWithEllipsis = rawCore.trim().endsWith('...') || rawCore.trim().endsWith('…');
              const canExpand = hasLongerExcerpt || endsWithEllipsis;
              const displayText = isExpanded ? fullText : rawCore;

              return (
                <div
                  className="p-2.5 rounded-xl border space-y-1.5 text-xs animate-fadeIn shadow-2xs"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--clean-accent-border, #DCF0E2)',
                    borderLeftWidth: '4px',
                    borderLeftColor: 'var(--clean-accent-caramel, #059669)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Official Confessional Standard ({activeDenom.traditionGroup})
                    </span>
                    <span className="text-[9px] font-mono text-emerald-900 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                      {confessionalSource.citation}
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      if (canExpand) {
                        setExpandedDoctrinalEntries(prev => ({
                          ...prev,
                          [sourceKey]: !prev[sourceKey]
                        }));
                      }
                    }}
                    className={`p-2 rounded-lg bg-white border border-[var(--clean-accent-border,#DCF0E2)] space-y-1 transition-all select-text ${
                      canExpand ? 'cursor-pointer hover:bg-emerald-50/40 group' : ''
                    }`}
                    title={canExpand ? (isExpanded ? "Click to collapse" : "Click to view full unabridged text") : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[11px] text-[#26221F]">
                        {confessionalSource.documentTitle}
                      </div>
                      {canExpand && (
                        <span className="text-[9.5px] font-semibold text-emerald-700 group-hover:text-emerald-900 inline-flex items-center gap-0.5">
                          {isExpanded ? '▲ Collapse' : '▼ Read full text'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#57524E] leading-relaxed italic">
                      "{displayText}"
                    </p>
                    {canExpand && !isExpanded && (
                      <div className="text-[9.5px] font-medium text-emerald-600/90 group-hover:text-emerald-800 flex items-center gap-1">
                        <span>(Click to expand full text)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Apologetics & Historical Defenses */}
            {(() => {
              const apologeticSource = activeDoctrinalSources.find(
                s => s.id?.startsWith('apologetics-') || s.keywords?.includes('Apologetics') || s.documentTitle?.startsWith('Christian Apologetics')
              );
              if (!apologeticSource) return null;

              const sourceKey = apologeticSource.id || `${apologeticSource.documentTitle}_${apologeticSource.citation}`;
              const isExpanded = Boolean(expandedDoctrinalEntries[sourceKey]);
              const rawCore = apologeticSource.coreDoctrine || '';
              const fullText = apologeticSource.fullExcerpt || rawCore;
              const hasLongerExcerpt = Boolean(apologeticSource.fullExcerpt && apologeticSource.fullExcerpt.trim().length > rawCore.trim().length);
              const endsWithEllipsis = rawCore.trim().endsWith('...') || rawCore.trim().endsWith('…');
              const canExpand = hasLongerExcerpt || endsWithEllipsis;
              const displayText = isExpanded ? fullText : rawCore;

              return (
                <div
                  className="p-2.5 rounded-xl border space-y-1.5 text-xs animate-fadeIn shadow-2xs"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    borderLeftWidth: '4px',
                    borderLeftColor: 'var(--clean-accent-caramel, #B4793D)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-bold text-[#8C5E32] uppercase tracking-wider flex items-center gap-1">
                      <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
                      Apologetics &amp; Historical Defenses
                    </span>
                    <span className="text-[9px] font-mono text-[#78716C] bg-white px-1.5 py-0.2 rounded border border-[#EBE5DC]">
                      {apologeticSource.citation}
                    </span>
                  </div>
                  <div
                    onClick={() => {
                      if (canExpand) {
                        setExpandedDoctrinalEntries(prev => ({
                          ...prev,
                          [sourceKey]: !prev[sourceKey]
                        }));
                      }
                    }}
                    className={`p-2 rounded-lg bg-white border border-[var(--clean-accent-border,#EBE5DC)] space-y-1 transition-all select-text ${
                      canExpand ? 'cursor-pointer hover:bg-stone-50 group' : ''
                    }`}
                    title={canExpand ? (isExpanded ? "Click to collapse" : "Click to view full unabridged text") : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-[11px] text-[#26221F]">
                        {apologeticSource.documentTitle.replace(/^Christian Apologetics:\s*/, '')}
                      </div>
                      {canExpand && (
                        <span className="text-[9.5px] font-semibold text-[#B4793D] group-hover:text-[#8C5E32] inline-flex items-center gap-0.5">
                          {isExpanded ? '▲ Collapse' : '▼ Read full text'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-[#57524E] leading-relaxed italic">
                      "{displayText}"
                    </p>
                    {canExpand && !isExpanded && (
                      <div className="text-[9.5px] font-medium text-[#B4793D] group-hover:text-[#8C5E32] flex items-center gap-1">
                        <span>(Click to expand full text)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Original Language Nuance */}
            {insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0 && (
              <div
                className="p-3 rounded-xl border space-y-2 text-xs shadow-xs"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  borderLeftWidth: '4px',
                  borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: 'var(--clean-accent-dark, #854D0E)' }}
                  >
                    <Languages className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                    Original Greek / Hebrew Exegesis
                  </span>
                  <span
                    className="text-[9.5px] font-mono px-1.5 py-0.2 rounded font-semibold border shadow-2xs"
                    style={{
                      backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                      borderColor: 'var(--clean-accent-border, #EBE5DC)',
                      color: 'var(--clean-accent-dark, #854D0E)'
                    }}
                  >
                    {insight.originalLanguageInsights.length} Terms
                  </span>
                </div>

                <div className="space-y-1.5">
                  {insight.originalLanguageInsights.map((term, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg border text-xs space-y-1"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span
                          className="font-bold text-xs"
                          style={{ color: 'var(--clean-accent-dark, #B4793D)' }}
                        >
                          {term.term}
                        </span>
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                        >
                          {term.originalScript} ({term.transliteration})
                        </span>
                      </div>
                      <p
                        className="text-[11px] leading-relaxed"
                        style={{ color: 'var(--clean-text-secondary, #57524E)' }}
                      >
                        {term.nuance}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Practical Application */}
            <div
              className="p-2.5 rounded-lg bg-white border text-xs shadow-2xs"
              style={{
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                borderLeftWidth: '3px',
                borderLeftColor: 'var(--clean-accent-border-strong, #B4793D)'
              }}
            >
              <span className="font-bold block mb-0.5 text-[11px]" style={{ color: 'var(--clean-accent-dark, #854D0E)' }}>Daily Spiritual Reflection</span>
              <p className="text-[#57524E] leading-relaxed text-[11px]">{insight.practicalApplication}</p>
            </div>

            {/* Historical Commentary & Quotes */}
            <div
              className="space-y-1.5 p-2.5 rounded-xl border shadow-xs"
              style={{
                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                >
                  <BookOpen className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                  Historical Commentary & Quotes
                </span>
              </div>
              <select
                value={selectedCommentator}
                onChange={handleGenerateCommentary}
                className="w-full p-2 text-xs rounded-lg outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--clean-highlight-cream, #FAF9F6)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                  color: 'var(--clean-text-primary, #26221F)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <option value="">Select a Commentator...</option>
                {(DENOMINATION_COMMENTATORS[activeLens] || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.description})
                  </option>
                ))}
              </select>

              {isCommentaryLoading && (
                <div className="flex flex-col items-center justify-center py-4 opacity-70 animate-pulse">
                  <div
                    className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mb-2"
                    style={{
                      borderColor: 'var(--clean-accent-caramel, #B4793D)',
                      borderTopColor: 'transparent'
                    }}
                  />
                  <p className="text-[10px] font-medium" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                    {commentaryProgress || 'Searching historical writings...'}
                  </p>
                </div>
              )}

              {commentaryError && (
                <p className="text-[10px] text-red-500 text-center py-2">{commentaryError}</p>
              )}

              {!isCommentaryLoading && commentaryText && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                      style={
                        isCommentaryVerbatim
                          ? { backgroundColor: '#EBF5EE', color: '#1E6B37', borderColor: '#CDE5D4' }
                          : {
                              backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                              color: 'var(--clean-accent-dark, #8B5E34)',
                              borderColor: 'var(--clean-accent-border, #E8DEC8)'
                            }
                      }
                    >
                      {isCommentaryVerbatim ? '📜 Authentic Historical Text' : '✨ AI Contextual Exegesis'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isCommentaryLong && (
                        <div
                          className="flex items-center p-0.5 rounded-md border"
                          style={{
                            backgroundColor: 'var(--clean-surface-subtle, #F3EFEA)',
                            borderColor: 'var(--clean-accent-border, #EBE5DC)'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setShowFullCommentary(false)}
                            className="text-[9.5px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                            style={
                              !showFullCommentary
                                ? {
                                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                    color: 'var(--clean-accent-dark, #8C5E2E)',
                                    fontWeight: 600,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                  }
                                : {
                                    color: 'var(--clean-text-secondary, #78716C)'
                                  }
                            }
                          >
                            Summary
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowFullCommentary(true)}
                            className="text-[9.5px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                            style={
                              showFullCommentary
                                ? {
                                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                    color: 'var(--clean-accent-dark, #8C5E2E)',
                                    fontWeight: 600,
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                  }
                                : {
                                    color: 'var(--clean-text-secondary, #78716C)'
                                  }
                            }
                          >
                            Full Statement
                          </button>
                        </div>
                      )}
                      <span className="text-[9.5px] text-[#A8A29E]">
                        {selectedCommentatorObj?.century}
                      </span>
                    </div>
                  </div>

                  {isCommentaryLong && !showFullCommentary ? (
                    <div
                      className="p-3 rounded-lg border text-xs space-y-2"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      <div
                        className="flex items-center gap-1.5 pb-1.5 border-b"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                        <span
                          className="text-[10.5px] font-bold uppercase tracking-wider"
                          style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                        >
                          Executive Summary
                        </span>
                        <span className="text-[9.5px] text-[#A8A29E] ml-auto">
                          {commentaryWordCount} words unabridged
                        </span>
                      </div>
                      <div className="prose prose-sm prose-slate max-w-none text-[11px] leading-relaxed text-[#3D3834]">
                        <MarkdownTheologyRenderer content={commentarySummary} />
                      </div>
                      <div
                        className="mt-2.5 pt-2 border-t flex items-center justify-between"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        <span className="text-[10px] text-[#78716C]">
                          Want the complete commentary?
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullCommentary(true)}
                          className="text-[11px] font-bold flex items-center gap-1 hover:underline transition-colors cursor-pointer"
                          style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                        >
                          <span>Read Full Statement ({commentaryWordCount} words)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-lg border text-xs max-h-[380px] overflow-y-auto"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF7F2)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      {isCommentaryLong && (
                        <div
                          className="flex items-center justify-between pb-1.5 mb-2 border-b"
                          style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                        >
                          <span className="text-[10px] font-semibold text-[#78716C]">
                            Full Unabridged Statement ({commentaryWordCount} words)
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowFullCommentary(false)}
                            className="text-[10.5px] font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                            style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                          >
                            <span>← Show Summary</span>
                          </button>
                        </div>
                      )}
                      <div className="prose prose-sm prose-slate max-w-none text-[11px] leading-relaxed text-[#3D3834]">
                        <MarkdownTheologyRenderer content={commentaryText} />
                      </div>
                      {isCommentaryLong && (
                        <div
                          className="mt-3 pt-2 border-t flex justify-end"
                          style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                        >
                          <button
                            type="button"
                            onClick={() => setShowFullCommentary(false)}
                            className="text-[10.5px] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                            style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}
                          >
                            <span>↑ Back to Summary</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[9px] text-[#A8A29E] italic text-center px-2">
                    {isCommentaryVerbatim
                      ? 'Direct verbatim text from published historical commentary.'
                      : 'Direct historical quotes and citations from verified works.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat / Ask AI Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-2 animate-fadeIn">
            {/* Passage Focus Bar in Chat */}
            <div
              className="px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-xs select-none"
              style={{
                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                borderColor: 'var(--clean-accent-border, #EBE5DC)'
              }}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                <span className="text-[11px] font-semibold text-[#26221F] truncate">
                  Passage: {isRangeActive ? `${currentBook} ${currentChapter}:${selectedVerseRange!.start}–${selectedVerseRange!.end} (${selectedVerseRange!.end - selectedVerseRange!.start + 1} verses)` : currentVerseRef}
                </span>
              </div>
              <button
                onClick={handleClearChat}
                className="text-[10px] text-[#78716C] hover:text-[#991B1B] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-white"
                title="Reset conversation"
              >
                <Trash2 className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 space-y-2 min-h-[140px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    {msg.sender === 'assistant' && (
                      <div
                        className="w-5 h-5 rounded-md overflow-hidden border flex-shrink-0 p-0.5 shadow-xs flex items-center justify-center"
                        style={{
                          borderColor: 'var(--clean-accent-border, #EBE5DC)',
                          backgroundColor: 'var(--clean-surface, #FFFFFF)'
                        }}
                      >
                        <img src="/berea-logo.jpg" alt="Berea" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-[9px] font-semibold text-[#26221F]">
                      {msg.sender === 'user' ? 'You' : 'Berea AI Guide'}
                    </span>
                    <span className="text-[9px] text-[#A8A29E]">{msg.timestamp}</span>
                  </div>
                  {msg.sender === 'user' ? (
                    <div
                      className="chat-user-bubble animate-fadeIn"
                      style={{
                        backgroundColor: 'var(--clean-accent-caramel, #26221F)',
                        color: '#FFFFFF'
                      }}
                    >
                      <p className="text-white text-xs select-text leading-relaxed font-normal">
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    <div
                      className="chat-ai-bubble animate-fadeIn space-y-1.5"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)'
                      }}
                    >
                      <MarkdownTheologyRenderer content={msg.text} />

                      {/* Citation Reference */}
                      {msg.primaryCitation && (
                        <div
                          className="mt-2 pt-1.5 border-t flex flex-wrap items-center justify-between gap-1 text-[10px] select-none"
                          style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
                        >
                          <span className="text-[#78716C] font-medium text-[9.5px]">
                            Source: {msg.primaryCitation}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isAiThinking && (
                <div
                  className="p-2.5 rounded-xl text-xs space-y-1.5 animate-fadeIn shadow-xs border"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-dark, #78471F)'
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin flex-shrink-0" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                      <span className="font-medium text-[11px] truncate max-w-[220px]">
                        {localModelProgress ? localModelProgress.text : 'Synthesizing exegesis & confessional standards...'}
                      </span>
                    </div>
                    {localModelProgress && (
                      <span className="font-mono font-bold text-[10px]" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                        {localModelProgress.progress}%
                      </span>
                    )}
                  </div>
                  {localModelProgress && (
                    <div
                      className="w-full h-1 bg-white rounded-full overflow-hidden border"
                      style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                    >
                      <div
                        className="h-full transition-all duration-200 rounded-full"
                        style={{
                          width: `${localModelProgress.progress}%`,
                          background: 'linear-gradient(to right, var(--clean-accent-caramel, #B4793D), var(--clean-accent-honey, #D4A373))'
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Question Pills Directly in Chat Tab */}
            <div
              className="pt-2 border-t space-y-1 select-none"
              style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
            >
              <span
                className="text-[9.5px] font-bold uppercase tracking-wider flex items-center gap-1 px-1"
                style={{ color: 'var(--clean-accent-dark, #854D0E)' }}
              >
                <Sparkles className="w-2.5 h-2.5" style={{ color: 'var(--clean-accent-dark, #854D0E)' }} /> Suggested Prompts for {currentVerseRef}
              </span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                {/* George Fox 'Be Known' Primary Prompt Pill */}
                <button
                  onClick={() => handleSendMessage(`Help me understand ${currentVerseRef} through the "Be Known" promise: 1) What it means (simple facts & words), 2) What it means for my life (God knows me), and 3) A simple prayer.`)}
                  disabled={isAiThinking}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-between group transition-all disabled:opacity-50 shadow-xs"
                  style={{
                    background: 'linear-gradient(to right, var(--clean-highlight-cream, #FAF5ED), #FFFFFF)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)',
                    color: 'var(--clean-accent-dark, #003057)'
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <AppliedAiLogo variant="icon-navy" height={13} className="flex-shrink-0" />
                    <span className="truncate">"Be Known": Learn It • Live It • Pray It</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform flex-shrink-0" style={{ color: 'var(--clean-accent-caramel, #003057)' }} />
                </button>
                {insight.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isAiThinking}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white border text-[11px] text-[#26221F] flex items-center justify-between group transition-all disabled:opacity-50"
                    style={{
                      borderColor: 'var(--clean-accent-border, #EBE5DC)'
                    }}
                  >
                    <span className="leading-snug pr-2">{q}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#A8A29E] group-hover:text-[var(--clean-accent-caramel,#B4793D)] flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div
              className="flex items-center gap-1.5 pt-1.5 border-t"
              style={{ borderTopColor: 'var(--clean-accent-border, #EBE5DC)' }}
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask anything about ${currentVerseRef} or theology...`}
                className="flex-1 bg-white border rounded-full px-3.5 py-1.5 text-xs text-[#26221F] placeholder-[#A8A29E] focus:outline-none transition-colors shadow-2xs"
                style={{
                  border: '1px solid var(--clean-accent-border, #EBE5DC)',
                  outline: 'none'
                }}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || isAiThinking}
                className="clean-caramel-btn !w-6 !h-6 !p-0 rounded-full flex items-center justify-center disabled:opacity-40"
              >
                <Send className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}

        {/* Text Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className="text-xs font-semibold"
                  style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                >
                  Translations Matrix
                </h4>
                <p className="text-[9.5px] text-[#78716C]">{currentVerseRef}</p>
              </div>
            </div>

            {/* Translation Pills - Filtered by Selected Language */}
            <div className="flex flex-wrap gap-1 p-1 rounded-lg border bg-[var(--clean-surface-subtle,#FAF7F2)] border-[var(--clean-border-soft,#EBE5DC)] max-h-48 overflow-y-auto custom-scrollbar">
              {matrixTranslations.map((t) => {
                const selectedIndex = comparisonTranslations.indexOf(t.id);
                const isSelected = selectedIndex !== -1;
                const orderNum = isSelected ? selectedIndex + 1 : null;
                const colorTheme = getTranslationColor(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isSelected && comparisonTranslations.length > 1) {
                        setComparisonTranslations(prev => prev.filter(x => x !== t.id));
                      } else if (!isSelected) {
                        setComparisonTranslations(prev => [...prev, t.id]);
                      }
                    }}
                    style={
                      isSelected
                        ? {
                            backgroundColor: colorTheme.badgeBg,
                            borderColor: colorTheme.badgeBg,
                            color: colorTheme.badgeText,
                            boxShadow: `0 2px 6px ${colorTheme.primary}40`
                          }
                        : {
                            backgroundColor: '#FFFFFF',
                            borderColor: 'var(--clean-border-soft, #EBE5DC)',
                            color: '#57524E'
                          }
                    }
                    className="text-[11px] font-semibold py-1 px-2.5 rounded-md border transition-all cursor-pointer select-none flex items-center gap-1.5"
                    title={`${t.name} (${t.year})`}
                  >
                    {isSelected ? (
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
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
                  </button>
                );
              })}
            </div>

            {/* Translation Cards with Unique Distinct Colors */}
            <div className="space-y-2">
              {comparisonTranslations.map((tId, idx) => {
                const tObj = TRANSLATIONS.find(x => x.id === tId);
                const colorTheme = getTranslationColor(tId);
                const cacheKey = `${tId}_${currentBook}_${currentChapter}_${activeVerseNum}`;
                const localText = selectedVerse?.text?.[tId];
                const externalText = externalComparisonTexts[cacheKey];
                const isLoading = loadingComparisonTrans[tId];

                const isNTOnly = Boolean(
                  tObj?.badge?.toLowerCase().includes('nt only') ||
                  tObj?.badge?.toLowerCase().includes('nt epistles') ||
                  tObj?.description?.toLowerCase().includes('new testament only')
                );
                const currentBookObj = BIBLE_BOOKS.find(b => b.name.toLowerCase() === currentBook.toLowerCase() || b.id.toLowerCase() === currentBook.toLowerCase());
                const isOT = currentBookObj ? currentBookObj.testament === 'OT' : false;
                const NON_LATIN_LANGS = new Set(['ru', 'uk', 'zh', 'ja', 'ko', 'he', 'el', 'ar', 'fa', 'hi', 'ta', 'kn', 'ml', 'ne']);
                const isNonLatin = tObj && NON_LATIN_LANGS.has(tObj.language || '');

                let verseText = '';
                if (isNTOnly && isOT) {
                  verseText = 'This translation contains the New Testament only.';
                } else if (localText) {
                  verseText = cleanApiText(localText);
                } else if (externalText) {
                  verseText = externalText;
                } else if (isLoading) {
                  verseText = `Fetching authentic ${tObj?.name || tId} text...`;
                } else {
                  verseText = `Loading ${tObj?.name || tId} scripture...`;
                }

                if (!localText && isNonLatin && /^[A-Za-z\s,;:'"?.!-]+$/.test(verseText.trim().slice(0, 30))) {
                  verseText = isNTOnly && isOT
                    ? 'This translation contains the New Testament only.'
                    : 'Passage not present in this translation edition.';
                }

                return (
                  <div
                    key={tId}
                    className="p-3 rounded-xl border space-y-1.5 transition-all shadow-xs"
                    style={{
                      backgroundColor: colorTheme.bg,
                      borderColor: colorTheme.border,
                      borderLeftWidth: '4px',
                      borderLeftColor: colorTheme.primary
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide shrink-0 shadow-2xs flex items-center gap-1"
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
                          className="font-bold text-xs truncate"
                          style={{ color: colorTheme.text }}
                          title={tObj?.name}
                        >
                          {tObj?.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                        <span
                          className="px-1.5 py-0.5 rounded border text-[9px] font-medium"
                          style={{
                            borderColor: colorTheme.border,
                            color: colorTheme.text,
                            backgroundColor: 'rgba(255,255,255,0.7)'
                          }}
                        >
                          {tObj?.philosophy.split('/')[0].trim()}
                        </span>
                        <span className="text-stone-500 font-medium">{tObj?.year}</span>
                      </div>
                    </div>
                    {isLoading && !localText && !externalText ? (
                      <div className="flex items-center gap-2 py-1.5 pl-1 text-[var(--clean-text-secondary,#78716C)]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--clean-accent-caramel,#B4793D)] shrink-0" />
                        <span className="text-xs italic">{verseText}</span>
                      </div>
                    ) : !localText && externalText && (externalText.includes('New Testament only') || externalText.includes('not present') || externalText.includes('Failed to retrieve')) ? (
                      <p className="text-xs italic text-[var(--clean-text-secondary,#78716C)] pl-1 py-0.5">
                        {verseText}
                      </p>
                    ) : (
                      <p
                        className="font-scripture text-xs text-[#26221F] leading-relaxed pl-1"
                      >
                        {verseText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-3 animate-fadeIn">


            <OpenFreeMapWidget
              currentBook={currentBook}
              currentChapter={currentChapter}
              activeVerseNumber={activeVerseNum}
              height="360px"
              onEventSelect={(ev) => setSelectedChapterEvent(ev)}
            />

            {/* Chapter Event Active Detail Card */}
            {currentEvent && (
              <div className="space-y-2">
                <div
                  className="p-3 rounded-xl border text-xs space-y-1.5"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-bold text-[11px] flex items-center gap-1"
                      style={{ color: 'var(--clean-accent-dark, #78471F)' }}
                    >
                      <span>{currentEvent.isReferencedOnly ? 'Reference' : 'Storyline'} {currentEvent.stepNumber}:</span> {currentEvent.title}
                    </span>
                    <button
                      onClick={() => {
                        let targetVerse = currentEvent.verseRange ? currentEvent.verseRange[0] : 1;
                        let targetChapter = currentChapter;
                        if (currentEvent.passageRef) {
                          const match = currentEvent.passageRef.match(/(\d+):(\d+)/);
                          if (match) {
                            const c = parseInt(match[1], 10);
                            const v = parseInt(match[2], 10);
                            if (!isNaN(c)) targetChapter = c;
                            if (!isNaN(v)) targetVerse = v;
                          }
                        }
                        const targetRange = currentEvent.verseRange
                          ? { start: currentEvent.verseRange[0], end: currentEvent.verseRange[1] }
                          : { start: targetVerse, end: targetVerse };

                        if (onVerseRangeChange) {
                          onVerseRangeChange(targetRange);
                        }
                        if (onNavigateToChapterAndVerse) {
                          onNavigateToChapterAndVerse(targetChapter, targetVerse, targetRange);
                        }
                      }}
                      className="text-[9.5px] font-mono px-1.5 py-0.5 rounded font-semibold transition-colors shadow-sm cursor-pointer active:scale-95"
                      style={{
                        backgroundColor: 'var(--clean-surface, #FFFFFF)',
                        color: 'var(--clean-accent-caramel, #B4793D)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      title={`Highlight ${currentEvent.passageRef} in Scripture`}
                    >
                      Mentioned in {currentEvent.passageRef}
                    </button>
                  </div>

                  <div className="text-[10px] font-medium flex items-center justify-between flex-wrap gap-1" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                    <span>Site: <strong style={{ color: 'var(--clean-text-primary, #26221F)' }}>{currentEvent.locationName}</strong></span>
                    {currentLegInfo && (
                      <span
                        className="text-[9.5px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 shadow-xs"
                        style={{
                          backgroundColor: 'var(--clean-surface, #FFFFFF)',
                          borderColor: 'var(--clean-accent-border, #EBE5DC)',
                          color: 'var(--clean-accent-caramel, #B4793D)'
                        }}
                      >
                        <span>{currentLegInfo.distanceMiles} mi from {currentLegInfo.fromName}</span>
                        <span>•</span>
                        <span>{currentLegInfo.daysLabel}</span>
                      </span>
                    )}
                  </div>

                  {currentLegInfo?.roadName && (
                    <div
                      className="text-[9.5px] font-medium px-2 py-0.5 rounded border flex items-center gap-1"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF3E8)',
                        borderColor: 'var(--clean-accent-border, #D4A373)',
                        color: 'var(--clean-accent-dark, #8C521F)'
                      }}
                    >
                      <span>Historical Route: <strong>{currentLegInfo.roadName}</strong></span>
                    </div>
                  )}

                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--clean-text-primary, #44403C)' }}>
                    {currentEvent.description}
                  </p>

                  {currentEvent.theologicalSignificance && currentEvent.theologicalSignificance !== "" && (
                    <div
                      className="p-2 rounded-lg border text-[10.5px] space-y-0.5 mt-1"
                      style={{
                        backgroundColor: 'var(--clean-surface, #FFFFFF)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        color: 'var(--clean-text-secondary, #57524E)'
                      }}
                    >
                      <strong
                        className="text-[10px] block uppercase tracking-wider"
                        style={{ color: 'var(--clean-accent-dark, #78471F)' }}
                      >
                        Theological Significance
                      </strong>
                      <p className="leading-snug">{currentEvent.theologicalSignificance}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {activeTab === 'quiz' && (
          <div className="flex-1 flex flex-col space-y-3 animate-fadeIn min-h-0">
            {/* Header Card */}
            <div
              className="p-4 rounded-xl border shadow-xs space-y-2.5"
              style={{
                background: 'linear-gradient(to bottom right, var(--clean-highlight-cream, #FAF5ED), var(--clean-surface, #FFFFFF))',
                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                color: 'var(--clean-text-primary, #26221F)'
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg border flex items-center justify-center shadow-2xs"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                    color: 'var(--clean-accent-caramel, #B4793D)'
                  }}
                >
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#26221F]">Scripture & Theology Quiz</h4>
                  <p className="text-[10.5px] text-[#78716C]">
                    Test comprehension, theology, and canonical themes
                  </p>
                </div>
              </div>

              {/* Quiz Style Selector */}
              <div
                className="pt-2 border-t space-y-1.5"
                style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
              >
                <span
                  className="text-[11px] font-semibold flex items-center gap-1.5"
                  style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                >
                  <Sliders className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                  <span>Quiz Style:</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStyleChange('multiple_choice')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      quizStyle === 'multiple_choice' ? '' : 'hover:border-[var(--clean-accent-border-strong,#B4793D)]'
                    }`}
                    style={{
                      backgroundColor: quizStyle === 'multiple_choice' ? 'var(--clean-highlight-cream, #FAF5ED)' : 'var(--clean-surface, #FFFFFF)',
                      borderColor: quizStyle === 'multiple_choice' ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      boxShadow: quizStyle === 'multiple_choice' ? '0 1px 4px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.2)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <ListFilter
                        className="w-3.5 h-3.5"
                        style={{ color: quizStyle === 'multiple_choice' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)' }}
                      />
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: quizStyle === 'multiple_choice' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-primary, #26221F)' }}
                      >
                        Multiple Choice
                      </span>
                    </div>
                    <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                      4 choices
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStyleChange('true_false')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      quizStyle === 'true_false' ? '' : 'hover:border-[var(--clean-accent-border-strong,#B4793D)]'
                    }`}
                    style={{
                      backgroundColor: quizStyle === 'true_false' ? 'var(--clean-highlight-cream, #FAF5ED)' : 'var(--clean-surface, #FFFFFF)',
                      borderColor: quizStyle === 'true_false' ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      boxShadow: quizStyle === 'true_false' ? '0 1px 4px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.2)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        style={{ color: quizStyle === 'true_false' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)' }}
                      />
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: quizStyle === 'true_false' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-primary, #26221F)' }}
                      >
                        True or False
                      </span>
                    </div>
                    <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                      Fact-check claims
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStyleChange('written')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      quizStyle === 'written' ? '' : 'hover:border-[var(--clean-accent-border-strong,#B4793D)]'
                    }`}
                    style={{
                      backgroundColor: quizStyle === 'written' ? 'var(--clean-highlight-cream, #FAF5ED)' : 'var(--clean-surface, #FFFFFF)',
                      borderColor: quizStyle === 'written' ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      boxShadow: quizStyle === 'written' ? '0 1px 4px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.2)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles
                        className="w-3.5 h-3.5"
                        style={{ color: quizStyle === 'written' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)' }}
                      />
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: quizStyle === 'written' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-primary, #26221F)' }}
                      >
                        Written
                      </span>
                    </div>
                    <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                      Short written answer
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStyleChange('mixed')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      quizStyle === 'mixed' ? '' : 'hover:border-[var(--clean-accent-border-strong,#B4793D)]'
                    }`}
                    style={{
                      backgroundColor: quizStyle === 'mixed' ? 'var(--clean-highlight-cream, #FAF5ED)' : 'var(--clean-surface, #FFFFFF)',
                      borderColor: quizStyle === 'mixed' ? 'var(--clean-accent-border-strong, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                      boxShadow: quizStyle === 'mixed' ? '0 1px 4px rgba(var(--clean-accent-rgb, 180, 121, 61), 0.2)' : 'none'
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Layers
                        className="w-3.5 h-3.5"
                        style={{ color: quizStyle === 'mixed' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)' }}
                      />
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: quizStyle === 'mixed' ? 'var(--clean-accent-dark, #8C5E2E)' : 'var(--clean-text-primary, #26221F)' }}
                      >
                        Mixed
                      </span>
                    </div>
                    <p className="text-[9.5px] mt-0.5 leading-tight" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                      All 3 formats
                    </p>
                  </button>
                </div>
              </div>
            </div>

            {/* Quiz Configuration Panel */}
            {!currentQuizType && (
              <div
                className="p-3.5 rounded-xl border space-y-4"
                style={{
                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                  borderColor: 'var(--clean-accent-border, #EBE5DC)'
                }}
              >
                {/* Mode Selector */}
                <div
                  className="flex p-0.5 rounded-lg border"
                  style={{
                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                  }}
                >
                  <button
                    onClick={() => setQuizMode('chapter')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
                    style={{
                      backgroundColor: quizMode === 'chapter' ? 'var(--clean-surface, #FFFFFF)' : 'transparent',
                      color: quizMode === 'chapter' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)',
                      boxShadow: quizMode === 'chapter' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Passage
                  </button>
                  <button
                    onClick={() => setQuizMode('book')}
                    className="flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer"
                    style={{
                      backgroundColor: quizMode === 'book' ? 'var(--clean-surface, #FFFFFF)' : 'transparent',
                      color: quizMode === 'book' ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-text-secondary, #78716C)',
                      boxShadow: quizMode === 'book' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                    }}
                  >
                    Book
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Target Book</label>
                    <select
                      value={quizTargetBook}
                      onChange={(e) => {
                        setQuizTargetBook(e.target.value);
                        setQuizTargetChapter(1);
                      }}
                      className="w-full p-2 text-xs font-medium rounded-lg outline-none transition-colors"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border, #EBE5DC)',
                        color: 'var(--clean-text-primary, #26221F)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      {BIBLE_BOOKS.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {quizMode === 'chapter' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Target Chapter</label>
                      <select
                        value={quizTargetChapter}
                        onChange={(e) => setQuizTargetChapter(parseInt(e.target.value))}
                        className="w-full p-2 text-xs font-medium rounded-lg outline-none transition-colors"
                        style={{
                          backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                          borderColor: 'var(--clean-accent-border, #EBE5DC)',
                          color: 'var(--clean-text-primary, #26221F)',
                          borderWidth: '1px',
                          borderStyle: 'solid'
                        }}
                      >
                        {Array.from({ length: BIBLE_BOOKS.find(b => b.name === quizTargetBook)?.chaptersCount || 1 }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>Chapter {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Question Count Selector */}
                  <div
                    className="space-y-1.5 pt-1 border-t"
                    style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                        Questions ({quizMode === 'chapter' ? '5–15' : '5–50'})
                      </label>
                      <span className="text-xs font-bold" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                        {quizMode === 'chapter' ? chapterQuizLength : bookQuizLength}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {(quizMode === 'chapter' ? [5, 10, 15] : [5, 10, 20, 50]).map(count => {
                        const isCountActive = (quizMode === 'chapter' ? chapterQuizLength : bookQuizLength) === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => quizMode === 'chapter' ? setChapterQuizLength(count) : setBookQuizLength(count)}
                            className="flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer"
                            style={{
                              backgroundColor: isCountActive ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-highlight-cream, #FAF5ED)',
                              borderColor: isCountActive ? 'var(--clean-accent-caramel, #B4793D)' : 'var(--clean-accent-border, #EBE5DC)',
                              color: isCountActive ? 'var(--clean-accent-contrast-text, #FFFFFF)' : 'var(--clean-text-secondary, #78716C)'
                            }}
                          >
                            {count}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startQuiz(quizMode)}
                  disabled={generatingQuizType !== null}
                  className="w-full py-2.5 mt-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-70"
                  style={{
                    backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                    color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                  }}
                >
                  {generatingQuizType ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating Quiz ({quizProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span>Start {quizMode === 'chapter' ? `${quizTargetBook} ${quizTargetChapter}` : quizTargetBook} Quiz</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Quiz active below generation buttons */}
            {currentQuizType && (
              <div
                className="rounded-xl border border-[#EBE5DC] bg-white p-3.5 space-y-3.5 shadow-xs flex flex-col flex-1 animate-fadeIn mt-1"
              >
                {/* Embedded Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#EBE5DC]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-heading font-bold text-xs text-[#26221F]">
                      {currentQuizType === 'chapter' ? `${quizTargetBook} ${quizTargetChapter} Quiz` : `${quizTargetBook} Book Quiz`}
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[9.5px] font-semibold rounded-md border"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                        color: 'var(--clean-accent-dark, #8C5E2E)'
                      }}
                    >
                      {quizStyle === 'multiple_choice' ? 'Multiple Choice' : quizStyle === 'true_false' ? 'True / False' : 'Written • AI Graded'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {quizQuestions.length > 0 && !isQuizSubmitted && !isGradingWritten && (
                      <span
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-full border shadow-2xs"
                        style={{
                          backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                          borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                          color: 'var(--clean-accent-dark, #8C5E2E)'
                        }}
                      >
                        Q {quizIndex + 1}/{quizQuestions.length}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setInternalQuizType(null);
                        onQuizTypeChange?.(null);
                      }}
                      className="p-1 rounded-md transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer hover:text-[var(--clean-accent-dark,#8C5E2E)]"
                      style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                      title="Close quiz"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isQuizLoading ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                      style={{
                        borderColor: 'var(--clean-accent-caramel, #B4793D)',
                        borderTopColor: 'transparent'
                      }}
                    />
                    <div className="text-center w-full max-w-[200px]">
                      <p className="text-xs font-medium animate-pulse mb-2" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                        Generating {currentQuizType} quiz ({quizStyle === 'multiple_choice' ? 'Multiple Choice' : quizStyle === 'true_false' ? 'True/False' : 'Written'})...
                      </p>
                      <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--clean-accent-border, #EBE5DC)' }}>
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${quizProgress}%`,
                            backgroundColor: 'var(--clean-accent-caramel, #B4793D)'
                          }}
                        />
                      </div>
                      <p className="text-[10px] mt-1.5 font-medium" style={{ color: 'var(--clean-text-tertiary, #A8A29E)' }}>
                        {quizCheckpoint ? `Question ${quizCheckpoint.current} of ${quizCheckpoint.total} (${quizProgress}%)` : `${quizProgress}%`}
                      </p>
                    </div>
                  </div>
                ) : isGradingWritten ? (
                  /* AI Written Grading Loader View */
                  <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fadeIn">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-caramel, #B4793D)',
                        borderTopColor: 'transparent',
                        color: 'var(--clean-accent-caramel, #B4793D)'
                      }}
                    >
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="text-center w-full max-w-[240px] space-y-1.5">
                      <p className="font-heading font-semibold text-xs" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                        AI Scholar is Grading Your Written Responses...
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                        Evaluating theological accuracy, scriptural context, and canonical retention
                      </p>
                      {gradingProgress && (
                        <div className="pt-2">
                          <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--clean-accent-border, #EBE5DC)' }}>
                            <div
                              className="h-1.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.round((gradingProgress.current / gradingProgress.total) * 100)}%`,
                                backgroundColor: 'var(--clean-accent-caramel, #B4793D)'
                              }}
                            />
                          </div>
                          <p className="text-[10px] mt-1 font-medium" style={{ color: 'var(--clean-text-tertiary, #A8A29E)' }}>
                            Grading question {gradingProgress.current} of {gradingProgress.total}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : quizError ? (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs text-red-600">{quizError}</p>
                    <button
                      onClick={() => startQuiz(currentQuizType)}
                      className="px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                        borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                        color: 'var(--clean-accent-dark, #8C5E2E)'
                      }}
                    >
                      Retry
                    </button>
                  </div>
                ) : quizQuestions.length > 0 ? (
                  isQuizSubmitted ? (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Score Card: Composite/Written vs Standard Choice */}
                      {quizQuestions.some(q => q.style === 'written') ? (
                        (() => {
                          const writtenQs = quizQuestions.filter(q => q.style === 'written');
                          const choiceQs = quizQuestions.filter(q => q.style !== 'written');
                          const totalWrittenScore = Object.values(writtenGrades).reduce((acc, g) => acc + g.score, 0);
                          const totalChoiceScore = choiceQs.reduce((acc, q) => {
                            const originalIdx = quizQuestions.indexOf(q);
                            return acc + (quizSelectedAnswers[originalIdx] === q.correctAnswerIndex ? 100 : 0);
                          }, 0);
                          const avgScore = Math.round((totalWrittenScore + totalChoiceScore) / (quizQuestions.length || 1));
                          const overallGrade = avgScore >= 88 ? 'Excellent Comprehension' : avgScore >= 70 ? 'Good Retention' : 'Review Recommended';

                          return (
                            <div
                              className="text-center p-4 rounded-xl border space-y-2"
                              style={{
                                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                borderColor: 'var(--clean-accent-border-strong, #B4793D)'
                              }}
                            >
                              <div
                                className="inline-flex items-center justify-center px-4 py-2 rounded-full border-2 font-bold text-lg shadow-xs"
                                style={{
                                  backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                  borderColor: 'var(--clean-accent-caramel, #B4793D)',
                                  color: 'var(--clean-accent-dark, #8C5E2E)'
                                }}
                              >
                                {avgScore}% Overall Score
                              </div>
                              <h4 className="font-heading font-bold text-sm" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                                {overallGrade}
                              </h4>
                              <p className="text-xs" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                                {avgScore >= 88
                                  ? 'Outstanding! Strong theological grasp and articulate scriptural understanding.'
                                  : avgScore >= 70
                                  ? 'Well done! Great theological retention and biblical reasoning.'
                                  : 'Good effort. Review passage commentary to deepen theological insights.'}
                              </p>
                              {choiceQs.length > 0 && writtenQs.length > 0 && (
                                <p className="text-[10.5px] font-medium" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                                  Combined: {choiceQs.filter(q => quizSelectedAnswers[quizQuestions.indexOf(q)] === q.correctAnswerIndex).length}/{choiceQs.length} Objective Correct • {writtenQs.length} AI Evaluated
                                </p>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        /* Score Card for Multiple Choice & True/False */
                        <div
                          className="text-center p-4 rounded-xl border space-y-2"
                          style={{
                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                            borderColor: 'var(--clean-accent-border-strong, #B4793D)'
                          }}
                        >
                          <div
                            className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 font-bold text-lg shadow-xs"
                            style={{
                              backgroundColor: 'var(--clean-surface, #FFFFFF)',
                              borderColor: 'var(--clean-accent-caramel, #B4793D)',
                              color: 'var(--clean-accent-dark, #8C5E2E)'
                            }}
                          >
                            {Object.entries(quizSelectedAnswers).reduce((acc, [idx, ans]) => acc + (quizQuestions[parseInt(idx)]?.correctAnswerIndex === ans ? 1 : 0), 0)}/{quizQuestions.length}
                          </div>
                          <h4 className="font-heading font-bold text-sm" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                            Quiz Complete!
                          </h4>
                          <p className="text-xs" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                            {Object.entries(quizSelectedAnswers).reduce((acc, [idx, ans]) => acc + (quizQuestions[parseInt(idx)]?.correctAnswerIndex === ans ? 1 : 0), 0) === quizQuestions.length
                              ? 'Outstanding! Perfect comprehension.'
                              : Object.entries(quizSelectedAnswers).reduce((acc, [idx, ans]) => acc + (quizQuestions[parseInt(idx)]?.correctAnswerIndex === ans ? 1 : 0), 0) >= quizQuestions.length / 2
                              ? 'Well done! Great theological retention.'
                              : 'Good effort. Review passage to strengthen insights.'}
                          </p>
                        </div>
                      )}

                      {/* Answers Review */}
                      <div className="space-y-2.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                        {quizQuestions.map((q, qIdx) => {
                          if (q.style === 'written') {
                            const grade = writtenGrades[qIdx] || {
                              score: 70,
                              grade: 'Good',
                              isCorrect: true,
                              feedback: 'Response recorded.',
                              biblicalInsights: q.sampleAnswer || q.explanation
                            };
                            const isPassing = grade.score >= 70;

                            return (
                              <div
                                key={qIdx}
                                className="p-3 rounded-lg border text-xs space-y-2"
                                style={{
                                  backgroundColor: isPassing ? 'rgba(5, 150, 105, 0.05)' : 'rgba(217, 119, 6, 0.06)',
                                  borderColor: isPassing ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)'
                                }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span
                                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                      style={{
                                        backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                        color: 'var(--clean-accent-dark, #8C5E2E)',
                                        border: '1px solid var(--clean-accent-border, #EBE5DC)'
                                      }}
                                    >
                                      Written
                                    </span>
                                    <p className="font-semibold" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                                      {q.question}
                                    </p>
                                  </div>
                                  <span
                                    className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0"
                                    style={{
                                      backgroundColor: isPassing ? 'rgba(5, 150, 105, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                                      color: isPassing ? '#047857' : '#B45309'
                                    }}
                                  >
                                    {grade.score}% • {grade.grade}
                                  </span>
                                </div>

                                <div
                                  className="p-2 rounded border"
                                  style={{
                                    backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                    borderColor: 'var(--clean-accent-border, #EBE5DC)'
                                  }}
                                >
                                  <span
                                    className="font-bold text-[10px] uppercase block mb-0.5"
                                    style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                                  >
                                    Your Response:
                                  </span>
                                  <p className="italic text-[11px] leading-relaxed" style={{ color: 'var(--clean-text-primary, #44403C)' }}>
                                    "{writtenAnswers[qIdx] || 'No written response provided'}"
                                  </p>
                                </div>

                                <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}>
                                  <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}>
                                    <Sparkles className="w-3 h-3" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }} />
                                    <span>AI Instructor Feedback:</span>
                                  </div>
                                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--clean-text-secondary, #57524E)' }}>
                                    {grade.feedback}
                                  </p>
                                </div>

                                {(grade.modelAnswer || q.sampleAnswer || q.explanation) && (
                                  <div
                                    className="p-2 rounded border text-[10.5px] space-y-0.5"
                                    style={{
                                      backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                      borderColor: 'var(--clean-accent-border-strong, #B4793D)'
                                    }}
                                  >
                                    <span
                                      className="font-bold text-[10px] block uppercase tracking-wider"
                                      style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                                    >
                                      Scripture Insight & Model Answer:
                                    </span>
                                    <p className="leading-relaxed" style={{ color: 'var(--clean-text-secondary, #57524E)' }}>
                                      {grade.modelAnswer || q.sampleAnswer || q.explanation}
                                    </p>
                                    {q.reference && (
                                      <p className="font-medium pt-0.5" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                                        Citation: {q.reference}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          }

                          /* Answers Review for Multiple Choice & True/False */
                          const userAns = quizSelectedAnswers[qIdx];
                          const isCorrect = userAns === q.correctAnswerIndex;
                          const isTrueFalse = q.style === 'true_false' || q.options?.length === 2;
                          return (
                            <div
                              key={qIdx}
                              className="p-3 rounded-lg border text-xs space-y-1.5"
                              style={{
                                backgroundColor: isCorrect ? 'rgba(5, 150, 105, 0.05)' : 'rgba(220, 38, 38, 0.05)',
                                borderColor: isCorrect ? 'rgba(5, 150, 105, 0.25)' : 'rgba(220, 38, 38, 0.25)'
                              }}
                            >
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                                  style={{
                                    backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                    color: 'var(--clean-accent-dark, #8C5E2E)',
                                    border: '1px solid var(--clean-accent-border, #EBE5DC)'
                                  }}
                                >
                                  {isTrueFalse ? 'True/False' : 'Multiple Choice'}
                                </span>
                                <p className="font-semibold" style={{ color: 'var(--clean-text-primary, #26221F)' }}>
                                  {q.question}
                                </p>
                              </div>
                              <p
                                className={isCorrect ? 'font-medium' : 'line-through'}
                                style={{ color: isCorrect ? '#047857' : '#B91C1C' }}
                              >
                                Your answer: {userAns !== undefined ? q.options[userAns] : 'None'}
                              </p>
                              {!isCorrect && (
                                <p className="font-medium" style={{ color: '#047857' }}>
                                  Correct answer: {q.options[q.correctAnswerIndex]}
                                </p>
                              )}
                              <p
                                className="text-[11px] italic leading-relaxed pt-1 border-t"
                                style={{
                                  borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                  color: 'var(--clean-text-secondary, #78716C)'
                                }}
                              >
                                {q.explanation}
                              </p>
                              {q.reference && (
                                <p className="font-medium text-[10.5px]" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                                  Scripture: {q.reference}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Action buttons */}
                      <div
                        className="flex items-center justify-between pt-2 border-t"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        <button
                          onClick={() => {
                            setInternalQuizType(null);
                            onQuizTypeChange?.(null);
                          }}
                          className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer hover:text-[var(--clean-accent-dark,#8C5E2E)]"
                          style={{ color: 'var(--clean-text-secondary, #78716C)' }}
                        >
                          Back to Quizzes
                        </button>
                        <button
                          onClick={() => startQuiz(currentQuizType)}
                          className="clean-caramel-btn text-xs font-semibold px-4 py-1.5 cursor-pointer"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Active Question View */
                    <div className="flex-1 flex flex-col justify-between space-y-3 animate-fadeIn">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}
                          >
                            Question {quizIndex + 1} of {quizQuestions.length}
                          </span>
                          {quizQuestions[quizIndex]?.reference && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs"
                              style={{
                                backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                                color: 'var(--clean-accent-dark, #8C5E2E)'
                              }}
                            >
                              {quizQuestions[quizIndex].reference}
                            </span>
                          )}
                        </div>

                        <h4
                          className="font-heading font-semibold text-xs sm:text-sm leading-snug mb-3"
                          style={{ color: 'var(--clean-text-primary, #26221F)' }}
                        >
                          {quizQuestions[quizIndex].question}
                        </h4>

                        {/* Question Input based on Style */}
                        {quizQuestions[quizIndex]?.style === 'written' ? (
                          /* Written Essay / Freeform Answer */
                          <div className="space-y-2">
                            <textarea
                              rows={5}
                              value={writtenAnswers[quizIndex] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setWrittenAnswers(prev => ({
                                  ...prev,
                                  [quizIndex]: val
                                }));
                              }}
                              placeholder="Write your theological response or explanation based on scripture here..."
                              className="w-full p-3 rounded-lg border text-xs leading-relaxed outline-none transition-all placeholder:text-[#A8A29E]"
                              style={{
                                backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                color: 'var(--clean-text-primary, #26221F)'
                              }}
                            />
                            <div className="flex items-center justify-between text-[10.5px]" style={{ color: 'var(--clean-text-secondary, #78716C)' }}>
                              <span>
                                {writtenAnswers[quizIndex]?.trim().split(/\s+/).filter(Boolean).length || 0} words
                              </span>
                              <span className="italic" style={{ color: 'var(--clean-accent-dark, #8C5E2E)' }}>
                                The AI evaluates theological depth and biblical reasoning.
                              </span>
                            </div>
                          </div>
                        ) : quizQuestions[quizIndex]?.style === 'true_false' ? (
                          /* True or False 2-button cards */
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2.5">
                              {['True', 'False'].map((label, optIdx) => {
                                const isSelected = quizSelectedAnswers[quizIndex] === optIdx;
                                const isRevealed = quizRevealedAnswers[quizIndex];
                                const isCorrect = isRevealed && optIdx === quizQuestions[quizIndex].correctAnswerIndex;
                                const isWrong = isRevealed && isSelected && optIdx !== quizQuestions[quizIndex].correctAnswerIndex;

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      if (!isRevealed) {
                                        setQuizSelectedAnswers(prev => ({ ...prev, [quizIndex]: optIdx }));
                                      }
                                    }}
                                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                                      isRevealed ? 'cursor-default' : 'cursor-pointer hover:opacity-95'
                                    }`}
                                    style={
                                      isCorrect
                                        ? { backgroundColor: '#ECFDF5', borderColor: '#34D399', color: '#065F46', fontWeight: 'bold' }
                                        : isWrong
                                        ? { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#991B1B', fontWeight: 'bold' }
                                        : isSelected
                                        ? {
                                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                            borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                                            color: 'var(--clean-accent-dark, #78471F)',
                                            fontWeight: 'bold',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                                          }
                                        : {
                                            backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                            borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                            color: 'var(--clean-text-primary, #26221F)'
                                          }
                                    }
                                  >
                                    {label === 'True' ? (
                                      <CheckCircle2
                                        className="w-5 h-5"
                                        style={{
                                          color: isCorrect
                                            ? '#059669'
                                            : isWrong
                                            ? '#DC2626'
                                            : isSelected
                                            ? 'var(--clean-accent-caramel, #B4793D)'
                                            : 'var(--clean-text-secondary, #78716C)'
                                        }}
                                      />
                                    ) : (
                                      <X
                                        className="w-5 h-5"
                                        style={{
                                          color: isCorrect
                                            ? '#059669'
                                            : isWrong
                                            ? '#DC2626'
                                            : isSelected
                                            ? 'var(--clean-accent-caramel, #B4793D)'
                                            : 'var(--clean-text-secondary, #78716C)'
                                        }}
                                      />
                                    )}
                                    <span className="text-sm font-heading">{label}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Immediate Feedback Reveal */}
                            {quizRevealedAnswers[quizIndex] && (
                              <div className={`mt-3 p-3 rounded-lg border text-xs space-y-1.5 animate-fadeIn ${
                                quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex 
                                  ? 'bg-emerald-50/60 border-emerald-200' 
                                  : 'bg-red-50/60 border-red-200'
                              }`}>
                                <p className={`font-semibold ${quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex ? 'Correct!' : 'Incorrect.'}
                                </p>
                                <p className="text-[#78716C] text-[11px] leading-relaxed pt-0.5">
                                  {quizQuestions[quizIndex].explanation}
                                </p>
                                {quizQuestions[quizIndex].reference && (
                                  <p className="font-medium text-[10.5px]" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                                    Scripture: {quizQuestions[quizIndex].reference}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              {quizQuestions[quizIndex].options.map((opt, optIdx) => {
                                const isSelected = quizSelectedAnswers[quizIndex] === optIdx;
                                const isRevealed = quizRevealedAnswers[quizIndex];
                                const isCorrect = isRevealed && optIdx === quizQuestions[quizIndex].correctAnswerIndex;
                                const isWrong = isRevealed && isSelected && optIdx !== quizQuestions[quizIndex].correctAnswerIndex;

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => {
                                      if (!isRevealed) {
                                        setQuizSelectedAnswers(prev => ({ ...prev, [quizIndex]: optIdx }));
                                      }
                                    }}
                                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between gap-2 ${
                                      isRevealed ? 'cursor-default' : 'cursor-pointer hover:opacity-95'
                                    }`}
                                    style={
                                      isCorrect
                                        ? { backgroundColor: '#ECFDF5', borderColor: '#34D399', color: '#065F46', fontWeight: 500 }
                                        : isWrong
                                        ? { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', color: '#991B1B' }
                                        : isSelected
                                        ? {
                                            backgroundColor: 'var(--clean-highlight-cream, #FAF5ED)',
                                            borderColor: 'var(--clean-accent-border-strong, #B4793D)',
                                            color: 'var(--clean-accent-dark, #78471F)',
                                            fontWeight: 500,
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                          }
                                        : {
                                            backgroundColor: 'var(--clean-surface, #FFFFFF)',
                                            borderColor: 'var(--clean-accent-border, #EBE5DC)',
                                            color: 'var(--clean-text-primary, #26221F)'
                                          }
                                    }
                                  >
                                    <span className="leading-snug">{opt}</span>
                                    <div
                                      className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                                      style={{
                                        borderColor: isCorrect
                                          ? '#10B981'
                                          : isWrong
                                          ? '#F87171'
                                          : isSelected
                                          ? 'var(--clean-accent-caramel, #B4793D)'
                                          : 'var(--clean-accent-border, #DCD5C9)',
                                        backgroundColor: isCorrect
                                          ? '#10B981'
                                          : isWrong
                                          ? '#F87171'
                                          : isSelected
                                          ? 'var(--clean-accent-caramel, #B4793D)'
                                          : 'transparent'
                                      }}
                                    >
                                      {(isSelected || isCorrect) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Immediate Feedback Reveal */}
                            {quizRevealedAnswers[quizIndex] && (
                              <div className={`mt-3 p-3 rounded-lg border text-xs space-y-1.5 animate-fadeIn ${
                                quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex 
                                  ? 'bg-emerald-50/60 border-emerald-200' 
                                  : 'bg-red-50/60 border-red-200'
                              }`}>
                                <p className={`font-semibold ${quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex ? 'text-emerald-700' : 'text-red-700'}`}>
                                  {quizSelectedAnswers[quizIndex] === quizQuestions[quizIndex].correctAnswerIndex ? 'Correct!' : 'Incorrect.'}
                                </p>
                                <p className="text-[#78716C] text-[11px] leading-relaxed pt-0.5">
                                  {quizQuestions[quizIndex].explanation}
                                </p>
                                {quizQuestions[quizIndex].reference && (
                                  <p className="font-medium text-[10.5px]" style={{ color: 'var(--clean-accent-caramel, #B4793D)' }}>
                                    Scripture: {quizQuestions[quizIndex].reference}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Navigation Row at bottom */}
                      <div
                        className="pt-3 border-t flex items-center justify-between"
                        style={{ borderColor: 'var(--clean-accent-border, #EBE5DC)' }}
                      >
                        <button
                          onClick={() => setQuizIndex(prev => Math.max(0, prev - 1))}
                          disabled={quizIndex === 0 || (!quizRevealedAnswers[quizIndex] && quizQuestions[quizIndex]?.style !== 'written')}
                          className={`px-3 py-1.5 text-xs text-[#78716C] font-medium transition-colors cursor-pointer ${quizIndex === 0 || (!quizRevealedAnswers[quizIndex] && quizQuestions[quizIndex]?.style !== 'written') ? 'opacity-30' : 'hover:text-[#26221F]'}`}
                        >
                          Previous
                        </button>

                        {quizQuestions[quizIndex]?.style === 'written' ? (
                          quizIndex === quizQuestions.length - 1 ? (
                            <button
                              onClick={handleGradeAllWrittenAnswers}
                              disabled={!writtenAnswers[quizIndex]?.trim() || isGradingWritten}
                              className="px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                              style={{
                                backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                                color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                              }}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isGradingWritten ? 'Grading Answers...' : 'Submit & Grade with AI'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setQuizIndex(prev => prev + 1)}
                              disabled={!writtenAnswers[quizIndex]?.trim()}
                              className="px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
                              style={{
                                backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                                color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                              }}
                            >
                              Next Question
                            </button>
                          )
                        ) : (
                          <button
                            onClick={() => {
                              if (!quizRevealedAnswers[quizIndex]) {
                                setQuizRevealedAnswers(prev => ({ ...prev, [quizIndex]: true }));
                              } else {
                                if (quizIndex < quizQuestions.length - 1) {
                                  setQuizIndex(prev => prev + 1);
                                } else {
                                  if (quizQuestions.some(q => q.style === 'written')) {
                                    handleGradeAllWrittenAnswers();
                                  } else {
                                    setIsQuizSubmitted(true);
                                    const totalCorrect = Object.entries(quizSelectedAnswers).reduce((acc, [idx, ans]) => {
                                      return acc + (quizQuestions[parseInt(idx)]?.correctAnswerIndex === ans ? 1 : 0);
                                    }, 0);
                                    if (totalCorrect >= quizQuestions.length / 2) {
                                      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
                                    }
                                  }
                                }
                              }
                            }}
                            disabled={quizSelectedAnswers[quizIndex] === undefined || isGradingWritten}
                            className="px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
                            style={{
                              backgroundColor: 'var(--clean-accent-caramel, #B4793D)',
                              color: 'var(--clean-accent-contrast-text, #FFFFFF)'
                            }}
                          >
                            {!quizRevealedAnswers[quizIndex] 
                              ? 'Check Answer' 
                              : quizIndex === quizQuestions.length - 1 
                              ? (quizQuestions.some(q => q.style === 'written') ? 'Grade with AI' : 'Finish Quiz') 
                              : 'Next Question'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                ) : null}
              </div>
            )}
          </div>
        )}
        
        {/* SYMBOLISM TAB */}
        {activeTab === 'symbolism' && (
          <ChapterSymbolismPanel
            book={currentBook}
            chapter={currentChapter}
            chapterText={wholeChapterText}
          />
        )}
        </div>
      </div>

      {/* George Fox Applied AI Institute 'Be Known' Footer */}
      <div
        className="px-3.5 py-2.5 border-t border-[var(--clean-border,#EBE5DC)] space-y-2 select-none flex-shrink-0 text-[#26221F]"
        style={{ background: 'linear-gradient(to bottom right, var(--clean-highlight-cream, #FAF7F2), #FFFFFF, var(--clean-highlight-cream, #FAF7F2))' }}
      >
        <div className="flex items-center justify-between gap-2">
          <AppliedAiLogo variant="lockup-navy" height={20} alt="George Fox University Applied AI Institute" />
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 text-white"
            style={{ backgroundColor: 'var(--clean-accent-dark, #003057)' }}
          >
            Be Known
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] text-[#57524E] leading-tight">
            Academic facts • Personal faith • Quiet prayer
          </p>
          <button
            onClick={() => {
              setActiveTab('chat');
              handleSendMessage(`Help me understand ${currentVerseRef} through the "Be Known" promise: 1) What it means (simple facts & words), 2) What it means for my life (God knows me), and 3) A simple prayer.`);
            }}
            className="clean-caramel-btn !text-white !text-[11px] !py-1.5 !px-3 shadow-xs flex items-center gap-1.5 flex-shrink-0 font-bold transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--clean-accent-caramel, #B4793D)'
            }}
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};
