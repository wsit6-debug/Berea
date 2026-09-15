import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, BookOpen, MapPin, Columns, MessageSquare, ChevronRight, RefreshCw, Send, Sliders, X, Trash2, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { DENOMINATIONS, DenominationalLens, getTheologicalInsight } from '../data/theologyData';
import { TRANSLATIONS, TranslationId, Verse } from '../data/bibleData';
import { getChapterGeoData, ChapterGeoEvent } from '../data/geoData';
import { OpenFreeMapWidget } from './OpenFreeMapWidget';
import { askBereaAssistant, ChatMessage } from '../services/aiService';
import { searchDoctrinalCorpus, preloadUnabridgedCorpus } from '../services/ragService';
import { MarkdownTheologyRenderer } from './MarkdownTheologyRenderer';
import { cleanApiText } from '../services/youversionService';

const DEFAULT_WELCOME_TEXT = "Welcome to Berea. Ask any question about Scripture, theology, church history, or the active passage, or choose a prompt below to get started.";

interface BereaAiPanelProps {
  currentBook: string;
  currentChapter: number;
  selectedVerse: Verse | null;
  activeLens: DenominationalLens;
  onLensChange: (lens: DenominationalLens) => void;
  activeTranslation: TranslationId;
  onTranslationChange: (t: TranslationId) => void;
  onClose?: () => void;
}

export const BereaAiPanel: React.FC<BereaAiPanelProps> = ({
  currentBook,
  currentChapter,
  selectedVerse,
  activeLens,
  onLensChange,
  activeTranslation,
  onTranslationChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'compare' | 'chat'>('overview');
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

  const insight = getTheologicalInsight(
    currentBook,
    currentChapter,
    selectedVerse?.verseNumber,
    currentVerseText,
    selectedVerse?.greekHebrew
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
        verseNumber: activeVerseNum,
        activeVerseRef: currentVerseRef,
        verseText: (selectedVerse?.text && (selectedVerse.text[activeTranslation] || selectedVerse.text['KJV'] || Object.values(selectedVerse.text)[0])) || undefined,
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
                className={`text-left p-2 rounded-lg text-xs transition-all border ${
                  activeLens === denom.id
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
        <div className="ios-segmented-capsule w-full flex justify-between">
          <button
            onClick={() => setActiveTab('overview')}
            className={`ios-segment-pill flex-1 !text-[11px] !py-0.5 ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`ios-segment-pill flex-1 !text-[11px] !py-0.5 ${activeTab === 'chat' ? 'active' : ''}`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Ask AI</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`ios-segment-pill flex-1 !text-[11px] !py-0.5 ${activeTab === 'compare' ? 'active' : ''}`}
          >
            <Columns className="w-3 h-3" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`ios-segment-pill flex-1 !text-[11px] !py-0.5 ${activeTab === 'map' ? 'active' : ''}`}
          >
            <MapPin className="w-3 h-3" />
            <span>Atlas</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-white">
        {activeTab === 'overview' && (
          <div key={`${currentBook}_${currentChapter}_${activeVerseNum}`} className="space-y-2.5 animate-fadeIn">
            {/* Main Overview Card */}
            <div className="p-3 rounded-xl bg-[#FAF5ED] border border-[#EBE5DC] space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#B4793D] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#B4793D]" />
                  Theological Synthesis
                </span>
                <span className="text-[9.5px] text-[#78471F] font-semibold bg-white px-2 py-0.2 rounded-full border border-[#EBE5DC]">
                  {insight.passageRef}
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
                <span className="text-[9.5px] font-bold text-[#B4793D] uppercase tracking-wider block px-0.5">
                  Original Language (Greek / Hebrew)
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {insight.originalLanguageInsights.map((orig, i) => (
                    <div key={i} className="p-2 rounded-lg bg-[#FAF7F2] border border-[#EBE5DC] text-xs">
                      <div className="flex items-baseline justify-between mb-0.5">
                        <span className="font-semibold text-[#26221F] text-[11.5px]">{orig.term}</span>
                        <span className="text-[#B4793D] text-xs font-serif font-medium">{orig.originalScript}</span>
                      </div>
                      <div className="text-[9.5px] text-[#78471F] mb-0.5">
                        <em>{orig.transliteration}</em> • Strong’s {orig.strongsRef}
                      </div>
                      <p className="text-[10.5px] text-[#57524E] leading-tight">{orig.nuance}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                  Passage: {currentVerseRef}
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
              <div className="space-y-1 max-h-[120px] overflow-y-auto custom-scrollbar">
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
    </div>
  );
};
