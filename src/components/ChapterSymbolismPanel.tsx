import React, { useState, useEffect } from 'react';
import { generateChapterSymbolism } from '../services/aiService';
import { getUserDenominationPreference, getDenominationLabel } from '../services/configService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChapterSymbolismPanelProps {
  book: string;
  chapter: number;
  chapterText?: string;
}

const ChapterSymbolismPanel: React.FC<ChapterSymbolismPanelProps> = ({ book, chapter, chapterText }) => {
  const [symbolismText, setSymbolismText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [progressText, setProgressText] = useState<string>('');
  const [error, setError] = useState<string>('');

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
          }
        );
        
        if (isMounted) {
          setSymbolismText(text);
          localStorage.setItem(cacheKey, text);
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
  }, [book, chapter, lens, cacheKey, chapterText]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 overflow-y-auto custom-scrollbar p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold font-serif text-slate-100 flex items-center gap-3">
          Symbolism & Typology
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          {book} {chapter} • {lens} Perspective
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center flex-grow opacity-70 animate-pulse">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-indigo-300 font-medium">{progressText || 'Analyzing chapter context...'}</p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/30 border border-rose-900/50 rounded-lg p-4 text-center">
          <p className="text-rose-400 text-sm">{error}</p>
          <button 
            onClick={() => localStorage.removeItem(cacheKey)} 
            className="mt-3 px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 text-xs rounded transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      ) : (
        <div className="prose prose-invert prose-slate prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {symbolismText}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ChapterSymbolismPanel;
