import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles, BookOpen, MapPin, Columns, MessageSquare, ChevronRight, RefreshCw, Send, Sliders, X,
  Trash2, ArrowUpRight, ShieldCheck, BookOpenCheck, Copy, Check, Printer, ChevronDown, ChevronUp,
  History, Bookmark, Users, GraduationCap, Baby, ArrowRight, Layers, FileText
} from 'lucide-react';
import { DENOMINATIONS, DenominationalLens, getTheologicalInsight } from '../data/theologyData';
import { TRANSLATIONS, TranslationId, Verse } from '../data/bibleData';
import { getChapterGeoData, ChapterGeoEvent } from '../data/geoData';
import { OpenFreeMapWidget } from './OpenFreeMapWidget';
import { askBereaAssistant, ChatMessage } from '../services/aiService';
import { searchDoctrinalCorpus, preloadUnabridgedCorpus } from '../services/ragService';
import { MarkdownTheologyRenderer } from './MarkdownTheologyRenderer';
import { cleanApiText, parsePassageReference, fetchChapterFromYouVersion } from '../services/youversionService';
import { AppliedAiLogo } from './AppliedAiLogo';
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

const DEFAULT_WELCOME_TEXT = "Welcome to Berea. Ask any question about Scripture, theology, church history, or the active passage, or choose a prompt below to get started.";

interface BereaAiPanelProps {
  currentBook: string;
  currentChapter: number;
  selectedVerse: Verse | null;
  selectedVerseRange?: { start: number; end: number } | null;
  onVerseRangeChange?: (range: { start: number; end: number } | null) => void;
  chapterVerses?: Verse[];
  activeLens: DenominationalLens;
  onLensChange: (lens: DenominationalLens) => void;
  activeTranslation: TranslationId;
  onTranslationChange: (t: TranslationId) => void;
  onClose?: () => void;
  activeTab?: BereaAiTab;
  onTabChange?: (tab: BereaAiTab) => void;
}

export const BereaAiPanel: React.FC<BereaAiPanelProps> = ({
  currentBook,
  currentChapter,
  selectedVerse,
  selectedVerseRange,
  onVerseRangeChange,
  chapterVerses,
  activeLens,
  onLensChange,
  activeTranslation,
  onTranslationChange,
  onClose,
  activeTab: externalTab,
  onTabChange
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
  const [comparisonTranslations, setComparisonTranslations] = useState<TranslationId[]>(['ESV', 'KJV', 'NIV']);
  const [showDenomModal, setShowDenomModal] = useState(false);

  const activeVerseNum = selectedVerse?.verseNumber || 1;
  const currentVerseRef = `${currentBook} ${currentChapter}:${activeVerseNum}`;

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

  // Study Guide Scope: default is whole chapter, individual verse and range are options
  type StudyGuideScope = 'chapter' | 'verse' | 'range';
  const [studyGuideScope, setStudyGuideScope] = useState<StudyGuideScope>('chapter');

  // Start Verse & Multi-Verse Range State
  const [manualStartVerseNum, setManualStartVerseNum] = useState<number>(activeVerseNum);
  const [endVerseNum, setEndVerseNum] = useState<number>(activeVerseNum);

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
    return effectiveEndVerse > effectiveStartVerse
      ? `${currentBook} ${currentChapter}:${effectiveStartVerse}–${effectiveEndVerse}`
      : `${currentBook} ${currentChapter}:${effectiveStartVerse}`;
  }, [studyGuideScope, currentBook, currentChapter, manualStartVerseNum, effectiveStartVerse, effectiveEndVerse]);

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
    return combinedRangeText;
  }, [studyGuideScope, wholeChapterText, manualStartVerseNum, chapterVerses, activeTranslation, currentVerseText, combinedRangeText]);

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

    if (studyGuideScope === 'verse') {
      targetVerseNumber = manualStartVerseNum;
      targetEndVerseNumber = undefined;
    } else if (studyGuideScope === 'range') {
      targetVerseNumber = effectiveStartVerse;
      targetEndVerseNumber = overrideEndVerse !== undefined ? overrideEndVerse : (effectiveEndVerse > effectiveStartVerse ? effectiveEndVerse : undefined);
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
      targetEndVerseNumber
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
    } catch {}
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

  const chapterData = getChapterGeoData(currentBook, currentChapter);
  const [selectedChapterEvent, setSelectedChapterEvent] = useState<ChapterGeoEvent | null>(null);

  useEffect(() => {
    setSelectedChapterEvent(null);
  }, [currentBook, currentChapter]);

  const currentEvent = selectedChapterEvent || chapterData.events[0];

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
    <div className="berea-ai-inspector flex flex-col h-full bg-white text-[#26221F] border border-[#EBE5DC] rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(180,160,140,0.06)]">
      {/* Inspector Header */}
      <div className="px-3.5 py-2.5 bg-[#FAF7F2] border-b border-[#EBE5DC] flex items-center justify-between select-none flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-[#B4793D] to-[#8C5E32] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
          </div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-semibold text-xs text-[#26221F]">Berea AI Guide</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Denominational Lens Selector Pill */}
          <button
            onClick={() => setShowDenomModal(!showDenomModal)}
            className="ios-glass-btn !text-[10.5px] !py-0.5 !px-2 hover:border-[#D4A373]"
            title="Change theological lens"
          >
            <span className="text-[11px]">{activeDenom.icon}</span>
            <span className="truncate max-w-[110px] font-medium">{activeDenom.traditionGroup}</span>
            <Sliders className="w-2.5 h-2.5 text-[#A8A29E]" />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="ios-icon-btn !w-5 !h-5 text-xs text-[#78716C] hover:text-[#26221F]"
              title="Close Guide"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Denominational Lens Dropdown Modal */}
      {showDenomModal && (
        <div className="p-3 bg-white border-b border-[#EBE5DC] animate-fadeIn select-none shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-[#26221F] flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-[#B4793D]" /> Confessional Tradition
            </span>
            <button
              onClick={() => setShowDenomModal(false)}
              className="ios-icon-btn !w-5 !h-5 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-64 overflow-y-auto custom-scrollbar">
            {DENOMINATIONS.map((denom) => (
              <button
                key={denom.id}
                onClick={() => {
                  onLensChange(denom.id);
                  setShowDenomModal(false);
                }}
                className={`text-left p-2 rounded-lg text-xs transition-all border ${activeLens === denom.id
                  ? 'bg-[#FAF3E8] border-[#B4793D] text-[#78471F] font-semibold shadow-xs'
                  : 'bg-white border-[#EBE5DC] text-[#78716C] hover:bg-[#FAF5ED]'
                  }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-xs">{denom.icon}</span>
                  <span className="font-semibold text-[11px] truncate">{denom.name}</span>
                </div>
                <div className="text-[9.5px] text-[#8C827A] line-clamp-1">{denom.tagline}</div>
                <div className="text-[8.5px] text-[#A8A29E] truncate font-mono mt-0.5">{denom.confessionalStandard.split(',')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Segmented Tab Capsule */}
      <div className="p-1.5 border-b border-[#EBE5DC] bg-[#FAF7F2] flex justify-center select-none flex-shrink-0">
        <div className="ios-segmented-capsule w-full flex justify-between gap-0.5">
          <button
            onClick={() => setActiveTab('overview')}
            className={`ios-segment-pill flex-1 !text-[10.5px] !py-0.5 ${activeTab === 'overview' ? 'active' : ''}`}
            title="Passage Overview"
          >
            <BookOpen className="w-3 h-3" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('studyGuide')}
            className={`ios-segment-pill flex-1 !text-[10.5px] !py-0.5 ${activeTab === 'studyGuide' ? 'active' : ''}`}
            title="Study Guide Generator"
          >
            <BookOpenCheck className="w-3 h-3 text-[#B4793D]" />
            <span>Study Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`ios-segment-pill flex-1 !text-[10.5px] !py-0.5 ${activeTab === 'chat' ? 'active' : ''}`}
            title="Ask AI Assistant"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`ios-segment-pill flex-1 !text-[10.5px] !py-0.5 ${activeTab === 'compare' ? 'active' : ''}`}
            title="Parallel Comparison"
          >
            <Columns className="w-3 h-3" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`ios-segment-pill flex-1 !text-[10.5px] !py-0.5 ${activeTab === 'map' ? 'active' : ''}`}
            title="Biblical Atlas"
          >
            <MapPin className="w-3 h-3" />
            <span>Atlas</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-white">
        {/* STUDY GUIDE TAB */}
        {activeTab === 'studyGuide' && (
          <div className="space-y-3 animate-fadeIn">
            {/* 1. Audience / Depth Selector Bar */}
            <div className="p-2.5 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] shadow-xs space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#B4793D]" />
                  Study Guide Depth
                </span>
                <span className="text-[10px] text-[#B4793D] font-medium bg-white px-2 py-0.5 rounded-full border border-[#EBE5DC]">
                  {selectedAudience === 'deep_exegesis' ? 'Pastoral & Exegetical' : selectedAudience === 'youth_family' ? 'Youth & Family' : 'Small Group'}
                </span>
              </div>

              {/* Segmented Audience Control */}
              <div className="flex rounded-lg bg-[#EFE9DF] p-0.5 gap-0.5">
                <button
                  type="button"
                  onClick={() => handleAudienceChange('small_group')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    selectedAudience === 'small_group'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                  }`}
                  title="Practical small group discussion, fellowship, and personal application"
                >
                  <Users className="w-3.5 h-3.5 text-[#B4793D]" />
                  <span>Small Group</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAudienceChange('deep_exegesis')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    selectedAudience === 'deep_exegesis'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                  }`}
                  title="Pastoral exegesis, linguistic grammar, confessional dogmatics, and historical setting"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#B4793D]" />
                  <span>Deep Exegesis</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAudienceChange('youth_family')}
                  className={`flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 ${
                    selectedAudience === 'youth_family'
                      ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                      : 'text-[#78716C] hover:text-[#26221F]'
                  }`}
                  title="Engaging storytelling, real-world scenarios, and family discussion prompts"
                >
                  <Baby className="w-3.5 h-3.5 text-[#B4793D]" />
                  <span>Youth & Family</span>
                </button>
              </div>

              {/* Passage Scope & Verse Range Controls */}
              <div className="pt-2 border-t border-[#EBE5DC]/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#78716C] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#B4793D]" />
                    Passage Scope
                  </span>
                  <span className="text-[11px] font-mono text-[#B4793D] font-bold bg-white px-2 py-0.5 rounded-full border border-[#EBE5DC]">
                    {effectiveStudyGuideRef}
                  </span>
                </div>

                {/* 3-Option Segmented Control: Whole Chapter vs Individual Verse vs Verse Range */}
                <div className="grid grid-cols-3 rounded-lg bg-[#EFE9DF] p-0.5 gap-0.5">
                  <button
                    type="button"
                    onClick={() => setStudyGuideScope('chapter')}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${
                      studyGuideScope === 'chapter'
                        ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                        : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                    title="Default: Complete chapter study guide"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#B4793D]" />
                    <span>Whole Chapter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStudyGuideScope('verse')}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${
                      studyGuideScope === 'verse'
                        ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                        : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                    title="Focus on an individual verse"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#B4793D]" />
                    <span>Individual Verse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStudyGuideScope('range');
                      if (endVerseNum <= manualStartVerseNum) {
                        setEndVerseNum(Math.min(manualStartVerseNum + 1, maxChapterVerses));
                      }
                    }}
                    className={`py-1.5 px-2 rounded-md text-[10.5px] font-medium transition-all flex items-center justify-center gap-1 ${
                      studyGuideScope === 'range'
                        ? 'bg-white text-[#26221F] shadow-xs font-semibold'
                        : 'text-[#78716C] hover:text-[#26221F]'
                    }`}
                    title="Custom verse range"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#B4793D]" />
                    <span>Verse Range</span>
                  </button>
                </div>

                {/* Scope Specific Configuration */}
                {studyGuideScope === 'chapter' && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-[#EBE5DC]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs text-[#57524E] font-medium">Complete chapter study guide (Default)</span>
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-[#B4793D] bg-[#FAF5ED] px-2 py-0.5 rounded border border-[#EBE5DC]">
                      {chapterVerses?.length || 0} verses
                    </span>
                  </div>
                )}

                {studyGuideScope === 'verse' && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-[#EBE5DC]">
                    <span className="text-xs text-[#57524E] font-medium">Select Passage Verse:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#78716C]">{currentBook} {currentChapter}:</span>
                      <select
                        value={manualStartVerseNum}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setManualStartVerseNum(val);
                        }}
                        className="text-xs font-bold text-[#26221F] bg-white border border-[#EBE5DC] rounded-md px-2 py-1 focus:outline-none focus:border-[#B4793D] shadow-2xs cursor-pointer"
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
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/90 border border-[#EBE5DC] gap-2">
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
                        className="text-xs font-bold text-[#26221F] bg-white border border-[#EBE5DC] rounded-md px-2 py-1 focus:outline-none focus:border-[#B4793D] shadow-2xs cursor-pointer"
                      >
                        {Array.from({ length: maxChapterVerses }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>
                            v.{num}
                          </option>
                        ))}
                      </select>
                    </div>

                    <ArrowRight className="w-3.5 h-3.5 text-[#B4793D]" />

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-[#78716C]">Through:</span>
                      <select
                        value={effectiveEndVerse}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEndVerseNum(val);
                        }}
                        className="text-xs font-bold text-[#26221F] bg-white border border-[#EBE5DC] rounded-md px-2 py-1 focus:outline-none focus:border-[#B4793D] shadow-2xs cursor-pointer"
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
              </div>
            </div>

            {/* Study Guide Action Bar */}
            <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF0E1] border border-[#D4A373]/40 flex items-center justify-center text-[#B4793D]">
                  <BookOpenCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#26221F]">{effectiveStudyGuideRef}</span>
                    <span className="text-[9.5px] text-[#B4793D] font-mono font-medium px-1.5 py-0.2 rounded bg-white border border-[#EBE5DC]">
                      {activeDenom.name}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#78716C] leading-none mt-0.5">
                    {studyGuideScope === 'chapter' ? 'Complete Chapter Guide' : selectedAudience === 'deep_exegesis' ? 'Pastoral Exegesis Guide' : selectedAudience === 'youth_family' ? 'Family & Youth Guide' : 'Small Group Study Guide'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowSavedGuidesDrawer(!showSavedGuidesDrawer)}
                  className={`ios-glass-btn !text-[10.5px] !py-1 !px-2 ${showSavedGuidesDrawer ? 'border-[#B4793D] text-[#B4793D]' : ''}`}
                  title="View Saved Study Guides"
                >
                  <History className="w-3 h-3 text-[#B4793D]" />
                  <span className="hidden sm:inline">Saved</span>
                  <span className="text-[9px] font-bold px-1 rounded-full bg-white border border-[#EBE5DC]">
                    {savedGuides.length}
                  </span>
                </button>

                <button
                  onClick={() => handleGenerateStudyGuide()}
                  className="clean-caramel-btn !text-[11px] !py-1 !px-2.5 shadow-xs"
                  title="Generate Study Guide"
                >
                  <Sparkles className="w-3 h-3 text-amber-100 fill-amber-100" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Saved Guides Drawer */}
            {showSavedGuidesDrawer && (
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE5DC] space-y-2 animate-fadeIn shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#78716C] tracking-wider flex items-center gap-1">
                    <History className="w-3 h-3 text-[#B4793D]" /> Saved Study Guides ({savedGuides.length})
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
                          className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-all border ${isSelected
                            ? 'bg-white border-[#B4793D] shadow-xs text-[#26221F]'
                            : 'bg-white/80 border-[#EBE5DC] hover:bg-white text-[#57524E]'
                            }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-xs text-[#26221F]">{g.passageRef}</span>
                              <span className="text-[9px] font-medium leading-none px-1.5 py-0.5 rounded-full bg-[#FAF0E1] text-[#B4793D] border border-[#D4A373]/30 inline-flex items-center gap-1">
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
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF0E1] text-[#B4793D] border border-[#D4A373]/40 flex items-center gap-1">
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
                      <span className="text-[9.5px] text-[#78716C] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#EBE5DC] truncate max-w-[200px]" title={currentGuide.confessionCited}>
                        {currentGuide.confessionCited}
                      </span>
                    )}
                  </div>
                </div>

                {/* Original Language Badge */}
                {currentGuide.originalLanguageNote && (
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE5DC]/80 shadow-2xs">
                    <div className="text-[10px] text-[#57524E] flex items-center gap-1 bg-white p-1.5 rounded-lg border border-[#EBE5DC]/60">
                      <span className="font-bold text-[#B4793D] font-mono">Original Language:</span>
                      <span className="truncate">{currentGuide.originalLanguageNote}</span>
                    </div>
                  </div>
                )}

                {/* 1. Context Snapshot Accordion */}
                <div className="rounded-xl border border-[#EBE5DC] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleSection('context')}
                    className="w-full px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF5ED] flex items-center justify-between text-left transition-colors border-b border-[#EBE5DC]/60"
                  >
                    <span className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#B4793D]" />
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
                <div className="rounded-xl border border-[#EBE5DC] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleSection('supportingPassages')}
                    className="w-full px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF5ED] flex items-center justify-between text-left transition-colors border-b border-[#EBE5DC]/60"
                  >
                    <span className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-[#B4793D]" />
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
                            <div key={idx} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EBE5DC]/80 space-y-1 text-xs">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-[#B4793D] font-mono">{p.ref}</span>
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
                                <p className="text-[11.5px] text-[#44403C] leading-relaxed pl-2 border-l-2 border-[#D4A373]/50">
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
                          className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-[#EBE5DC] focus:outline-none focus:border-[#B4793D] bg-[#FAF7F2]/50 text-[#26221F] placeholder:text-[#A8A29E]"
                        />
                        <button
                          type="submit"
                          disabled={!newPassageRefInput.trim() || isAddingPassage}
                          className="ios-glass-btn !text-xs !py-1.5 !px-2.5 bg-white text-[#B4793D] font-medium border border-[#EBE5DC] hover:border-[#B4793D] disabled:opacity-50"
                        >
                          {isAddingPassage ? 'Adding...' : '+ Add'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* 3. Icebreaker Questions Accordion */}
                <div className="rounded-xl border border-[#EBE5DC] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleSection('icebreakers')}
                    className="w-full px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF5ED] flex items-center justify-between text-left transition-colors border-b border-[#EBE5DC]/60"
                  >
                    <span className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#B4793D]" />
                      Icebreaker Questions (2)
                    </span>
                    {openSections.icebreakers ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.icebreakers && (
                    <div className="p-3 bg-white space-y-2">
                      {currentGuide.icebreakers.map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#FAF7F2] border border-[#EBE5DC]/80 text-xs text-[#38332E] flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#FAF0E1] text-[#B4793D] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 3. Deep Discussion Prompts Accordion */}
                <div className="rounded-xl border border-[#EBE5DC] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleSection('deepPrompts')}
                    className="w-full px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF5ED] flex items-center justify-between text-left transition-colors border-b border-[#EBE5DC]/60"
                  >
                    <span className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B4793D]" />
                      Deep Discussion Prompts (3)
                    </span>
                    {openSections.deepPrompts ? <ChevronUp className="w-3.5 h-3.5 text-[#A8A29E]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#A8A29E]" />}
                  </button>
                  {openSections.deepPrompts && (
                    <div className="p-3 bg-white space-y-2">
                      {currentGuide.deepPrompts.map((p, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#FAF5ED] border border-[#EBE5DC] text-xs text-[#38332E] flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#FAF0E1] text-[#B4793D] font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{p}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Actionable Takeaway Accordion */}
                <div className="rounded-xl border border-[#EBE5DC] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => toggleSection('application')}
                    className="w-full px-3 py-2 bg-[#FAF7F2] hover:bg-[#FAF5ED] flex items-center justify-between text-left transition-colors border-b border-[#EBE5DC]/60"
                  >
                    <span className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#B4793D]" />
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
                <div className="p-2 bg-[#FAF7F2] rounded-xl border border-[#EBE5DC] flex items-center justify-between gap-1.5">
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
              <div className="p-6 rounded-2xl bg-[#FAF5ED] border border-[#EBE5DC] text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EBE5DC] flex items-center justify-center text-[#B4793D] mx-auto shadow-xs">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-[#26221F]">Study Guide Generator</h4>
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
          </div>
        )}

        {activeTab === 'overview' && (
          <div key={`${currentBook}_${currentChapter}_${isRangeActive ? `${selectedVerseRange!.start}_${selectedVerseRange!.end}` : activeVerseNum}`} className="space-y-2.5 animate-fadeIn">
            {/* Main Overview Card */}
            <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B4793D]" />
                  Theological Synthesis
                </span>
                <span className="text-[9.5px] text-[#78471F] font-semibold bg-white px-2 py-0.2 rounded-full border border-[#EBE5DC]">
                  {insight.passageRef} {isRangeActive && `(${selectedVerseRange!.end - selectedVerseRange!.start + 1} verses)`}
                </span>
              </div>

              <p className="text-xs font-normal leading-relaxed text-[#26221F]">
                {insight.conciseOverview}
              </p>

              {/* Lens Perspective */}
              <div
                className="p-2 rounded-lg bg-white border border-[#EBE5DC] text-xs space-y-0.5"
                style={{ borderLeftWidth: '3px', borderLeftColor: activeDenom.accentColor }}
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

            {/* Doctrinal Confessional Grounding (RAG Verified Sources) */}
            {activeDoctrinalSources.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[#F4F9F5] border border-[#DCF0E2] space-y-1.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[9.5px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Official Confessional Standard ({activeDenom.traditionGroup})
                  </span>
                  <span className="text-[9px] font-mono text-emerald-900 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                    {activeDoctrinalSources[0].citation}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white border border-[#DCF0E2] space-y-1">
                  <div className="font-semibold text-[11px] text-[#26221F]">
                    {activeDoctrinalSources[0].documentTitle}
                  </div>
                  <p className="text-[10.5px] text-[#57524E] leading-relaxed italic">
                    "{activeDoctrinalSources[0].coreDoctrine}"
                  </p>
                </div>
              </div>
            )}

            {/* Original Language Nuance */}
            {insight.originalLanguageInsights && insight.originalLanguageInsights.length > 0 && (
              <div className="space-y-1">
                <span className="text-[9.5px] font-bold text-[#78716C] uppercase tracking-wider block px-1">
                  Original Greek / Hebrew Exegesis
                </span>
                <div className="space-y-1">
                  {insight.originalLanguageInsights.map((term, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white border border-[#EBE5DC] text-xs">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-[#B4793D]">{term.term}</span>
                        <span className="text-[10px] text-[#78716C]">{term.originalScript} ({term.transliteration})</span>
                      </div>
                      <p className="text-[10.5px] text-[#57524E] mt-0.5">{term.nuance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* George Fox Applied AI Institute 'Be Known' 3-Tier Lens */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#003057]/8 via-[#FAF7F2] to-[#D4AF37]/15 border border-[#003057]/20 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <AppliedAiLogo variant="lockup-navy" height={22} alt="George Fox University Applied AI Institute" />
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#003057] text-[#FAF7F2] uppercase tracking-wider flex-shrink-0">
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
                  className="clean-caramel-btn !bg-[#003057] hover:!bg-[#002240] !text-white !text-[10px] !py-1 !px-2.5 shadow-xs flex items-center gap-1 flex-shrink-0"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="w-3 h-3 text-[#D4AF37]" />
                </button>
              </div>
            </div>

            {/* Suggested AI Prompts in Overview Tab */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold text-[#78716C] uppercase tracking-wider block px-0.5">
                Ask Berea AI
              </span>
              <div className="space-y-1">
                {insight.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(q);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-white border border-[#EBE5DC] hover:bg-[#FAF5ED] hover:border-[#D4A373] transition-colors flex items-center justify-between group"
                  >
                    <span className="text-[11.5px] text-[#26221F] group-hover:text-[#78471F] leading-snug">{q}</span>
                    <ChevronRight className="w-3 h-3 text-[#A8A29E] group-hover:text-[#B4793D] flex-shrink-0 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Practical Application */}
            <div className="p-2.5 rounded-lg bg-[#F0FDF4] border border-[#DCFCE7] text-xs">
              <span className="font-semibold text-[#065F46] block mb-0.5 text-[10.5px]">Daily Spiritual Reflection</span>
              <p className="text-[#047857] leading-relaxed text-[11px]">{insight.practicalApplication}</p>
            </div>
          </div>
        )}

        {/* Chat / Ask AI Tab */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-full space-y-2 animate-fadeIn">
            {/* Passage Focus Bar in Chat */}
            <div className="px-2.5 py-1.5 bg-[#FAF5ED] rounded-xl border border-[#EBE5DC] flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3 h-3 text-[#B4793D] flex-shrink-0" />
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
                      <div className="w-5 h-5 rounded-md overflow-hidden border border-[#EBE5DC] flex-shrink-0 bg-[#FAF7F2] p-0.5 shadow-xs flex items-center justify-center">
                        <img src="/berea-logo.jpg" alt="Berea" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <span className="text-[9px] font-semibold text-[#26221F]">
                      {msg.sender === 'user' ? 'You' : 'Berea AI Guide'}
                    </span>
                    <span className="text-[9px] text-[#A8A29E]">{msg.timestamp}</span>
                  </div>
                  {msg.sender === 'user' ? (
                    <div className="chat-user-bubble animate-fadeIn">
                      <p className="text-white text-xs select-text leading-relaxed font-normal">
                        {msg.text}
                      </p>
                    </div>
                  ) : (
                    <div className="chat-ai-bubble animate-fadeIn space-y-1.5">
                      <MarkdownTheologyRenderer content={msg.text} />

                      {/* Citation Reference */}
                      {msg.primaryCitation && (
                        <div className="mt-2 pt-1.5 border-t border-[#EBE5DC] flex flex-wrap items-center justify-between gap-1 text-[10px] select-none">
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
                <div className="p-2.5 bg-[#FAF5ED] border border-[#EBE5DC] rounded-xl text-xs text-[#78471F] space-y-1.5 animate-fadeIn shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-[#B4793D] flex-shrink-0" />
                      <span className="font-medium text-[11px] truncate max-w-[220px]">
                        {localModelProgress ? localModelProgress.text : 'Synthesizing exegesis & confessional standards...'}
                      </span>
                    </div>
                    {localModelProgress && (
                      <span className="font-mono font-bold text-[10px] text-[#B4793D]">
                        {localModelProgress.progress}%
                      </span>
                    )}
                  </div>
                  {localModelProgress && (
                    <div className="w-full h-1 bg-white rounded-full overflow-hidden border border-[#EBE5DC]">
                      <div
                        className="h-full bg-gradient-to-r from-[#B4793D] to-[#D4A373] transition-all duration-200 rounded-full"
                        style={{ width: `${localModelProgress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Suggested Question Pills Directly in Chat Tab */}
            <div className="pt-2 border-t border-[#EBE5DC]/80 space-y-1 select-none">
              <span className="text-[9.5px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1 px-1">
                <Sparkles className="w-2.5 h-2.5 text-[#B4793D]" /> Suggested Prompts for {currentVerseRef}
              </span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                {/* George Fox 'Be Known' Primary Prompt Pill */}
                <button
                  onClick={() => handleSendMessage(`Help me understand ${currentVerseRef} through the "Be Known" promise: 1) What it means (simple facts & words), 2) What it means for my life (God knows me), and 3) A simple prayer.`)}
                  disabled={isAiThinking}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#003057]/10 to-[#FAF5ED] hover:from-[#003057]/20 border border-[#003057]/25 text-[11px] text-[#003057] font-semibold flex items-center justify-between group transition-all disabled:opacity-50 shadow-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <AppliedAiLogo variant="icon-navy" height={13} className="flex-shrink-0" />
                    <span className="truncate">"Be Known": Learn It • Live It • Pray It</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-[#003057] group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                </button>
                {insight.suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    disabled={isAiThinking}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#FAF3E8] border border-[#EBE5DC] hover:border-[#D4A373] text-[11px] text-[#26221F] hover:text-[#78471F] flex items-center justify-between group transition-all disabled:opacity-50"
                  >
                    <span className="leading-snug pr-2">{q}</span>
                    <ArrowUpRight className="w-3 h-3 text-[#A8A29E] group-hover:text-[#B4793D] flex-shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-1.5 pt-1.5 border-t border-[#EBE5DC]">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask anything about ${currentVerseRef} or theology...`}
                className="flex-1 bg-[#FAF5ED] border border-[#EBE5DC] focus:border-[#D4A373] focus:bg-white rounded-full px-3 py-1.5 text-xs text-[#26221F] placeholder-[#A8A29E] focus:outline-none transition-colors"
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
                <h4 className="text-xs font-semibold text-[#26221F]">Translations Matrix</h4>
                <p className="text-[9.5px] text-[#78716C]">{currentVerseRef}</p>
              </div>
            </div>

            {/* Translation Pills */}
            <div className="ios-segmented-capsule flex-wrap">
              {TRANSLATIONS.map((t) => {
                const isSelected = comparisonTranslations.includes(t.id);
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
                    className={`ios-segment-pill !text-[10.5px] !py-0.2 !px-2 ${isSelected ? 'active' : ''}`}
                  >
                    {t.id}
                  </button>
                );
              })}
            </div>

            {/* Translation Cards */}
            <div className="space-y-1.5">
              {comparisonTranslations.map((tId) => {
                const tObj = TRANSLATIONS.find(x => x.id === tId);
                const rawCompareText = (selectedVerse?.text && (selectedVerse.text[tId] || selectedVerse.text['KJV'] || Object.values(selectedVerse.text)[0])) || 'Loading scripture...';
                const verseText = cleanApiText(rawCompareText);

                return (
                  <div key={tId} className="p-2.5 rounded-lg bg-[#FAF5ED] border border-[#EBE5DC] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#B4793D]">{tObj?.name} ({tId})</span>
                      <span className="text-[9px] text-[#78716C]">{tObj?.year}</span>
                    </div>
                    <p className="font-scripture text-[11.5px] text-[#38332E] leading-relaxed pl-1.5 border-l-2 border-[#B4793D]">
                      {verseText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#26221F] flex items-center gap-1.5">
                  <span>{currentBook.toUpperCase()} Chapter {currentChapter} Topography</span>
                </h4>
                <p className="text-[10px] text-[#78716C]">
                  {chapterData.region} • {chapterData.events.length} Chapter Event{chapterData.events.length > 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-[9.5px] font-semibold text-[#B4793D] bg-[#FAF5ED] px-2 py-0.5 rounded-full border border-[#EBE5DC]">
                Event Topography
              </span>
            </div>

            <OpenFreeMapWidget
              currentBook={currentBook}
              currentChapter={currentChapter}
              activeVerseNumber={activeVerseNum}
              height="230px"
              onEventSelect={(ev) => setSelectedChapterEvent(ev)}
            />

            {/* Chapter Event Active Detail Card */}
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-[#78471F] flex items-center gap-1">
                    <span>📍 Event {currentEvent.stepNumber}:</span> {currentEvent.title}
                  </span>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-white text-[#B4793D] border border-[#EBE5DC] font-semibold">
                    {currentEvent.passageRef}
                  </span>
                </div>

                <div className="text-[10px] text-[#78716C] font-medium">
                  Site: <strong className="text-[#26221F]">{currentEvent.locationName}</strong>
                </div>

                <p className="text-[#44403C] text-[11px] leading-relaxed">
                  {currentEvent.description}
                </p>

                <div className="p-2 rounded-lg bg-white border border-[#EBE5DC] text-[10.5px] text-[#57524E] space-y-0.5 mt-1">
                  <strong className="text-[#78471F] text-[10px] block uppercase tracking-wider">Theological Significance</strong>
                  <p className="leading-snug">{currentEvent.theologicalSignificance}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Guide Sub-footer */}
      <div className="px-3.5 py-2 bg-[#FAF7F2] border-t border-[#EBE5DC] flex items-center justify-between text-[10px] text-[#78716C] select-none flex-shrink-0">
        <AppliedAiLogo variant="lockup-navy" height={16} alt="George Fox University Applied AI Institute" />
        <span className="text-[9.5px] text-[#A8A29E] font-medium">Be Known</span>
      </div>
    </div>
  );
};
