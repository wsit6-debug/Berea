import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateChapterSymbolism } from '../services/aiService';
import { getUserDenominationPreference, getDenominationLabel } from '../services/configService';
import { safeLocalStorageSet, pruneDisposableCache } from '../services/storageService';
import { MarkdownTheologyRenderer } from './MarkdownTheologyRenderer';

interface ChapterSymbolismPanelProps {
  book: string;
  chapter: number;
  chapterText?: string;
}

/**
 * Normalizes legacy or unformatted Roman-numeral responses into clean Markdown headings
 */
function formatSymbolismMarkdown(raw: string): string {
  if (!raw) return '';
  // Strip trailing generic summary sentence if present
  let text = raw.replace(/\n\s*These (?:three|key) symbols.*$/si, '').trim();

  // If already structured with Markdown headers (###), return cleaned text directly
  if (/^###\s+/m.test(text)) {
    return text;
  }

  // Convert Roman numerals at line starts (e.g. "I. Symbol: Title" -> "### 1. Title")
  text = text.replace(/^[IVX]+\.\s*(?:Symbol|Motif|Typological Element)?:\s*/gmi, '### ');
  // Convert standalone numbered headers if not already sub-bullets (e.g. "1. Symbol:" -> "### 1. ")
  text = text.replace(/^(\d+)\.\s*(?:Symbol|Motif|Typological Element)?:\s*/gmi, '### $1. ');

  return text;
}

const ChapterSymbolismPanel: React.FC<ChapterSymbolismPanelProps> = ({ book, chapter, chapterText }) => {
  const [symbolismText, setSymbolismText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const lens = getDenominationLabel(getUserDenominationPreference());
  const cacheKey = `berea_symbolism_${book}_${chapter}_${lens}`;

  useEffect(() => {
    let isMounted = true;
    
    const loadSymbolism = async () => {
      setLoading(true);
      setError('');
      
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setSymbolismText(cached);
        setLoading(false);
        return;
      }
      
      try {
        const text = await generateChapterSymbolism(
          book, 
          chapter, 
          lens, 
          chapterText, 
          (progress) => {
            if (isMounted) setProgressText(progress.text);
          },
          (_delta, accumulated) => {
            if (isMounted) {
              setSymbolismText(accumulated);
              setLoading(false);
            }
          }
        );
        
        if (isMounted) {
          setSymbolismText(text);
          safeLocalStorageSet(cacheKey, text);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to analyze symbolism.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadSymbolism();
    
    return () => {
      isMounted = false;
    };
  }, [book, chapter, lens, cacheKey, chapterText, retryTrigger]);

  const handleRetry = () => {
    try {
      localStorage.removeItem(cacheKey);
      pruneDisposableCache();
    } catch {}
    setRetryTrigger(prev => prev + 1);
  };

  const formattedContent = useMemo(() => formatSymbolismMarkdown(symbolismText), [symbolismText]);

  return (
    <div className="flex flex-col h-full bg-[var(--clean-surface,#FFFFFF)] text-[var(--clean-text-primary,#26221F)] overflow-y-auto custom-scrollbar p-5">
      <div className="mb-4 pb-3 border-b border-[var(--clean-border,#EBE5DC)] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-serif text-[var(--clean-text-primary,#26221F)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--clean-accent-caramel,#B4793D)]" />
            Symbolism & Typology
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium text-[var(--clean-text-secondary,#78716C)]">
              {book} {chapter}
            </span>
            <span className="text-[10px] text-[var(--clean-border-strong,#D6CEBF)]">•</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-[var(--clean-highlight-cream,#FAF5ED)] border border-[var(--clean-accent-border,#EBE5DC)] text-[var(--clean-accent-dark,#8C5E2E)]">
              {lens} Perspective
            </span>
          </div>
        </div>
        <button
          onClick={handleRetry}
          disabled={loading}
          title="Re-analyze chapter"
          className="p-1.5 rounded-lg border border-[var(--clean-border,#EBE5DC)] hover:bg-[var(--clean-highlight-cream,#FAF5ED)] text-[var(--clean-text-secondary,#78716C)] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-center">
          <p className="text-rose-600 text-xs font-medium">{error}</p>
          <button 
            onClick={handleRetry} 
            className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      ) : loading && !symbolismText ? (
        <div className="flex flex-col items-center justify-center flex-grow py-12 text-center opacity-80 animate-pulse space-y-3">
          <div className="w-8 h-8 border-2 border-[var(--clean-accent-caramel,#B4793D)] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-[var(--clean-accent-dark,#8C5E2E)] font-medium">
            {progressText || 'Tracing canonical typology...'}
          </p>
        </div>
      ) : (
        <div className="theology-content space-y-4 pb-6">
          <MarkdownTheologyRenderer content={formattedContent} />
        </div>
      )}
    </div>
  );
};

export { ChapterSymbolismPanel };
export default ChapterSymbolismPanel;
