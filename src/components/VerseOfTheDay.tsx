import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sun, Bot } from 'lucide-react';
import { TranslationId } from '../data/bibleData';
import { parsePassageReference, fetchChapterFromYouVersion, cleanApiText } from '../services/youversionService';
import { generateDailyVerseAndReflection } from '../services/aiService';

interface VerseOfTheDayProps {
  activeTranslation: TranslationId;
  activeLens: string;
  onNavigateToPassage: (bookId: string, chapterNum: number, verseNum?: number) => void;
}

interface VotdData {
  text: string;
  reference: string;
  reflection: string;
}

export const VerseOfTheDay: React.FC<VerseOfTheDayProps> = ({ activeTranslation, activeLens, onNavigateToPassage }) => {
  const [votd, setVotd] = useState<VotdData | null>(null);
  const [verseText, setVerseText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progressText, setProgressText] = useState<string | null>(null);

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';

  useEffect(() => {
    let isMounted = true;
    const fetchVOTD = async () => {
      setIsLoading(true);
      setProgressText('Loading daily verse...');
      
      try {
        const todayStr = `${new Date().toDateString()} - ${timeOfDay}`;
        const cacheKey = `berea_votd_${todayStr}_${activeLens}`;
        
        // 1. Check local cache
        if (typeof window !== 'undefined' && window.localStorage) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              // Invalidate cache if the AI hallucinated placeholder text or didn't return text
              if (parsed && parsed.reference && parsed.reference !== 'Book Chapter:Verse' && parsed.reference !== 'John 1:5' && !(parsed.text || '').includes('The bible verse text')) {
                if (isMounted) setVotd(parsed);
                setIsLoading(false);
                return;
              }
            } catch (e) {
              // bad json in cache, ignore and re-fetch
            }
          }
        }

        // 2. Fetch from Local AI Engine
        const data = await generateDailyVerseAndReflection(
          todayStr, 
          activeLens, 
          (prog) => {
            if (isMounted) setProgressText(prog.text);
          }
        );
        
        if (isMounted) {
          setVotd(data);
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch AI VOTD:', err);
        if (isMounted) {
          setVotd({
            reference: 'Psalm 119:105',
            text: 'Thy word is a lamp unto my feet, and a light unto my path.',
            reflection: 'Even when the way ahead seems unclear, God\'s Word provides the illumination we need to take the next faithful step.'
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVOTD();
    return () => { isMounted = false; };
  }, [activeLens, timeOfDay]);

  // Effect 2: Fetch the exact translation text from the API
  useEffect(() => {
    if (!votd) return;
    
    let isMounted = true;
    const fetchRealVerse = async () => {
      const parsed = parsePassageReference(votd.reference);
      if (parsed && parsed.verseNum) {
        try {
          const chapterData = await fetchChapterFromYouVersion(parsed.bookId, parsed.chapterNum, activeTranslation);
          const verseObj = chapterData.find(v => v.verseNumber === parsed.verseNum);
          if (verseObj && isMounted) {
            const translationText = verseObj.text[activeTranslation] || verseObj.text['KJV'] || Object.values(verseObj.text)[0];
            if (translationText) {
              setVerseText(cleanApiText(translationText));
            } else {
              setVerseText(votd.text);
            }
          }
        } catch (e) {
          if (isMounted) setVerseText(votd.text);
        }
      } else {
        if (isMounted) setVerseText(votd.text);
      }
    };
    fetchRealVerse();
    
    return () => { isMounted = false; };
  }, [votd, activeTranslation]);

  const handleClick = () => {
    if (!votd) return;
    const parsed = parsePassageReference(votd.reference);
    if (parsed) {
      onNavigateToPassage(parsed.bookId, parsed.chapterNum, parsed.verseNum);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAF5ED] border border-[#EBE5DC] rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-white border border-[#EBE5DC] flex items-center justify-center shadow-xs">
            <Bot className="w-3.5 h-3.5 text-[#B4793D] animate-pulse" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#78716C]">Daily Inspiration</span>
        </div>
        <div className="space-y-3 animate-pulse pt-2">
          <div className="h-4 w-full bg-[#EBE5DC]/50 rounded"></div>
          <div className="h-4 w-5/6 bg-[#EBE5DC]/50 rounded"></div>
          <div className="h-4 w-4/6 bg-[#EBE5DC]/50 rounded"></div>
        </div>
        {progressText && (
          <div className="text-xs text-[#B4793D] italic mt-4 text-center">
            {progressText}
          </div>
        )}
      </div>
    );
  }

  if (!votd) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6] border border-[#EBE5DC] rounded-2xl shadow-sm mb-4 group transition-all hover:shadow-md hover:border-[#D4A373]">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#D4A373]/20 to-transparent rounded-full blur-xl pointer-events-none"></div>
      
      <div className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white border border-[#EBE5DC] flex items-center justify-center shadow-xs">
              <Sun className="w-3.5 h-3.5 text-[#B4793D]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#78716C]">Verse of the {timeOfDay}</span>
          </div>
          
          <button 
            onClick={handleClick}
            className="flex items-center gap-1.5 text-[10px] font-semibold text-[#B4793D] hover:text-[#8C5E32] transition-colors"
          >
            Read Verse <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <blockquote className="mt-2 mb-3">
          <p className="text-[#38332E] font-medium leading-relaxed text-sm italic">
            "{verseText || votd.text}"
          </p>
        </blockquote>
        
        <div className="mb-4">
          <p className="text-[12.5px] text-[#57524E] leading-relaxed">
            {votd.reflection}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#EBE5DC]/60">
          <div className="font-heading font-bold text-[#B4793D] text-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 opacity-60" />
            {votd.reference}
          </div>
        </div>
      </div>
    </div>
  );
};
